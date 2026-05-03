(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SubmitToCanvasModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function SubmitToCanvasModal({ open, onClose, noteTitle, editorHtml }) {
    _s();
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("select");
    const [assignments, setAssignments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedCourse, setSelectedCourse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedAssignment, setSelectedAssignment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pdfBlob, setPdfBlob] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pdfUrl, setPdfUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const iframeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Unique course names derived from assignments. */ const courseNames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SubmitToCanvasModal.useMemo[courseNames]": ()=>[
                ...new Set(assignments.map({
                    "SubmitToCanvasModal.useMemo[courseNames]": (a)=>a.courseName
                }["SubmitToCanvasModal.useMemo[courseNames]"]))
            ]
    }["SubmitToCanvasModal.useMemo[courseNames]"], [
        assignments
    ]);
    /** Assignments filtered to the selected course. */ const visibleAssignments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SubmitToCanvasModal.useMemo[visibleAssignments]": ()=>selectedCourse ? assignments.filter({
                "SubmitToCanvasModal.useMemo[visibleAssignments]": (a)=>a.courseName === selectedCourse
            }["SubmitToCanvasModal.useMemo[visibleAssignments]"]) : []
    }["SubmitToCanvasModal.useMemo[visibleAssignments]"], [
        assignments,
        selectedCourse
    ]);
    /** Upcoming assignments across all courses (shown before course is picked). */ const suggested = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SubmitToCanvasModal.useMemo[suggested]": ()=>{
            const now = Date.now();
            return assignments.filter({
                "SubmitToCanvasModal.useMemo[suggested]": (a)=>a.dueAt && new Date(a.dueAt).getTime() > now
            }["SubmitToCanvasModal.useMemo[suggested]"]).sort({
                "SubmitToCanvasModal.useMemo[suggested]": (a, b)=>new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
            }["SubmitToCanvasModal.useMemo[suggested]"]).slice(0, 3);
        }
    }["SubmitToCanvasModal.useMemo[suggested]"], [
        assignments
    ]);
    // Close on Escape (unless actively submitting)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SubmitToCanvasModal.useEffect": ()=>{
            if (!open) return;
            function handleKeyDown(e) {
                if (e.key === "Escape" && step !== "submitting") onClose();
            }
            document.addEventListener("keydown", handleKeyDown);
            return ({
                "SubmitToCanvasModal.useEffect": ()=>document.removeEventListener("keydown", handleKeyDown)
            })["SubmitToCanvasModal.useEffect"];
        }
    }["SubmitToCanvasModal.useEffect"], [
        open,
        step,
        onClose
    ]);
    /** Fetch assignments when modal opens. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SubmitToCanvasModal.useEffect": ()=>{
            if (!open) return;
            setStep("select");
            setSelectedCourse(null);
            setSelectedAssignment(null);
            setPdfBlob(null);
            setPdfUrl(null);
            setError(null);
            fetchAssignments();
        }
    }["SubmitToCanvasModal.useEffect"], [
        open
    ]);
    /** Clean up PDF object URL on unmount. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SubmitToCanvasModal.useEffect": ()=>{
            return ({
                "SubmitToCanvasModal.useEffect": ()=>{
                    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                }
            })["SubmitToCanvasModal.useEffect"];
        }
    }["SubmitToCanvasModal.useEffect"], [
        pdfUrl
    ]);
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
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logger"].info("canvas-modal:assignments-loaded", {
                count: data.assignments.length
            });
        } catch (err) {
            const msg = err.message;
            setError(msg);
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logger"].error("canvas-modal:fetch-assignments-failed", {
                error: msg
            });
        } finally{
            setLoading(false);
        }
    }
    /**
   * Generates a PDF from the editor HTML using jspdf + html2canvas.
   */ const generatePdf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SubmitToCanvasModal.useCallback[generatePdf]": async ()=>{
            setLoading(true);
            setError(null);
            try {
                const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                    __turbopack_context__.A("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript, async loader)"),
                    __turbopack_context__.A("[project]/node_modules/html2canvas/dist/html2canvas.js [app-client] (ecmascript, async loader)")
                ]);
                const title = noteTitle || "Untitled";
                const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                const container = document.createElement("div");
                container.style.cssText = "position:fixed;left:-9999px;top:0;width:816px;padding:72px;background:white;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;";
                container.innerHTML = `
        <h1 style="font-size:24px;font-weight:700;margin:0 0 16px 0;color:#1a1a1a;">${escapedTitle}</h1>
        <div style="font-size:12px;line-height:1.6;color:#1a1a1a;">${editorHtml}</div>
      `;
                document.body.appendChild(container);
                const images = container.querySelectorAll("img");
                await Promise.all(Array.from(images).map({
                    "SubmitToCanvasModal.useCallback[generatePdf]": (img)=>new Promise({
                            "SubmitToCanvasModal.useCallback[generatePdf]": (resolve)=>{
                                if (img.complete) return resolve();
                                img.onload = ({
                                    "SubmitToCanvasModal.useCallback[generatePdf]": ()=>resolve()
                                })["SubmitToCanvasModal.useCallback[generatePdf]"];
                                img.onerror = ({
                                    "SubmitToCanvasModal.useCallback[generatePdf]": ()=>resolve()
                                })["SubmitToCanvasModal.useCallback[generatePdf]"];
                            }
                        }["SubmitToCanvasModal.useCallback[generatePdf]"])
                }["SubmitToCanvasModal.useCallback[generatePdf]"]));
                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff"
                });
                document.body.removeChild(container);
                const pdf = new jsPDF("p", "in", "letter");
                const pageW = 8.5;
                const pageH = 11;
                const imgW = pageW;
                const imgH = canvas.height / canvas.width * imgW;
                const totalPages = Math.ceil(imgH / pageH);
                for(let i = 0; i < totalPages; i++){
                    if (i > 0) pdf.addPage();
                    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, -(i * pageH), imgW, imgH);
                }
                const blob = pdf.output("blob");
                const url = URL.createObjectURL(blob);
                setPdfBlob(blob);
                setPdfUrl(url);
                setStep("preview");
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logger"].info("canvas-modal:pdf-generated", {
                    pages: totalPages,
                    sizeKb: Math.round(blob.size / 1024)
                });
            } catch (err) {
                const msg = err.message;
                setError(`PDF generation failed: ${msg}`);
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logger"].error("canvas-modal:pdf-generation-failed", {
                    error: msg
                });
            } finally{
                setLoading(false);
            }
        }
    }["SubmitToCanvasModal.useCallback[generatePdf]"], [
        noteTitle,
        editorHtml
    ]);
    /** Submits the generated PDF to Canvas. */ async function handleSubmit() {
        if (!pdfBlob || !selectedAssignment) return;
        setStep("submitting");
        setError(null);
        const fileName = `${(noteTitle || "Untitled").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
        const file = new File([
            pdfBlob
        ], fileName, {
            type: "application/pdf"
        });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("courseId", String(selectedAssignment.courseId));
        formData.append("assignmentId", String(selectedAssignment.id));
        try {
            const res = await fetch("/api/canvas/submit", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || `Submission failed (${res.status})`);
            }
            setStep("done");
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logger"].info("canvas-modal:submitted", {
                assignmentId: selectedAssignment.id,
                submissionId: data.submissionId
            });
            showToast("Assignment submitted to Canvas", {
                duration: 4000
            });
        } catch (err) {
            const msg = err.message;
            setError(msg);
            setStep("preview");
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logger"].error("canvas-modal:submit-failed", {
                error: msg
            });
        }
    }
    /**
   * Format due date with time first (gray) and date second (blue/red).
   * Overdue = red date, within 7 days = blue date, else muted date.
   *
   * @returns Object with timePart, datePart, and dateClassName for split rendering
   */ function formatDue(dueAt) {
        if (!dueAt) return null;
        const d = new Date(dueAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dueDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const time = d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
        const month = d.toLocaleDateString("en-US", {
            month: "short"
        });
        const day = d.getDate();
        let datePart;
        if (diffDays === 0) datePart = "Today";
        else if (diffDays === 1) datePart = "Tomorrow";
        else datePart = `${month} ${day}`;
        let dateClassName;
        if (diffDays < 0) dateClassName = "text-red-400";
        else if (diffDays <= 7) dateClassName = "text-blue-400";
        else dateClassName = "text-subtle-foreground";
        return {
            timePart: time,
            datePart,
            dateClassName
        };
    }
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[60] flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in",
                onClick: step !== "submitting" ? onClose : undefined
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative bg-popover border border-border rounded-2xl shadow-xl w-full mx-4 animate-announce-card-in flex flex-col transition-all duration-200 ${step === "select" ? "max-w-lg max-h-[85vh]" : "max-w-4xl max-h-[90vh]"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-b border-border flex items-center justify-between shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                        size: 16,
                                        className: "text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 269,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-base font-semibold text-foreground",
                                        children: step === "done" ? "Submitted" : "Submit to Canvas"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 270,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                lineNumber: 268,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "p-1.5 text-muted-foreground hover:text-foreground transition-colors",
                                "aria-label": "Close",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                    lineNumber: 279,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                lineNumber: 274,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                        lineNumber: 267,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto",
                        children: [
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-4 mt-3 px-3 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                lineNumber: 286,
                                columnNumber: 13
                            }, this),
                            step === "select" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 space-y-3",
                                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-4 w-16 bg-muted rounded animate-pulse mb-1.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 297,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-10 w-full bg-muted rounded-xl animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                            lineNumber: 296,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3 w-20 bg-muted rounded animate-pulse mt-1"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                            lineNumber: 301,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-14 w-full bg-muted rounded-xl animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 304,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-14 w-full bg-muted rounded-xl animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 305,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-14 w-full bg-muted rounded-xl animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 306,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                            lineNumber: 303,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                    lineNumber: 294,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-foreground mb-1.5 block",
                                                    children: "Course"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 313,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: selectedCourse || "",
                                                    onChange: (e)=>{
                                                        setSelectedCourse(e.target.value || null);
                                                        setSelectedAssignment(null);
                                                    },
                                                    className: "w-full px-3 py-2.5 rounded-xl border border-input-border bg-popover text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-8",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Select a course..."
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                            lineNumber: 322,
                                                            columnNumber: 23
                                                        }, this),
                                                        courseNames.map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: name,
                                                                children: name
                                                            }, name, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                lineNumber: 324,
                                                                columnNumber: 25
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 314,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                            lineNumber: 312,
                                            columnNumber: 19
                                        }, this),
                                        !selectedCourse && suggested.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-foreground mb-1.5 block",
                                                    children: "Due soon"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 332,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-xl border border-border overflow-hidden",
                                                    children: suggested.map((a, i)=>{
                                                        const isSelected = selectedAssignment?.id === a.id;
                                                        const due = formatDue(a.dueAt);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setSelectedAssignment(isSelected ? null : a),
                                                            className: `w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${isSelected ? "bg-blue-500/10 text-blue-500" : "hover:bg-muted text-foreground"} ${i < suggested.length - 1 ? "border-b border-border" : ""}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex-1 min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "font-medium truncate block",
                                                                            children: a.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                            lineNumber: 346,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs text-muted-foreground truncate block",
                                                                            children: a.courseName
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                            lineNumber: 347,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                    lineNumber: 345,
                                                                    columnNumber: 31
                                                                }, this),
                                                                due && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs shrink-0 whitespace-nowrap",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: isSelected ? "text-blue-400/60" : "text-muted-foreground/50",
                                                                            children: due.timePart
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                            lineNumber: 351,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: isSelected ? "text-blue-400" : due.dateClassName,
                                                                            children: [
                                                                                " ",
                                                                                due.datePart
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                            lineNumber: 352,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                    lineNumber: 350,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, a.id, true, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                            lineNumber: 338,
                                                            columnNumber: 29
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 333,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                            lineNumber: 331,
                                            columnNumber: 21
                                        }, this),
                                        selectedCourse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-foreground mb-1.5 block",
                                                    children: "Assignment"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 365,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-xl border border-border overflow-hidden max-h-[45vh] overflow-y-auto",
                                                    children: visibleAssignments.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "px-3 py-4 text-sm text-muted-foreground text-center",
                                                        children: "No unsubmitted assignments"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                        lineNumber: 368,
                                                        columnNumber: 27
                                                    }, this) : visibleAssignments.map((a, i)=>{
                                                        const isSelected = selectedAssignment?.id === a.id;
                                                        const due = formatDue(a.dueAt);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setSelectedAssignment(a),
                                                            className: `w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${isSelected ? "bg-blue-500/10 text-blue-500" : "hover:bg-muted text-foreground"} ${i < visibleAssignments.length - 1 ? "border-b border-border" : ""}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-medium truncate flex-1",
                                                                    children: a.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                    lineNumber: 383,
                                                                    columnNumber: 33
                                                                }, this),
                                                                due && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs shrink-0 whitespace-nowrap",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: isSelected ? "text-blue-400/60" : "text-muted-foreground/50",
                                                                            children: due.timePart
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                            lineNumber: 386,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: isSelected ? "text-blue-400" : due.dateClassName,
                                                                            children: [
                                                                                " ",
                                                                                due.datePart
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                            lineNumber: 387,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                                    lineNumber: 385,
                                                                    columnNumber: 35
                                                                }, this)
                                                            ]
                                                        }, a.id, true, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                            lineNumber: 376,
                                                            columnNumber: 31
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                    lineNumber: 366,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                            lineNumber: 364,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                lineNumber: 292,
                                columnNumber: 13
                            }, this),
                            (step === "preview" || step === "submitting") && pdfUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-border rounded-xl overflow-hidden bg-muted/30",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                                            ref: iframeRef,
                                            src: pdfUrl,
                                            className: "w-full h-[65vh]",
                                            title: "PDF Preview"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                            lineNumber: 405,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 404,
                                        columnNumber: 15
                                    }, this),
                                    selectedAssignment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex items-center gap-2 text-sm text-muted-foreground",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                lineNumber: 414,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "truncate",
                                                children: [
                                                    selectedAssignment.courseName,
                                                    " — ",
                                                    selectedAssignment.name
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                lineNumber: 415,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 413,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                lineNumber: 403,
                                columnNumber: 13
                            }, this),
                            step === "done" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-8 text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-6 h-6 text-green-500",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M5 13l4 4L19 7"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                lineNumber: 427,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                            lineNumber: 426,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 425,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium text-foreground",
                                        children: "Successfully submitted"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 430,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mt-1",
                                        children: [
                                            selectedAssignment?.name,
                                            " — ",
                                            selectedAssignment?.courseName
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 431,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                lineNumber: 424,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                        lineNumber: 284,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-t border-border flex items-center justify-end gap-2 shrink-0",
                        children: [
                            step === "select" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onClose,
                                        className: "px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 442,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: generatePdf,
                                        disabled: !selectedAssignment || loading,
                                        className: "px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                                        children: [
                                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                size: 14,
                                                className: "animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                lineNumber: 453,
                                                columnNumber: 28
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                lineNumber: 453,
                                                columnNumber: 77
                                            }, this),
                                            "Generate PDF"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 448,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            step === "preview" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setStep("select"),
                                        className: "px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                        children: "Back"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 461,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleSubmit,
                                        className: "px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                                lineNumber: 471,
                                                columnNumber: 17
                                            }, this),
                                            "Submit to Canvas"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 467,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            step === "submitting" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: true,
                                className: "px-4 py-2 text-sm rounded-xl bg-blue-500 text-white opacity-50 cursor-not-allowed flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        size: 14,
                                        className: "animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                        lineNumber: 482,
                                        columnNumber: 15
                                    }, this),
                                    "Submitting..."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                lineNumber: 478,
                                columnNumber: 13
                            }, this),
                            step === "done" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                                children: "Done"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                                lineNumber: 488,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                        lineNumber: 439,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
                lineNumber: 263,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx",
        lineNumber: 257,
        columnNumber: 5
    }, this), document.body);
}
_s(SubmitToCanvasModal, "Ee/nOXdafy/7QbterzZn93RhNbA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = SubmitToCanvasModal;
var _c;
__turbopack_context__.k.register(_c, "SubmitToCanvasModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=56051_worktrees_claude-work_src_components_notes_SubmitToCanvasModal_tsx_3a97b3c7._.js.map