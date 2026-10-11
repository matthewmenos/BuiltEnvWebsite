/**
 * File-based upload helpers.
 *
 * Files upload DIRECTLY to Cloudflare R2 via a short-lived presigned PUT URL:
 * the browser asks `/api/admin/files` for a URL (`action: 'presign'`), PUTs the
 * raw bytes to R2 (never through our serverless function — so there is no
 * 4.5 MB request-body cap), then calls back (`action: 'register'`) to record
 * metadata. The server returns a stable id; that id becomes a public URL
 * served by `/api/uploads/<id>`.
 *
 * If presigning fails (e.g. R2 unreachable from the API), we fall back to the
 * old base64-proxied upload, which is capped at ~3 MB by Vercel's body limit.
 */

/** Read a File/Blob into a `data:<mime>;base64,...` string (fallback path). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Client-side sanity guard. The presigned path itself is unbounded (bytes go
 * straight to R2), but we keep a very high ceiling to catch accidental
 * multi-gigabyte picks. Raise or remove this if you need larger files.
 */
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200 MB

export interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface UploadResult {
  /** Public URL to embed in an <img src> (proxied from R2). */
  url: string;
  id: string;
  name: string;
}

/** Public URL that streams an uploaded file by id. */
export function uploadUrl(id: string): string {
  return `/api/uploads/${id}`;
}

/**
 * Base URL of the R2 public bucket/custom domain, baked in at build time from
 * VITE_R2_PUBLIC_URL. When set, uploaded media can be referenced DIRECTLY at
 * the CDN edge instead of going through `/api/uploads/<id>` (which invokes a
 * serverless function + 302 on every image load). Empty -> use the proxy path.
 */
const CDN_BASE = (import.meta.env.VITE_R2_PUBLIC_URL || '').replace(/\/+$/, '');

/**
 * Resolve a stored media reference to the fastest URL:
 *  - `/api/uploads/<id>`  ->  `<CDN>/uploads/<id>` when a CDN base is set,
 *                            otherwise the proxy URL (unchanged behaviour).
 *  - anything else (already-absolute URLs, seed assets, empty) passes through.
 *
 * This lets `<img src>` hit Cloudflare's edge directly, skipping the Vercel
 * function hop that made media feel slow — without changing how/where files
 * are stored.
 */
export function mediaUrl(url: string): string {
  if (!url || !CDN_BASE) return url;
  const m = /^\/api\/uploads\/([^/?#]+)/.exec(url);
  if (!m) return url;
  return `${CDN_BASE}/uploads/${m[1]}`;
}

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Primary path: presign → direct PUT to R2 → register. No practical size cap
 * because the bytes bypass the serverless function entirely.
 */
async function uploadPresigned(
  file: File,
  token: string | null
): Promise<UploadResult> {
  // 1) Ask the API for a short-lived PUT URL for a fresh id.
  const presignRes = await fetch('/api/admin/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ action: 'presign' }),
  });
  const presign = await presignRes.json().catch(() => ({}));
  if (!presignRes.ok || !presign.uploadUrl || !presign.id) {
    throw new Error(presign.error || 'Could not start upload');
  }
  const { id, uploadUrl: putUrl, publicUrl } = presign as {
    id: string;
    uploadUrl: string;
    publicUrl: string;
  };

  // 2) PUT the raw bytes straight to R2. No base64 inflation, no size cap.
  const putRes = await fetch(putUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`Upload to storage failed (${putRes.status})`);
  }

  // 3) Record metadata in the admin registry (idempotent on retry).
  const regRes = await fetch('/api/admin/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({
      action: 'register',
      id,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    }),
  });
  if (!regRes.ok) {
    // Bytes are already in R2 and served by id; metadata listing may lag but
    // the image is usable, so don't hard-fail the whole upload.
    const data = await regRes.json().catch(() => ({}));
    console.warn('[upload] register failed:', data.error || regRes.status);
  }

  return { url: publicUrl || uploadUrl(id), id, name: file.name };
}

/** Fallback: base64-proxied upload (capped ~3 MB by Vercel's body limit). */
async function uploadProxied(
  file: File,
  token: string | null
): Promise<UploadResult> {
  const dataUrl = await readFileAsDataUrl(file);
  const res = await fetch('/api/admin/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({
      files: [{ name: file.name, mimeType: file.type, dataUrl }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Upload failed');
  }
  const item: UploadedFile | undefined = Array.isArray(data.items)
    ? data.items[0]
    : undefined;
  if (!item?.id) {
    throw new Error('Upload failed');
  }
  return { url: uploadUrl(item.id), id: item.id, name: item.name };
}

/**
 * Upload one file and return its public URL. Throws on failure so callers can
 * surface a message. `token` is the admin JWT (Bearer).
 */
export async function uploadFile(
  file: File,
  token: string | null
): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File is too large (max ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB)`
    );
  }
  try {
    return await uploadPresigned(file, token);
  } catch (err) {
    // If presigning itself failed (no uploadUrl / R2 unreachable from the
    // API), retry via the proxied path so small uploads still work.
    const message = err instanceof Error ? err.message : String(err);
    const presignFailed = /could not start upload/i.test(message);
    if (presignFailed && file.size <= 3 * 1024 * 1024) {
      return uploadProxied(file, token);
    }
    throw err;
  }
}

/** Delete a previously-uploaded file by id (best effort). */
export async function deleteUploadedFile(
  id: string,
  token: string | null
): Promise<void> {
  const res = await fetch('/api/admin/files', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Delete failed');
  }
}

/** Extract the file id from a `/api/uploads/<id>` URL (or return null). */
export function idFromUploadUrl(url: string): string | null {
  const m = /\/api\/uploads\/([^/?#]+)/.exec(url || '');
  return m?.[1] ?? null;
}
