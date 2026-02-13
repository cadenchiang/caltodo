/**
 * Generates a cryptographically secure calendar token for iCal feed authentication.
 *
 * @returns A 64-character hex string (32 random bytes)
 */

import { randomBytes } from "crypto";

export function generateCalendarToken(): string {
  return randomBytes(32).toString("hex");
}
