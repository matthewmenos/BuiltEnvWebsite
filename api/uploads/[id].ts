import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

import { getRegistryFile, getUploadDir } from '../../lib/uploads-dir';

// Public, unauthenticated route that streams a previously-uploaded file by id.
// The binary lives on disk in `uploads/`; the registry maps id -> disk name.
// The directory is resolved by the shared helper so it always matches the
// location written by the admin upload endpoint (api/admin/files.ts).
const UPLOAD_DIR = getUploadDir();
const REGISTRY_FILE = getRegistryFile();

interface RegistryEntry {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  diskName: string;
}

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Support both `/api/uploads/<id>` (dynamic segment) and `?id=<id>`.
  const q = req.query as Record<string, string | string[] | undefined>;
  const rawId = Array.isArray(q.id) ? q.id[0] : q.id;
  if (!rawId) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  try {
    if (!existsSync(REGISTRY_FILE)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const registry = JSON.parse(
      readFileSync(REGISTRY_FILE, 'utf8')
    ) as RegistryEntry[];
    const entry = Array.isArray(registry)
      ? registry.find((f) => f && (f.id === rawId || f.name === rawId))
      : undefined;
    if (!entry) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const filePath = path.join(UPLOAD_DIR, entry.diskName || entry.name);
    if (!existsSync(filePath)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const buffer = readFileSync(filePath);
    res.setHeader('Content-Type', entry.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', String(buffer.length));
    res.setHeader('Cache-Control', CACHE_HEADERS['Cache-Control']);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(entry.name || entry.id)}"`
    );
    res.status(200).send(buffer);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/uploads]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
