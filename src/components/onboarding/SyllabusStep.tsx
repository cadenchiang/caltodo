"use client";

import { useState, useRef, useCallback, useEffect, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
import type { ExtractedAssignment } from "@/app/api/syllabus/extract/route";
import Button from "@/components/ui/Button";
import SyllabusPreview from "./SyllabusPreview";
import type { SelectableAssignment } from "./SyllabusPreview";
import SyllabusExtracting, {
  estimateExtractionTime,
  STATUS_MESSAGES,
} from "./SyllabusExtracting";
import SyllabusDropzone, { validateSyllabusFile } from "./SyllabusDropzone";
import { ErrorBanner, StepHeading } from "./StepChrome";
import { MOCK_ASSIGNMENTS, MOCK_COURSE_NAME, shouldLoadSyllabusMock } from "./syllabusMock";

interface SyllabusStepProps {
  onNext: (payload: Record<string, never>) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  onPhaseChange?: (phase: "upload" | "extracting" | "preview") => void;
  /**
   * Reports a completed import so the caller can include it in the post-setup
   * recap. Syllabus assignments never touch the sync engine, so they are
   * invisible to SyncResult and would otherwise be counted as zero.
   */
  onImported?: (summary: { count: number; courseName: string | null }) => void;
}

/**
 * Syllabus upload and assignment extraction step.
 * Phases: upload → extracting (loading UI) → preview (editable list).
 */
export default function SyllabusStep({ onNext, onSkip, error, setError, onPhaseChange, onImported }: SyllabusStepProps) {
  const { showToast } = useToast();
  const { importSyllabusTasks } = useTaskContext();
  const searchParams = useSearchParams();

  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  /**
   * Blob URL backing the thumbnail. A data: URL cannot be embedded as a PDF in
   * Chrome, and it is megabytes of string; a blob URL renders the real first
   * page cheaply. Revoked whenever it is replaced so the blob is not retained.
   */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Release the blob when the step goes away; the browser holds it otherwise.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [phase, setPhase] = useState<"upload" | "extracting" | "preview">("upload");

  // The parent lays the page out (wide preview, no Skip control) from the
  // phase it was last told. Reporting only on transitions left it stuck in
  // "preview" after this step unmounted mid-preview and came back fresh in
  // "upload", so the user had the wide layout with no Skip. Report the phase
  // on every change including mount, and reset it on unmount.
  const onPhaseChangeRef = useRef(onPhaseChange);
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);
  useEffect(() => {
    onPhaseChangeRef.current?.(phase);
  }, [phase]);
  useEffect(() => {
    return () => onPhaseChangeRef.current?.("upload");
  }, []);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<SelectableAssignment[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const extractionStartRef = useRef<number>(0);
  /** Seconds since extraction began, ticked by the progress interval. */
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const estimatedMsRef = useRef<number>(15_000);
  const [importing, setImporting] = useState(false);

  /** Clears all extraction-related intervals. */
  function clearExtractionIntervals() {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    progressIntervalRef.current = null;
    statusIntervalRef.current = null;
  }

  useEffect(() => () => clearExtractionIntervals(), []);

  // Dev-only: ?mock=true previews the review table without calling the API.
  // Gated on NODE_ENV so the param is inert in production.
  useEffect(() => {
    if (shouldLoadSyllabusMock(searchParams, process.env.NODE_ENV) && phase === "upload") {
      setFile(new File(["mock"], "CS170_Syllabus.pdf", { type: "application/pdf" }));
      setCourseName(MOCK_COURSE_NAME);
      setAssignments(MOCK_ASSIGNMENTS);
      setPhase("preview");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const problem = validateSyllabusFile(f);
    if (problem) {
      showToast(problem, { variant: "error", duration: 4000 });
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

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }, [setError, showToast]);

  /** Starts the simulated progress bar and status message rotation. */
  function startProgressSimulation() {
    extractionStartRef.current = Date.now();
    setElapsedSeconds(0);
    setProgressPercent(0);
    setStatusIndex(0);
    progressIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - extractionStartRef.current;
      const ratio = elapsedMs / estimatedMsRef.current;
      setProgressPercent(Math.min(90, 90 * (1 - Math.exp(-2.5 * ratio))));
      setElapsedSeconds(Math.floor(elapsedMs / 1_000));
    }, 500);
    statusIntervalRef.current = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 4_000);
  }

  /** Calls the extraction API with progress simulation, then transitions to preview. */
  async function handleExtract(e?: FormEvent) {
    e?.preventDefault();
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
      showToast(err instanceof Error ? err.message : String(err), { variant: "error", duration: 4000 });
    }
  }

  /**
   * Imports selected assignments as tasks via TaskContext.
   *
   * @param color - Hex color string chosen by the user for these tasks
   */
  async function handleImport(color: string) {
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
        })),
        color
      );
      onImported?.({ count: selected.length, courseName });
      await onNext({} as Record<string, never>);
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), { variant: "error", duration: 4000 });
    } finally {
      setImporting(false);
    }
  }

  /** Returns the elapsed time display string as a count-up timer. */
  function getTimeEstimateText(): string {
    if (elapsedSeconds < 1) return "0 seconds";
    if (elapsedSeconds === 1) return "1 second";
    return `${elapsedSeconds} seconds`;
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
    <form onSubmit={handleExtract} noValidate>
      <StepHeading
        provider="syllabus"
        title="Syllabus"
        description="Upload a PDF or screenshot of your course syllabus and we will pull out the assignments."
      />

      <SyllabusDropzone file={file} previewUrl={previewUrl} onFile={processFile} />

      <div className="mt-4">
        <ErrorBanner message={error} />
      </div>

      <Button type="submit" variant="inverted" size="lg" className="w-full mt-2" disabled={!file || !fileBase64}>
        Extract assignments
      </Button>
    </form>
  );
}
