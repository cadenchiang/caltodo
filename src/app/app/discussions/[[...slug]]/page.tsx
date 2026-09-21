import { redirect } from "next/navigation";

/**
 * Legacy redirect for the removed course chat feature.
 *
 * /app/discussions and every path beneath it used to be the chat UI. The
 * feature was removed from the product, but old bookmarks and shared links
 * still point here, so this optional catch-all sends them to Inbox instead
 * of a 404. The underlying database tables are untouched.
 *
 * @returns Never renders; always redirects to /app/inbox.
 */
export default function DiscussionsRedirectPage(): never {
  redirect("/app/inbox");
}
