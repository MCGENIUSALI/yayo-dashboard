import { readdir, readFile } from "node:fs/promises";
import { hash } from "@node-rs/argon2";
import { expect, type Page } from "@playwright/test";
import pg from "pg";
import { E2E_DATABASE_URL, MAIL_DIR } from "../env";

/** Direct database access, only to arrange states (expired session, expired link) and to assert what the server stored. */
export async function sql<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: unknown[] = []) {
  const c = new pg.Client({ connectionString: E2E_DATABASE_URL });
  await c.connect();
  try {
    return (await c.query<T>(text, params)).rows;
  } finally {
    await c.end();
  }
}

export const uniqueEmail = (tag: string) => `${tag}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}@yayo.test`;

export async function createAccount(p: { email: string; password: string; roles?: string[]; verified?: boolean }) {
  const h = await hash(p.password, { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const [u] = await sql<{ id: string }>("INSERT INTO users (email, name, password_hash, roles, email_verified_at) VALUES ($1, 'Test Vendeur', $2, $3, CASE WHEN $4 THEN now() END) RETURNING id", [p.email, h, p.roles ?? ["seller"], p.verified ?? true]);
  return u.id;
}

/** Latest message sent to an address by the file transport, waiting for it to land. */
export async function lastMail(to: string, subject?: RegExp) {
  let found: { to: string; subject: string; text: string } | undefined;
  await expect
    .poll(async () => {
      const files = (await readdir(MAIL_DIR).catch(() => [] as string[])).sort();
      const all = await Promise.all(files.map(async (f) => JSON.parse(await readFile(`${MAIL_DIR}/${f}`, "utf8"))));
      found = all.filter((m) => m.to === to && (!subject || subject.test(m.subject))).at(-1);
      return Boolean(found);
    })
    .toBe(true);
  return found!;
}

export const linkIn = (text: string) => /(https?:\/\/\S+token=[A-Za-z0-9_-]{43})/.exec(text)![1];

export async function signIn(page: Page, email: string, password: string, opts: { next?: string; remember?: boolean } = {}) {
  await page.goto(opts.next ? `/connexion?suite=${encodeURIComponent(opts.next)}` : "/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  if (opts.remember) await page.getByLabel(/Se souvenir de moi/).check();
  await page.getByRole("button", { name: "Se connecter" }).click();
}

export const onPath = (page: Page, path: string) => expect.poll(() => new URL(page.url()).pathname).toBe(path);
