import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

/**
 * Shared layout for the public landing routes (/, /about, /contact, /guides,
 * /for, /privacy, /terms and the 404 page). Renders the top navigation and
 * the footer once at this layer so client-side transitions between these
 * pages only swap the content between them.
 *
 * Always white, so it carries `force-light` (as /login does): without it the
 * app's dark theme after sunset gave the contact form dark native controls
 * and dark autofill on a white page.
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
  return (
    <div className="min-h-dvh flex flex-col bg-white text-black force-light" style={{ overflowX: "clip" }}>
      <LandingNav />
      {children}
      <LandingFooter />
    </div>
  );
}
