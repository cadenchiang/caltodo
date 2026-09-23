import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Placeholder shape. text is one line of body copy, circle is an avatar. */
export type SkeletonShape = "text" | "title" | "circle" | "block" | "pill";

export const SKELETON_SHAPES: Record<SkeletonShape, string> = {
  text: "h-4 w-full rounded",
  title: "h-5 w-1/2 rounded",
  circle: "w-8 h-8 rounded-full",
  block: "h-20 w-full rounded-2xl",
  pill: "h-6 w-16 rounded-full",
};

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape preset. Defaults to text. Override width/height with className. */
  shape?: SkeletonShape;
}

/**
 * Loading placeholder: a muted block that pulses. Compose several to sketch
 * the layout that is loading.
 *
 * @param shape - text | title | circle | block | pill
 * @remarks aria-hidden: the surrounding region should carry aria-busy or a
 *          visually hidden "Loading" so assistive tech hears one message, not
 *          a dozen empty boxes.
 */
export default function Skeleton({ shape = "text", className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-muted animate-pulse", SKELETON_SHAPES[shape], className)}
      {...rest}
    />
  );
}
