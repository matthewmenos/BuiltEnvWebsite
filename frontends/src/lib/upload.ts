/**
 * File-based upload helpers.
 *
 * Files are read in the browser as base64 data URLs and POSTed to
 * `/api/admin/files`, which stores them in Cloudflare R2. The server returns a stable
 * id; that id becomes a public URL served by `/api/uploads/<id>`.
 * No image is referenced by an external URL — everything is file based.
 */

/** Read a File/Blob into a `data:<mime>;base64,...` string. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

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
 * Upload one file and return its public URL. Throws on failure so callers can
 * surface a message. `token` is the admin JWT (Bearer).
 */
export async function uploadFile(
  file: File,
  token: string | null
): Promise<UploadResult> {
  const dataUrl = await readFileAsDataUrl(file);
  const res = await fetch('/api/admin/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
