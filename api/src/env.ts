import 'dotenv/config';

// Validate required environment variables
const required = ['DATABASE_URL', 'JWT_SECRET', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missing = required.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error(`[API] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  r2AccountId: process.env.R2_ACCOUNT_ID!,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID!,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  r2Bucket: process.env.R2_BUCKET!,
  adminEmail: process.env.ADMIN_EMAIL!,
  adminPassword: process.env.ADMIN_PASSWORD!,
  nodeEnv: process.env.NODE_ENV || 'production',
};
