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
import { handleResource, type ResourceConfig } from '../../lib/resource';

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
    buildValues: (body) => ({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
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
  const raw = Array.isArray(q.resource) ? q.resource[0] : q.resource;
  const config = raw ? RESOURCES[raw] : undefined;
  if (!config) {
    res.status(404).json({ error: 'Unknown resource' });
    return Promise.resolve();
  }
  return handleResource(req, res, config);
}
