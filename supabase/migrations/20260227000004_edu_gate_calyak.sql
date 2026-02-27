-- Remove non-.edu users from the calyak system course
DELETE FROM course_memberships
WHERE course_id = (
  SELECT id FROM courses WHERE source = 'system' AND external_id = 'caltodo-yak'
)
AND user_id IN (
  SELECT id FROM auth.users WHERE email NOT LIKE '%.edu'
);
