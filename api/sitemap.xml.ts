import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  events as eventsTable,
  galleryAlbums as galleryAlbumsTable,
  galleryImages as galleryTable,
  getDb,
  news as newsTable,
  notices as noticesTable,
  programmes as programmesTable,
  staff as staffTable,
} from '../lib/db';
import { env } from '../lib/env';
import { gt, isNull, or } from 'drizzle-orm';

/**
 * Dynamic sitemap at /sitemap.xml (via the vercel.json rewrite).
 *
 * All public content lives in Postgres, so detail pages are enumerated from
 * the DB per request (CDN-cached for an hour via Cache-Control) instead of
 * being baked at build time — new rows appear in the sitemap without a
 * redeploy. Each entry carries <lastmod> from the row's updated_at so
 * crawlers prioritise re-crawling changed pages.
 *
 * NOTE: sitemaps may only list URLs served by this site. The parent
 * university's own domain (pentvars.edu.gh) is therefore linked from the
 * site footer and the JSON-LD in index.html, not from here — external <loc>
 * entries would make the file invalid.
 */

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

/** Canonical origin; SITE_URL env allows a custom domain without a redeploy. */
const SITE = env.siteUrl.replace(/\/+$/, '');

/** Index pages that always exist (no DB dependency). */
const STATIC_ROUTES: UrlEntry[] = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/programmes', changefreq: 'weekly', priority: '0.9' },
  { loc: '/news', changefreq: 'daily', priority: '0.9' },
  { loc: '/events', changefreq: 'weekly', priority: '0.8' },
  { loc: '/resources', changefreq: 'weekly', priority: '0.8' },
  { loc: '/staff', changefreq: 'monthly', priority: '0.7' },
  { loc: '/gallery', changefreq: 'monthly', priority: '0.6' },
  { loc: '/research', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact', changefreq: 'yearly', priority: '0.5' },
];

/** ISO date (YYYY-MM-DD) or undefined for unusable values. */
const day = (value: unknown): string | undefined => {
  const time = new Date(value as string | number | Date).getTime();
  return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : undefined;
};

/** Detail-page entries from one table; failed queries yield []. */
function detailEntries(
  base: string,
  rows: Array<{ id: string; updatedAt: Date }>,
  priority: string,
  changefreq: string
): UrlEntry[] {
  return rows.map((row) => ({
    loc: `${base}/${encodeURIComponent(row.id)}`,
    lastmod: day(row.updatedAt),
    priority,
    changefreq,
  }));
}

/**
 * Enumerate DB-backed detail pages. Each query settles independently so one
 * failing table never takes the whole sitemap down.
 */
async function dynamicEntries(): Promise<UrlEntry[]> {
  const db = getDb();
  const [programmes, news, events, staff, gallery, albums, notices] = await Promise.allSettled([
    db.select({ id: programmesTable.id, updatedAt: programmesTable.updatedAt }).from(programmesTable),
    db.select({ id: newsTable.id, updatedAt: newsTable.updatedAt }).from(newsTable),
    db.select({ id: eventsTable.id, updatedAt: eventsTable.updatedAt }).from(eventsTable),
    db.select({ id: staffTable.id, updatedAt: staffTable.updatedAt }).from(staffTable),
    db.select({ id: galleryTable.id, updatedAt: galleryTable.updatedAt }).from(galleryTable),
    db.select({ id: galleryAlbumsTable.id, updatedAt: galleryAlbumsTable.updatedAt }).from(galleryAlbumsTable),
    // Expired notices drop off the public Resources page, so drop them here too.
    db
      .select({ id: noticesTable.id, updatedAt: noticesTable.updatedAt })
      .from(noticesTable)
      .where(or(isNull(noticesTable.expiresAt), gt(noticesTable.expiresAt, new Date()))),
  ]);

  const rows = <T extends { id: string; updatedAt: Date }>(
    result: PromiseSettledResult<T[]>
  ): T[] => (result.status === 'fulfilled' ? result.value : []);

  return [
    ...detailEntries('/programmes', rows(programmes), '0.7', 'monthly'),
    ...detailEntries('/news', rows(news), '0.7', 'weekly'),
    ...detailEntries('/events', rows(events), '0.6', 'monthly'),
    ...detailEntries('/staff', rows(staff), '0.5', 'yearly'),
    ...detailEntries('/gallery', rows(gallery), '0.5', 'yearly'),
    ...detailEntries('/gallery/albums', rows(albums), '0.6', 'monthly'),
    ...detailEntries('/resources/notices', rows(notices), '0.6', 'monthly'),
  ];
}

function toXml(entries: UrlEntry[]): string {
  const body = entries
    .map((entry) => {
      const parts = [`    <loc>${SITE}${entry.loc}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      parts.push(`    <priority>${entry.priority}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
    '',
  ].join('\n');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).end();
    return;
  }
  let entries = STATIC_ROUTES;
  try {
    entries = [...STATIC_ROUTES, ...(await dynamicEntries())];
  } catch (err) {
    // DB unreachable? Still serve the static routes so crawlers are never
    // handed an error page; detail pages reappear on the next warm request.
    console.error('[sitemap] dynamic entries failed:', err);
  }
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(toXml(entries));
}
