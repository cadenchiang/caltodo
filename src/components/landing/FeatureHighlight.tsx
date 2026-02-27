import FadeIn from "@/components/landing/FadeIn";

/**
 * Full-width feature highlight section with "New" badge, heading, subtitle, and image placeholder.
 * Designed to showcase a single marquee feature (e.g. Class Chat).
 *
 * @returns React element for the feature highlight section.
 */
export default function FeatureHighlight() {
  return (
    <section className="w-full bg-[#FCFCFD] py-16 sm:py-24 px-6 lg:px-10">
      <div className="max-w-4xl mx-auto">
        {/* Badge + Heading */}
        <FadeIn>
          <div className="flex items-center gap-4 mb-3">
            <span className="px-2.5 py-0.5 text-base font-semibold rounded-xl bg-[#ffe0d0] text-[#ff5a05] tracking-wide">
              New
            </span>
            <h2
              className="text-[22px] sm:text-[32px] font-medium text-[#ff5a05] leading-[1.05] tracking-tight"
            style={{
              fontFamily:
                '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
            >
              Class Chat
            </h2>
          </div>
          <p className="text-base sm:text-xl text-black/50 -mt-2 max-w-none leading-relaxed">
            Message classmates in real time, organized by course.
          </p>
        </FadeIn>

        {/* Image placeholder — swap src when ready */}
        <FadeIn delay={150}>
          <div className="mt-5 sm:mt-8 rounded-2xl overflow-hidden">
            <img
              src="/chat-feature-preview.png"
              alt="caltodo class chat feature preview"
              className="w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = "flex";
                }
              }}
            />
            {/* Fallback shown when image is missing */}
            <div
              className="hidden items-center justify-center py-32 sm:py-48 text-black/20 text-sm"
            >
              Screenshot coming soon
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
