-- Single cover image per programme (matches news/events/staff).
-- The legacy `images` JSON-array column is left in place; `image` holds the
-- cover shown on the public card and detail header.
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS image text NOT NULL DEFAULT '';
