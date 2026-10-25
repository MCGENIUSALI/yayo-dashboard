import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getConfig } from "@/lib/auth/config";

/** 256-bit random value, URL-safe. Used for sessions, e-mail tokens, OAuth state, nonce and PKCE. */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

/** Storage key for a secret token: a leaked table does not reveal usable tokens. */
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/** Keyed hash (AUTH_SECRET) for integrity checks and pseudonymised log / rate-limit keys. */
export const hmac = (value: string) => createHmac("sha256", getConfig().AUTH_SECRET).update(value).digest("base64url");

export function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}
