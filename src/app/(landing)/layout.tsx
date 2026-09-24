import LandingShell from "@/components/landing/LandingShell";

/**
 * Shared layout for the public landing routes (/, /about, /contact, /guides,
 * /for, /privacy, /terms). Renders the top navigation and the footer once at
 * this layer so client-side transitions between these pages only swap the
 * content between them. The root not-found page reuses the same shell.
 *
 * Always white, so the shell carries `force-light` (as /login does): without
 * it the app's dark theme after sunset gave the contact form dark native
 * controls and dark autofill on a white page.
 *
 * Intentionally does NOT do any server-side auth fetching, which would mark
 * every landing page as dynamic. Auth is detected client-side inside
 * LandingNav so the pages stay statically generated and edge-cached.
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandingShell>{children}</LandingShell>;
}
