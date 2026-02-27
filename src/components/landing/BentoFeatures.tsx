import { RefreshCw, MessageCircle, Calendar, Link2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/FadeIn";

/**
 * Feature card data for the bento grid.
 * Each card has an icon, title, description, and optional column/row span classes.
 */
const FEATURES = [
  {
    icon: RefreshCw,
    title: "Deadline Sync",
    description: "Auto-sync assignments from bCourses, Gradescope, and Pensieve.",
    className: "md:col-span-2",
  },
  {
    icon: MessageCircle,
    title: "Class Chat",
    description: "Chat with classmates in real time, organized by course.",
    className: "md:col-span-1",
  },
  {
    icon: Calendar,
    title: "Calendar View",
    description: "See every deadline on one calendar — no more missed due dates.",
    className: "md:col-span-1",
  },
  {
    icon: Link2,
    title: "Google Calendar",
    description: "Two-way sync so deadlines show up wherever you look.",
    className: "md:col-span-1",
  },
  {
    icon: LayoutGrid,
    title: "Smart Organization",
    description: "Board view, filters, and drag-and-drop to stay on top of it all.",
    className: "md:col-span-1",
  },
] as const;

/**
 * Bento-style feature grid for the landing page.
 * Displays key caltodo features in a responsive 3-column (desktop) / 1-column (mobile) grid.
 *
 * @returns React element containing the feature grid section.
 */
export default function BentoFeatures() {
  return (
    <section className="w-full max-w-4xl mx-auto mt-2 sm:mt-4 mb-12 sm:mb-20 px-2 sm:px-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <FadeIn key={feature.title} delay={i * 75} className={feature.className}>
              <div
                className={cn(
                  "rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 h-full",
                  "shadow-sm transition-shadow duration-200 hover:shadow-md",
                )}
              >
                <Icon className="w-6 h-6 text-black/30 mb-8 sm:mb-12" strokeWidth={1.5} />
                <h3 className="text-base sm:text-lg font-semibold text-black tracking-tight mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-black/65 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
