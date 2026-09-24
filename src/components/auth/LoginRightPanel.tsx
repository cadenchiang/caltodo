import { BRAND } from "@/lib/copy";

/** Schools whose marks scroll across the top of the panel. */
const SCHOOLS: ReadonlyArray<{ name: string; src: string }> = [
  { name: "UC Berkeley", src: "/cal-logo.png" },
  { name: "Stanford", src: "/schools/stanford.svg" },
  { name: "Harvard", src: "/schools/harvard.svg" },
  { name: "MIT", src: "/schools/mit.svg" },
  { name: "Yale", src: "/schools/yale.svg" },
  { name: "Cornell", src: "/schools/cornell.svg" },
  { name: "NYU", src: "/schools/nyu.svg" },
  { name: "UCSD", src: "/schools/ucsd.svg" },
  { name: "UCLA", src: "/schools/ucla.svg" },
  { name: "UPenn", src: "/schools/upenn.svg" },
  { name: "USC", src: "/schools/usc.svg" },
  { name: "Columbia", src: "/schools/columbia.svg" },
];

/**
 * Formats the synced-assignment count for the panel line.
 *
 * @param count - Total assignments synced, 0 when unknown
 * @returns "12,345+ assignments synced so far", or null when there is no count
 */
export function formatSyncedLine(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  return `${Math.floor(count).toLocaleString("en-US")}+ assignments synced so far`;
}

export interface LoginRightPanelProps {
  /** Real synced-assignment total from the landing cache; 0 hides the line. */
  assignmentCount: number;
}

/**
 * Right-side panel beside the login form on desktop: the school marquee, the
 * bear, a one-line product statement, and the same real synced-assignment
 * count the landing hero shows. No invented quotes, names or schools.
 *
 * @param assignmentCount - From getCachedAssignmentCount; hidden when 0
 */
export default function LoginRightPanel({ assignmentCount }: LoginRightPanelProps) {
  const syncedLine = formatSyncedLine(assignmentCount);
  return (
    <div className="relative w-full h-full flex flex-col items-center px-10 pt-10 pb-12 overflow-hidden">
      <div
        className="w-full overflow-hidden mb-8"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-5 whitespace-nowrap login-marquee-track" aria-hidden="true">
          {[...SCHOOLS, ...SCHOOLS].map((school, i) => (
            <div key={`${school.name}-${i}`} className="h-7 w-20 flex items-center justify-center shrink-0" title={school.name}>
              <img src={school.src} alt="" className="max-h-full max-w-full object-contain grayscale opacity-60" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full min-h-0">
        <img src="/login-bear.png" alt="" className="w-56 h-auto select-none pointer-events-none" draggable={false} />

        <div className="text-center max-w-md flex flex-col items-center gap-3">
          <p className="text-base text-foreground leading-relaxed">
            {BRAND} pulls every deadline from Canvas, Gradescope, your syllabus and more into one planner that keeps itself up to date.
          </p>
          {syncedLine && (
            <p className="text-sm font-medium text-muted-foreground">{syncedLine}</p>
          )}
        </div>
      </div>
    </div>
  );
}
