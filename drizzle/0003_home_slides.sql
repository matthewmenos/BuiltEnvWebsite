-- Homepage hero background-carousel slides (admin-configurable).
-- Aligns with shared/schema.ts `homeSlides`. Safe to run multiple times.
CREATE TABLE IF NOT EXISTS home_slides (
  id text PRIMARY KEY,
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
