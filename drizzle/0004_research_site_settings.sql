-- Research areas + site settings (see shared/schema.ts).
-- Idempotent so re-runs are safe.

CREATE TABLE IF NOT EXISTS "research_areas" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "icon" text NOT NULL DEFAULT 'microscope',
  "sort_order" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "site_settings" (
  "key" text PRIMARY KEY,
  "value" text NOT NULL DEFAULT '',
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Seed the 3 research cards currently hardcoded on the public Research page,
-- and the contact details currently hardcoded on the public Contact/Home/Footer.
INSERT INTO "research_areas" ("id", "title", "description", "icon", "sort_order", "active")
VALUES
  ('seed-climate-lab', 'Climate Resilience Lab', 'Applied research on flood-resilient housing, heat-responsive design and infrastructure for Ghanaian cities.', 'microscope', 0, true),
  ('seed-materials', 'Materials Innovation', 'Testing low-carbon binders, laterite composites and durable local materials for affordable construction.', 'building', 1, true),
  ('seed-partnerships', 'Industry Partnerships', 'Live briefs, guest studios and placement routes with quantity surveying, construction and planning firms.', 'award', 2, true)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "site_settings" ("key", "value")
VALUES
  ('contact.address', 'Department of Built Environment, Pentecost University, Sowutuom, Accra, Ghana'),
  ('contact.phone', '+233 302 417 064'),
  ('contact.email', 'info@pentvars.edu.gh'),
  ('contact.hours', 'Monday - Friday: 8:00 AM - 5:00 PM'),
  ('contact.mapQuery', 'Pentecost University Sowutuom Accra Ghana')
ON CONFLICT ("key") DO NOTHING;
