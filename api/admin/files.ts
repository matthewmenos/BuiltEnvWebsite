import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { verifyToken } from '../../lib/auth';
import { env } from '../../lib/env';
import {
  getPagination,
  handleError,
  HttpError,
  readJsonBody,
  sendJson,
} from '../../lib/http';

interface StoredFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

// MVP placeholder: file list lives in the R2_FILES env var (JSON array).
// Full R2 upload integration would use @aws-sdk/client-s3 here.
function listFiles(): StoredFile[] {
  const raw = process.env.R2_FILES;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredFile[];
  } catch {
    return [];
  }
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

    if (req.method === 'GET') {
      const { limit, page } = getPagination(req, 50);
      const files = listFiles();
      sendJson(res, 200, {
        items: files,
        pagination: {
          total: files.length,
          page,
          limit,
          pages: Math.ceil(files.length / limit),
        },
      });
      return;
    }

    if (req.method === 'POST') {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        throw new HttpError(401, 'Unauthorized');
      }
      try {
        verifyToken(auth.slice(7));
      } catch {
        throw new HttpError(401, 'Unauthorized');
      }

      const body = await readJsonBody<{ name?: string; type?: string; size?: string | number }>(req);
      if (!body.name || !body.type) {
        sendJson(res, 400, { error: 'Missing required fields' });
        return;
      }
      void env.r2Bucket; // documents the R2 dependency for future upload wiring
      sendJson(res, 201, {
        item: {
          id: randomUUID(),
          name: body.name,
          url: process.env.R2_UPLOAD_URL || `https://example.com/uploads/${body.name}`,
          type: body.type,
          size: parseInt(String(body.size ?? '0'), 10) || 0,
          uploadedAt: new Date().toISOString(),
        },
      });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    handleError(res, err);
  }
}
