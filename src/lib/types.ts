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
  source: "canvas" | "gradescope" | "pensieve" | "syllabus" | null;
  external_id: string | null;
  course_name: string | null;
  source_url: string | null;
  points_possible: number | null;
  is_submitted: boolean;
  google_event_id: string | null;
  dismissed_at: string | null;
  repeat_interval: number | null;
  repeat_unit: "day" | "week" | "month" | null;
  repeat_end_date: string | null;
  repeat_end_count: number | null;
  late_due_date: string | null;
  completed_at: string | null;
  tags: string[];
  snoozed_until: string | null;
  sort_order: number | null;
  /** Set when user manually edits due_date — sync engine won't overwrite. */
  due_date_manually_edited_at: string | null;
  /** Set when user manually edits due_time — sync engine won't overwrite. */
  due_time_manually_edited_at: string | null;
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
  /** Optional course name for board-view column grouping. */
  course_name?: string | null;
  repeat_interval?: number | null;
  repeat_unit?: "day" | "week" | "month" | null;
  repeat_end_date?: string | null;
  repeat_end_count?: number | null;
  tags?: string[];
  /** Emails to invite after task creation (fire-and-forget). */
  inviteEmails?: string[];
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
  repeat_end_date?: string | null;
  repeat_end_count?: number | null;
  completed_at?: string | null;
  tags?: string[];
  snoozed_until?: string | null;
  sort_order?: number | null;
  course_name?: string | null;
  /** Auto-stamped by TaskContext.updateTask when due_date is changed. */
  due_date_manually_edited_at?: string | null;
  /** Auto-stamped by TaskContext.updateTask when due_time is changed. */
  due_time_manually_edited_at?: string | null;
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
 * A single additional Canvas account beyond the primary bCourses integration.
 *
 * @param id - Unique identifier for this account (nanoid-style, assigned on creation)
 * @param label - User-chosen display name (e.g. "Stanford Canvas")
 * @param base_url - Canvas instance base URL (e.g. "https://canvas.stanford.edu")
 * @param token - Canvas API access token
 * @param token_created_at - ISO timestamp of when the token was saved (for 120-day expiry tracking)
 * @param selected_courses - Courses chosen for sync (null = sync all, [] = sync none)
 */
export interface AdditionalCanvasAccount {
  id: string;
  label: string;
  base_url: string;
  token: string;
  token_created_at: string;
  selected_courses: Array<{ id: number; name: string }> | null;
  /** iCal calendar feed URL (alternative to API token). */
  ical_url?: string;
}

/**
 * Server-persisted record of which welcome/announcement modals
 * the user has dismissed. Stored as JSONB in integration_credentials.
 */
export interface DismissedModals {
  sync_welcome?: boolean;
  gcal_announce?: boolean;
  calchat_welcome?: boolean;
  pensieve_announced?: boolean;
  calchat_announcement?: boolean;
}

/**
 * Integration credentials as returned by the API.
 * Gradescope password is never returned — only a boolean flag.
 */
export interface IntegrationCredentials {
  canvas_token: string | null;
  canvas_base_url: string;
  /** Canvas iCal calendar feed URL (alternative to API token). */
  canvas_ical_url: string | null;
  /** Whether the Canvas token has exceeded its 120-day lifetime. */
  canvas_token_expired: boolean;
  gradescope_email: string | null;
  has_gradescope_password: boolean;
  /** Whether the last Gradescope sync failed due to invalid credentials. */
  gradescope_auth_failed: boolean;
  last_synced_at: string | null;
  selected_canvas_courses: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses: Array<{ id: string; name: string }> | null;
  selected_pensieve_courses: Array<{ id: string; name: string }> | null;
  dismissed_canvas_course_ids: number[];
  has_google_calendar: boolean;
  /** Whether Google Calendar access was revoked (refresh token invalid_grant). */
  google_auth_failed: boolean;
  google_calendar_id: string | null;
  google_email: string | null;
  google_photo_url: string | null;
  canvas_token_created_at: string | null;
  is_founding_member: boolean;
  pensieve_calendar_url: string | null;
  brightspace_calendar_url: string | null;
  additional_canvas_accounts: AdditionalCanvasAccount[];
  /** Whether the user has completed onboarding (has at least one integration configured). */
  has_completed_onboarding: boolean;
  /** Whether the user receives daily email digest notifications. */
  email_digest_enabled: boolean;
  /** Preferred hour (UTC) for daily digest email. Default 15 = 7 AM PST. */
  email_digest_hour: number;
  /** Email address to send the digest to (null = account email). */
  email_digest_address: string | null;
  /** Server-persisted record of dismissed welcome/announcement modals. */
  dismissed_modals: DismissedModals;
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
  canvas_ical_url?: string | null;
  gradescope_email?: string | null;
  gradescope_password?: string | null;
  selected_canvas_courses?: Array<{ id: number; name: string }> | null;
  selected_gradescope_courses?: Array<{ id: string; name: string }> | null;
  selected_pensieve_courses?: Array<{ id: string; name: string }> | null;
  dismissed_canvas_course_ids?: number[];
  pensieve_calendar_url?: string | null;
  brightspace_calendar_url?: string | null;
  additional_canvas_accounts?: AdditionalCanvasAccount[];
  email_digest_enabled?: boolean;
  email_digest_hour?: number;
  email_digest_address?: string | null;
  dismissed_modals?: DismissedModals;
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
  pensieve: SyncSourceResult;
  brightspace: SyncSourceResult;
  last_synced_at: string;
  /** New Canvas courses detected that the user hasn't selected yet. */
  new_canvas_courses?: Array<{ id: number; name: string }>;
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

/**
 * Notification types emitted by sync and background operations.
 */
export type NotificationType =
  | "new_assignment"
  | "assignment_updated"
  | "auto_completed"
  | "repeat_spawned"
  | "sync_error"
  | "task_invite";

/**
 * A client-side notification for the notification center.
 * Persisted in localStorage, not in the database.
 *
 * @param id - Unique identifier (nanoid-style)
 * @param type - Category of the notification
 * @param title - Short display title
 * @param description - Optional detail text
 * @param taskId - Related task ID (if applicable)
 * @param read - Whether the user has seen this notification
 * @param createdAt - ISO timestamp of when the notification was created
 */
/**
 * A task share record representing an invitation from one user to another.
 *
 * @param id - Unique share identifier
 * @param source_task_id - The original task that was shared
 * @param inviter_id - UUID of the user who sent the invite
 * @param invitee_id - UUID of the user who received the invite
 * @param copied_task_id - The task copy created in the invitee's account (null if invitee deleted it)
 * @param invitee_email - Email address of the invitee
 * @param created_at - ISO timestamp of when the share was created
 */
export interface TaskShare {
  id: string;
  source_task_id: string;
  inviter_id: string;
  invitee_id: string | null;
  copied_task_id: string | null;
  invitee_email: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string | null;
  taskId: string | null;
  read: boolean;
  createdAt: string;
}

/**
 * A pending task invite shown in the Inbox "Requests" section.
 *
 * @param shareId - The task_shares row ID
 * @param taskTitle - Title of the source task
 * @param taskDueDate - Due date of the source task (YYYY-MM-DD or null)
 * @param taskDueTime - Due time of the source task (HH:MM or null)
 * @param taskColor - Color of the source task
 * @param inviterName - Full name of the inviter (null if unavailable)
 * @param inviterEmail - Email of the inviter
 * @param inviterAvatar - Avatar URL of the inviter (null if unavailable)
 * @param createdAt - ISO timestamp of when the invite was created
 */
export interface PendingInvite {
  shareId: string;
  taskTitle: string;
  taskDueDate: string | null;
  taskDueTime: string | null;
  taskColor: string;
  inviterName: string | null;
  inviterEmail: string;
  inviterAvatar: string | null;
  createdAt: string;
}

/**
 * A normalized course record shared across integrations.
 * Deduped by (source, external_id) so the same platform course
 * always maps to one row, regardless of display-name changes.
 *
 * @param id - UUID primary key
 * @param source - Integration source ("canvas", "gradescope", "pensieve")
 * @param external_id - Stable course identifier from the source platform
 * @param name - Display name (updated on each sync)
 * @param created_at - ISO timestamp of when the course was first seen
 */
export interface Course {
  id: string;
  source: "canvas" | "gradescope" | "pensieve" | "system";
  external_id: string;
  name: string;
  created_at: string;
}

/**
 * Links a user to a course. Auto-populated during sync.
 *
 * @param id - UUID primary key
 * @param user_id - The enrolled user's auth ID
 * @param course_id - FK to the courses table
 * @param joined_at - ISO timestamp of enrollment
 */
export interface CourseMembership {
  id: string;
  user_id: string;
  course_id: string;
  joined_at: string;
}

/**
 * A chat message in a course group chat.
 * Author name/avatar are denormalized at insert time for Realtime delivery.
 *
 * @param id - UUID primary key
 * @param course_id - FK to the courses table
 * @param author_id - The message author's auth ID
 * @param author_name - Display name stored at insert time
 * @param author_avatar - Avatar URL stored at insert time
 * @param body - Message body text (1-5000 chars)
 * @param created_at - ISO timestamp of creation
 * @param updated_at - ISO timestamp of last edit
 */
export interface ChatMessage {
  id: string;
  course_id: string;
  author_id: string;
  author_name?: string | null;
  author_avatar?: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  /** UUID of the message this is a reply to (null if not a reply). */
  reply_to_id?: string | null;
  /** Client-only delivery status for optimistic UI. */
  _status?: "sending" | "delivered" | "failed";
  /** Client-only system event text (e.g. "X unsent a message"). When set, renders as a centered notice instead of a bubble. */
  _systemText?: string;
}

/**
 * Presence state for a user in a course chat channel.
 *
 * @param user_id - The user's auth ID
 * @param user_name - Display name
 * @param user_avatar - Avatar URL
 * @param online_at - ISO timestamp of when presence was established
 * @param status - User-set status: "online", "idle", or "dnd". Defaults to "online" if absent.
 */
export interface ChatPresence {
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  online_at: string;
  status?: "online" | "idle" | "dnd";
}

/**
 * A member avatar preview for board cards.
 */
export interface MemberPreview {
  name: string | null;
  avatar: string | null;
}

/**
 * A course board summary for the board list view.
 *
 * @param course - The course record
 * @param message_count - Number of chat messages in this course
 * @param last_message_body - Preview of the most recent message
 * @param last_message_author - Author name of the most recent message
 * @param last_message_at - Timestamp of the most recent message
 * @param member_count - Number of enrolled members
 * @param member_avatars - First 5 member avatars for preview
 */
export interface DiscussionBoard {
  course: Course;
  message_count: number;
  last_message_body?: string | null;
  last_message_author?: string | null;
  last_message_at?: string | null;
  member_count: number;
  member_avatars: MemberPreview[];
}

/**
 * A course member with profile info.
 */
export interface CourseMemberProfile {
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  joined_at: string;
}

/**
 * A Google Calendar event as returned by the /api/gcal/events endpoint.
 *
 * @param id - Google Calendar event ID
 * @param summary - Event title
 * @param start - ISO start datetime (or date for all-day events)
 * @param end - ISO end datetime (or date for all-day events)
 * @param colorId - Google Calendar color ID (optional)
 * @param location - Event location (optional)
 * @param htmlLink - URL to view event in Google Calendar
 * @param allDay - Whether this is an all-day event
 * @param calendarId - Source calendar ID (set when fetching from multiple calendars)
 */
/**
 * A user note stored in Tiptap JSON format.
 *
 * @param id - UUID primary key
 * @param user_id - Owner's auth ID
 * @param course_id - FK to courses table (null = "General" folder)
 * @param title - Note title (may be auto-derived from first line)
 * @param content - Tiptap document JSON
 * @param is_pinned - Whether the note is pinned to top of list
 * @param created_at - ISO timestamp of creation
 * @param updated_at - ISO timestamp of last modification
 */
export interface Note {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  content: Record<string, unknown>;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  /** ISO timestamp when note was soft-deleted, null if active. */
  deleted_at: string | null;
  /** Optional emoji icon displayed before the note title. */
  icon: string | null;
}

/**
 * Fields required to create a new note.
 */
export interface NoteInsert {
  course_id?: string | null;
  title?: string;
  content?: Record<string, unknown>;
  icon?: string | null;
}

/**
 * Fields that can be updated on an existing note.
 */
export interface NoteUpdate {
  title?: string;
  content?: Record<string, unknown>;
  is_pinned?: boolean;
  course_id?: string | null;
  icon?: string | null;
}

export interface GCalEvent {
  id: string;
  summary: string;
  description: string | null;
  start: string;
  end: string;
  colorId: string | null;
  location: string | null;
  htmlLink: string;
  allDay: boolean;
  calendarId?: string;
  /** User's RSVP status: "accepted" | "declined" | "tentative" | "needsAction" | null. */
  responseStatus: string | null;
  /** Number of non-self attendees (0 for self-created events with no invitees). */
  attendeeCount?: number;
  /** Non-self attendee details. */
  attendees?: Array<{ email: string; displayName: string; responseStatus: string | null }>;
  /** Google Meet or video conference link, if any. */
  meetLink?: string | null;
  /** Display name of the source calendar (resolved from calendarList API). */
  calendarSummary?: string;
}
