/**
 * Canvas URL validation for SSRF prevention.
 * Only allows known, trusted Canvas LMS domains over HTTPS.
 */

/**
 * Validates that a Canvas base URL belongs to a known, trusted domain.
 * Prevents SSRF by rejecting arbitrary URLs — only bcourses.berkeley.edu
 * and *.instructure.com are allowed, and only over HTTPS.
 *
 * @param url - The base URL to validate
 * @returns true if the URL is on an allowed Canvas domain over HTTPS
 *
 * @example
 * ```ts
 * isAllowedCanvasUrl("https://bcourses.berkeley.edu") // true
 * isAllowedCanvasUrl("https://canvas.instructure.com") // true
 * isAllowedCanvasUrl("https://evil.edu") // false
 * isAllowedCanvasUrl("http://bcourses.berkeley.edu") // false (no HTTP)
 * ```
 */
export function isAllowedCanvasUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === "bcourses.berkeley.edu" ||
      hostname === "instructure.com" ||
      hostname.endsWith(".instructure.com")
    );
  } catch {
    return false;
  }
}
