/**
 * Represents a task in the todolist.
 * Manual tasks have source=null. Synced assignments have source set
 * to "canvas" or "gradescope" with additional metadata fields.
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string | null;
  due_time: string | null;
  is_completed: boolean;
  color: string;
  created_at: string;
  updated_at: string;
  source: "canvas" | "gradescope" | null;
  external_id: string | null;
  course_name: string | null;
  source_url: string | null;
  points_possible: number | null;
  is_submitted: boolean;
  google_event_id: string | null;
  dismissed_at: string | null;
  repeat_interval: number | null;
  repeat_unit: "day" | "week" | "month" | null;
  late_due_date: string | null;
}

/**
 * Fields required to create a new task.
 */
export interface TaskInsert {
  title: string;
  description?: string;
  due_date?: string | null;
  due_time?: string | null;
  color?: string;
  repeat_interval?: number | null;
  repeat_unit?: "day" | "week" | "month" | null;
}

/**
 * Fields that can be updated on an existing task.
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  due_date?: string | null;
  due_time?: string | null;
  is_completed?: boolean;
  color?: string;
  repeat_interval?: number | null;
  repeat_unit?: "day" | "week" | "month" | null;
}

/**
 * A Google Calendar entry as returned by the calendarList API.
 *
 * @param id - The calendar's unique ID (email-like string)
 * @param summary - Display name of the calendar
 * @param primary - Whether this is the user's primary calendar
 * @param backgroundColor - Hex color assigned to this calendar
 * @param accessRole - User's access level ("owner", "writer", "reader", "freeBusyReader")
 */
export interface GCalCalendarEntry {
  id: string;
  summary: string;
  primary: boolean;
  backgroundColor: string;
  accessRole: string;
}

/**
 * Integration credentials as returned by the API.
 * Gradescope password is never returned — only a boolean flag.
 */
export interface IntegrationCredentials {
  canvas_token: string | null;
  canvas_base_url: string;
  gradescope_email: string | null;
  has_gradescope_password: boolean;
  last_synced_at: string | null;
  selected_canvas_courses: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses: Array<{ id: string; name: string }> | null;
  has_google_calendar: boolean;
  google_calendar_id: string | null;
  google_email: string | null;
  google_photo_url: string | null;
}

/**
 * Payload for saving integration credentials via PUT /api/credentials.
 *
 * @param canvas_token - Canvas API token (null to clear)
 * @param canvas_base_url - Canvas instance URL
 * @param gradescope_email - Gradescope login email (null to clear)
 * @param gradescope_password - Gradescope password in plaintext (encrypted server-side, null to keep existing)
 */
export interface CredentialsSavePayload {
  canvas_token?: string | null;
  canvas_base_url?: string;
  gradescope_email?: string | null;
  gradescope_password?: string | null;
  selected_canvas_courses?: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses?: Array<{ id: string; name: string }> | null;
}

/**
 * Result of a sync operation for a single source.
 */
export interface SyncSourceResult {
  synced: number;
  errors: string[];
}

/**
 * Combined result of a full sync operation.
 */
export interface SyncResult {
  canvas: SyncSourceResult;
  gradescope: SyncSourceResult;
  last_synced_at: string;
}

/**
 * Response from the Google Calendar sync endpoint.
 *
 * @param synced - Whether the event was synced to Google Calendar
 * @param googleEventId - The Google Calendar event ID (on create/update)
 * @param reason - Why sync was skipped (e.g. "not_connected", "no_due_date")
 * @param error - Error message if sync failed
 */
export interface GCalSyncResponse {
  synced: boolean;
  googleEventId?: string;
  reason?: string;
  error?: string;
}
