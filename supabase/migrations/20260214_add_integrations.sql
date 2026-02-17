-- Integration tables: credentials storage and synced assignments

-- Table: integration_credentials
-- Stores Canvas token and encrypted Gradescope password per user.
CREATE TABLE IF NOT EXISTS public.integration_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canvas_token TEXT DEFAULT NULL,
  canvas_base_url TEXT DEFAULT 'https://bcourses.berkeley.edu',
  gradescope_email TEXT DEFAULT NULL,
  gradescope_password_encrypted TEXT DEFAULT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_integration_credentials_user_id ON public.integration_credentials(user_id);

ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own credentials"
    ON public.integration_credentials FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own credentials"
    ON public.integration_credentials FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own credentials"
    ON public.integration_credentials FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own credentials"
    ON public.integration_credentials FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE TRIGGER integration_credentials_updated_at
  BEFORE UPDATE ON public.integration_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Table: assignments
-- Stores synced assignments from Canvas and Gradescope.
-- Deduplicates via UNIQUE(user_id, source, external_id).
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('canvas', 'gradescope')),
  external_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ DEFAULT NULL,
  source_url TEXT DEFAULT NULL,
  points_possible NUMERIC DEFAULT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_source ON public.assignments(source);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own assignments"
    ON public.assignments FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own assignments"
    ON public.assignments FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own assignments"
    ON public.assignments FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own assignments"
    ON public.assignments FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE TRIGGER assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
