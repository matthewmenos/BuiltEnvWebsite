import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import * as schema from '../../shared/schema';

// Re-export shared tables so routes can do:
//   import { db, programmes } from '../../database' (with correct depth)
export * from '../../shared/schema';
export { schema };

// Neon HTTP driver for serverless functions.
// NOTE: `drizzle-orm/neon-serverless` expects a `Pool | PoolClient | Client`
// (NeonClient), while `neon()` returns a `NeonQueryFunction`. The matching
// drizzle adapter for `neon()` is `drizzle-orm/neon-http`.
const connectionString = process.env.DATABASE_URL as string;
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// For local development with a pooled connection (optional)
let pooledDb: Pool | null = null;
export function getDbPool(): Pool {
  if (!pooledDb) {
    pooledDb = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pooledDb;
}

