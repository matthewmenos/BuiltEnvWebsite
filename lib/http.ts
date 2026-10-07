import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from './auth';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function sendJson(
  res: VercelResponse,
  status: number,
  data: unknown
): void {
  res.status(status).json(data);
}

/** Vercel pre-parses JSON bodies; handle string/object/missing uniformly. */
export async function readJsonBody<T = Record<string, any>>(
  req: VercelRequest
): Promise<T> {
  const body: unknown = (req as unknown as { body?: unknown }).body;
  if (body === undefined || body === null || body === '') {
    return {} as T;
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body || '{}') as T;
    } catch {
      throw new HttpError(400, 'Invalid JSON');
    }
  }
  if (typeof body === 'object') {
    return body as T;
  }
  return {} as T;
}

export function getPagination(
  req: VercelRequest,
  defaultLimit: number
): { limit: number; page: number; offset: number } {
  const q = req.query as Record<string, string | string[] | undefined>;
  const first = (
    v: string | string[] | undefined,
    fallback: string
  ): string => (Array.isArray(v) ? v[0] ?? fallback : v ?? fallback);
  const limit = Math.min(
    Math.max(parseInt(first(q.limit, String(defaultLimit)), 10) || defaultLimit, 1),
    200
  );
  const page = Math.max(parseInt(first(q.page, '1'), 10) || 1, 1);
  return { limit, page, offset: (page - 1) * limit };
}

/** Throws HttpError(401) unless a valid Bearer JWT is present. */
export function requireAuth(req: VercelRequest): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    throw new HttpError(401, 'Unauthorized');
  }
  try {
    verifyToken(auth.slice(7));
  } catch {
    throw new HttpError(401, 'Unauthorized');
  }
}

export function handleError(res: VercelResponse, err: unknown): void {
  if (err instanceof HttpError) {
    sendJson(res, err.status, { error: err.message });
    return;
  }
  console.error('[api]', err);
  sendJson(res, 500, { error: 'Internal server error' });
}

export function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] ?? '' : fwd ?? '';
  return raw.split(',')[0]?.trim() ?? '';
}
