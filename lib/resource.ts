import type { VercelRequest, VercelResponse } from '@vercel/node';
import { count } from 'drizzle-orm';
import { getDb } from './db';
import { generateId } from './auth';
import {
  clientIp,
  getPagination,
  handleError,
  readJsonBody,
  requireAuth,
  sendJson,
} from './http';

export interface ResourceConfig {
  /** Drizzle pgTable object (typed as any to keep configs terse). */
  table: any;
  defaultLimit: number;
  /** Body keys that must be non-empty for POST. */
  required: string[];
  /** Build the insert row (id generated for you). */
  buildValues: (body: Record<string, any>, req: VercelRequest) => Record<string, any>;
  /** If true, POST is public (e.g. contact form). Default: POST needs auth. */
  publicWrite?: boolean;
}

/**
 * Shared GET (paginated list, public) + POST (create) handler for the
 * admin content resources. Fixes two bugs from the old api/src routes:
 * the broken `.select({ count: table.id.length })` count query (now uses
 * drizzle's `count()`) and the duplicated `rows` declaration.
 */
export async function handleResource(
  req: VercelRequest,
  res: VercelResponse,
  config: ResourceConfig
): Promise<void> {
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 200, {});
      return;
    }

    if (req.method === 'GET') {
      const db: any = getDb();
      const { limit, page, offset } = getPagination(req, config.defaultLimit);
      const [{ count: total }] = await db
        .select({ count: count() })
        .from(config.table);
      const rows = await db
        .select()
        .from(config.table)
        .limit(limit)
        .offset(offset);
      sendJson(res, 200, {
        items: rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
      return;
    }

    if (req.method === 'POST') {
      if (!config.publicWrite) {
        requireAuth(req);
      }
      const body = await readJsonBody<Record<string, any>>(req);
      const missing = config.required.filter(
        (k) => body[k] === undefined || body[k] === null || body[k] === ''
      );
      if (missing.length > 0) {
        sendJson(res, 400, { error: 'Missing required fields', fields: missing });
        return;
      }
      const db: any = getDb();
      const [item] = await db
        .insert(config.table)
        .values({ id: generateId(), ...config.buildValues(body, req) })
        .returning();
      sendJson(res, 201, { item });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    handleError(res, err);
  }
}

export { clientIp };
