/**
 * Constants and helpers for the /share page, kept out of the page module
 * because Next.js forbids extra exports from route files.
 *
 * @module share-page
 */

/** The text the sms: link pre-fills, shown as a fallback where sms: cannot open. */
export const SHARE_MESSAGE = "Hey, you should try this. It is free for life right now: https://caltodo.me";

/** The sms: URL. Encoded from SHARE_MESSAGE so the two can never drift. */
export const SHARE_SMS_URL = `sms:?body=${encodeURIComponent(SHARE_MESSAGE)}`;

/** How long to wait for Messages before showing the copy fallback. */
export const FALLBACK_AFTER_MS = 1500;

/**
 * Whether this device can plausibly open an sms: link. Desktop browsers
 * without a paired Messages app leave the page sitting on "opening" forever.
 *
 * @param userAgent - navigator.userAgent
 * @returns True for phones and tablets
 */
export function canOpenSms(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Android/i.test(userAgent);
}

