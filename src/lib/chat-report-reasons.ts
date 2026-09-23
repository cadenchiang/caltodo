/**
 * Reasons a student can give when reporting a chat message.
 * Shared by the report modal and the report API so the two never drift.
 *
 * @module chat-report-reasons
 */

/** Reason id to human label, in the order the select shows them. */
export const REPORT_REASONS = {
  spam: "Spam or advertising",
  harassment: "Harassment or bullying",
  hate: "Hate speech",
  inappropriate: "Inappropriate or explicit content",
  cheating: "Academic dishonesty",
  other: "Something else",
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

/**
 * Type guard for a reason id.
 *
 * @param value - Anything from a request body
 */
export function isReportReason(value: unknown): value is ReportReason {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(REPORT_REASONS, value);
}
