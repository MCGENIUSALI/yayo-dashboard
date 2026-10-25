import "server-only";
import { audit } from "@/lib/auth/audit";
import type { RequestContext } from "@/lib/auth/context";
import { emails, sendQuietly } from "@/lib/auth/email";
import { hashPassword, isBreachedPassword, verifyAgainstDummy, verifyPassword } from "@/lib/auth/password";
import { hit, hitAll, retryMessage } from "@/lib/auth/rate-limit";
import { createSession, revokeAllSessions, type AppRole, type SessionUser } from "@/lib/auth/sessions";
import { consumeToken, issueToken, type TokenState } from "@/lib/auth/tokens";
import { emailSchema, fieldErrors, passwordProblem, signInSchema, signUpSchema, tokenSchema, type FieldErrors } from "@/lib/auth/validation";
import { db, transaction } from "@/lib/db";

/**
 * Authentication use cases. They take plain inputs plus the request context
 * and return results; the server actions only add cookies and redirects.
 * Failure messages are generic wherever a difference would reveal whether
 * an account exists.
 */
export type Failure = { ok: false; error: string; code?: string; fieldErrors?: FieldErrors };
export type NewSession = { token: string; expiresAt: Date; persistent: boolean };

const GENERIC_SIGN_IN = "Adresse e-mail ou mot de passe incorrect.";
const BREACHED = "Ce mot de passe apparaît dans des fuites de données connues. Choisis-en un autre.";

const invalid = (errors: FieldErrors): Failure => ({ ok: false, error: "Vérifie les champs indiqués.", code: "invalid", fieldErrors: errors });
const limited = async (ctx: RequestContext, retryAfter: number, scope: string): Promise<Failure> => {
  await audit("rate_limited", ctx, null, { scope });
  return { ok: false, error: retryMessage(retryAfter), code: "rate_limited" };
};

const isUniqueViolation = (e: unknown) => typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  roles: AppRole[];
  status: "active" | "suspended";
  email_verified_at: Date | null;
}

const findUserByEmail = async (email: string) => (await db.query<UserRow>("SELECT id, email, name, password_hash, roles, status, email_verified_at FROM users WHERE email = $1", [email]))[0] ?? null;

async function sendVerification(user: Pick<UserRow, "id" | "email" | "name">) {
  const token = await issueToken(db, user.id, "verify_email");
  return sendQuietly(emails.verify(user.email, user.name, token), "verify_email");
}

export async function signInWithPassword(input: unknown, ctx: RequestContext, currentToken: string | null): Promise<({ ok: true } & NewSession) | Failure> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { email, password, remember } = parsed.data;

  const limit = await hitAll([
    ["signInIp", ctx.ip],
    ["signInAccount", email],
  ]);
  if (!limit.allowed) return limited(ctx, limit.retryAfter, "sign_in");

  const user = await findUserByEmail(email);
  const ok = user?.password_hash ? await verifyPassword(user.password_hash, password) : await verifyAgainstDummy(password);
  if (!user || !ok) {
    await audit("sign_in_failed", ctx, user?.id ?? null);
    return { ok: false, error: GENERIC_SIGN_IN, code: "credentials" };
  }
  // Only reachable with the right password: these messages reveal nothing to someone who does not hold it.
  if (user.status !== "active") {
    await audit("sign_in_blocked", ctx, user.id, { reason: "suspended" });
    return { ok: false, error: "Ce compte est suspendu. Contacte le support YA YO! pour en savoir plus.", code: "suspended" };
  }
  if (!user.email_verified_at) {
    const resend = await hit("verifyResendAccount", user.id);
    if (resend.allowed) await sendVerification(user);
    await audit("sign_in_blocked", ctx, user.id, { reason: "unverified" });
    return { ok: false, error: "Confirme d’abord ton adresse e-mail : nous t’avons envoyé un nouveau lien.", code: "unverified" };
  }

  const session = await createSession(db, { userId: user.id, roles: user.roles, remember, method: "password", userAgent: ctx.userAgent, replacesToken: currentToken });
  await audit("sign_in", ctx, user.id, { method: "password", persistent: session.persistent });
  return { ok: true, ...session };
}

/**
 * Same answer whether or not the address is already registered: a new
 * account receives a verification link, an existing one a notice. The
 * account cannot sign in before the address is confirmed.
 */
export async function signUp(input: unknown, ctx: RequestContext): Promise<{ ok: true; email: string } | Failure> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { name, email, password } = parsed.data;
  const problem = passwordProblem(password, email);
  if (problem) return invalid({ password: problem });

  const limit = await hit("signUpIp", ctx.ip);
  if (!limit.allowed) return limited(ctx, limit.retryAfter, "sign_up");
  if (await isBreachedPassword(password)) return invalid({ password: BREACHED });

  const existing = await findUserByEmail(email);
  if (!existing) {
    const passwordHash = await hashPassword(password);
    try {
      const [user] = await db.query<{ id: string }>("INSERT INTO users (email, name, password_hash, password_changed_at) VALUES ($1, $2, $3, now()) RETURNING id", [email, name, passwordHash]);
      await audit("sign_up", ctx, user.id);
      await sendVerification({ id: user.id, email, name });
      return { ok: true, email };
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
      // Lost a race with a concurrent sign-up for the same address: same answer as an existing account.
    }
  } else {
    await verifyAgainstDummy(password); // comparable response time
  }
  const account = existing ?? (await findUserByEmail(email));
  const notice = await hit("verifyResendAccount", `exists:${email}`);
  if (notice.allowed) await sendQuietly(emails.existingAccount(email), "existing_account");
  await audit("sign_up_existing", ctx, account?.id ?? null);
  return { ok: true, email };
}

export async function resendVerification(input: unknown, ctx: RequestContext): Promise<{ ok: true } | Failure> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return invalid({ email: parsed.error.issues[0].message });
  const limit = await hit("verifyResendIp", ctx.ip);
  if (!limit.allowed) return limited(ctx, limit.retryAfter, "verify_resend");
  const user = await findUserByEmail(parsed.data);
  if (user && !user.email_verified_at && user.status === "active" && (await hit("verifyResendAccount", user.id)).allowed) await sendVerification(user);
  return { ok: true };
}

export async function verifyEmail(token: unknown, ctx: RequestContext): Promise<{ ok: true } | (Failure & { status?: TokenState["status"] })> {
  const parsed = tokenSchema.safeParse(token);
  if (!parsed.success) return { ok: false, error: "Ce lien n’est pas valide.", code: "invalid", status: "invalid" };
  const limit = await hit("tokenSubmitIp", ctx.ip);
  if (!limit.allowed) return limited(ctx, limit.retryAfter, "verify_email");
  const state = await transaction(async (tx) => {
    const s = await consumeToken(tx, parsed.data, "verify_email");
    if (s.status === "valid") await tx.query("UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()), updated_at = now() WHERE id = $1", [s.userId]);
    return s;
  });
  if (state.status !== "valid") return { ok: false, error: tokenMessage(state.status), code: state.status, status: state.status };
  await audit("email_verified", ctx, state.userId);
  return { ok: true };
}

export function tokenMessage(status: Exclude<TokenState["status"], "valid">) {
  if (status === "expired") return "Ce lien a expiré. Demande un nouveau lien.";
  if (status === "used") return "Ce lien a déjà été utilisé. Demande un nouveau lien si besoin.";
  return "Ce lien n’est pas valide. Vérifie que tu l’as copié en entier ou demande un nouveau lien.";
}

/** Always the same answer; only existing, active accounts actually receive a link. */
export async function requestPasswordReset(input: unknown, ctx: RequestContext): Promise<{ ok: true } | Failure> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return invalid({ email: parsed.error.issues[0].message });
  const limit = await hit("resetRequestIp", ctx.ip);
  if (!limit.allowed) return limited(ctx, limit.retryAfter, "reset_request");
  const user = await findUserByEmail(parsed.data);
  if (user && user.status === "active" && (await hit("resetRequestAccount", user.id)).allowed) {
    const token = await issueToken(db, user.id, "reset_password");
    await sendQuietly(emails.reset(user.email, token), "reset_password");
    await audit("password_reset_requested", ctx, user.id);
  }
  return { ok: true };
}

/**
 * New password from an e-mailed link. Consuming the token, storing the hash
 * and revoking every session happen in one transaction. Following the link
 * also proves control of the address, so it counts as e-mail verification.
 */
export async function resetPassword(input: { token: unknown; password: unknown }, ctx: RequestContext): Promise<{ ok: true } | (Failure & { status?: TokenState["status"] })> {
  const token = tokenSchema.safeParse(input.token);
  if (!token.success) return { ok: false, error: tokenMessage("invalid"), code: "invalid", status: "invalid" };
  const password = typeof input.password === "string" ? input.password : "";
  const problem = passwordProblem(password);
  if (problem) return invalid({ password: problem });
  const limit = await hit("tokenSubmitIp", ctx.ip);
  if (!limit.allowed) return limited(ctx, limit.retryAfter, "reset_password");
  if (await isBreachedPassword(password)) return invalid({ password: BREACHED });
  const passwordHash = await hashPassword(password);

  const result = await transaction(async (tx) => {
    const state = await consumeToken(tx, token.data, "reset_password");
    if (state.status !== "valid") return { state, email: null };
    const [user] = await tx.query<{ email: string }>(
      "UPDATE users SET password_hash = $2, password_changed_at = now(), email_verified_at = COALESCE(email_verified_at, now()), updated_at = now() WHERE id = $1 AND status = 'active' RETURNING email",
      [state.userId, passwordHash],
    );
    if (!user) return { state: { status: "invalid" } as TokenState, email: null };
    await revokeAllSessions(tx, state.userId);
    return { state, email: user.email };
  });
  if (result.state.status !== "valid") return { ok: false, error: tokenMessage(result.state.status), code: result.state.status, status: result.state.status };
  await audit("password_reset", ctx, result.state.userId);
  await sendQuietly(emails.passwordChanged(result.email!), "password_changed");
  return { ok: true };
}

/**
 * Requires the current password. Every session is revoked and the current
 * one is replaced by a new identifier (rotation after a privilege-sensitive
 * change).
 */
export async function changePassword(user: SessionUser, input: { current: unknown; next: unknown }, ctx: RequestContext, persistent: boolean): Promise<({ ok: true } & NewSession) | Failure> {
  const current = typeof input.current === "string" ? input.current : "";
  const next = typeof input.next === "string" ? input.next : "";
  if (!current) return invalid({ current: "Indique ton mot de passe actuel." });
  const problem = passwordProblem(next, user.email);
  if (problem) return invalid({ next: problem });
  const limit = await hit("sensitiveUser", `pw:${user.id}`);
  if (!limit.allowed) return limited(ctx, limit.retryAfter, "change_password");

  const [row] = await db.query<{ password_hash: string | null }>("SELECT password_hash FROM users WHERE id = $1", [user.id]);
  if (!row?.password_hash || !(await verifyPassword(row.password_hash, current))) return invalid({ current: "Mot de passe actuel incorrect." });
  if (await verifyPassword(row.password_hash, next)) return invalid({ next: "Choisis un mot de passe différent de l’actuel." });
  if (await isBreachedPassword(next)) return invalid({ next: BREACHED });
  const passwordHash = await hashPassword(next);

  const session = await transaction(async (tx) => {
    await tx.query("UPDATE users SET password_hash = $2, password_changed_at = now(), updated_at = now() WHERE id = $1", [user.id, passwordHash]);
    await revokeAllSessions(tx, user.id);
    return createSession(tx, { userId: user.id, roles: user.roles, remember: persistent, method: "password", userAgent: ctx.userAgent });
  });
  await audit("password_changed", ctx, user.id);
  await sendQuietly(emails.passwordChanged(user.email), "password_changed");
  return { ok: true, ...session };
}

/** Re-authentication for sensitive actions (linking an identity provider). */
export async function confirmPassword(user: SessionUser, password: unknown, ctx: RequestContext): Promise<{ ok: true } | Failure> {
  if (!user.hasPassword) return { ok: true };
  if (typeof password !== "string" || !password) return invalid({ password: "Indique ton mot de passe." });
  const limit = await hit("sensitiveUser", `confirm:${user.id}`);
  if (!limit.allowed) return limited(ctx, limit.retryAfter, "confirm_password");
  const [row] = await db.query<{ password_hash: string | null }>("SELECT password_hash FROM users WHERE id = $1", [user.id]);
  if (!row?.password_hash || !(await verifyPassword(row.password_hash, password))) return invalid({ password: "Mot de passe incorrect." });
  return { ok: true };
}

export async function updateName(user: SessionUser, input: unknown): Promise<{ ok: true; name: string } | Failure> {
  const parsed = signUpSchema.shape.name.safeParse(input);
  if (!parsed.success) return invalid({ name: parsed.error.issues[0].message });
  await db.query("UPDATE users SET name = $2, updated_at = now() WHERE id = $1", [user.id, parsed.data]);
  return { ok: true, name: parsed.data };
}

export async function unlinkGoogle(user: SessionUser, ctx: RequestContext): Promise<{ ok: true } | Failure> {
  // Never leave an account without a way in.
  if (!user.hasPassword) return { ok: false, error: "Définis d’abord un mot de passe : Google est aujourd’hui ton seul moyen de connexion.", code: "last_method" };
  const rows = await db.query("DELETE FROM user_identities WHERE user_id = $1 AND provider = 'google' RETURNING subject", [user.id]);
  if (rows.length) {
    await audit("google_unlinked", ctx, user.id);
    await sendQuietly(emails.googleUnlinked(user.email), "google_unlinked");
  }
  return { ok: true };
}

export async function getGoogleLink(userId: string) {
  const [row] = await db.query<{ email: string | null; created_at: Date }>("SELECT email, created_at FROM user_identities WHERE user_id = $1 AND provider = 'google'", [userId]);
  return row ? { email: row.email, linkedAt: row.created_at } : null;
}
