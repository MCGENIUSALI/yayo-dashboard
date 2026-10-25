import "server-only";
import { randomToken, sha256 } from "@/lib/auth/crypto";
import type { Queryable } from "@/lib/db";

export type TokenPurpose = "verify_email" | "reset_password";

export const TOKEN_TTL_SEC: Record<TokenPurpose, number> = { verify_email: 24 * 3600, reset_password: 30 * 60 };

/**
 * Issues a single-use link token. A new reset link cancels the previous ones
 * (only the latest request can change the password); verification links stay
 * valid until they expire, since they only confirm the mailbox they reached.
 */
export async function issueToken(q: Queryable, userId: string, purpose: TokenPurpose) {
  const token = randomToken();
  if (purpose === "reset_password") await q.query("UPDATE auth_tokens SET used_at = now() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL", [userId, purpose]);
  await q.query("INSERT INTO auth_tokens (id, user_id, purpose, expires_at) VALUES ($1, $2, $3, now() + make_interval(secs => $4))", [sha256(token), userId, purpose, TOKEN_TTL_SEC[purpose]]);
  return token;
}

export type TokenState = { status: "valid"; userId: string } | { status: "expired" | "used" | "invalid" };

/** Read-only check, to show the right screen before the user acts. */
export async function inspectToken(q: Queryable, token: string, purpose: TokenPurpose): Promise<TokenState> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { status: "invalid" };
  const [row] = await q.query<{ user_id: string; used: boolean; expired: boolean }>(
    "SELECT user_id, used_at IS NOT NULL AS used, expires_at <= now() AS expired FROM auth_tokens WHERE id = $1 AND purpose = $2",
    [sha256(token), purpose],
  );
  if (!row) return { status: "invalid" };
  if (row.used) return { status: "used" };
  if (row.expired) return { status: "expired" };
  return { status: "valid", userId: row.user_id };
}

/**
 * Consumes a token atomically: of two simultaneous requests with the same
 * token, exactly one succeeds. Expired and used tokens are refused.
 */
export async function consumeToken(q: Queryable, token: string, purpose: TokenPurpose): Promise<TokenState> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { status: "invalid" };
  const [row] = await q.query<{ user_id: string }>(
    "UPDATE auth_tokens SET used_at = now() WHERE id = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now() RETURNING user_id",
    [sha256(token), purpose],
  );
  if (row) return { status: "valid", userId: row.user_id };
  return inspectToken(q, token, purpose);
}
