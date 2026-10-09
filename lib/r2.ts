import { AwsClient } from 'aws4fetch';
import { webcrypto } from 'crypto';

import { env } from './env';
import { HttpError } from './http';

// aws4fetch signs with Web Crypto (crypto.subtle). Node 19+ exposes it
// globally; guard for older runtimes allowed by `engines` (>=18).
const scope = globalThis as { crypto?: unknown };
if (!scope.crypto) {
  scope.crypto = webcrypto;
}

/**
 * Cloudflare R2 (S3-compatible) storage for ALL uploaded media.
 *
 * Bucket layout:
 *   uploads/<id>        — file bytes (id = random UUID)
 *   meta/registry.json  — [{ id, name, mimeType, size, uploadedAt, key }, ...]
 *
 * Serving derives `uploads/<id>` from the request id, so reads never depend
 * on the registry; the registry only lets the admin library list original
 * filenames/sizes without HEAD-ing every object.
 *
 * Errors: missing config -> HttpError 500 naming the env vars; R2/network
 * failures -> HttpError 502. Credentials are never logged.
 */

/** Metadata for one stored file — the admin list payload. */
export interface StoredFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  /** R2 object key — always `uploads/<id>`. */
  key: string;
}

const UPLOAD_PREFIX = 'uploads/';
const REGISTRY_KEY = 'meta/registry.json';
/** Ids are UUIDs from randomUUID(); also blocks `..`/`/` inside object keys. */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
/** Uploaded media never changes for a given id — cache it hard. */
export const MEDIA_CACHE_CONTROL = 'public, max-age=31536000, immutable';

let cachedClient: AwsClient | undefined;

function r2Config(): { endpoint: string; bucket: string } {
  const missing: string[] = [];
  const endpoint =
    env.r2Endpoint ||
    (env.r2AccountId ? `https://${env.r2AccountId}.r2.cloudflarestorage.com` : '');
  if (!env.r2Endpoint && !env.r2AccountId) missing.push('R2_ACCOUNT_ID');
  if (!env.r2AccessKeyId) missing.push('R2_ACCESS_KEY_ID');
  if (!env.r2SecretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
  if (!env.r2Bucket) missing.push('R2_BUCKET');
  if (missing.length > 0) {
    throw new HttpError(500, `R2 is not configured — set ${missing.join(', ')}`);
  }
  if (!cachedClient) {
    cachedClient = new AwsClient({
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
      // AWS SigV4 constants — R2 treats both literally (per Cloudflare's
      // aws4fetch documentation).
      service: 's3',
      region: 'auto',
      // aws4fetch defaults to 10 retries with exponential backoff — far too
      // slow for a serverless function (a persistently failing R2 would burn
      // minutes of wall-clock time). 2 retries keeps worst-case added latency
      // around 150 ms while still healing one transient blip.
      retries: 2,
      initRetryMs: 50,
    });
  }
  return { endpoint: endpoint.replace(/\/+$/, ''), bucket: env.r2Bucket };
}

function r2Client(): AwsClient {
  r2Config(); // validates config as a side effect
  return cachedClient as AwsClient;
}

/** Object key for an upload id (also the id validation gate). */
export function uploadKey(id: string): string {
  if (!ID_PATTERN.test(id)) {
    throw new HttpError(400, 'Invalid id');
  }
  return `${UPLOAD_PREFIX}${id}`;
}

function encodeKey(key: string): string {
  return key.split('/').map(encodeURIComponent).join('/');
}

function objectUrl(key: string): string {
  const { endpoint, bucket } = r2Config();
  return `${endpoint}/${encodeURIComponent(bucket)}/${encodeKey(key)}`;
}

/**
 * Public URL for an object when R2_PUBLIC_URL is configured (public bucket or
 * custom domain), else null -> the caller proxies the bytes itself.
 */
export function r2PublicObjectUrl(key: string): string | null {
  const base = env.r2PublicUrl;
  if (!base) return null;
  return `${base.replace(/\/+$/, '')}/${encodeKey(key)}`;
}

/**
 * RFC 6266 Content-Disposition: ASCII fallback in `filename`, full UTF-8 in
 * `filename*`. Quotes/CR/LF are stripped so the header can never break or be
 * injected into.
 */
function contentDisposition(filename: string): string {
  const cleaned = filename.replace(/["\\\r\n]/g, '').trim() || 'file';
  const ascii = cleaned.replace(/[^\x20-\x7E]/g, '_');
  return `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(cleaned)}`;
}

function fail(op: string, err: unknown): never {
  if (err instanceof HttpError) throw err;
  console.error(`[r2] ${op} failed:`, err);
  throw new HttpError(502, `R2 ${op} failed`);
}

/** Store file bytes at `key` with immutable cache + original filename. */
export async function putR2Object(
  key: string,
  body: Buffer,
  opts: { contentType: string; filename: string }
): Promise<void> {
  try {
    const res = await r2Client().fetch(objectUrl(key), {
      method: 'PUT',
      headers: {
        'Content-Type': opts.contentType || 'application/octet-stream',
        'Content-Disposition': contentDisposition(opts.filename),
        'Cache-Control': MEDIA_CACHE_CONTROL,
      },
      body,
    });
    if (!res.ok) {
      console.error(`[r2] PUT ${key} -> ${res.status}:`, (await res.text()).slice(0, 500));
      throw new HttpError(502, `R2 upload failed (${res.status})`);
    }
  } catch (err) {
    fail('upload', err);
  }
}

/** Fetch an object; caller interprets status (404 missing, 304 unchanged). */
export async function getR2Object(
  key: string,
  headers: Record<string, string> = {}
): Promise<Response> {
  try {
    return await r2Client().fetch(objectUrl(key), { method: 'GET', headers });
  } catch (err) {
    return fail('read', err);
  }
}

/** Delete an object. Idempotent — 404 counts as success. */
export async function deleteR2Object(key: string): Promise<void> {
  try {
    const res = await r2Client().fetch(objectUrl(key), { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
      console.error(`[r2] DELETE ${key} -> ${res.status}:`, (await res.text()).slice(0, 500));
      throw new HttpError(502, `R2 delete failed (${res.status})`);
    }
  } catch (err) {
    fail('delete', err);
  }
}

/**
 * Read the file registry. Missing (first run) -> []. A present-but-unparsable
 * registry is corruption: surface 502 rather than an empty library.
 */
export async function loadUploadRegistry(): Promise<StoredFile[]> {
  const res = await getR2Object(REGISTRY_KEY);
  if (res.status === 404) return [];
  if (!res.ok) {
    console.error(`[r2] registry GET -> ${res.status}`);
    throw new HttpError(502, `R2 registry read failed (${res.status})`);
  }
  try {
    const parsed: unknown = JSON.parse(await res.text());
    if (!Array.isArray(parsed)) throw new Error('not an array');
    return parsed.filter(
      (f): f is StoredFile =>
        !!f && typeof f === 'object' && typeof (f as { id?: unknown }).id === 'string'
    );
  } catch (err) {
    console.error('[r2] registry parse failed:', err);
    throw new HttpError(502, 'R2 file registry is corrupt');
  }
}

/** Overwrite the file registry. */
export async function saveUploadRegistry(files: StoredFile[]): Promise<void> {
  try {
    const res = await r2Client().fetch(objectUrl(REGISTRY_KEY), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(files, null, 2),
    });
    if (!res.ok) {
      console.error(`[r2] registry PUT -> ${res.status}:`, (await res.text()).slice(0, 500));
      throw new HttpError(502, `R2 registry write failed (${res.status})`);
    }
  } catch (err) {
    fail('registry write', err);
  }
}
