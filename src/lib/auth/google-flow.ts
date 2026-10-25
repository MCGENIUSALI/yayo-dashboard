import "server-only";
import { audit } from "@/lib/auth/audit";
import type { AuthConfig } from "@/lib/auth/config";
import type { RequestContext } from "@/lib/auth/context";
import { hmac, randomToken, safeEqual } from "@/lib/auth/crypto";
import { emails, sendQuietly } from "@/lib/auth/email";
import { authorizationUrl, exchangeCode, GoogleError, verifyIdToken, type GoogleIdentity } from "@/lib/auth/google";
import { hit } from "@/lib/auth/rate-limit";
import type { AppRole, SessionUser } from "@/lib/auth/sessions";
import { normalizeEmail } from "@/lib/auth/validation";
import { safeNext } from "@/lib/redirect";
import { db, transaction } from "@/lib/db";

export const OAUTH_TTL_SEC = 10 * 60;
export const callbackPath = "/auth/google/callback";
export const redirectUri = (c: Pick<AuthConfig, "APP_URL">) => new URL(callbackPath, c.APP_URL).toString();

/** What the browser keeps between the redirect to Google and the callback (HttpOnly cookie, HMAC-signed, 10 min). */
interface OAuthState {
  state: string;
  verifier: string;
  nonce: string;
  next: string;
  mode: "login" | "link";
  remember: boolean;
  /** Link mode: the account that started the flow. */
  userId?: string;
  exp: number;
}

export function sealState(s: OAuthState) {
  const body = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${body}.${hmac(`oauth:${body}`)}`;
}

export function openState(value: string | undefined): OAuthState | null {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig || !safeEqual(sig, hmac(`oauth:${body}`))) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as OAuthState;
    return typeof s.exp === "number" && s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}

export function startGoogle(c: AuthConfig, p: { mode: "login" | "link"; next?: string; remember?: boolean; userId?: string }) {
  const s: OAuthState = {
    state: randomToken(),
    verifier: randomToken(),
    nonce: randomToken(),
    next: safeNext(p.next),
    mode: p.mode,
    remember: Boolean(p.remember),
    userId: p.userId,
    exp: Date.now() + OAUTH_TTL_SEC * 1000,
  };
  return { url: authorizationUrl({ clientId: c.GOOGLE_CLIENT_ID!, redirectUri: redirectUri(c), state: s.state, nonce: s.nonce, codeVerifier: s.verifier }), cookie: sealState(s) };
}

/** Error codes shown on the sign-in / security screens. */
export type GoogleErrorCode = "google_refus" | "google_echec" | "google_compte_existant" | "google_non_verifie" | "google_deja_lie" | "compte_suspendu" | "trop_de_tentatives";

export type GoogleOutcome =
  | { type: "signed_in"; userId: string; roles: AppRole[]; remember: boolean; next: string }
  | { type: "linked"; next: string }
  | { type: "error"; code: GoogleErrorCode; mode: "login" | "link" };

export interface GoogleDeps {
  exchange: (code: string, verifier: string) => Promise<string>;
  verify: (idToken: string, nonce: string) => Promise<GoogleIdentity>;
}

export const googleDeps = (c: AuthConfig): GoogleDeps => ({
  exchange: (code, verifier) => exchangeCode({ code, codeVerifier: verifier, redirectUri: redirectUri(c), clientId: c.GOOGLE_CLIENT_ID!, clientSecret: c.GOOGLE_CLIENT_SECRET! }),
  verify: (idToken, nonce) => verifyIdToken(idToken, { clientId: c.GOOGLE_CLIENT_ID!, nonce }),
});

/**
 * Callback handling. The application session is created by the caller only
 * for a `signed_in` outcome, i.e. after state, code exchange and ID token
 * have all been verified. An existing password account is never linked on the
 * basis of a matching e-mail: linking is only possible from the security
 * screen, signed in and after re-entering the password.
 */
export async function completeGoogle(
  p: { params: URLSearchParams; cookie: string | undefined; currentUser: SessionUser | null },
  deps: GoogleDeps,
  ctx: RequestContext,
): Promise<GoogleOutcome> {
  const saved = openState(p.cookie);
  const mode = saved?.mode ?? "login";
  const fail = async (code: GoogleErrorCode, reason: string, userId: string | null = null): Promise<GoogleOutcome> => {
    await audit("google_rejected", ctx, userId, { reason });
    return { type: "error", code, mode };
  };

  const limit = await hit("googleIp", ctx.ip);
  if (!limit.allowed) return fail("trop_de_tentatives", "rate_limited");

  const returnedState = p.params.get("state");
  // The state must match the one bound to this browser: blocks login CSRF and replayed callbacks.
  if (!saved || !returnedState || !safeEqual(returnedState, saved.state)) return fail("google_echec", "state_mismatch");
  const error = p.params.get("error");
  if (error) return fail(error === "access_denied" ? "google_refus" : "google_echec", `provider_${error === "access_denied" ? "denied" : "error"}`);
  const code = p.params.get("code");
  if (!code) return fail("google_echec", "missing_code");

  let identity: GoogleIdentity;
  try {
    identity = await deps.verify(await deps.exchange(code, saved.verifier), saved.nonce);
  } catch (e) {
    const reason = e instanceof GoogleError ? e.code : "unexpected";
    return fail(reason === "email_not_verified" ? "google_non_verifie" : "google_echec", reason);
  }

  if (saved.mode === "link") {
    const user = p.currentUser;
    if (!user || user.id !== saved.userId) return fail("google_echec", "link_session_mismatch", user?.id ?? null);
    const [owner] = await db.query<{ user_id: string }>("SELECT user_id FROM user_identities WHERE provider = 'google' AND subject = $1", [identity.sub]);
    if (owner && owner.user_id !== user.id) return fail("google_deja_lie", "sub_owned_by_other", user.id);
    if (!owner) {
      try {
        await db.query("INSERT INTO user_identities (provider, subject, user_id, email) VALUES ('google', $1, $2, $3)", [identity.sub, user.id, normalizeEmail(identity.email)]);
      } catch {
        return fail("google_deja_lie", "user_has_google", user.id);
      }
      await audit("google_linked", ctx, user.id);
      await sendQuietly(emails.googleLinked(user.email), "google_linked");
    }
    return { type: "linked", next: saved.next };
  }

  const [linked] = await db.query<{ id: string; roles: AppRole[]; status: string }>(
    "SELECT u.id, u.roles, u.status FROM user_identities i JOIN users u ON u.id = i.user_id WHERE i.provider = 'google' AND i.subject = $1",
    [identity.sub],
  );
  if (linked) {
    if (linked.status !== "active") return fail("compte_suspendu", "suspended", linked.id);
    await audit("google_sign_in", ctx, linked.id);
    return { type: "signed_in", userId: linked.id, roles: linked.roles, remember: saved.remember, next: saved.next };
  }

  const email = normalizeEmail(identity.email);
  const [existing] = await db.query<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
  if (existing) return fail("google_compte_existant", "email_exists", existing.id);

  try {
    const user = await transaction(async (tx) => {
      const name = (identity.name ?? email.split("@")[0]).normalize("NFKC").trim().slice(0, 80) || "Utilisateur";
      const [u] = await tx.query<{ id: string; roles: AppRole[] }>("INSERT INTO users (email, name, email_verified_at) VALUES ($1, $2, now()) RETURNING id, roles", [email, name]);
      await tx.query("INSERT INTO user_identities (provider, subject, user_id, email) VALUES ('google', $1, $2, $3)", [identity.sub, u.id, email]);
      return u;
    });
    await audit("google_sign_up", ctx, user.id);
    return { type: "signed_in", userId: user.id, roles: user.roles, remember: saved.remember, next: saved.next };
  } catch {
    // Concurrent callback for the same Google account or address.
    return fail("google_echec", "concurrent_create");
  }
}
