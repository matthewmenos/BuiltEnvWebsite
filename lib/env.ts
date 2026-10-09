// Serverless-safe environment access for Vercel functions.
//
// Unlike the old api/src/env.ts, this module NEVER calls process.exit() —
// exiting would kill the serverless function host. Missing variables throw
// lazily when first accessed, so unrelated endpoints (e.g. /api/health)
// keep working and failures surface as 500s with a clear message.
//
// Local: `vercel dev` loads .env.local automatically.
// Production: set variables in the Vercel dashboard (Project > Settings >
// Environment Variables).
function read(name: string): string | undefined {
  const v = process.env[name];
  return v !== undefined && v !== '' ? v : undefined;
}

function required(name: string): string {
  const v = read(name);
  if (!v) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  get databaseUrl(): string {
    return required('DATABASE_URL');
  },
  get jwtSecret(): string {
    return required('JWT_SECRET');
  },
  get jwtExpiresIn(): string {
    return read('JWT_EXPIRES_IN') || '7d';
  },
  // --- Cloudflare R2 (REQUIRED — all media storage, see lib/r2.ts) ---
  // Read lazily; lib/r2.ts validates presence with actionable errors so
  // unrelated endpoints (e.g. /api/health) keep working when R2 is unset.
  /** Optional S3-compatible endpoint override (local mocks / MinIO). */
  get r2Endpoint(): string {
    return read('R2_ENDPOINT') || '';
  },
  get r2AccountId(): string {
    return read('R2_ACCOUNT_ID') || '';
  },
  get r2AccessKeyId(): string {
    return read('R2_ACCESS_KEY_ID') || '';
  },
  get r2SecretAccessKey(): string {
    return read('R2_SECRET_ACCESS_KEY') || '';
  },
  get r2Bucket(): string {
    return read('R2_BUCKET') || '';
  },
  /**
   * Optional public base URL (R2 public dev URL or custom domain). When set,
   * GET /api/uploads/<id> 302-redirects there instead of proxying through
   * this function. Requires a publicly reachable bucket.
   */
  get r2PublicUrl(): string {
    return read('R2_PUBLIC_URL') || '';
  },
  get adminEmail(): string {
    return required('ADMIN_EMAIL');
  },
  get adminPassword(): string {
    return required('ADMIN_PASSWORD');
  },
  get nodeEnv(): string {
    return read('NODE_ENV') || 'production';
  },
};
