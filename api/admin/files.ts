import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
} from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';

import { requireAuth } from '../../lib/http';
import { getRegistryFile, getUploadDir } from '../../lib/uploads-dir';

// Uploaded binaries live on disk under the shared `uploads/` folder. The
// directory is resolved by the shared helper so this route and the public
// /api/uploads/[id] route always read and write the SAME location.
const UPLOAD_DIR = getUploadDir();
// The registry maps each logical id -> { disk path + metadata } and is what the
// list/delete endpoints read/write. It is the single source of truth.
const REGISTRY_FILE = getRegistryFile();

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per file

interface StoredFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  /** File name on disk (uuid + ext). Kept so DELETE removes the right file. */
  diskName: string;
}

type RegistryEntry = StoredFile;

function ensureUploadDir(): void {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function loadRegistry(): RegistryEntry[] {
  if (!existsSync(REGISTRY_FILE)) return [];
  try {
    const raw = readFileSync(REGISTRY_FILE, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((f): f is RegistryEntry => !!f && typeof f === 'object')
      : [];
  } catch {
    return [];
  }
}

function saveRegistry(files: RegistryEntry[]): void {
  try {
    writeFileSync(REGISTRY_FILE, JSON.stringify(files, null, 2), 'utf8');
  } catch {
    // Ignore registry persistence failures; the response still reflects the save.
  }
}

function extFromMime(mimeType: string): string {
  const base = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
    'application/pdf': '.pdf',
  };
  return map[base] ?? '';
}

function safeExt(originalName: string): string {
  return path.extname(originalName || '').toLowerCase().slice(0, 10);
}

/**
 * Parse a `data:<mime>;base64,<payload>` string into raw bytes.
 * Returns null if the string is not a valid base64 data URL.
 */
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

interface IncomingFile {
  name?: string;
  mimeType?: string;
  dataUrl?: string;
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    if (req.method === 'OPTIONS') {
      res.status(200).json({});
      return;
    }

    if (req.method === 'GET') {
      const files = loadRegistry();
      res.status(200).json({ items: files });
      return;
    }

    if (req.method === 'POST') {
      requireAuth(req);
      const body = (req.body ?? {}) as Record<string, unknown>;
      const incoming = normalizeFiles(body);
      if (incoming.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      ensureUploadDir();
      const saved: RegistryEntry[] = [];

      for (const item of incoming) {
        if (!item.dataUrl) {
          res.status(400).json({ error: 'Missing file data' });
          return;
        }
        const parsed = parseDataUrl(item.dataUrl);
        if (!parsed) {
          res.status(400).json({ error: 'Invalid file data' });
          return;
        }
        if (parsed.buffer.length === 0) {
          res.status(400).json({ error: 'Empty file' });
          return;
        }
        if (parsed.buffer.length > MAX_BYTES) {
          res.status(413).json({ error: 'File too large (max 8 MB)' });
          return;
        }

        const id = randomUUID();
        const ext =
          safeExt(item.name ?? '') || extFromMime(item.mimeType || parsed.mimeType);
        const diskName = `${id}${ext}`;
        writeFileSync(path.join(UPLOAD_DIR, diskName), parsed.buffer);

        saved.push({
          id,
          name: item.name || diskName,
          mimeType: item.mimeType || parsed.mimeType,
          size: parsed.buffer.length,
          uploadedAt: new Date().toISOString(),
          diskName,
        });
      }

      const registry = loadRegistry();
      registry.push(...saved);
      saveRegistry(registry);

      res.status(201).json({ items: saved });
      return;
    }

    if (req.method === 'DELETE') {
      requireAuth(req);
      const body = (req.body ?? {}) as { id?: string; name?: string };
      const id = body.id || body.name;
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }

      const registry = loadRegistry();
      const index = registry.findIndex((f) => f.id === id || f.name === id);
      if (index === -1) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const file = registry[index];
      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }
      try {
        rmSync(path.join(UPLOAD_DIR, file.diskName || file.name), { force: true });
      } catch {
        // Ignore file-system removal errors; registry state is authoritative.
      }
      registry.splice(index, 1);
      saveRegistry(registry);
      res.status(200).json({ item: file });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/files]', err);
    const status = (err as { status?: number }).status;
    if (typeof status === 'number') {
      res.status(status).json({ error: (err as Error).message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
