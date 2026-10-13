-- 0009: awards table for the homepage awards marquee.
-- Idempotent: safe to re-run (this project's runner applies ALL files each deploy).
CREATE TABLE IF NOT EXISTS awards (
  id text PRIMARY KEY,
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
