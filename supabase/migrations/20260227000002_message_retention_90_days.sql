-- Message Retention: Auto-delete chat messages older than 90 days.
-- Uses pg_cron (supported out of the box on Supabase) to schedule a
-- daily cleanup at 3 AM UTC.
--
-- Notes:
-- - message_reactions FK has ON DELETE CASCADE, so reactions auto-delete.
-- - Storage objects (images) are NOT auto-deleted by this migration.
--   A separate storage cleanup can be added as a follow-up.
-- - SECURITY DEFINER lets the cron job bypass RLS.

-- Enable pg_cron extension (Supabase includes this)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Function to delete messages older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_messages()
RETURNS void AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.chat_messages
  WHERE created_at < now() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE LOG 'chat_message_cleanup: deleted % messages older than 90 days', deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule daily at 3 AM UTC
SELECT cron.schedule(
  'cleanup-old-chat-messages',
  '0 3 * * *',
  $$SELECT public.cleanup_old_chat_messages()$$
);
