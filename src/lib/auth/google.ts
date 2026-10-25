import "server-only";
import { createHash } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { safeEqual } from "@/lib/auth/crypto";

/**
 * Google OpenID Connect, authorization code flow for a confidential web
 * client, with state (login CSRF), nonce (ID token replay) and PKCE S256
 * (code interception). Endpoints are Google's published ones.
 */
export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export const pkceChallenge = (verifier: string) => createHash("sha256").update(verifier).digest("base64url");

export function authorizationUrl(p: { clientId: string; redirectUri: string; state: string; nonce: string; codeVerifier: string }) {
  const url = new URL(GOOGLE_AUTH_URL);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: p.clientId,
    redirect_uri: p.redirectUri,
    scope: "openid email profile",
    state: p.state,
    nonce: p.nonce,
    code_challenge: pkceChallenge(p.codeVerifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url.toString();
}

export class GoogleError extends Error {
  constructor(public readonly code: string) {
    super(`Google sign-in rejected: ${code}`);
    this.name = "GoogleError";
  }
}

/** Exchanges the one-time code (server to server, with the client secret and PKCE verifier) for an ID token. Access tokens are discarded. */
export async function exchangeCode(p: { code: string; codeVerifier: string; redirectUri: string; clientId: string; clientSecret: string }, fetchImpl: typeof fetch = fetch): Promise<string> {
  let res: Response;
  try {
    res = await fetchImpl(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ grant_type: "authorization_code", code: p.code, code_verifier: p.codeVerifier, redirect_uri: p.redirectUri, client_id: p.clientId, client_secret: p.clientSecret }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
  } catch {
    throw new GoogleError("token_endpoint_unreachable");
  }
  if (!res.ok) throw new GoogleError("code_exchange_failed");
  const body = (await res.json().catch(() => null)) as { id_token?: unknown } | null;
  if (typeof body?.id_token !== "string") throw new GoogleError("missing_id_token");
  return body.id_token;
}

export interface GoogleIdentity {
  sub: string;
  email: string;
  name: string | null;
}

/**
 * Verifies the ID token cryptographically (RS256 signature against Google's
 * JWKS) and its claims: issuer, audience, expiry / issued-at, authorized
 * party, nonce, and a verified e-mail. A decoded-but-unverified token is
 * never trusted.
 */
export async function verifyIdToken(idToken: string, p: { clientId: string; nonce: string; keys?: JWTVerifyGetKey }): Promise<GoogleIdentity> {
  let payload;
  try {
    ({ payload } = await jwtVerify(idToken, p.keys ?? googleJwks, { issuer: GOOGLE_ISSUERS, audience: p.clientId, algorithms: ["RS256"], clockTolerance: 30, maxTokenAge: "1h", requiredClaims: ["sub", "iat", "exp"] }));
  } catch {
    throw new GoogleError("invalid_id_token");
  }
  if (payload.azp !== undefined && payload.azp !== p.clientId) throw new GoogleError("invalid_azp");
  if (typeof payload.nonce !== "string" || !safeEqual(payload.nonce, p.nonce)) throw new GoogleError("nonce_mismatch");
  if (typeof payload.sub !== "string" || payload.sub.length === 0 || payload.sub.length > 255) throw new GoogleError("invalid_sub");
  if (typeof payload.email !== "string" || payload.email_verified !== true) throw new GoogleError("email_not_verified");
  return { sub: payload.sub, email: payload.email, name: typeof payload.name === "string" ? payload.name : null };
}
