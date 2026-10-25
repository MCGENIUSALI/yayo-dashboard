import "server-only";
import { randomToken, sha256 } from "@/lib/auth/crypto";
import { db, type Queryable } from "@/lib/db";

export type AppRole = "seller" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  roles: AppRole[];
  emailVerified: boolean;
  hasPassword: boolean;
}

export interface Session {
  publicId: string;
  userId: string;
  persistent: boolean;
  expiresAt: Date;
  authMethod: "password" | "google";
}

/**
 * Session policy (server-side, the cookie lifetime only mirrors it):
 * - standard: browser-session cookie, expires after 12 h without activity, 24 h at most;
 * - "remember me": persistent cookie, 7 days without activity, 30 days at most;
 * - admin accounts: always standard cookie, 2 h without activity, 12 h at most, "remember me" ignored.
 * Activity refreshes `last_seen_at` at most once a minute.
 */
const HOUR = 3600;
export function sessionPolicy(roles: AppRole[], remember: boolean) {
  if (roles.includes("admin")) return { persistent: false, idleSec: 2 * HOUR, absoluteSec: 12 * HOUR };
  if (remember) return { persistent: true, idleSec: 7 * 24 * HOUR, absoluteSec: 30 * 24 * HOUR };
  return { persistent: false, idleSec: 12 * HOUR, absoluteSec: 24 * HOUR };
}

/** Concurrent sessions per account; the oldest are revoked beyond this. */
export const MAX_SESSIONS = 20;
const TOUCH_EVERY_SEC = 60;

/**
 * Creates a session after a fully verified authentication. The token (256
 * random bits) is returned once for the cookie; only its SHA-256 is stored.
 * A fresh identifier is issued on every sign-in, and the previous session of
 * this browser is revoked, so a planted identifier is never upgraded
 * (session fixation).
 */
export async function createSession(
  q: Queryable,
  input: { userId: string; roles: AppRole[]; remember: boolean; method: Session["authMethod"]; userAgent: string | null; replacesToken?: string | null },
) {
  const policy = sessionPolicy(input.roles, input.remember);
  const token = randomToken();
  if (input.replacesToken) await q.query("UPDATE sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL", [sha256(input.replacesToken)]);
  const [row] = await q.query<{ expires_at: Date }>(
    `INSERT INTO sessions (id, user_id, auth_method, persistent, idle_timeout_seconds, expires_at, user_agent)
     VALUES ($1, $2, $3, $4, $5, now() + make_interval(secs => $6), $7) RETURNING expires_at`,
    [sha256(token), input.userId, input.method, policy.persistent, policy.idleSec, policy.absoluteSec, input.userAgent?.slice(0, 256) ?? null],
  );
  await q.query(
    `UPDATE sessions SET revoked_at = now() WHERE id IN (
       SELECT id FROM sessions WHERE user_id = $1 AND revoked_at IS NULL ORDER BY created_at DESC OFFSET $2)`,
    [input.userId, MAX_SESSIONS],
  );
  return { token, expiresAt: row.expires_at, persistent: policy.persistent };
}

interface Row {
  public_id: string;
  user_id: string;
  persistent: boolean;
  expires_at: Date;
  auth_method: Session["authMethod"];
  needs_touch: boolean;
  email: string;
  name: string;
  roles: AppRole[];
  email_verified: boolean;
  has_password: boolean;
}

/**
 * Validates a cookie token on every protected request: the session must
 * exist, not be revoked, be within both its idle and absolute lifetime, and
 * belong to an active account. Anything else is a refusal.
 */
export async function validateSessionToken(token: string): Promise<{ session: Session; user: SessionUser } | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const id = sha256(token);
  const [row] = await db.query<Row>(
    `SELECT s.public_id, s.user_id, s.persistent, s.expires_at, s.auth_method,
            s.last_seen_at < now() - make_interval(secs => $2) AS needs_touch,
            u.email, u.name, u.roles, u.email_verified_at IS NOT NULL AS email_verified, u.password_hash IS NOT NULL AS has_password
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > now()
        AND s.last_seen_at + make_interval(secs => s.idle_timeout_seconds) > now()
        AND u.status = 'active'`,
    [id, TOUCH_EVERY_SEC],
  );
  if (!row) return null;
  if (row.needs_touch) await db.query("UPDATE sessions SET last_seen_at = now() WHERE id = $1 AND revoked_at IS NULL", [id]);
  return {
    session: { publicId: row.public_id, userId: row.user_id, persistent: row.persistent, expiresAt: row.expires_at, authMethod: row.auth_method },
    user: { id: row.user_id, email: row.email, name: row.name, roles: row.roles, emailVerified: row.email_verified, hasPassword: row.has_password },
  };
}

export async function revokeSessionByToken(token: string) {
  await db.query("UPDATE sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL", [sha256(token)]);
}

/** Revokes one of the caller's own sessions. The user id comes from the validated session, never from the browser. */
export async function revokeOwnSession(userId: string, publicId: string) {
  const rows = await db.query("UPDATE sessions SET revoked_at = now() WHERE public_id = $1 AND user_id = $2 AND revoked_at IS NULL RETURNING public_id", [publicId, userId]);
  return rows.length > 0;
}

export async function revokeAllSessions(q: Queryable, userId: string, exceptToken?: string) {
  await q.query("UPDATE sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL AND ($2::text IS NULL OR id <> $2)", [userId, exceptToken ? sha256(exceptToken) : null]);
}

export interface ActiveSession {
  publicId: string;
  createdAt: Date;
  lastSeenAt: Date;
  userAgent: string | null;
  authMethod: Session["authMethod"];
  persistent: boolean;
}

export async function listActiveSessions(userId: string): Promise<ActiveSession[]> {
  const rows = await db.query<{ public_id: string; created_at: Date; last_seen_at: Date; user_agent: string | null; auth_method: Session["authMethod"]; persistent: boolean }>(
    `SELECT public_id, created_at, last_seen_at, user_agent, auth_method, persistent FROM sessions
      WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > now() AND last_seen_at + make_interval(secs => idle_timeout_seconds) > now()
      ORDER BY last_seen_at DESC`,
    [userId],
  );
  return rows.map((r) => ({ publicId: r.public_id, createdAt: r.created_at, lastSeenAt: r.last_seen_at, userAgent: r.user_agent, authMethod: r.auth_method, persistent: r.persistent }));
}
