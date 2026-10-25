import "server-only";
import { hmac } from "@/lib/auth/crypto";
import type { RequestContext } from "@/lib/auth/context";
import { db } from "@/lib/db";

export type AuthEvent =
  | "sign_in"
  | "sign_in_failed"
  | "sign_in_blocked"
  | "sign_up"
  | "sign_up_existing"
  | "email_verified"
  | "password_reset_requested"
  | "password_reset"
  | "password_changed"
  | "google_sign_in"
  | "google_sign_up"
  | "google_linked"
  | "google_unlinked"
  | "google_rejected"
  | "session_revoked"
  | "sessions_revoked_all"
  | "sign_out"
  | "rate_limited";

/**
 * Security journal. Only identifiers and a keyed hash of the IP are kept:
 * never passwords, tokens, cookies or e-mail addresses (pass `detail` with
 * non-sensitive codes only).
 */
export async function audit(event: AuthEvent, ctx: RequestContext, userId: string | null, detail?: Record<string, string | number | boolean>) {
  const ipHash = ctx.ip ? hmac(`ip:${ctx.ip}`).slice(0, 16) : null;
  console.info(JSON.stringify({ level: "info", scope: "auth", event, userId, ipHash, ...(detail ? { detail } : {}) }));
  try {
    await db.query("INSERT INTO auth_events (user_id, event, ip_hash, detail) VALUES ($1, $2, $3, $4)", [userId, event, ipHash, detail ? JSON.stringify(detail) : null]);
  } catch (e) {
    console.error(JSON.stringify({ level: "error", scope: "auth", event: "audit_write_failed", message: e instanceof Error ? e.message : "unknown" }));
  }
}
