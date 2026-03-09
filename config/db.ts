import { Pool, QueryResult, QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err: Error) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === "development") {
    console.log("[DB]", {
      text: text.substring(0, 80),
      duration: ${duration}ms,
      rows: result.rowCount,
    });
  }

  return result;
}

export async function getClient() {
  return await pool.connect();
}

export { pool };
export default { query, getClient, pool };
