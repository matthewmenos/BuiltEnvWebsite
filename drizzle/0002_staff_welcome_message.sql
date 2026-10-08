-- Add staff contact columns + HOD welcome message.
-- Aligns the `staff` table with shared/schema.ts (department, phone,
-- address, welcome_message). Safe to run multiple times.
ALTER TABLE staff ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT 'Built Environment';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS welcome_message text;
