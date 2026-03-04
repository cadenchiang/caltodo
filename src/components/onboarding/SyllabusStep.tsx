"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Check, ChevronLeft } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import type { ExtractedAssignment } from "@/app/api/syllabus/extract/route";

interface SyllabusStepProps {
  onNext: (payload: Record<string, never>) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

/** Maximum file size in bytes (10 MB). */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

/**
 * Syllabus upload and assignment extraction step.
 * Phase 1: File upload with drag-and-drop.
 * Phase 2: Side-by-side preview with editable assignment list.
 *
 * @param onNext - Called after successful import to navigate away
 * @param onSkip - Called to skip/cancel this step
 * @param saving - Whether parent is saving
 * @param error - Error message from parent
 * @param setError - Error setter from parent
 */
export default function SyllabusStep({ onNext, onSkip, error, setError }: SyllabusStepProps) {
  const { importSyllabusTasks } = useTaskContext();

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraction state
  const [extracting, setExtracting] = useState(false);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<(ExtractedAssignment & { selected: boolean })[]>([]);
  const [phase, setPhase] = useState<"upload" | "preview">("upload");

  // Import state
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  /**
   * Processes a selected file: validates type/size and reads as base64.
   * @param f - The file to process
   */
  const processFile = useCallback((f: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Unsupported file type. Please upload a PDF, PNG, JPG, or WebP file.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }
    setFile(f);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileDataUrl(result);
      // Strip the data URL prefix to get raw base64
      const base64 = result.split(",")[1];
      setFileBase64(base64);
    };
    reader.readAsDataURL(f);
  }, [setError]);

  /**
   * Calls the extraction API and transitions to preview phase.
   */
  async function handleExtract() {
    if (!file || !fileBase64) return;
    setExtracting(true);
    setError(null);

    try {
      const res = await fetch("/api/syllabus/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: fileBase64,
          mimeType: file.type,
          fileName: file.name,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Extraction failed: ${res.status}`);
      }

      const data: { course_name: string | null; assignments: ExtractedAssignment[] } =
        await res.json();

      setCourseName(data.course_name);
      setAssignments(data.assignments.map((a) => ({ ...a, selected: true })));
      setPhase("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExtracting(false);
    }
  }

  /**
   * Imports selected assignments as tasks via TaskContext.
   */
  async function handleImport() {
    const selected = assignments.filter((a) => a.selected);
    if (selected.length === 0) return;
    setImporting(true);
    setError(null);

    try {
      await importSyllabusTasks(
        selected.map((a) => ({
          title: a.title,
          description: a.description,
          due_date: a.due_date,
          due_time: a.due_time,
          course_name: courseName,
          points_possible: a.points_possible,
        }))
      );
      await onNext({} as Record<string, never>);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setImporting(false);
    }
  }

  const selectedCount = assignments.filter((a) => a.selected).length;
  const allSelected = assignments.length > 0 && selectedCount === assignments.length;

  // ---- Phase 2: Side-by-side preview ----
  if (phase === "preview") {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <button
          onClick={() => setPhase("upload")}
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
            {file?.type === "application/pdf" ? (
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
          onClick={handleImport}
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

  // ---- Phase 1: Upload ----
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-2 animate-drop-in">
        upload a syllabus
      </h2>
      <p className="text-sm text-muted-foreground mb-6 animate-drop-in delay-100">
        Upload a PDF or screenshot of your course syllabus to automatically extract assignments.
      </p>

      {/* Drag-and-drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) processFile(droppedFile);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`animate-drop-in delay-150 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
            : file
            ? "border-purple-300 bg-purple-50/50 dark:border-purple-500/40 dark:bg-purple-500/5"
            : "border-border hover:border-foreground/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) processFile(f);
          }}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText size={32} className="text-purple-500" />
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
            <p className="text-xs text-blue-500">Click to choose a different file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drag & drop your syllabus here
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, PNG, JPG, or WebP (max 10 MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl mt-4">
          {error}
        </div>
      )}

      <button
        onClick={handleExtract}
        disabled={!file || extracting}
        className="w-full mt-6 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold btn-elevated-primary disabled:opacity-50 animate-drop-in delay-200 cursor-pointer"
      >
        {extracting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            Extracting assignments...
          </span>
        ) : (
          "Extract Assignments"
        )}
      </button>

      <button
        onClick={onSkip}
        className="w-full mt-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        skip
      </button>
    </div>
  );
}
