import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { env } from './env';

// Re-export shared tables so functions can do:
//   import { db, programmes } from '../../lib/db' (adjust depth per file)
export * from '../shared/schema';
export { schema };

// Neon HTTP driver — the correct drizzle adapter for the `neon()`
// query function in serverless (no persistent connections, no pg Pool).
// Lazily initialised so importing this module never throws when
// DATABASE_URL is missing; the error surfaces on first DB use.
function createDb() {
  return drizzle(neon(env.databaseUrl), { schema });
}

export type Database = ReturnType<typeof createDb>;

let cached: Database | undefined;

export function getDb(): Database {
  if (!cached) {
    cached = createDb();
  }
  return cached;
}
