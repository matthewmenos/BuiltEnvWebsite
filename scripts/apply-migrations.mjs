/**
 * Idempotent SQL migration runner.
 *
 * Applies every `drizzle/*.sql` file, in filename order, to the Neon
 * database named by DATABASE_URL. Each migration is written to be safe to
 * re-run (CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS), so this
 * runner simply executes them in order and is safe to invoke repeatedly.
 *
 * We run raw SQL (rather than `drizzle-kit migrate`) because the migrations
 * in `drizzle/` are hand-maintained and there is no `meta/_journal.json`.
 *
 * Usage:  npm run db:apply
 * Reads DATABASE_URL from the environment, falling back to `.env`.
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // Minimal .env fallback (no dotenv dependency in this project).
  try {
    const env = readFileSync(join(root, '.env'), 'utf8');
    const match = env.match(/^DATABASE_URL=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  } catch {
    /* ignore */
  }
  throw new Error('DATABASE_URL is not set (env or .env).');
}

/**
 * Split a SQL script into individual statements.
 *
 * The Neon HTTP driver executes each call as a single prepared statement
 * (extended query protocol), so it rejects multiple commands in one string
 * ("cannot insert multiple commands into a prepared statement"). We therefore
 * split on semicolons while respecting single-quoted string literals and
 * `--` line comments, then send each statement separately.
 */
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let i = 0;
  let inString = false;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inString) {
      current += ch;
      if (ch === "'") {
        // '' is an escaped quote inside a string literal.
        if (next === "'") {
          current += next;
          i += 2;
          continue;
        }
        inString = false;
      }
      i += 1;
      continue;
    }

    if (ch === "'") {
      inString = true;
      current += ch;
      i += 1;
      continue;
    }

    // Line comment: consume to end of line.
    if (ch === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') {
        current += sql[i];
        i += 1;
      }
      continue;
    }

    if (ch === ';') {
      statements.push(current);
      current = '';
      i += 1;
      continue;
    }

    current += ch;
    i += 1;
  }
  if (current.trim().length > 0) statements.push(current);

  // Drop statements that contain no SQL (only comments/whitespace).
  return statements
    .map((s) => s.trim())
    .filter((s) => s.replace(/--[^\n]*/g, '').trim().length > 0);
}

const sql = neon(loadDatabaseUrl());
const dir = join(root, 'drizzle');
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.log('No migration files found in drizzle/.');
  process.exit(0);
}

let total = 0;
for (const file of files) {
  const contents = readFileSync(join(dir, file), 'utf8');
  const statements = splitStatements(contents);
  console.log(`Applying ${file} (${statements.length} statement(s)) ...`);
  try {
    for (const stmt of statements) {
      await sql(stmt);
      total += 1;
    }
    console.log(`  ok`);
  } catch (err) {
    console.error(`  FAILED ${file}:`, err);
    process.exit(1);
  }
}

console.log(`\nAll ${files.length} migration(s) applied (${total} statements).`);

