-- Per-user colours for tags and classes.
--
-- Neither is stored as a row of its own: both are derived from the tasks that
-- carry them, so there was nowhere to hang a chosen colour and the app fell
-- back to deriving one from the name. That is stable but not editable, and a
-- student who wants their exam tag red cannot have it.
--
-- One row per (user, kind, name). The name is stored lowercased so "Hong Kong"
-- and "hong kong" cannot end up as two differently coloured entries in the
-- same list, matching how the pickers already match names.

CREATE TABLE public.label_colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Which list the name belongs to: 'tag', 'class', or 'source'. A tag and a
  -- class may share a name and still be coloured separately.
  kind TEXT NOT NULL CHECK (kind IN ('tag', 'class', 'source')),
  -- The label, lowercased. Matching is case-insensitive everywhere it is used.
  name TEXT NOT NULL CHECK (name = lower(name) AND length(name) BETWEEN 1 AND 200),
  -- Hex colour, e.g. '#0e89d6'. Constrained so a bad write cannot reach the
  -- style attribute the UI feeds it to.
  color TEXT NOT NULL CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One colour per label per user. Recolouring is an upsert onto this key.
  UNIQUE (user_id, kind, name)
);

CREATE INDEX idx_label_colors_user_id ON public.label_colors(user_id);

ALTER TABLE public.label_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own label colors"
  ON public.label_colors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own label colors"
  ON public.label_colors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own label colors"
  ON public.label_colors FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own label colors"
  ON public.label_colors FOR DELETE
  USING (auth.uid() = user_id);
