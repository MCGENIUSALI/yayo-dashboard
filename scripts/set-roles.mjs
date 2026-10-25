#!/usr/bin/env node
/**
 * Roles are never granted from the browser. An operator assigns them here:
 *   npm run auth:roles -- someone@example.com seller,admin
 * Revokes the account's sessions so the new rights apply on next sign-in.
 */
import pg from "pg";

const [email, roles] = process.argv.slice(2);
const allowed = ["seller", "admin"];
const list = (roles ?? "").split(",").map((r) => r.trim()).filter(Boolean);
if (!email || list.length === 0 || list.some((r) => !allowed.includes(r))) {
  console.error("Usage: npm run auth:roles -- <email> <seller|admin|seller,admin>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rows } = await client.query("UPDATE users SET roles = $2, updated_at = now() WHERE email = $1 RETURNING id", [email.trim().toLowerCase(), list]);
  if (!rows[0]) {
    console.error("No account with this e-mail.");
    process.exitCode = 1;
  } else {
    await client.query("UPDATE sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [rows[0].id]);
    await client.query("INSERT INTO auth_events (user_id, event, detail) VALUES ($1, 'roles_changed', $2)", [rows[0].id, JSON.stringify({ roles: list })]);
    console.log(`Roles set to ${list.join(", ")}; existing sessions revoked.`);
  }
} finally {
  await client.end();
}
