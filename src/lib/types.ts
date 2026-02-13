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
}

/**
 * Fields required to create a new task.
 */
export interface TaskInsert {
  title: string;
  description?: string;
  due_date?: string | null;
  color?: string;
}

/**
 * Fields that can be updated on an existing task.
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  due_date?: string | null;
  is_completed?: boolean;
  color?: string;
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
