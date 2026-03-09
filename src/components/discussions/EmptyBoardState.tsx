"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

/**
 * Shown when the user has no enrolled courses yet.
 * Prompts them to sync courses from Settings.
 */
export default function EmptyBoardState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <MessageCircle size={24} className="text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        No chat rooms yet
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Sync your courses from Canvas, Gradescope, or Pensive to start chatting with classmates.
      </p>
      <Link
        href="/app/settings"
        className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
      >
        Go to Settings
      </Link>
    </div>
  );
}
