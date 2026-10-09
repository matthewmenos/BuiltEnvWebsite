import { accessSync, constants, mkdirSync } from 'fs';
import path from 'path';

/**
 * Single source of truth for where uploaded binaries are stored on disk.
 *
 * Every upload-related route (api/admin/files.ts and api/uploads/[id].ts)
 * must resolve the SAME directory, otherwise files written by the admin
 * upload endpoint can never be served back by the public endpoint.
 *
 * We resolve from `process.cwd()` (the repo root at runtime) rather than
 * `__dirname` so the result is identical regardless of how deep the calling
 * file sits in the `api/` tree. We prefer the project's `uploads/` folder and
 * transparently fall back to the OS temp dir when the project folder is not
 * writable (e.g. Vercel's read-only serverless filesystem, where /tmp IS
 * shared between functions).
 */
let cachedDir: string | undefined;

function isWritable(dir: string): boolean {
  try {
    accessSync(dir, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export function getUploadDir(): string {
  if (cachedDir) return cachedDir;

  const candidates = [
    path.resolve(process.cwd(), 'uploads'),
    path.join('/tmp', 'builtenv-uploads'),
  ];

  for (const dir of candidates) {
    try {
      mkdirSync(dir, { recursive: true });
      if (isWritable(dir)) {
        cachedDir = dir;
        return dir;
      }
    } catch {
      // Try the next candidate.
    }
  }

  // Last resort: /tmp path even if we could not verify writability.
  cachedDir = candidates[candidates.length - 1] as string;
  return cachedDir;
}

export function getRegistryFile(): string {
  return path.join(getUploadDir(), 'registry.json');
}
