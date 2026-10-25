import { readdir, readFile, rm } from "node:fs/promises";
import type { RequestContext } from "@/lib/auth/context";
import { hashPassword } from "@/lib/auth/password";
import type { AppRole } from "@/lib/auth/sessions";
import { db } from "@/lib/db";

let n = 0;
/** A distinct client IP per test keeps per-IP rate limits independent. */
export const ctx = (ip = `10.0.${Math.floor(Math.random() * 250)}.${++n % 250}`): RequestContext => ({ ip, userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0 Safari/537.36" });

export async function resetDb() {
  await db.query("TRUNCATE users, sessions, auth_tokens, auth_rate_limits, auth_events, user_identities CASCADE");
  await rm(process.env.EMAIL_FILE_DIR!, { recursive: true, force: true });
}

export async function createUser(p: { email: string; password?: string; roles?: AppRole[]; verified?: boolean; status?: "active" | "suspended"; name?: string }) {
  const [u] = await db.query<{ id: string }>(
    "INSERT INTO users (email, name, password_hash, roles, status, email_verified_at) VALUES ($1, $2, $3, $4, $5, CASE WHEN $6 THEN now() END) RETURNING id",
    [p.email, p.name ?? "Test User", p.password ? await hashPassword(p.password) : null, p.roles ?? ["seller"], p.status ?? "active", p.verified ?? true],
  );
  return u.id;
}

export interface SentMail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function mails(): Promise<SentMail[]> {
  const dir = process.env.EMAIL_FILE_DIR!;
  const files = (await readdir(dir).catch(() => [] as string[])).sort();
  return Promise.all(files.map(async (f) => JSON.parse(await readFile(`${dir}/${f}`, "utf8")) as SentMail));
}

export const tokenFrom = (mail: SentMail) => /token=([A-Za-z0-9_-]{43})/.exec(mail.text)?.[1] ?? null;
