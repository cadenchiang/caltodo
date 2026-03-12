/**
 * Canvas URL validation for SSRF prevention.
 * Allows any HTTPS URL that isn't a known internal/private address.
 * If the URL isn't actually a Canvas instance, the sync will simply fail.
 */

/** Hostnames that must never be contacted (SSRF prevention). */
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "0.0.0.0",
  "[::1]",
]);

/**
 * Validates that a Canvas base URL is a safe, non-internal HTTPS URL.
 * Blocks localhost, private IPs, and non-HTTPS to prevent SSRF.
 * Any public HTTPS URL is allowed — if it's not Canvas, sync fails gracefully.
 *
 * @param url - The base URL to validate
 * @returns true if the URL is a safe public HTTPS endpoint
 *
 * @example
 * ```ts
 * isAllowedCanvasUrl("https://bcourses.berkeley.edu") // true
 * isAllowedCanvasUrl("https://canvas.ucsd.edu") // true
 * isAllowedCanvasUrl("https://canvas.instructure.com") // true
 * isAllowedCanvasUrl("http://canvas.ucsd.edu") // false (no HTTP)
 * isAllowedCanvasUrl("https://localhost") // false (internal)
 * ```
 */
export function isAllowedCanvasUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();

    // Block known internal hostnames
    if (BLOCKED_HOSTNAMES.has(hostname)) return false;

    // Block private/internal IP ranges
    if (
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
