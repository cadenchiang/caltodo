/**
 * Structured logger for server-side operations.
 * Outputs JSON-formatted log messages with timestamp, level, context, and data.
 * Server-side only.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  data?: Record<string, unknown>;
}

/**
 * Writes a structured log entry to stdout/stderr.
 *
 * @param level - Log severity level
 * @param context - Short description of the operation (e.g. "fetchCanvasCourses")
 * @param data - Optional key-value pairs with additional context
 */
function log(level: LogLevel, context: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    ...(data && { data }),
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  /**
   * Log an informational message.
   * @param context - Operation name
   * @param data - Additional structured data
   */
  info: (context: string, data?: Record<string, unknown>) => log("info", context, data),

  /**
   * Log a warning message.
   * @param context - Operation name
   * @param data - Additional structured data
   */
  warn: (context: string, data?: Record<string, unknown>) => log("warn", context, data),

  /**
   * Log an error message.
   * @param context - Operation name
   * @param data - Additional structured data
   */
  error: (context: string, data?: Record<string, unknown>) => log("error", context, data),
};
