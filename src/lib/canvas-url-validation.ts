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
  "::1",
  "::",
  "[::]",
]);

/**
 * Returns true when a hostname is an IP-address literal in ANY encoding.
 *
 * A real Canvas instance is always a DNS name (bcourses.berkeley.edu,
 * canvas.instructure.com), never a bare IP. Rejecting every IP literal closes
 * the SSRF encodings a naive prefix check misses: the cloud-metadata address
 * 169.254.169.254, IPv6 loopback/ULA/link-local (::1, [::], fc00::/7, fe80::),
 * IPv4-mapped IPv6 (::ffff:127.0.0.1), and non-dotted forms like decimal
 * (2130706433), hex (0x7f000001), or octal (017700000001).
 */
function looksLikeIpLiteral(hostname: string): boolean {
  const h = hostname;
  // Bracketed or colon-bearing host = IPv6 literal.
  if (h.startsWith("[") || h.includes(":")) return true;
  // Standard dotted IPv4.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return true;
  // Hex (0x..), or a bare number (decimal or octal) with no dots.
  if (/^0x[0-9a-f]+$/i.test(h)) return true;
  if (/^\d+$/.test(h)) return true;
  // Dotted form whose every label is numeric/hex (shorthand / octal / hex IPv4)
  // and which does not start with a letter (so real DNS names are unaffected).
  if (/^[0-9a-fx]+(\.[0-9a-fx]+)+$/i.test(h) && !/^[a-z]/i.test(h)) return true;
  return false;
}

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

    // Canvas is always a DNS name — reject every IP-address literal (covers
    // link-local metadata, IPv6, and alternate numeric encodings).
    if (looksLikeIpLiteral(hostname)) return false;

    // Belt-and-suspenders: block private/internal + link-local IPv4 prefixes
    // for any dotted form that slipped past the literal check.
    if (
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      hostname.startsWith("0.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
