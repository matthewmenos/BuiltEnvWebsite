import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'crypto';
import { hashPassword, signToken, verifyPassword } from '../../lib/auth';
import { env } from '../../lib/env';
import { handleError, readJsonBody, sendJson } from '../../lib/http';

// Lazily-hashed bootstrap admin from plaintext env password.
// Hashed once per warm instance (bcrypt, cost 12); only the hash is kept
// in memory and verified with constant-time comparison afterwards.
let adminPasswordHash: Promise<string> | undefined;
function getAdminPasswordHash(): Promise<string> {
  return (adminPasswordHash ??= hashPassword(env.adminPassword));
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 200, {});
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    const body = await readJsonBody<{ email?: string; password?: string }>(req);
    const { email, password } = body;

    if (!email || !password) {
      sendJson(res, 400, { error: 'Email and password required' });
      return;
    }

    if (!timingSafeStringEqual(email, env.adminEmail)) {
      sendJson(res, 401, { error: 'Invalid credentials' });
      return;
    }

    const valid = await verifyPassword(password, await getAdminPasswordHash());
    if (!valid) {
      sendJson(res, 401, { error: 'Invalid credentials' });
      return;
    }

    const token = signToken(email, email, 'admin');
    sendJson(res, 200, { token, user: { email } });
  } catch (err) {
    handleError(res, err);
  }
}
