import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson } from '../lib/http';
import { env } from '../lib/env';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }
  sendJson(res, 200, { status: 'ok', environment: env.nodeEnv });
}
