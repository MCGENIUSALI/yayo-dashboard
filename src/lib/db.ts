import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { getConfig } from "@/lib/auth/config";

/**
 * Postgres access. Every query is parameterised ($1, $2…): values never go
 * through string concatenation. One small pool per server instance, reused
 * across hot reloads in development.
 */
const g = globalThis as unknown as { __yayoPool?: Pool };

function pool() {
  if (!g.__yayoPool) {
    g.__yayoPool = new Pool({ connectionString: getConfig().DATABASE_URL, max: 5, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 5_000 });
    g.__yayoPool.on("error", (e) => console.error(JSON.stringify({ level: "error", scope: "db", event: "pool_error", message: e.message })));
  }
  return g.__yayoPool;
}

export interface Queryable {
  query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<T[]>;
}

export const db: Queryable = {
  async query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
    return (await pool().query<T>(text, params)).rows;
  },
};

export async function transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T> {
  const client: PoolClient = await pool().connect();
  const tx: Queryable = { query: async <R extends QueryResultRow>(text: string, params: unknown[] = []) => (await client.query<R>(text, params)).rows };
  try {
    await client.query("BEGIN");
    const result = await fn(tx);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** Tests only: close the pool so the process can exit. */
export async function closeDb() {
  await g.__yayoPool?.end();
  g.__yayoPool = undefined;
}
