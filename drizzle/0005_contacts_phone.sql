-- Add phone column to contacts so the public contact form's phone field
-- persists. Safe to run multiple times.
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
