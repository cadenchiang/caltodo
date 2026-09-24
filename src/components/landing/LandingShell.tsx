import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

/**
 * The landing chrome: always-white force-light wrapper, top nav, footer.
 * Used by the (landing) layout and by the root not-found page, which Next
 * renders outside that layout but which should look like every other public
 * page.
 *
 * @param children - Page content between the nav and the footer
 */
export default function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-white text-black force-light" style={{ overflowX: "clip" }}>
      <LandingNav />
      {children}
      <LandingFooter />
    </div>
  );
}
