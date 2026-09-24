"use client";

import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import IntegrationLogo from "@/components/ui/IntegrationLogo";
import { PROVIDER_LABELS, type ProviderKey } from "@/lib/copy";
import { cn } from "@/lib/utils";

/**
 * Small shared pieces every onboarding step is built from: the heading with
 * the provider mark, the numbered instruction list, and the error banner.
 * Left-aligned throughout, matching the school and platforms steps.
 */

export interface StepHeadingProps {
  /** Provider whose mark sits before the title. Omit for plain headings. */
  provider?: ProviderKey;
  /** Heading text. Defaults to the provider label. */
  title?: string;
  /** One line under the heading. */
  description?: ReactNode;
}

/**
 * Step heading: provider mark plus an h2, left-aligned.
 *
 * @param provider - Optional provider mark
 * @param title - Heading text; falls back to the provider label
 * @param description - Muted line under the heading
 */
export function StepHeading({ provider, title, description }: StepHeadingProps) {
  const text = title ?? (provider ? PROVIDER_LABELS[provider] : "");
  return (
    <div className={cn("text-left", description ? "mb-6" : "mb-4")}>
      <div className="flex items-center gap-2">
        {provider === "syllabus" ? (
          <span aria-hidden="true" className="w-[22px] h-[22px] rounded bg-muted flex items-center justify-center shrink-0">
            <FileText size={14} className="text-secondary-foreground" />
          </span>
        ) : provider ? (
          <IntegrationLogo provider={provider} size="sm" decorative className="w-[22px] h-[22px]" />
        ) : null}
        <h2 className="text-lg font-bold text-foreground">{text}</h2>
      </div>
      {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
    </div>
  );
}

/**
 * Numbered instruction list (1, 2, 3...).
 *
 * @param steps - One node per instruction, in order
 */
export function NumberedSteps({ steps }: { steps: ReadonlyArray<ReactNode> }) {
  return (
    <ol className="flex flex-col gap-1 mb-4 text-left list-none p-0 m-0">
      {steps.map((step, i) => (
        <li key={i} className="flex items-center gap-3 px-2 py-2">
          <span
            aria-hidden="true"
            className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0"
          >
            {i + 1}
          </span>
          <span className="text-sm font-medium text-foreground flex items-center gap-1.5 flex-wrap">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/** The one error-banner recipe for the flow. */
export const ERROR_BANNER = "rounded-xl bg-danger-tint p-3 mb-4 text-sm text-red-600 dark:text-red-400 text-left";

/**
 * Error banner announced to assistive tech.
 *
 * @param message - Error text; renders nothing when null or empty
 */
export function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div role="alert" className={ERROR_BANNER}>
      {message}
    </div>
  );
}

/** Link-styled inline text link used inside instruction steps. */
export const STEP_LINK = "text-blue-500 hover:text-blue-600 underline underline-offset-2 rounded";
