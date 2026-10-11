import type { VercelRequest, VercelResponse } from '@vercel/node';
import { count, eq } from 'drizzle-orm';
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
  /**
   * If true, the row PK is a caller-supplied key (site_settings.key) rather
   * than a generated id: POST upserts by key and single-GET returns all rows.
   */
  keyed?: boolean;
}

/**
 * Shared GET (paginated list, public) + POST (create) + PUT (update by id)
 * + DELETE (remove by id) handler for the admin content resources.
 * Fixes two bugs from the old api/src routes:
 * the broken `.select({ count: table.id.length })` count query (now uses
 * drizzle's `count()`) and the duplicated `rows` declaration.
 */
export async function handleResource(
  req: VercelRequest,
  res: VercelResponse,
  config: ResourceConfig
): Promise<void> {
  const getId = (): string | undefined => {
    const q = req.query as Record<string, string | string[] | undefined>;
    const fromQuery = Array.isArray(q.id) ? q.id[0] : q.id;
    if (fromQuery) return fromQuery;
    // Support /api/admin/<resource>/<id> style URLs (incl. the [...all]
    // catch-all router): the id is the last path segment, and the segment
    // before it is the resource name.
    const url = (req.url || '').split('?')[0] ?? '';
    const segs = url.split('/').filter(Boolean);
    const last = segs[segs.length - 1];
    if (!last || last === 'api' || last === 'admin') return undefined;
    const prev = segs[segs.length - 2];
    if (prev === 'admin') return undefined; // /api/admin/<resource> — no id
    return last;
  };
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 200, {});
      return;
    }

    if (req.method === 'GET') {
      const db: any = getDb();
      const id = getId();
      // Single-item read: /api/admin/<resource>/<id> (used by the public
      // detail pages). Keyed resources ignore the id and return all rows as
      // a map — consumers index by key client-side.
      if (id && !config.keyed) {
        const rows = await db
          .select()
          .from(config.table)
          .where(eq(config.table.id, id))
          .limit(1);
        const item = rows[0];
        if (!item) {
          sendJson(res, 404, { error: 'Not found' });
          return;
        }
        sendJson(res, 200, { item });
        return;
      }
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
      // Keyed resources (site_settings): upsert one row per supplied key.
      // Accepts { key, value } or { settings: { key: value, ... } }.
      if (config.keyed) {
        const entries: Array<[string, string]> = [];
        if (body.settings && typeof body.settings === 'object') {
          for (const [k, v] of Object.entries(body.settings)) {
            entries.push([k, String(v ?? '')]);
          }
        } else if (typeof body.key === 'string' && body.key.length > 0) {
          entries.push([body.key, String(body.value ?? '')]);
        }
        if (entries.length === 0) {
          sendJson(res, 400, { error: 'Missing required fields', fields: ['settings'] });
          return;
        }
        const items: any[] = [];
        for (const [key, value] of entries) {
          const [item] = await db
            .insert(config.table)
            .values({ key, value })
            .onConflictDoUpdate({
              target: config.table.key,
              set: { value, updatedAt: new Date() },
            })
            .returning();
          items.push(item);
        }
        sendJson(res, 200, { items });
        return;
      }
      const [item] = await db
        .insert(config.table)
        .values({ id: generateId(), ...config.buildValues(body, req) })
        .returning();
      sendJson(res, 201, { item });
      return;
    }

    if (req.method === 'PUT') {
      requireAuth(req);
      const id = getId();
      if (!id) {
        sendJson(res, 400, { error: 'Missing id' });
        return;
      }
      const body = await readJsonBody<Record<string, any>>(req);
      const db: any = getDb();
      const [item] = await db
        .update(config.table)
        .set({ ...config.buildValues(body, req), updatedAt: new Date() })
        .where(eq(config.table.id, id))
        .returning();
      if (!item) {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }
      sendJson(res, 200, { item });
      return;
    }

    if (req.method === 'DELETE') {
      requireAuth(req);
      const id = getId();
      if (!id) {
        sendJson(res, 400, { error: 'Missing id' });
        return;
      }
      const db: any = getDb();
      const [item] = await db
        .delete(config.table)
        .where(eq(config.table.id, id))
        .returning();
      if (!item) {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }
      sendJson(res, 200, { item });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    handleError(res, err);
  }
}

export { clientIp };
