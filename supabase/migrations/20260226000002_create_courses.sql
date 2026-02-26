-- Normalized courses table for discussion boards.
-- Deduped by (source, external_id) so the same platform course
-- always maps to one row, regardless of display-name changes.

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,           -- "canvas", "gradescope", "pensieve"
  external_id TEXT NOT NULL,      -- platform course ID (stable identifier)
  name TEXT NOT NULL,             -- display name (updated on each sync)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dedup index: one row per (source, external_id)
CREATE UNIQUE INDEX idx_courses_source_external ON courses (source, external_id);

-- RLS: anyone authenticated can read courses; writes via admin client only (during sync)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select" ON courses
  FOR SELECT TO authenticated
  USING (true);
