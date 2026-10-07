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
  // R2 is optional (files endpoint is an MVP placeholder).
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
