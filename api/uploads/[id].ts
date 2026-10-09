import type { VercelRequest, VercelResponse } from '@vercel/node';

import { handleError, HttpError, sendJson } from '../../lib/http';
import {
  getR2Object,
  MEDIA_CACHE_CONTROL,
  r2PublicObjectUrl,
  uploadKey,
} from '../../lib/r2';

/**
 * Public route: streams a stored file by id. Objects live in R2 under
 * `uploads/<id>` — the key derives from the id (validated inside uploadKey),
 * so reads need no registry lookup and keep working even if the registry
 * write failed.
 *
 * Default: proxy bytes through this function (works with a private bucket,
 * immutable caching applied here). If R2_PUBLIC_URL is configured (public
 * bucket / custom domain), answer with a 302 instead so traffic goes
 * straight from the CDN to the browser.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const q = req.query as Record<string, string | string[] | undefined>;
  const rawId = Array.isArray(q.id) ? q.id[0] : q.id;
  if (!rawId) {
    sendJson(res, 400, { error: 'Missing id' });
    return;
  }

  try {
    const key = uploadKey(rawId); // throws 400 on malformed ids (no key escape)

    const publicUrl = r2PublicObjectUrl(key);
    if (publicUrl) {
      res.setHeader('Cache-Control', MEDIA_CACHE_CONTROL);
      res.redirect(302, publicUrl);
      return;
    }

    const ifNoneMatch = req.headers['if-none-match'];
    const upstream = await getR2Object(
      key,
      ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : {}
    );

    if (upstream.status === 304) {
      res.status(304).end();
      return;
    }
    if (upstream.status === 404) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }
    if (!upstream.ok) {
      console.error(`[uploads] R2 GET ${key} -> ${upstream.status}`);
      throw new HttpError(502, `Storage read failed (${upstream.status})`);
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') || 'application/octet-stream'
    );
    const disposition = upstream.headers.get('content-disposition');
    if (disposition) res.setHeader('Content-Disposition', disposition);
    const etag = upstream.headers.get('etag');
    if (etag) res.setHeader('ETag', etag);
    res.setHeader(
      'Cache-Control',
      upstream.headers.get('cache-control') || MEDIA_CACHE_CONTROL
    );
    res.setHeader('Content-Length', String(buffer.length));
    res.status(200).send(buffer);
  } catch (err) {
    handleError(res, err);
  }
}