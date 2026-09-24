"use client";

/**
 * "See which platforms" disclosure under the sync step on the landing page.
 *
 * The step says assignments come from "your other platforms", which is only
 * convincing if a visitor can check that theirs is one of them. The list is
 * closed by default because the step's job is to explain the idea, and open
 * to the same options the onboarding platform picker offers, so what a
 * visitor is promised here is what they meet on the first screen after
 * signing up, minus the one that does not yet deliver.
 *
 * The names stay in the DOM while collapsed rather than being mounted on
 * click: they are the words people search for, and the landing page is
 * statically rendered for exactly that reason.
 *
 * Google Classroom is deliberately absent. It appears in the onboarding
 * picker, but its sync does not currently work, and the landing page is a
 * promise to someone who has not signed up yet.
 */

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";

/** One supported source, in the order the onboarding picker lists them. */
interface Platform {
  label: string;
  /** Logo path, or null for the syllabus upload, which is not a platform. */
  logo: string | null;
}

const PLATFORMS: Platform[] = [
  { label: "Google Calendar", logo: "/gcal-logo.png" },
  { label: "Canvas", logo: "/canvas-logo.png" },
  { label: "Gradescope", logo: "/gradescope-logo.png" },
  { label: "Pensive", logo: "/pensieve-logo.png" },
  { label: "Brightspace", logo: "/brightspace-logo.svg" },
  { label: "Blackboard", logo: "/blackboard-logo.svg" },
  { label: "Syllabus PDF", logo: null },
];

/**
 * Renders the toggle and the platform list it reveals.
 *
 * @returns A text button that expands a two-column list of supported sources.
 * @remarks Expands with the grid-rows 0fr/1fr technique used elsewhere in the
 *          app, which animates to the content's own height without measuring
 *          it, and keeps the collapsed content in the document for search
 *          engines. `inert` keeps it off the tab order while closed.
 */
export default function SupportedPlatforms() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#0e89d6] hover:text-[#0b6ea9] transition-colors cursor-pointer"
      >
        See which platforms
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="overflow-hidden">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {PLATFORMS.map((p) => (
              <li key={p.label} className="flex items-center gap-2 min-w-0">
                {p.logo ? (
                  <img src={p.logo} alt="" className="w-5 h-5 object-contain shrink-0" />
                ) : (
                  // Neutral tile, as in Settings: a syllabus is a file the
                  // student uploaded, not a platform with a brand of its own.
                  <span className="w-5 h-5 rounded bg-black/[0.06] flex items-center justify-center shrink-0">
                    <FileText size={12} className="text-black/50" />
                  </span>
                )}
                <span className="text-sm text-black/70 truncate">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
