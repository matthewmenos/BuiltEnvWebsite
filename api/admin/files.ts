import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

import { handleError, HttpError, readJsonBody, requireAuth, sendJson } from '../../lib/http';
import {
  deleteR2Object,
  loadUploadRegistry,
  putR2Object,
  saveUploadRegistry,
  uploadKey,
  type StoredFile,
} from '../../lib/r2';

// All media lives in Cloudflare R2 (lib/r2.ts): objects at `uploads/<id>`
// plus a JSON registry at `meta/registry.json`. Nothing touches the local
// filesystem — Vercel's serverless FS is read-only and ephemeral, which is
// why the previous disk-based implementation lost files between deploys.

// Vercel caps request bodies at 4.5 MB and base64 inflates ~4/3, so a 3 MB
// file lands at ~4 MB on the wire — the largest that reliably fits.
const MAX_BYTES = 3 * 1024 * 1024;

interface IncomingFile {
  name?: string;
  mimeType?: string;
  dataUrl?: string;
}

/** Parse a `data:<mime>;base64,<payload>` string into raw bytes. */
function parseDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string } | null {
  const match = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(dataUrl.trim());
  if (!match) return null;
  const mimeType = match[1] || 'application/octet-stream';
  const isBase64 = match[2] === ';base64';
  const payload = match[3] ?? '';
  try {
    const buffer = isBase64
      ? Buffer.from(payload, 'base64')
      : Buffer.from(decodeURIComponent(payload), 'utf8');
    return { buffer, mimeType };
  } catch {
    return null;
  }
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'application/pdf': '.pdf',
};

function extFromMime(mimeType: string): string {
  const base = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  return MIME_TO_EXT[base] ?? '';
}

/** Normalise `{ files: [...] }` or a single `{ file: {...} }` body into a list. */
function normalizeFiles(body: Record<string, unknown>): IncomingFile[] {
  const out: IncomingFile[] = [];
  const candidates: unknown[] = Array.isArray(body.files)
    ? body.files
    : body.files && typeof body.files === 'object'
      ? [body.files]
      : body.file && typeof body.file === 'object'
        ? [body.file]
        : [];
  for (const c of candidates) {
    if (c && typeof c === 'object') out.push(c as IncomingFile);
  }
  return out;
}

/** Best-effort undo of a half-finished batch (registry write failed). */
async function rollbackBatch(saved: StoredFile[]): Promise<void> {
  for (const file of saved) {
    try {
      await deleteR2Object(uploadKey(file.id));
    } catch (err) {
      console.error('[files] rollback failed for', file.id, err);
    }
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
      // Admin library listing — same auth bar as create/delete.
      requireAuth(req);
      const items = await loadUploadRegistry();
      sendJson(res, 200, { items });
      return;
    }

    if (req.method === 'POST') {
      requireAuth(req);
      const body = await readJsonBody<Record<string, unknown>>(req);
      const incoming = normalizeFiles(body);
      if (incoming.length === 0) {
        sendJson(res, 400, { error: 'No files uploaded' });
        return;
      }

      const saved: StoredFile[] = [];
      try {
        for (const item of incoming) {
          if (!item.dataUrl) throw new HttpError(400, 'Missing file data');
          const parsed = parseDataUrl(item.dataUrl);
          if (!parsed) throw new HttpError(400, 'Invalid file data');
          if (parsed.buffer.length === 0) throw new HttpError(400, 'Empty file');
          if (parsed.buffer.length > MAX_BYTES) {
            throw new HttpError(413, 'File too large (max 3 MB)');
          }

          const id = randomUUID();
          const mimeType = item.mimeType || parsed.mimeType;
          const name = item.name || `${id}${extFromMime(mimeType)}`;
          const key = uploadKey(id);
          await putR2Object(key, parsed.buffer, { contentType: mimeType, filename: name });
          saved.push({
            id,
            name,
            mimeType,
            size: parsed.buffer.length,
            uploadedAt: new Date().toISOString(),
            key,
          });
        }

        // Registry round-trip: read + append + write. A failed write rolls the
        // batch back so R2 objects and the registry never silently diverge.
        const registry = await loadUploadRegistry();
        registry.push(...saved);
        await saveUploadRegistry(registry);
      } catch (err) {
        await rollbackBatch(saved);
        throw err;
      }

      sendJson(res, 201, { items: saved });
      return;
    }

    if (req.method === 'DELETE') {
      requireAuth(req);
      const body = await readJsonBody<{ id?: string; name?: string }>(req);
      const needle = body.id || body.name;
      if (!needle) {
        sendJson(res, 400, { error: 'Missing id' });
        return;
      }

      const registry = await loadUploadRegistry();
      const index = registry.findIndex((f) => f.id === needle || f.name === needle);
      if (index === -1) {
        sendJson(res, 404, { error: 'File not found' });
        return;
      }
      const entry = registry[index];
      if (!entry) {
        sendJson(res, 404, { error: 'File not found' });
        return;
      }

      // Object first: if this fails the registry still points at it (retryable);
      // the reverse order would orphan the object with no way to find it.
      await deleteR2Object(uploadKey(entry.id));
      registry.splice(index, 1);
      await saveUploadRegistry(registry);
      sendJson(res, 200, { item: entry });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    handleError(res, err);
  }
}