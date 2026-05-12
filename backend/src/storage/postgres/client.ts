import { Pool } from "pg";
import { requireDatabaseUrl } from "../../config/env.js";

let pool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: requireDatabaseUrl()
    });
  }

  return pool;
}

export async function closePostgresPool(): Promise<void> {
  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = null;
  await activePool.end();
}
