"use client";

import { Check, ChevronLeft } from "lucide-react";
import type { ExtractedAssignment } from "@/app/api/syllabus/extract/route";

/** Assignment with user selection state for the preview list. */
export type SelectableAssignment = ExtractedAssignment & { selected: boolean };

interface SyllabusPreviewProps {
  file: File;
  fileDataUrl: string | null;
  courseName: string | null;
  assignments: SelectableAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<SelectableAssignment[]>>;
  importing: boolean;
  error: string | null;
  onBack: () => void;
  onImport: () => void;
}

/**
 * Side-by-side preview of the uploaded syllabus and extracted assignments.
 * Allows users to select/deselect, edit titles and dates before importing.
 *
 * @param file - The uploaded file for preview rendering
 * @param fileDataUrl - Data URL for file preview (PDF iframe or image)
 * @param courseName - Extracted course name (may be null)
 * @param assignments - Array of extracted assignments with selection state
 * @param setAssignments - Setter to update assignment list
 * @param importing - Whether import is in progress
 * @param error - Error message to display
 * @param onBack - Handler to return to upload phase
 * @param onImport - Handler to start importing selected assignments
 */
export default function SyllabusPreview({
  file,
  fileDataUrl,
  courseName,
  assignments,
  setAssignments,
  importing,
  error,
  onBack,
  onImport,
}: SyllabusPreviewProps) {
  const selectedCount = assignments.filter((a) => a.selected).length;
  const allSelected = assignments.length > 0 && selectedCount === assignments.length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors cursor-pointer"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {courseName && (
        <p className="text-xs text-muted-foreground mb-2">
          Course: <span className="font-medium text-foreground">{courseName}</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Left: file preview */}
        <div className="rounded-xl border border-border overflow-hidden bg-muted/50 min-h-[300px] max-h-[500px]">
          {file.type === "application/pdf" ? (
            <iframe
              src={fileDataUrl ?? ""}
              className="w-full h-full min-h-[300px]"
              title="Syllabus preview"
            />
          ) : (
            <img
              src={fileDataUrl ?? ""}
              alt="Syllabus"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Right: assignment list */}
        <div className="flex flex-col min-h-[300px] max-h-[500px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {selectedCount} of {assignments.length} selected
            </span>
            <button
              onClick={() =>
                setAssignments((prev) =>
                  prev.map((a) => ({ ...a, selected: !allSelected }))
                )
              }
              className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {assignments.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2.5 rounded-xl border transition-colors ${
                  a.selected
                    ? "border-border bg-card"
                    : "border-transparent bg-muted/30 opacity-60"
                }`}
              >
                <button
                  onClick={() =>
                    setAssignments((prev) =>
                      prev.map((item, idx) =>
                        idx === i ? { ...item, selected: !item.selected } : item
                      )
                    )
                  }
                  className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    a.selected
                      ? "border-purple-500 bg-purple-500"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {a.selected && <Check size={10} className="text-white" />}
                </button>

                <div className="flex-1 min-w-0 space-y-1">
                  <input
                    type="text"
                    value={a.title}
                    onChange={(e) =>
                      setAssignments((prev) =>
                        prev.map((item, idx) =>
                          idx === i ? { ...item, title: e.target.value } : item
                        )
                      )
                    }
                    className="w-full text-sm font-medium text-foreground bg-transparent border-none outline-none focus:ring-0 p-0"
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="date"
                      value={a.due_date ?? ""}
                      onChange={(e) =>
                        setAssignments((prev) =>
                          prev.map((item, idx) =>
                            idx === i
                              ? { ...item, due_date: e.target.value || null }
                              : item
                          )
                        )
                      }
                      className="bg-transparent border-none outline-none text-xs text-muted-foreground p-0"
                    />
                    {a.points_possible !== null && (
                      <span>{a.points_possible} pts</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {assignments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No assignments found in this document.
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl mb-3">
          {error}
        </div>
      )}

      <button
        onClick={onImport}
        disabled={importing || selectedCount === 0}
        className="w-full px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold btn-elevated-primary disabled:opacity-50 cursor-pointer"
      >
        {importing
          ? "Importing..."
          : `Import ${selectedCount} Assignment${selectedCount !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
