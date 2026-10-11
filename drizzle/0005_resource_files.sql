-- Downloadable resource files (timetables, handbooks, logbooks, forms…).
-- Grouped by `category` so the public Resources page can render each card
-- (Timetable / Internship / Downloads) from admin-managed rows.
-- Idempotent so re-runs are safe.

CREATE TABLE IF NOT EXISTS "resource_files" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "category" text NOT NULL DEFAULT 'downloads',
  "file_url" text NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);