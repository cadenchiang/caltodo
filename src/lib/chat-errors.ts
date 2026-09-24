/**
 * Plain-language error copy for the chat, written for students rather than
 * developers. API routes return terse strings ("Not enrolled in this
 * course", "Failed to fetch messages (500)"); this maps a status plus that
 * string to something a person can act on.
 *
 * @module chat-errors
 */

/** API error strings that already read fine and are kept verbatim. */
const PASSTHROUGH = new Set([
  "Message contains inappropriate content",
  "Message must be 5000 characters or fewer",
  "System chats cannot be hidden here",
]);

/**
 * Turns an API failure into a sentence for the user.
 *
 * @param status - HTTP status (0 for a network failure)
 * @param apiError - The `error` field from the JSON body, if any
 * @param action - What was being attempted, e.g. "send your message"
 * @returns A short sentence in sentence case with no raw status codes
 */
export function friendlyChatError(status: number, apiError: unknown, action: string): string {
  const raw = typeof apiError === "string" ? apiError : "";
  if (PASSTHROUGH.has(raw)) return raw;
  if (raw.startsWith("Slow down") || raw.startsWith("Sending too fast")) return raw;

  switch (status) {
    case 0:
      return `We couldn't ${action}. Check your connection and try again.`;
    case 401:
      return "Your session expired. Sign in again to keep chatting.";
    case 403:
      if (/onboarding/i.test(raw)) {
        return "Connect a class integration in Settings to unlock chat.";
      }
      return "You're not in this chat.";
    case 404:
      return "That message is no longer available.";
    case 409:
      return "You already reported this message.";
    case 413:
      return "That file is too large to send.";
    case 422:
      return raw || "That can't be sent.";
    case 429:
      return "You're sending too quickly. Wait a moment and try again.";
    default:
      if (status >= 500) return `Something went wrong on our end. We couldn't ${action}. Try again in a moment.`;
      return `We couldn't ${action}. Try again.`;
  }
}
