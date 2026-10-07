import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../lib/auth';
import { handleError, readJsonBody, sendJson } from '../../lib/http';

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

    const body = await readJsonBody<{ token?: string }>(req);
    if (!body.token) {
      sendJson(res, 400, { error: 'Token required' });
      return;
    }

    try {
      verifyToken(body.token);
    } catch {
      sendJson(res, 401, { error: 'Invalid or expired token' });
      return;
    }

    // Stateless JWT — nothing to invalidate server-side.
    sendJson(res, 200, { success: true });
  } catch (err) {
    handleError(res, err);
  }
}
