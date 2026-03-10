"use client";

import { FileText } from "lucide-react";

/** Rotating status messages shown during extraction. */
export const STATUS_MESSAGES = [
  "Reading document pages...",
  "Identifying assignments...",
  "Extracting due dates...",
  "Organizing results...",
];

/**
 * Estimates extraction time in milliseconds based on file size.
 * Larger files take longer for the AI to process.
 *
 * @param fileSize - File size in bytes
 * @returns Estimated extraction time in milliseconds, capped at 45s
 */
export function estimateExtractionTime(fileSize: number): number {
  const sizeMB = fileSize / (1024 * 1024);
  return Math.min(45_000, 8_000 + sizeMB * 3_000);
}

interface SyllabusExtractingProps {
  progressPercent: number;
  statusMessage: string;
  timeEstimate: string;
}

/**
 * Full-screen loading experience shown while the extraction API processes
 * the uploaded syllabus. Displays an animated icon, progress bar,
 * time estimate, and rotating status messages.
 *
 * @param progressPercent - Current progress bar fill (0-100)
 * @param statusMessage - Current rotating status message
 * @param timeEstimate - Formatted time remaining text
 */
export default function SyllabusExtracting({
  progressPercent,
  statusMessage,
  timeEstimate,
}: SyllabusExtractingProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <FileText
        size={48}
        className="text-purple-500 mb-6 animate-drop-in"
      />

      <h2 className="text-lg font-bold text-foreground mb-1 animate-drop-in delay-100">
        analyzing your syllabus...
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-8 animate-drop-in delay-200">
        Finding assignments, due dates,
        <br />
        and course details
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-3 animate-drop-in delay-300">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-purple-500 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Time estimate */}
      <p className="text-xs text-muted-foreground mb-4 animate-drop-in delay-400">
        {timeEstimate}
      </p>

      {/* Rotating status message */}
      <p className="text-xs text-muted-foreground animate-sync-glow">
        {statusMessage}
      </p>
    </div>
  );
}
