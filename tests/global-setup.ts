import pg from "pg";
// @ts-expect-error plain ESM script without types
import { migrate } from "../scripts/migrate.mjs";
import { ADMIN_URL, TEST_DB, TEST_URL } from "./db-url";

export default async function setup() {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${TEST_DB}`);
  await admin.end();
  await migrate(TEST_URL, "up");
}
