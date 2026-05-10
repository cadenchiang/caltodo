import LandingNav from "@/components/landing/LandingNav";

/**
 * Shared layout for the public landing routes (/, /about, /contact).
 * Renders the top navigation once at this layer so client-side
 * transitions between these pages only swap the page content
 * underneath the nav.
 *
 * Intentionally does NOT do any server-side auth fetching — that would
 * mark every landing page as dynamic. Auth is detected client-side inside
 * LandingNav so About/Contact stay statically generated and edge-cached.
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-white text-black" style={{ overflowX: "clip" }}>
      <LandingNav />
      {children}
    </div>
  );
}
