import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  contacts as contactsTable,
  events as eventsTable,
  galleryImages as galleryTable,
  homeSlides as homeSlidesTable,
  news as newsTable,
  notices as noticesTable,
  programmes as programmesTable,
  staff as staffTable,
} from '../../lib/db';
import { clientIp, handleResource, type ResourceConfig } from '../../lib/resource';

/**
 * Catch-all admin resource router: ONE serverless function serving
 * /api/admin/<resource> and /api/admin/<resource>/<id>.
 *
 * Static sibling files (files.ts, login.ts, logout.ts) take routing
 * precedence for their exact paths; everything else lands here.
 * Replaces the eight per-resource files so the deployment stays under
 * the Vercel Hobby function-count limit.
 */
const RESOURCES: Record<string, ResourceConfig> = {
  programmes: {
    table: programmesTable,
    defaultLimit: 50,
    required: ['title', 'shortCode', 'description', 'faculty', 'duration'],
    buildValues: (body) => ({
      title: body.title,
      shortCode: body.shortCode,
      description: body.description,
      faculty: body.faculty,
      duration: body.duration,
      admission: body.admission,
      euFees: body.euFees,
      nonEuFees: body.nonEuFees,
      accreditation: body.accreditation,
      images: body.images || '[]',
    }),
  },
  news: {
    table: newsTable,
    defaultLimit: 20,
    required: ['title', 'summary', 'body', 'author', 'category'],
    buildValues: (body) => ({
      title: body.title,
      summary: body.summary,
      body: body.body,
      author: body.author,
      category: body.category,
      image: body.image || '',
    }),
  },
  events: {
    table: eventsTable,
    defaultLimit: 20,
    required: ['title', 'description', 'location', 'startTime', 'endTime'],
    buildValues: (body) => ({
      title: body.title,
      description: body.description,
      location: body.location,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      image: body.image || '',
      category: body.category || 'general',
    }),
  },
  staff: {
    table: staffTable,
    defaultLimit: 50,
    required: ['name', 'position', 'email', 'bio', 'image'],
    buildValues: (body) => ({
      name: body.name,
      position: body.position,
      department: body.department || 'Built Environment',
      email: body.email,
      phone: body.phone || '',
      address: body.address || '',
      bio: body.bio,
      welcomeMessage: body.welcomeMessage ?? null,
      image: body.image,
      researchInterests: body.researchInterests || '[]',
    }),
  },
  gallery: {
    table: galleryTable,
    defaultLimit: 50,
    required: ['title', 'description', 'imageUrl'],
    buildValues: (body) => ({
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      credit: body.credit || '',
      featured: body.featured || false,
    }),
  },
  notices: {
    table: noticesTable,
    defaultLimit: 50,
    required: ['title', 'body', 'author'],
    buildValues: (body) => ({
      title: body.title,
      body: body.body,
      author: body.author,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    }),
  },
  contacts: {
    table: contactsTable,
    defaultLimit: 50,
    required: ['name', 'email', 'subject', 'message'],
    // Public endpoint — the contact form writes without a token.
    publicWrite: true,
    buildValues: (body, req) => ({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      ipAddress: clientIp(req),
      userAgent: req.headers['user-agent'] || '',
    }),
  },
  'home-slides': {
    table: homeSlidesTable,
    defaultLimit: 20,
    required: ['imageUrl'],
    buildValues: (body) => ({
      imageUrl: body.imageUrl,
      altText: body.altText || '',
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      active:
        body.active === undefined
          ? true
          : body.active === true || body.active === 'true',
    }),
  },
};

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const q = req.query as Record<string, string | string[] | undefined>;
  // Vercel exposes the catch-all param under `all`, but the dashboard shows
  // the key as `...all` — accept every plausible spelling, then fall back to
  // parsing the URL path so routing never depends on the query-key format.
  const candidates: Array<string | string[] | undefined> = [
    q.all,
    (q as Record<string, unknown>)['...all'] as string | string[] | undefined,
    (q as Record<string, unknown>)['…all'] as string | string[] | undefined,
  ];
  let segments: string[] = [];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) {
      segments = c;
      break;
    }
    if (typeof c === 'string' && c.length > 0) {
      segments = c.split('/').filter(Boolean);
      break;
    }
  }
  if (segments.length === 0) {
    const urlPath = (req.url || '').split('?')[0] ?? '';
    const parts = urlPath.split('/').filter(Boolean);
    const adminIdx = parts.lastIndexOf('admin');
    if (adminIdx >= 0) {
      segments = parts.slice(adminIdx + 1);
    }
  }
  // Strip any incidental query-key artefacts (e.g. a literal "...all" prefix
  // leaking through) and URI-decode segments.
  segments = segments
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    })
    .filter((s) => s.length > 0 && s !== '...all' && s !== '…all');
  const resource = segments[0];
  const pathId = segments[1];
  // Expose the path-style id as ?id= so handleResource.getId() finds it.
  if (pathId && !q.id) {
    (req.query as Record<string, unknown>).id = pathId;
  }
  const config = resource ? RESOURCES[resource] : undefined;
  if (!config) {
    res.status(404).json({ error: 'Unknown resource' });
    return Promise.resolve();
  }
  return handleResource(req, res, config);
}
