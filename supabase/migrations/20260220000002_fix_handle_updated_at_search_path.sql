-- Fix mutable search_path on handle_updated_at to satisfy Supabase security lint.
-- Setting search_path to '' prevents search_path hijacking attacks.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
