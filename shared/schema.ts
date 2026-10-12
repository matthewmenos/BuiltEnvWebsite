/**
 * Shared GraphQL-agnostic TypeScript types & Drizzle schema
 * for the Department of Built Environment website.
 *
 * Used by both the frontend (admin API client types) and the
 * serverless API (Drizzle ORM schema).
 */

/** Shared types */
export type Programmes = 'QS' | 'Construction' | 'Architecture' | 'Planning';

export interface IBreadcrumb {
  label: string;
  href?: string;
}

export interface IPageMeta {
  title: string;
  description: string;
  ogImage?: string;
}

/** Programme interface (shared between frontend and API) */
export interface IProgramme {
  id: string;
  title: string;
  shortCode: string;
  description: string;
  faculty: string;
  duration: string;
  admission: string;
  euFees: string;
  nonEuFees: string;
  accreditation: string;
  structure?: string;
  image: string;
  location: string;
}

/** Event interface (shared between frontend and API) */
export interface IEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  image: string;
  category: string;
}

/** News interface (shared between frontend and API) */
export interface INews {
  id: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  category: string;
  image: string;
  publishedAt: string;
}

/** Staff interface (shared between frontend and API) */
export interface IStaff {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  welcomeMessage?: string;
  image: string;
}

/** Gallery album (openable collection of photos) shown on the public Gallery page. */
export interface IAlbum {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  sortOrder: number;
  active: boolean;
}

/** Gallery item interface (shared between frontend and API) */
export interface IGalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  /** Optional link to a parent album (gallery_albums.id). */
  albumId: string | null;
}

/** Research area card shown on the public Research page (admin-managed). */
export interface IResearchArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  sortOrder: number;
  active: boolean;
}

/** Downloadable resource file (timetable / internship / downloads). */
export interface IResourceFile {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  sortOrder: number;
  active: boolean;
}

/** Single site-wide setting (contact info, office hours, etc.). */
export interface ISiteSetting {
  key: string;
  value: string;
}
/** Shared Drizzle schema (PostgreSQL tables) */

import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const programmes = pgTable('programmes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  shortCode: text('short_code').notNull().unique(),
  description: text('description').notNull(),
  faculty: text('faculty').notNull(),
  duration: text('duration').notNull(),
  admission: text('admission').notNull(),
  euFees: text('eu_fees').notNull(),
  nonEuFees: text('non_eu_fees').notNull(),
  accreditation: text('accreditation').notNull(),
  images: text('images').notNull().default('[]'),
  /** Single cover image shown on the public card and detail header. */
  image: text('image').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const news = pgTable('news', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  body: text('body').notNull(),
  author: text('author').notNull(),
  category: text('category').notNull(),
  image: text('image').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  image: text('image').notNull(),
  category: text('category').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const staff = pgTable('staff', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  position: text('position').notNull(),
  department: text('department').notNull().default('Built Environment'),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().default(''),
  address: text('address').notNull().default(''),
  bio: text('bio').notNull(),
  welcomeMessage: text('welcome_message'),
  image: text('image').notNull(),
  researchInterests: text('research_interests').notNull().default('[]'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const galleryImages = pgTable('gallery_images', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  credit: text('credit').notNull().default(''),
  featured: boolean('featured').notNull().default(false),
  /** Optional parent album (gallery_albums.id); unassigned photos stay ungrouped. */
  albumId: text('album_id'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Gallery albums: openable collections of photos with a cover image. */
export const galleryAlbums = pgTable('gallery_albums', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  coverImage: text('cover_image').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const notices = pgTable('notices', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  author: text('author').notNull(),
  postedAt: timestamp('posted_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull().default(''),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Research area cards on the public Research page (admin-managed). */
export const researchAreas = pgTable('research_areas', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull().default('microscope'),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Site-wide settings (contact info, office hours, …) as key/value rows.
 * The text PK is the setting key itself.
 */
export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Homepage hero background-carousel slides (admin-configurable). */
export const homeSlides = pgTable('home_slides', {
  id: text('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Downloadable resource files grouped by category (Timetable / Internship / Downloads). */
export const resourceFiles = pgTable('resource_files', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  category: text('category').notNull().default('downloads'),
  fileUrl: text('file_url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});