-- Add soft-delete support to course_memberships so deleted folders
-- appear in the Recently Deleted section instead of being permanently removed.
ALTER TABLE course_memberships ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
