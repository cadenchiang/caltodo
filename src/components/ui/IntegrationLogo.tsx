/* eslint-disable @next/next/no-img-element */
import { PROVIDER_LABELS, type ProviderKey } from "@/lib/copy";
import { cn } from "@/lib/utils";

/** Rendered box size. sm for chips, md for cards, lg for onboarding tiles. */
export type LogoSize = "sm" | "md" | "lg";

export const LOGO_SIZES: Record<LogoSize, string> = {
  sm: "w-4 h-4",
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

/**
 * One asset per provider. Canvas always uses the Canvas mark (bcourses-logo
 * is retired from the UI; Berkeley naming lives in help text only). Syllabus
 * has no mark and renders nothing.
 */
export const PROVIDER_ASSETS: Record<Exclude<ProviderKey, "syllabus">, string> = {
  canvas: "/canvas-logo.png",
  gradescope: "/gradescope-logo.png",
  pensieve: "/pensieve-logo.png",
  brightspace: "/brightspace-logo.svg",
  blackboard: "/blackboard-logo.svg",
  classroom: "/classroom-logo.png",
  gcal: "/gcal-logo.png",
};

export interface IntegrationLogoProps {
  /** Provider id. */
  provider: ProviderKey;
  /** Box size. Defaults to md (28px). */
  size?: LogoSize;
  /**
   * When the label is already visible next to the mark, pass true so the
   * image is decorative (alt="") and the name is not read twice.
   */
  decorative?: boolean;
  /** Extra classes. */
  className?: string;
}

/**
 * Provider mark with the right asset and alt text from PROVIDER_LABELS.
 *
 * @param provider - canvas | gradescope | pensieve | brightspace | blackboard | classroom | gcal | syllabus
 * @param size - sm (16px) | md (28px) | lg (40px)
 * @param decorative - Empty alt when a visible label accompanies the mark
 * @returns An img, or null for providers without a mark (syllabus)
 */
export default function IntegrationLogo({ provider, size = "md", decorative = false, className }: IntegrationLogoProps) {
  if (provider === "syllabus") return null;
  return (
    <img
      src={PROVIDER_ASSETS[provider]}
      alt={decorative ? "" : PROVIDER_LABELS[provider]}
      className={cn("object-contain shrink-0", LOGO_SIZES[size], className)}
      loading="lazy"
      decoding="async"
    />
  );
}
