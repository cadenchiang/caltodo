"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Collapsible help for students who sign in to Gradescope through Google or
 * their school's SSO and therefore have no Gradescope password. Shown after
 * a 401 and inside the empty class list.
 */
export default function GradescopeAuthHelp() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="mt-3 text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 rounded px-1 py-1 -mx-1"
      >
        Don&apos;t see your classes?
        <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} className="mt-3">
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            If you normally sign in to Gradescope with Google or your school&apos;s SSO, that
            password will not work here. You need a Gradescope-specific password.
          </p>
          <a
            href="https://www.gradescope.com/reset_password"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reset your Gradescope password
          </a>
          <p className="text-xs text-muted-foreground mt-2">Then come back and try again with the new password.</p>
        </div>
      )}
    </div>
  );
}
