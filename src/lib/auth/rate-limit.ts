import "server-only";
import { hmac } from "@/lib/auth/crypto";
import { db } from "@/lib/db";

/**
 * Fixed-window counters in Postgres, so every serverless instance shares them
 * (an in-memory counter would reset on each cold start). Windows simply
 * expire: no permanent lock an attacker could use against a legitimate user.
 * Keys are HMAC'd: the table holds no e-mail or IP in clear.
 * Per-IP limits are generous because mobile operators in Kinshasa put many
 * customers behind the same address (CGNAT); per-account limits are strict.
 */
export const LIMITS = {
  signInIp: { max: 100, windowSec: 15 * 60 },
  signInAccount: { max: 8, windowSec: 15 * 60 },
  signUpIp: { max: 10, windowSec: 60 * 60 },
  resetRequestIp: { max: 10, windowSec: 15 * 60 },
  resetRequestAccount: { max: 3, windowSec: 60 * 60 },
  verifyResendIp: { max: 10, windowSec: 15 * 60 },
  verifyResendAccount: { max: 3, windowSec: 60 * 60 },
  tokenSubmitIp: { max: 20, windowSec: 15 * 60 },
  googleIp: { max: 60, windowSec: 15 * 60 },
  sensitiveUser: { max: 6, windowSec: 15 * 60 },
} as const;

export type LimitName = keyof typeof LIMITS;

export interface LimitResult {
  allowed: boolean;
  /** Seconds until the window resets. */
  retryAfter: number;
}

export async function hit(name: LimitName, subject: string | null): Promise<LimitResult> {
  // Without a trusted client IP the per-IP limits cannot be enforced per client; account limits still apply.
  if (subject === null) return { allowed: true, retryAfter: 0 };
  const { max, windowSec } = LIMITS[name];
  const key = `${name}:${hmac(`rl:${subject}`)}`;
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / (windowSec * 1000)) * windowSec * 1000);
  const [row] = await db.query<{ count: number }>(
    `INSERT INTO auth_rate_limits (key, window_start, count) VALUES ($1, $2, 1)
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN auth_rate_limits.window_start = EXCLUDED.window_start THEN auth_rate_limits.count + 1 ELSE 1 END,
       window_start = EXCLUDED.window_start
     RETURNING count`,
    [key, windowStart],
  );
  // Occasional clean-up of expired windows.
  if (Math.random() < 0.02) db.query("DELETE FROM auth_rate_limits WHERE window_start < now() - interval '1 day'").catch(() => {});
  return { allowed: row.count <= max, retryAfter: Math.ceil((windowStart.getTime() + windowSec * 1000 - now) / 1000) };
}

/** Applies several limits; reports the most restrictive failure. */
export async function hitAll(checks: [LimitName, string | null][]): Promise<LimitResult> {
  const results = await Promise.all(checks.map(([n, s]) => hit(n, s)));
  const blocked = results.filter((r) => !r.allowed);
  if (blocked.length === 0) return { allowed: true, retryAfter: 0 };
  return { allowed: false, retryAfter: Math.max(...blocked.map((r) => r.retryAfter)) };
}

export function retryMessage(retryAfter: number) {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60));
  return `Trop de tentatives. Réessaie dans ${minutes} minute${minutes > 1 ? "s" : ""}.`;
}
