"use client";

/**
 * The selected classes in settings, grouped under the platform they sync from.
 *
 * Replaces a flat column of chips whose only clue to origin was a background
 * tint. Each platform now names itself and says how many of its classes are
 * on, so "which platforms and which classes" is answerable at a glance rather
 * than inferable from colour.
 */

import type { ClassGroup } from "@/lib/class-groups";
import { groupCountLabel } from "@/lib/class-groups";

interface SelectedClassesByPlatformProps {
  /** Non-empty groups to render, in platform order. */
  groups: ClassGroup[];
}

/**
 * Renders one block per platform: its name, its count, and its class chips.
 *
 * @param groups - Groups from buildClassGroups; an empty array renders nothing.
 * @returns The grouped class list.
 * @remarks The chips wrap rather than stacking one per line. The old list gave
 *          every class its own row, so four classes filled the section; wrapped
 *          chips keep a full course load readable without scrolling.
 */
export default function SelectedClassesByPlatform({ groups }: SelectedClassesByPlatformProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="flex items-center gap-2 mb-2">
            {group.logo ? (
              <img src={group.logo} alt="" className="w-4 h-4 object-contain shrink-0" />
            ) : (
              <span className="w-4 h-4 rounded bg-muted shrink-0" />
            )}
            <p className="text-xs font-semibold text-foreground">{group.label}</p>
            <span className="text-xs text-subtle-foreground">{groupCountLabel(group)}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.courses.map((name, i) => (
              <span
                key={`${group.id}-${name}-${i}`}
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[13px] font-medium ${group.chipClassName}`}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
