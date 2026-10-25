import { rm } from "node:fs/promises";
import { hash } from "@node-rs/argon2";
import { execFileSync } from "node:child_process";
import pg from "pg";
import { ADMIN_DATABASE_URL, E2E_DATABASE_URL, MAIL_DIR, SELLER, STAFF } from "./env";

/** Fresh database with two accounts: a staff member (seller + admin) and a seller. */
export default async function globalSetup() {
  const admin = new pg.Client({ connectionString: ADMIN_DATABASE_URL });
  await admin.connect();
  await admin.query("DROP DATABASE IF EXISTS yayo_e2e WITH (FORCE)");
  await admin.query("CREATE DATABASE yayo_e2e");
  await admin.end();
  execFileSync(process.execPath, ["scripts/migrate.mjs"], { env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL }, stdio: "inherit" });
  await rm(MAIL_DIR, { recursive: true, force: true });

  const db = new pg.Client({ connectionString: E2E_DATABASE_URL });
  await db.connect();
  for (const [u, roles] of [
    [STAFF, ["seller", "admin"]],
    [SELLER, ["seller"]],
  ] as const) {
    await db.query("INSERT INTO users (email, name, password_hash, roles, email_verified_at) VALUES ($1, $2, $3, $4, now())", [u.email, u.name, await hash(u.password, { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 }), roles]);
  }
  await db.end();
}
