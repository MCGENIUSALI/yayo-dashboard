import "server-only";
import { createHash } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { getConfig } from "@/lib/auth/config";
import { normalizePassword } from "@/lib/auth/validation";

/**
 * Argon2id with the OWASP baseline (19 MiB, 2 passes, 1 lane): ~50 ms on a
 * Vercel function, fits the 1 GB memory limit under concurrency.
 * `algorithm: 2` is Argon2id (the package exports it as a const enum).
 */
const OPTIONS = { algorithm: 2, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string) => hash(normalizePassword(password), OPTIONS);

export async function verifyPassword(stored: string, password: string) {
  try {
    return await verify(stored, normalizePassword(password));
  } catch {
    return false;
  }
}

let dummy: Promise<string> | undefined;

/**
 * Runs a full verification against a throwaway hash when the account does not
 * exist or has no password, so response time does not reveal which e-mails
 * are registered.
 */
export async function verifyAgainstDummy(password: string) {
  dummy ??= hashPassword(`dummy-${Math.random()}`);
  await verifyPassword(await dummy, password);
  return false;
}

/**
 * Have I Been Pwned range API (k-anonymity: only the first 5 hex chars of the
 * SHA-1 leave the server, responses are padded). Fails open after 2.5 s: an
 * outage of the service must not block sign-ups, it is logged instead.
 */
export async function isBreachedPassword(password: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  if (getConfig().AUTH_PASSWORD_BREACH_CHECK === "off") return false;
  const sha1 = createHash("sha1").update(normalizePassword(password)).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  try {
    const res = await fetchImpl(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { "Add-Padding": "true" }, signal: AbortSignal.timeout(2500), cache: "no-store" });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const body = await res.text();
    return body.split("\n").some((line) => {
      const [s, count] = line.trim().split(":");
      return s === suffix && Number(count) > 0;
    });
  } catch (e) {
    console.warn(JSON.stringify({ level: "warn", scope: "auth", event: "breach_check_unavailable", message: e instanceof Error ? e.message : "unknown" }));
    return false;
  }
}
