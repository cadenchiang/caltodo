(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourseTasksModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskPreviewPopover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/course-name-merge.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
/**
 * Modal that shows tasks for a single course.
 * Reuses the same TaskList component as the inbox, filtered to one course.
 * Includes task preview popover for mobile and edit modal for desktop.
 *
 * @param courseName - The course to filter tasks for
 * @param tasks - All tasks (filtered internally by course_name)
 * @param open - Whether the modal is visible
 * @param onClose - Handler to close the modal
 */ "use client";
;
;
;
;
;
;
;
;
;
function CourseTasksModal({ courseName, tasks, color, open, onClose }) {
    _s();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const { addTask, updateTask, deleteTask, toggleComplete } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const [previewTask, setPreviewTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [previewRect, setPreviewRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editTask, setEditTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const themeColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getThemeColor"])(color, colorTheme);
    /** Filter tasks that belong to this course. */ const courseTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CourseTasksModal.useMemo[courseTasks]": ()=>{
            const targetCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractCourseCode"])(courseName);
            return tasks.filter({
                "CourseTasksModal.useMemo[courseTasks]": (t)=>{
                    const raw = t.course_name || "General";
                    if (raw === courseName) return true;
                    if (targetCode) {
                        const taskCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractCourseCode"])(raw);
                        return taskCode === targetCode;
                    }
                    return false;
                }
            }["CourseTasksModal.useMemo[courseTasks]"]);
        }
    }["CourseTasksModal.useMemo[courseTasks]"], [
        tasks,
        courseName
    ]);
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-4 md:inset-y-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 flex flex-col bg-popover rounded-2xl shadow-2xl overflow-hidden animate-scale-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 px-5 py-4 border-b border-foreground/[0.08] shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-3 h-3 rounded-full shrink-0",
                                style: {
                                    backgroundColor: themeColor
                                }
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold text-foreground flex-1 truncate",
                                children: courseName
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-muted-foreground mr-2",
                                children: [
                                    courseTasks.length,
                                    " ",
                                    courseTasks.length === 1 ? "task" : "tasks"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            tasks: courseTasks,
                            loading: false,
                            error: null,
                            sortMode: "date",
                            onAdd: addTask,
                            onToggle: toggleComplete,
                            onSelect: (task, anchorRect)=>{
                                if (("TURBOPACK compile-time value", "object") !== "undefined" && window.innerWidth < 768 && anchorRect) {
                                    setPreviewTask(task);
                                    setPreviewRect(anchorRect);
                                } else {
                                    setEditTask(task);
                                }
                            },
                            onDelete: deleteTask,
                            onColorChange: async (cn, newColor)=>{
                                const matching = courseTasks.filter((t)=>(t.course_name || "General") === cn);
                                for (const t of matching)await updateTask(t.id, {
                                    color: newColor
                                });
                            },
                            onDeleteClass: async (cn)=>{
                                const matching = courseTasks.filter((t)=>(t.course_name || "General") === cn);
                                for (const t of matching)await deleteTask(t.id);
                            }
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            previewTask && previewRect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskPreviewPopover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                task: previewTask,
                anchorRect: previewRect,
                onClose: ()=>{
                    setPreviewTask(null);
                    setPreviewRect(null);
                },
                onEdit: (task)=>{
                    setPreviewTask(null);
                    setPreviewRect(null);
                    setEditTask(task);
                },
                onDelete: async (id)=>{
                    await deleteTask(id);
                    setPreviewTask(null);
                    setPreviewRect(null);
                },
                onToggle: toggleComplete
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                lineNumber: 119,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: !!editTask,
                onClose: ()=>setEditTask(null),
                onAdd: ()=>{},
                editTask: editTask,
                onSave: async (id, updates)=>{
                    await updateTask(id, updates);
                },
                onDelete: async (id)=>{
                    await deleteTask(id);
                    setEditTask(null);
                }
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx",
                lineNumber: 130,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(CourseTasksModal, "5QNVwKOVucOT9oW5DJpxFjspyls=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"]
    ];
});
_c = CourseTasksModal;
var _c;
__turbopack_context__.k.register(_c, "CourseTasksModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=56051_worktrees_claude-work_src_components_courses_CourseTasksModal_tsx_6905baa8._.js.map