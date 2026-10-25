#!/usr/bin/env node
/**
 * Versioned, reversible SQL migrations (db/migrations/NNNN_name.{up,down}.sql).
 *   npm run db:migrate            apply every pending migration
 *   npm run db:migrate -- down    revert the latest applied migration
 *   npm run db:migrate -- status  list applied / pending
 * Each migration runs in its own transaction. Reads DATABASE_URL.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");

export async function migrate(databaseUrl, command = "up") {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
    const applied = new Set((await client.query("SELECT version FROM schema_migrations")).rows.map((r) => r.version));
    const versions = (await readdir(dir)).filter((f) => f.endsWith(".up.sql")).map((f) => f.replace(/\.up\.sql$/, "")).sort();

    if (command === "status") {
      for (const v of versions) console.log(`${applied.has(v) ? "applied" : "pending"}  ${v}`);
      return;
    }
    if (command === "down") {
      const last = versions.filter((v) => applied.has(v)).at(-1);
      if (!last) return console.log("Nothing to revert.");
      await run(client, await readFile(path.join(dir, `${last}.down.sql`), "utf8"), "DELETE FROM schema_migrations WHERE version = $1", last);
      return console.log(`reverted ${last}`);
    }
    for (const v of versions.filter((v) => !applied.has(v))) {
      await run(client, await readFile(path.join(dir, `${v}.up.sql`), "utf8"), "INSERT INTO schema_migrations (version) VALUES ($1)", v);
      console.log(`applied ${v}`);
    }
  } finally {
    await client.end();
  }
}

async function run(client, sql, record, version) {
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query(record, [version]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  migrate(url, process.argv[2] ?? "up").catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
