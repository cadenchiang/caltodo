"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, FileText } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useToast } from "@/contexts/ToastContext";
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
  onPhaseChange?: (phase: "upload" | "extracting" | "preview") => void;
  /**
   * Reports a completed import so the caller can include it in the post-setup
   * recap. Syllabus assignments never touch the sync engine, so they are
   * invisible to SyncResult and would otherwise be counted as zero.
   */
  onImported?: (summary: { count: number; courseName: string | null }) => void;
}

/** Maximum file size in bytes (10 MB). */
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

/** Sample assignments for dev preview (loaded via ?mock=true query param). */
const MOCK_ASSIGNMENTS: SelectableAssignment[] = [
  { title: "Homework 1: Introduction to Algorithms", description: "Covers chapters 1-3", due_date: "2026-01-15", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Homework 2: Sorting & Searching", description: "Merge sort, quicksort, binary search", due_date: "2026-01-22", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Project 1: Data Structures", description: "Implement a balanced BST", due_date: "2026-02-05", due_time: "23:59", points_possible: 200, selected: true },
  { title: "Midterm 1", description: null, due_date: "2026-02-12", due_time: "14:00", points_possible: 150, selected: true },
  { title: "Homework 3: Graph Algorithms", description: "BFS, DFS, shortest paths", due_date: "2026-02-19", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Homework 4: Dynamic Programming", description: "Knapsack, LCS, edit distance", due_date: "2026-02-26", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Project 2: Network Flow", description: "Max flow / min cut implementation", due_date: "2026-03-12", due_time: "23:59", points_possible: 200, selected: true },
  { title: "Homework 5: NP-Completeness", description: "Reductions and proofs", due_date: "2026-03-19", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Midterm 2", description: null, due_date: "2026-03-26", due_time: "14:00", points_possible: 150, selected: true },
  { title: "Homework 6: Approximation Algorithms", description: "Vertex cover, TSP", due_date: "2026-04-02", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Homework 7: Randomized Algorithms", description: null, due_date: "2026-04-09", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Project 3: Final Project", description: "Open-ended algorithmic project", due_date: "2026-04-23", due_time: "23:59", points_possible: 300, selected: true },
  { title: "Homework 8: Review Problems", description: "Comprehensive review", due_date: "2026-04-16", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Homework 9: Advanced Topics", description: "Streaming, online algorithms", due_date: null, due_time: null, points_possible: 100, selected: true },
  { title: "Reading Quiz 1", description: null, due_date: "2026-01-10", due_time: "09:00", points_possible: 10, selected: false },
  { title: "Reading Quiz 2", description: null, due_date: "2026-01-24", due_time: "09:00", points_possible: 10, selected: false },
  { title: "Final Exam", description: "Comprehensive final", due_date: "2026-05-07", due_time: "10:00", points_possible: 250, selected: true },
  { title: "Extra Credit: Research Paper Review", description: "Review a recent algorithms paper", due_date: null, due_time: null, points_possible: 50, selected: true },
];

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
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhaseRaw] = useState<"upload" | "extracting" | "preview">("upload");

  /** Sets phase and notifies parent. */
  const setPhase = useCallback((p: "upload" | "extracting" | "preview") => {
    setPhaseRaw(p);
    onPhaseChange?.(p);
  }, [onPhaseChange]);
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

  // Dev-only: load mock data via ?mock=true to preview UI without API call
  useEffect(() => {
    if (searchParams.get("mock") === "true" && phase === "upload") {
      setFile(new File(["mock"], "CS170_Syllabus.pdf", { type: "application/pdf" }));
      setCourseName("CS 170: Efficient Algorithms");
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
    if (!ACCEPTED_TYPES.includes(f.type)) {
      showToast("Unsupported file type. Please upload a PDF, PNG, JPG, or WebP file.", { variant: "error", duration: 4000 });
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      showToast("File too large. Maximum size is 10 MB.", { variant: "error", duration: 4000 });
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
  }, [setError, showToast]);

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
    const elapsed = Date.now() - extractionStartRef.current;
    const elapsedSeconds = Math.floor(elapsed / 1_000);
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
    <div>
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-[22px] h-[22px] rounded bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center shrink-0">
          <FileText size={14} className="text-purple-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground animate-drop-in">
          Syllabus
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6 animate-drop-in delay-100 text-center">
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
            ? "border-purple-500"
            : file
            ? "border-purple-400"
            : "border-foreground/20"
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
            <p className="text-sm font-semibold text-foreground">{file.name}</p>
            <p className="text-xs text-foreground">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
            <p className="text-xs font-medium text-[#0e89d6]">Click to choose a different file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-foreground" />
            <p className="text-sm font-semibold text-foreground">Drag &amp; drop your syllabus here</p>
            <p className="text-xs text-foreground">PDF, PNG, JPG, or WebP (max 10 MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl mt-4">{error}</div>
      )}

      <button
        onClick={handleExtract}
        disabled={!file}
        className={`w-full mt-6 px-5 py-2.5 rounded-full text-sm font-semibold border border-transparent transition-colors animate-drop-in delay-200 ${
          !file
            ? "bg-[#D1D1D6] dark:bg-[#3A3A3C] text-white/70 dark:text-white/40 cursor-not-allowed"
            : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 cursor-pointer"
        }`}
      >
        Extract Assignments
      </button>
    </div>
  );
}
