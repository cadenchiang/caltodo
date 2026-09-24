"use client";

import type { FormEvent } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PlatformLogo from "@/components/onboarding/PlatformLogo";
import SelectableTile from "@/components/onboarding/SelectableTile";
import { CLASSROOM_AVAILABLE } from "@/lib/classroom-availability";
import type { OnboardingPlatform } from "@/lib/onboarding-progress";
import { PROVIDER_LABELS, SKIP_LABEL } from "@/lib/copy";

/** One entry in the platform grid. */
export interface PlatformOption {
  id: OnboardingPlatform;
  label: string;
  description: string;
  logo: string;
}

/** Platform options shown in the grid, in display order. */
export const PLATFORM_OPTIONS: ReadonlyArray<PlatformOption> = [
  { id: "gcal", label: PROVIDER_LABELS.gcal, description: "Two-way event sync", logo: "/gcal-logo.png" },
  { id: "canvas", label: PROVIDER_LABELS.canvas, description: "Sync assignments from your Canvas account", logo: "/canvas-logo.png" },
  { id: "gradescope", label: PROVIDER_LABELS.gradescope, description: "Sync deadlines from Gradescope", logo: "/gradescope-logo.png" },
  { id: "pensieve", label: PROVIDER_LABELS.pensieve, description: "Assignments from your Pensive calendar", logo: "/pensieve-logo.png" },
  { id: "brightspace", label: PROVIDER_LABELS.brightspace, description: "Sync deadlines from your D2L Brightspace calendar", logo: "/brightspace-logo.svg" },
  { id: "blackboard", label: PROVIDER_LABELS.blackboard, description: "Sync deadlines from your Blackboard calendar", logo: "/blackboard-logo.svg" },
  { id: "classroom", label: PROVIDER_LABELS.classroom, description: "Coursework and due dates", logo: "/classroom-logo.png" },
  { id: "syllabus", label: PROVIDER_LABELS.syllabus, description: "Extract assignments from a syllabus PDF", logo: "/file.svg" },
];

/**
 * Whether a platform may be selected right now.
 *
 * @param id - Platform id
 * @returns False for Google Classroom while CLASSROOM_AVAILABLE is off
 */
export function isPlatformSelectable(id: OnboardingPlatform): boolean {
  return id !== "classroom" || CLASSROOM_AVAILABLE;
}

export interface PlatformsStepProps {
  /** Currently selected platforms. */
  selected: ReadonlySet<OnboardingPlatform>;
  /** Toggle one platform. */
  onToggle: (id: OnboardingPlatform) => void;
  /** Platforms with a saved draft from an earlier visit. */
  inProgress: ReadonlySet<OnboardingPlatform>;
  /** Called on Continue with at least one platform selected. */
  onContinue: () => void;
  /** Called by "Skip for now". */
  onSkip: () => void;
}

/**
 * Two-column platform grid with a Continue button and a skip link. Each tile
 * is a SelectableTile, so it has a focus ring and aria-pressed.
 *
 * @param selected - Selected ids
 * @param inProgress - Ids that show the "In progress" badge
 * @param onContinue - Runs on submit when at least one platform is selected
 */
export default function PlatformsStep({ selected, onToggle, inProgress, onContinue, onSkip }: PlatformsStepProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (selected.size === 0) return;
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-lg font-bold text-foreground mb-2">Select your platforms</h2>
      <p className="text-sm text-muted-foreground mb-6">Which platforms do you use? You can always change this later.</p>
      {/* Two columns, tighter rows: eight options in one column pushed Continue below the fold. */}
      <div className="grid grid-cols-2 gap-2 mb-6" role="group" aria-label="Platforms">
        {PLATFORM_OPTIONS.map((opt) => {
          const comingSoon = !isPlatformSelectable(opt.id);
          return (
            <SelectableTile
              key={opt.id}
              size="sm"
              selected={selected.has(opt.id)}
              onToggle={() => onToggle(opt.id)}
              disabled={comingSoon}
              trailing={comingSoon ? <Badge variant="neutral">Coming soon</Badge> : undefined}
            >
              <PlatformLogo id={opt.id} src={opt.logo} label={opt.label} />
              <span className="flex-1 min-w-0 flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-foreground truncate">{opt.label}</span>
                {inProgress.has(opt.id) && <Badge variant="info">In progress</Badge>}
              </span>
            </SelectableTile>
          );
        })}
      </div>
      <Button type="submit" variant="inverted" size="lg" className="w-full" disabled={selected.size === 0}>
        Continue
      </Button>
      <div className="mt-3 flex justify-center">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          {SKIP_LABEL}
        </Button>
      </div>
    </form>
  );
}
