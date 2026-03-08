"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Loader2, FileText } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { logger } from "@/lib/logger";

interface CanvasAssignment {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  dueAt: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  noteTitle: string;
  editorHtml: string;
}

type Step = "select" | "preview" | "submitting" | "done";

/**
 * Modal for submitting a note as a PDF to a Canvas assignment.
 * Step 1: Pick a course, then an assignment.
 * Step 2: Preview the generated PDF.
 * Step 3: Upload and submit.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param noteTitle - Title of the note for the PDF
 * @param editorHtml - HTML content to convert to PDF
 */
export default function SubmitToCanvasModal({ open, onClose, noteTitle, editorHtml }: Props) {
  const [step, setStep] = useState<Step>("select");
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<CanvasAssignment | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { showToast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /** Unique course names derived from assignments. */
  const courseNames = useMemo(
    () => [...new Set(assignments.map((a) => a.courseName))],
    [assignments]
  );

  /** Assignments filtered to the selected course. */
  const visibleAssignments = useMemo(
    () => selectedCourse ? assignments.filter((a) => a.courseName === selectedCourse) : [],
    [assignments, selectedCourse]
  );

  /** Upcoming assignments across all courses (shown before course is picked). */
  const suggested = useMemo(() => {
    const now = Date.now();
    return assignments
      .filter((a) => a.dueAt && new Date(a.dueAt).getTime() > now)
      .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime())
      .slice(0, 3);
  }, [assignments]);

  // Close on Escape (unless actively submitting)
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && step !== "submitting") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, step, onClose]);

  /** Fetch assignments when modal opens. */
  useEffect(() => {
    if (!open) return;
    setStep("select");
    setSelectedCourse(null);
    setSelectedAssignment(null);
    setPdfBlob(null);
    setPdfUrl(null);
    setError(null);
    fetchAssignments();
  }, [open]);

  /** Clean up PDF object URL on unmount. */
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  async function fetchAssignments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/canvas/assignments");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to fetch assignments (${res.status})`);
      }
      const data = await res.json();
      setAssignments(data.assignments);
      logger.info("canvas-modal:assignments-loaded", { count: data.assignments.length });
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      logger.error("canvas-modal:fetch-assignments-failed", { error: msg });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Generates a PDF from the editor HTML using jspdf + html2canvas.
   */
  const generatePdf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const title = noteTitle || "Untitled";
      const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const container = document.createElement("div");
      container.style.cssText =
        "position:fixed;left:-9999px;top:0;width:816px;padding:72px;background:white;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;";
      container.innerHTML = `
        <h1 style="font-size:24px;font-weight:700;margin:0 0 16px 0;color:#1a1a1a;">${escapedTitle}</h1>
        <div style="font-size:12px;line-height:1.6;color:#1a1a1a;">${editorHtml}</div>
      `;
      document.body.appendChild(container);

      const images = container.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(container);

      const pdf = new jsPDF("p", "in", "letter");
      const pageW = 8.5;
      const pageH = 11;
      const imgW = pageW;
      const imgH = (canvas.height / canvas.width) * imgW;
      const totalPages = Math.ceil(imgH / pageH);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, -(i * pageH), imgW, imgH);
      }

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfUrl(url);
      setStep("preview");
      logger.info("canvas-modal:pdf-generated", { pages: totalPages, sizeKb: Math.round(blob.size / 1024) });
    } catch (err) {
      const msg = (err as Error).message;
      setError(`PDF generation failed: ${msg}`);
      logger.error("canvas-modal:pdf-generation-failed", { error: msg });
    } finally {
      setLoading(false);
    }
  }, [noteTitle, editorHtml]);

  /** Submits the generated PDF to Canvas. */
  async function handleSubmit() {
    if (!pdfBlob || !selectedAssignment) return;
    setStep("submitting");
    setError(null);

    const fileName = `${(noteTitle || "Untitled").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    const file = new File([pdfBlob], fileName, { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", String(selectedAssignment.courseId));
    formData.append("assignmentId", String(selectedAssignment.id));

    try {
      const res = await fetch("/api/canvas/submit", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Submission failed (${res.status})`);
      }

      setStep("done");
      logger.info("canvas-modal:submitted", { assignmentId: selectedAssignment.id, submissionId: data.submissionId });
      showToast("Assignment submitted to Canvas", { duration: 4000 });
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      setStep("preview");
      logger.error("canvas-modal:submit-failed", { error: msg });
    }
  }

  /**
   * Format due date with time first (gray) and date second (blue/red).
   * Overdue = red date, within 7 days = blue date, else muted date.
   *
   * @returns Object with timePart, datePart, and dateClassName for split rendering
   */
  function formatDue(dueAt: string | null): { timePart: string; datePart: string; dateClassName: string } | null {
    if (!dueAt) return null;
    const d = new Date(dueAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();

    let datePart: string;
    if (diffDays === 0) datePart = "Today";
    else if (diffDays === 1) datePart = "Tomorrow";
    else datePart = `${month} ${day}`;

    let dateClassName: string;
    if (diffDays < 0) dateClassName = "text-red-400";
    else if (diffDays <= 7) dateClassName = "text-blue-400";
    else dateClassName = "text-subtle-foreground";

    return { timePart: time, datePart, dateClassName };
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={step !== "submitting" ? onClose : undefined}
      />

      <div className={`relative bg-popover border border-border rounded-2xl shadow-xl w-full mx-4 animate-announce-card-in flex flex-col transition-all duration-200 ${
        step === "select" ? "max-w-lg max-h-[85vh]" : "max-w-4xl max-h-[90vh]"
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              {step === "done" ? "Submitted" : "Submit to Canvas"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}

          {step === "select" && (
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {/* Course picker skeleton */}
                  <div>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse mb-1.5" />
                    <div className="h-10 w-full bg-muted rounded-xl animate-pulse" />
                  </div>
                  {/* "Due soon" label skeleton */}
                  <div className="h-3 w-20 bg-muted rounded animate-pulse mt-1" />
                  {/* Assignment row skeletons */}
                  <div className="space-y-2">
                    <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
                    <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
                    <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Course picker */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Course</label>
                    <select
                      value={selectedCourse || ""}
                      onChange={(e) => {
                        setSelectedCourse(e.target.value || null);
                        setSelectedAssignment(null);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-input-border bg-popover text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-8"
                    >
                      <option value="">Select a course...</option>
                      {courseNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Suggested assignments — shown before course is picked */}
                  {!selectedCourse && suggested.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Due soon</label>
                      <div className="rounded-xl border border-border overflow-hidden">
                        {suggested.map((a, i) => {
                          const isSelected = selectedAssignment?.id === a.id;
                          const due = formatDue(a.dueAt);
                          return (
                            <button
                              key={a.id}
                              onClick={() => setSelectedAssignment(isSelected ? null : a)}
                              className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                                isSelected ? "bg-blue-500/10 text-blue-500" : "hover:bg-muted text-foreground"
                              } ${i < suggested.length - 1 ? "border-b border-border" : ""}`}
                            >
                              <div className="flex-1 min-w-0">
                                <span className="font-medium truncate block">{a.name}</span>
                                <span className="text-xs text-muted-foreground truncate block">{a.courseName}</span>
                              </div>
                              {due && (
                                <span className="text-xs shrink-0 whitespace-nowrap">
                                  <span className={isSelected ? "text-blue-400/60" : "text-muted-foreground/50"}>{due.timePart}</span>
                                  <span className={isSelected ? "text-blue-400" : due.dateClassName}>{" "}{due.datePart}</span>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Assignment list — only shown after course is picked */}
                  {selectedCourse && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Assignment</label>
                      <div className="rounded-xl border border-border overflow-hidden max-h-[45vh] overflow-y-auto">
                        {visibleAssignments.length === 0 ? (
                          <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                            No unsubmitted assignments
                          </p>
                        ) : (
                          visibleAssignments.map((a, i) => {
                            const isSelected = selectedAssignment?.id === a.id;
                            const due = formatDue(a.dueAt);
                            return (
                              <button
                                key={a.id}
                                onClick={() => setSelectedAssignment(a)}
                                className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                                  isSelected ? "bg-blue-500/10 text-blue-500" : "hover:bg-muted text-foreground"
                                } ${i < visibleAssignments.length - 1 ? "border-b border-border" : ""}`}
                              >
                                <span className="font-medium truncate flex-1">{a.name}</span>
                                {due && (
                                  <span className="text-xs shrink-0 whitespace-nowrap">
                                    <span className={isSelected ? "text-blue-400/60" : "text-muted-foreground/50"}>{due.timePart}</span>
                                    <span className={isSelected ? "text-blue-400" : due.dateClassName}>{" "}{due.datePart}</span>
                                  </span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {(step === "preview" || step === "submitting") && pdfUrl && (
            <div className="p-4">
              <div className="border border-border rounded-xl overflow-hidden bg-muted/30">
                <iframe
                  ref={iframeRef}
                  src={pdfUrl}
                  className="w-full h-[65vh]"
                  title="PDF Preview"
                />
              </div>
              {selectedAssignment && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText size={14} />
                  <span className="truncate">
                    {selectedAssignment.courseName} — {selectedAssignment.name}
                  </span>
                </div>
              )}
            </div>
          )}

          {step === "done" && (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">Successfully submitted</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedAssignment?.name} — {selectedAssignment?.courseName}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-2 shrink-0">
          {step === "select" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generatePdf}
                disabled={!selectedAssignment || loading}
                className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                Generate PDF
              </button>
            </>
          )}

          {step === "preview" && (
            <>
              <button
                onClick={() => setStep("select")}
                className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Upload size={14} />
                Submit to Canvas
              </button>
            </>
          )}

          {step === "submitting" && (
            <button
              disabled
              className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white opacity-50 cursor-not-allowed flex items-center gap-2"
            >
              <Loader2 size={14} className="animate-spin" />
              Submitting...
            </button>
          )}

          {step === "done" && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
