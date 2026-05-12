import fs from "node:fs/promises";
import path from "node:path";
import { getPostgresPool } from "../storage/postgres/client.js";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "db", "migrations");

async function run(): Promise<void> {
  const pool = getPostgresPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const entries = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true });
  const migrationFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();

  const applied = await pool.query<{ version: string }>(
    `SELECT version FROM schema_migrations`
  );
  const appliedSet = new Set(applied.rows.map((row) => row.version));

  for (const fileName of migrationFiles) {
    if (appliedSet.has(fileName)) {
      continue;
    }

    const fullPath = path.join(MIGRATIONS_DIR, fileName);
    const sql = await fs.readFile(fullPath, "utf8");
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        `INSERT INTO schema_migrations (version) VALUES ($1)`,
        [fileName]
      );
      await client.query("COMMIT");
      console.log(`Applied migration ${fileName}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  await pool.end();
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
