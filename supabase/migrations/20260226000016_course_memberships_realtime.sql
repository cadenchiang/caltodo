-- Enable Realtime for course_memberships so clients receive
-- join/leave events. REPLICA IDENTITY FULL ensures DELETE events
-- include the full old row (user_id, course_id) for filtering.
ALTER TABLE public.course_memberships REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_memberships;
