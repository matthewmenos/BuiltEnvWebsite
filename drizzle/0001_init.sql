-- ---------------------------------------------------------------------------
-- 0001_init — baseline schema (core content tables).
--
-- Matches shared/schema.ts BEFORE the 0002/0003 migrations:
--   * staff WITHOUT department/phone/address/welcome_message (added in 0002)
--   * no home_slides table (created in 0003)
--
-- Safe to re-run (CREATE TABLE IF NOT EXISTS). Applied by `npm run db:apply`,
-- which runs 0001 -> 0002 -> 0003 in order.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name          text NOT NULL,
  role          text NOT NULL DEFAULT 'admin',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS programmes (
  id           text PRIMARY KEY,
  title        text NOT NULL,
  short_code   text NOT NULL UNIQUE,
  description  text NOT NULL,
  faculty      text NOT NULL,
  duration     text NOT NULL,
  admission    text NOT NULL,
  eu_fees      text NOT NULL,
  non_eu_fees  text NOT NULL,
  accreditation text NOT NULL,
  images       text NOT NULL DEFAULT '[]',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news (
  id           text PRIMARY KEY,
  title        text NOT NULL,
  summary      text NOT NULL,
  body         text NOT NULL,
  author       text NOT NULL,
  category     text NOT NULL,
  image        text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id          text PRIMARY KEY,
  title       text NOT NULL,
  description text NOT NULL,
  location    text NOT NULL,
  start_time  timestamptz NOT NULL,
  end_time    timestamptz NOT NULL,
  image       text NOT NULL,
  category    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff (
  id                 text PRIMARY KEY,
  name               text NOT NULL,
  position           text NOT NULL,
  email              text NOT NULL UNIQUE,
  bio                text NOT NULL,
  image              text NOT NULL,
  research_interests text NOT NULL DEFAULT '[]',
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id          text PRIMARY KEY,
  title       text NOT NULL,
  description text NOT NULL,
  image_url   text NOT NULL,
  credit      text NOT NULL DEFAULT '',
  featured    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notices (
  id         text PRIMARY KEY,
  title      text NOT NULL,
  body       text NOT NULL,
  author     text NOT NULL,
  posted_at  timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text NOT NULL,
  message    text NOT NULL,
  ip_address text NOT NULL,
  user_agent text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
