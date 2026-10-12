-- Gallery albums: openable collections of photos with a cover image.
CREATE TABLE IF NOT EXISTS gallery_albums (
  id          text PRIMARY KEY,
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  sort_order  integer NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Link gallery photos to a parent album (nullable: unassigned photos stay ungrouped).
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS album_id text;
