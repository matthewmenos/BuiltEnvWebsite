-- 0008: add sort_order to staff for drag-to-reorder in the admin dashboard.
-- Idempotent: safe to re-run (this project's runner applies ALL files each deploy).
ALTER TABLE staff ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Seed existing rows with their creation order so the initial admin ordering is
-- stable. Guard: only run while every row is still at the default 0 — i.e. the
-- column was just added and nobody has reordered yet. Once any row has a
-- non-zero value (a real admin order), skip so re-deploys never scramble it.
UPDATE staff SET sort_order = sub.rn
FROM (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) - 1) * 10 AS rn
  FROM staff
) AS sub
WHERE staff.id = sub.id
  AND staff.sort_order = 0
  AND NOT EXISTS (SELECT 1 FROM staff s2 WHERE s2.sort_order <> 0);
