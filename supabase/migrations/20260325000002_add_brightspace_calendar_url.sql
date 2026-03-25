-- Add Brightspace (D2L) iCal calendar URL for syncing assignments
ALTER TABLE integration_credentials
ADD COLUMN IF NOT EXISTS brightspace_calendar_url text;
