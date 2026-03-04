"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import type { ExtractedAssignment } from "@/app/api/syllabus/extract/route";
import SyllabusPreview from "./SyllabusPreview";
import type { SelectableAssignment } from "./SyllabusPreview";
import SyllabusExtracting, {
  estimateExtractionTime,
  STATUS_MESSAGES,
} from "./SyllabusExtracting";

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
 * Phases: upload → extracting (loading UI) → preview (editable list).
 */
export default function SyllabusStep({ onNext, onSkip, error, setError }: SyllabusStepProps) {
  const { importSyllabusTasks } = useTaskContext();

  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"upload" | "extracting" | "preview">("upload");
  const [courseName, setCourseName] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<SelectableAssignment[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const extractionStartRef = useRef<number>(0);
  const estimatedMsRef = useRef<number>(15_000);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  /** Clears all extraction-related intervals. */
  function clearExtractionIntervals() {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    progressIntervalRef.current = null;
    statusIntervalRef.current = null;
  }

  useEffect(() => () => clearExtractionIntervals(), []);

  // Prevent page leave during extraction
  useEffect(() => {
    if (phase !== "extracting") return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  /** Validates type/size and reads the file as base64. */
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
      setFileBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(f);
  }, [setError]);

  /** Starts the simulated progress bar and status message rotation. */
  function startProgressSimulation() {
    extractionStartRef.current = Date.now();
    setProgressPercent(0);
    setStatusIndex(0);
    progressIntervalRef.current = setInterval(() => {
      const ratio = (Date.now() - extractionStartRef.current) / estimatedMsRef.current;
      setProgressPercent(Math.min(90, 90 * (1 - Math.exp(-2.5 * ratio))));
    }, 500);
    statusIntervalRef.current = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 4_000);
  }

  /** Calls the extraction API with progress simulation, then transitions to preview. */
  async function handleExtract() {
    if (!file || !fileBase64) return;
    setError(null);
    estimatedMsRef.current = estimateExtractionTime(file.size);
    setPhase("extracting");
    startProgressSimulation();

    try {
      const res = await fetch("/api/syllabus/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: fileBase64, mimeType: file.type, fileName: file.name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Extraction failed: ${res.status}`);
      }
      const data: { course_name: string | null; assignments: ExtractedAssignment[] } =
        await res.json();

      clearExtractionIntervals();
      setProgressPercent(100);
      setCourseName(data.course_name);
      setAssignments(data.assignments.map((a) => ({ ...a, selected: true })));
      await new Promise((resolve) => setTimeout(resolve, 400));
      setPhase("preview");
    } catch (err) {
      clearExtractionIntervals();
      setProgressPercent(0);
      setPhase("upload");
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  /** Imports selected assignments as tasks via TaskContext. */
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

  /** Returns the time estimate display string ("Almost done..." when close). */
  function getTimeEstimateText(): string {
    const remaining = Math.max(0, estimatedMsRef.current - (Date.now() - extractionStartRef.current));
    const remainingSeconds = Math.ceil(remaining / 1_000);
    if (progressPercent > 85 || remainingSeconds <= 5) return "Almost done...";
    return `~${remainingSeconds} seconds remaining`;
  }

  // ---- Phase 3: Side-by-side preview ----
  if (phase === "preview" && file) {
    return (
      <SyllabusPreview
        file={file}
        fileDataUrl={fileDataUrl}
        courseName={courseName}
        assignments={assignments}
        setAssignments={setAssignments}
        importing={importing}
        error={error}
        onBack={() => setPhase("upload")}
        onImport={handleImport}
      />
    );
  }

  // ---- Phase 2: Extracting ----
  if (phase === "extracting") {
    return (
      <SyllabusExtracting
        progressPercent={progressPercent}
        statusMessage={STATUS_MESSAGES[statusIndex]}
        timeEstimate={getTimeEstimateText()}
      />
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
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
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
            <p className="text-sm font-medium text-foreground">Drag & drop your syllabus here</p>
            <p className="text-xs text-muted-foreground">PDF, PNG, JPG, or WebP (max 10 MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl mt-4">{error}</div>
      )}

      <button
        onClick={handleExtract}
        disabled={!file}
        className="w-full mt-6 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold btn-elevated-primary disabled:opacity-50 animate-drop-in delay-200 cursor-pointer"
      >
        Extract Assignments
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
