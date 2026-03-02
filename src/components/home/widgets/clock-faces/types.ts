/**
 * Shared props interface for all clock face components.
 * Each face receives the current time and display preferences.
 */
export interface ClockFaceProps {
  /** Current Date object, updated every second by the parent ClockWidget. */
  now: Date;
  /** Whether to display in 24-hour format (true) or 12-hour (false). */
  is24h: boolean;
  /** IANA timezone string (e.g. "America/New_York"). Undefined = local. */
  timezone?: string;
  /** CSS font-weight value as a string (e.g. "300", "700"). */
  fontWeight: string;
}
