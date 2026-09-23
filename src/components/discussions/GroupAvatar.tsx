"use client";

/**
 * Colorful placeholder group chat avatar.
 * Generates a unique gradient based on the course name,
 * with initials overlaid in white.
 *
 * @param initials - 1-2 character initials from the course name
 * @param name - Full course name (used to deterministically pick a color)
 * @param size - Outer container size in px (default 44)
 */
interface GroupAvatarProps {
  initials: string;
  name: string;
  size?: number;
}

/**
 * Gradient color pairs for group chat avatars.
 * Each entry is [from, to] for a CSS gradient.
 */
const GRADIENTS: [string, string][] = [
  ["#0e89d6", "#0e89d6"], // blue
  ["#8B5CF6", "#6D28D9"], // purple
  ["#EC4899", "#BE185D"], // pink
  ["#10B981", "#047857"], // emerald
  ["#F59E0B", "#D97706"], // amber
  ["#EF4444", "#B91C1C"], // red
  ["#06B6D4", "#0E7490"], // cyan
  ["#F97316", "#C2410C"], // orange
  ["#14B8A6", "#0F766E"], // teal
  ["#A855F7", "#7C3AED"], // violet
];

/**
 * Deterministically picks a gradient pair from the course name.
 * Uses a simple hash so the same course always gets the same color.
 *
 * @param name - Course name string
 * @returns [fromColor, toColor] gradient pair
 */
function getGradient(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export default function GroupAvatar({ initials, name, size = 44 }: GroupAvatarProps) {
  const [from, to] = getGradient(name);

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.34}px`,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {initials}
    </div>
  );
}
