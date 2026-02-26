-- Drop the old forum tables now that chat has replaced the discussion forum.
-- Run after all UI has been switched to the chat system.

DROP TABLE IF EXISTS public.discussion_comments CASCADE;
DROP TABLE IF EXISTS public.discussion_posts CASCADE;
