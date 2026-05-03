(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/lib/expand-repeating-tasks.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Expands repeating tasks into virtual display instances for a given date range.
 * Used by Calendar and Inbox to show future occurrences without requiring completion.
 *
 * Virtual instances share the original task's ID with a ":repeat:YYYY-MM-DD" suffix
 * so they can be distinguished from real database rows.
 *
 * @module expand-repeating-tasks
 */ __turbopack_context__.s([
    "expandRepeatingTasks",
    ()=>expandRepeatingTasks,
    "getRealTaskId",
    ()=>getRealTaskId,
    "isVirtualRepeatInstance",
    ()=>isVirtualRepeatInstance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/repeat.ts [app-client] (ecmascript)");
;
/** Maximum virtual instances to generate per task to prevent infinite loops. */ const MAX_EXPANSIONS = 200;
function isVirtualRepeatInstance(taskId) {
    return taskId.includes(":repeat:");
}
function getRealTaskId(taskId) {
    const idx = taskId.indexOf(":repeat:");
    return idx >= 0 ? taskId.slice(0, idx) : taskId;
}
function expandRepeatingTasks(tasks, rangeStart, rangeEnd) {
    const result = [];
    for (const task of tasks){
        // Pass through non-repeating tasks unchanged
        if (!task.repeat_interval || !task.repeat_unit || !task.due_date) {
            result.push(task);
            continue;
        }
        // Pass through completed repeating tasks unchanged
        if (task.is_completed) {
            result.push(task);
            continue;
        }
        // Include the original task itself (it has a real due_date)
        result.push(task);
        // Generate virtual future instances
        let currentDate = task.due_date;
        let count = 1; // original counts as 1
        for(let i = 0; i < MAX_EXPANSIONS; i++){
            const nextDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeNextDueDate"])(currentDate, task.repeat_interval, task.repeat_unit);
            // Stop if we've passed the visible range
            if (nextDate > rangeEnd) break;
            // Check end date limit
            if (task.repeat_end_date && nextDate > task.repeat_end_date) break;
            // Check end count limit
            count++;
            if (task.repeat_end_count !== null && count > task.repeat_end_count) break;
            // Only include if within visible range
            if (nextDate >= rangeStart) {
                result.push({
                    ...task,
                    id: `${task.id}:repeat:${nextDate}`,
                    due_date: nextDate
                });
            }
            currentDate = nextDate;
        }
    }
    return result;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/task-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatTime12h",
    ()=>formatTime12h,
    "getDueDateInfo",
    ()=>getDueDateInfo,
    "getSourceBadges",
    ()=>getSourceBadges
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
;
function formatTime12h(time24) {
    const [hourStr, minute] = time24.split(":");
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute} ${ampm}`;
}
function getDueDateInfo(dueDate, dueTime) {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + "T00:00:00");
    const diffMs = due.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const timeLabel = dueTime ? formatTime12h(dueTime) : null;
    if (diffDays < 0) {
        const month = due.toLocaleString("en-US", {
            month: "short"
        });
        const day = due.getDate();
        return {
            dateLabel: `${month} ${day}`,
            timeLabel,
            className: "text-red-400"
        };
    }
    if (diffDays === 0) {
        return {
            dateLabel: "Today",
            timeLabel,
            className: "text-blue-400"
        };
    }
    if (diffDays === 1) {
        return {
            dateLabel: "Tomorrow",
            timeLabel,
            className: "text-blue-400"
        };
    }
    if (diffDays <= 7) {
        const month = due.toLocaleString("en-US", {
            month: "short"
        });
        const day = due.getDate();
        return {
            dateLabel: `${month} ${day}`,
            timeLabel,
            className: "text-blue-400"
        };
    }
    const month = due.toLocaleString("en-US", {
        month: "short"
    });
    const day = due.getDate();
    return {
        dateLabel: `${month} ${day}`,
        timeLabel,
        className: "text-subtle-foreground"
    };
}
function getSourceBadges(task) {
    const badges = [];
    if (task.source) {
        const map = {
            canvas: {
                label: "bCourses",
                cls: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/40"
            },
            pensieve: {
                label: "Pensive",
                cls: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-600/40"
            },
            gradescope: {
                label: "Gradescope",
                cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-600/40"
            }
        };
        const entry = map[task.source];
        if (entry) badges.push({
            label: entry.label,
            className: entry.cls
        });
    }
    if (task.is_submitted) {
        badges.push({
            label: "Submitted",
            className: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-600/40"
        });
    }
    if (task.late_due_date) {
        badges.push({
            label: `Late due ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(task.late_due_date + "T00:00:00"), "MMM d")}`,
            className: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-600/40"
        });
    }
    return badges;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Unified task completion checkbox used across TaskItem, TaskCard,
 * TaskDetailPanel, and TaskPreviewPopover.
 *
 * Two sizes:
 * - "sm" (14px): used in list rows and board cards, with ghost checkmark on hover
 * - "lg" (20px): used in detail panel and popover previews
 */ __turbopack_context__.s([
    "default",
    ()=>TaskCheckbox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function TaskCheckbox({ color, isCompleted, onToggle, size = "sm" }) {
    const isLg = size === "lg";
    const sizeClass = isLg ? "w-5 h-5" : "w-3.5 h-3.5";
    const borderWidth = isLg ? "1.5px" : "1px";
    const svgWidth = isLg ? 10 : 8;
    const svgHeight = isLg ? 8 : 6;
    const strokeWidth = isLg ? 2 : 1.5;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: (e)=>{
            e.stopPropagation();
            onToggle();
        },
        className: `group/check flex-shrink-0 ${sizeClass} rounded-[4px] flex items-center justify-center transition-all cursor-pointer ${isLg ? "mt-1" : ""}`,
        style: {
            backgroundColor: isCompleted ? color || "#D1D5DB" : "transparent",
            border: isCompleted ? "none" : `${borderWidth} solid ${color || "#D1D5DB"}`
        },
        "aria-label": isCompleted ? "Mark incomplete" : "Mark complete",
        children: isCompleted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: svgWidth,
            height: svgHeight,
            viewBox: "0 0 10 8",
            fill: "none",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M1 4L3.5 6.5L9 1",
                stroke: "white",
                strokeWidth: strokeWidth,
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx",
                lineNumber: 59,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx",
            lineNumber: 58,
            columnNumber: 9
        }, this) : !isLg ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: svgWidth,
            height: svgHeight,
            viewBox: "0 0 10 8",
            fill: "none",
            className: "opacity-0 group-hover/check:opacity-40 transition-opacity",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M1 4L3.5 6.5L9 1",
                stroke: color || "#D1D5DB",
                strokeWidth: strokeWidth,
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx",
                lineNumber: 75,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx",
            lineNumber: 68,
            columnNumber: 9
        }, this) : null
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c = TaskCheckbox;
var _c;
__turbopack_context__.k.register(_c, "TaskCheckbox");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TaskItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Repeat$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/repeat.js [app-client] (ecmascript) <export default as Repeat>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-client] (ecmascript) <export default as MoreVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/task-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
/** Duration presets for the snooze submenu. */ const SNOOZE_PRESETS = [
    {
        label: "1 hour",
        hours: 1
    },
    {
        label: "3 hours",
        hours: 3
    },
    {
        label: "12 hours",
        hours: 12
    },
    {
        label: "1 day",
        hours: 24
    },
    {
        label: "3 days",
        hours: 72
    },
    {
        label: "1 week",
        hours: 168
    }
];
/** Far-future date used for "Until I unhide" snooze (~100 years). */ const FOREVER_HOURS = 876_000;
function TaskItem({ task, isSelected, onToggle, onSelect, onDelete }) {
    _s();
    const { snoozeTask } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const isMiffy = colorTheme === "miffy";
    const taskColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getThemeColor"])(task.color, colorTheme);
    const rawBadge = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDueDateInfo"])(task.due_date, task.due_time);
    // Miffy theme: swap blue-400 date badges to pink; completed tasks stay subtle
    const dueBadge = rawBadge && task.is_completed ? {
        ...rawBadge,
        className: "text-subtle-foreground"
    } : rawBadge && isMiffy && rawBadge.className === "text-blue-400" ? {
        ...rawBadge,
        className: "text-[#e8729a] dark:text-[#f4a0bc]"
    } : rawBadge;
    const [menuOpen, setMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [snoozeOpen, setSnoozeOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [customHours, setCustomHours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [confirmDelete, setConfirmDelete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [menuPos, setMenuPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const menuBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isOptimistic = task.id.startsWith("temp-");
    /**
   * Opens the delete menu from right-click context menu.
   */ function handleContextMenu(e) {
        e.preventDefault();
        const x = Math.min(e.clientX, window.innerWidth - 156);
        setMenuPos({
            x,
            y: e.clientY
        });
        setMenuOpen(true);
    }
    /**
   * Opens the delete menu from the three-dots button.
   * Clamps x so the menu never overflows the right edge of the viewport.
   */ function handleDotsClick(e) {
        e.stopPropagation();
        if (menuBtnRef.current) {
            const rect = menuBtnRef.current.getBoundingClientRect();
            const x = Math.min(rect.left, window.innerWidth - 156);
            setMenuPos({
                x,
                y: rect.bottom + 4
            });
        }
        setMenuOpen(true);
    }
    function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        setMenuOpen(false);
        setConfirmDelete(false);
        onDelete(task.id);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `group flex items-center gap-2 px-3 h-10 mx-1 md:gap-3 md:px-6 md:mx-2 rounded-xl transition-colors duration-100 cursor-pointer ${isSelected ? "bg-black/5 dark:bg-muted/60" : "hover:bg-accent"} ${task.is_completed ? "opacity-60" : ""} ${isOptimistic ? "animate-task-slide-in" : ""}`,
                onClick: (e)=>onSelect(task, e.currentTarget.getBoundingClientRect()),
                onContextMenu: handleContextMenu,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        color: taskColor,
                        isCompleted: task.is_completed,
                        onToggle: ()=>onToggle(task.id),
                        size: "sm"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0 flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `truncate text-sm ${task.is_completed ? "text-muted-foreground" : "text-foreground"}`,
                                children: task.title
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this),
                            task.tags && task.tags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-medium px-1 py-px rounded bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400 shrink-0 truncate max-w-[80px]",
                                children: task.tags.length === 1 ? task.tags[0] : `${task.tags.length} tags`
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                lineNumber: 128,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    task.repeat_interval && task.repeat_unit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Repeat$3e$__["Repeat"], {
                        size: 12,
                        className: "text-purple-400 shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                        lineNumber: 136,
                        columnNumber: 11
                    }, this),
                    dueBadge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-[11px] shrink-0 font-normal ${dueBadge.className}`,
                        children: [
                            dueBadge.timeLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-muted-foreground opacity-60",
                                children: [
                                    dueBadge.timeLabel,
                                    " "
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                lineNumber: 143,
                                columnNumber: 15
                            }, this),
                            dueBadge.dateLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        ref: menuBtnRef,
                        type: "button",
                        onClick: handleDotsClick,
                        className: "shrink-0 -mr-2 p-1.5 md:p-0.5 rounded text-subtle-foreground md:opacity-0 md:group-hover:opacity-100 hover:text-foreground hover:bg-accent transition-all",
                        "aria-label": "Task options",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                            size: 14
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this),
            menuOpen && typeof document !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-50",
                        onClick: ()=>{
                            setMenuOpen(false);
                            setSnoozeOpen(false);
                        },
                        onContextMenu: (e)=>{
                            e.preventDefault();
                            setMenuOpen(false);
                            setSnoozeOpen(false);
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                        lineNumber: 164,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed z-50 bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[140px]",
                        style: {
                            top: menuPos.y,
                            left: menuPos.x
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSnoozeOpen(!snoozeOpen),
                                        className: "flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                                lineNumber: 179,
                                                columnNumber: 17
                                            }, this),
                                            "Hide for..."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                        lineNumber: 175,
                                        columnNumber: 15
                                    }, this),
                                    snoozeOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute left-full top-0 ml-1 bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[140px] z-50",
                                        children: [
                                            SNOOZE_PRESETS.map((preset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        snoozeTask(task.id, preset.hours);
                                                        setMenuOpen(false);
                                                        setSnoozeOpen(false);
                                                    },
                                                    className: "flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                                                    children: preset.label
                                                }, preset.hours, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                                    lineNumber: 185,
                                                    columnNumber: 21
                                                }, this)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border-t border-border my-1"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                                lineNumber: 197,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                onSubmit: (e)=>{
                                                    e.preventDefault();
                                                    const h = parseFloat(customHours);
                                                    if (h > 0) {
                                                        snoozeTask(task.id, h);
                                                        setMenuOpen(false);
                                                        setSnoozeOpen(false);
                                                        setCustomHours("");
                                                    }
                                                },
                                                className: "flex items-center gap-1.5 px-3 py-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "1",
                                                        step: "1",
                                                        value: customHours,
                                                        onChange: (e)=>setCustomHours(e.target.value),
                                                        placeholder: "hrs",
                                                        className: "w-14 px-2 py-1 text-sm rounded-md border border-input-border bg-background text-foreground placeholder-muted-foreground focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                                        lineNumber: 211,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: "hours"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                                        lineNumber: 220,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                                lineNumber: 198,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    snoozeTask(task.id, FOREVER_HOURS);
                                                    setMenuOpen(false);
                                                    setSnoozeOpen(false);
                                                },
                                                className: "flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                        size: 13
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                                        lineNumber: 230,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Until I unhide"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                                lineNumber: 222,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                        lineNumber: 183,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleDelete,
                                className: "flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors",
                                "aria-label": confirmDelete ? "Confirm delete task" : "Delete task",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                        lineNumber: 241,
                                        columnNumber: 15
                                    }, this),
                                    confirmDelete ? "Click to confirm" : "Delete task"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                                lineNumber: 236,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx",
                        lineNumber: 169,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true), document.body)
        ]
    }, void 0, true);
}
_s(TaskItem, "XkYrmrJ7micQcDHKHWyuBD5mUBg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = TaskItem;
var _c;
__turbopack_context__.k.register(_c, "TaskItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClassGroupHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-client] (ecmascript) <export default as MoreVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-client] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ClassGroupHeader({ groupName, displayName, hasAlias, count, isCollapsed, onToggle, onRename, onResetName, onColorChange, onDeleteClass, onAddTask }) {
    _s();
    const [showMenu, setShowMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editValue, setEditValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(displayName);
    const [showColorGrid, setShowColorGrid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const menuBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const menuDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const editInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close menu on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClassGroupHeader.useEffect": ()=>{
            if (!showMenu) return;
            function handleClick(e) {
                const target = e.target;
                if (menuBtnRef.current && !menuBtnRef.current.contains(target) && !menuDropdownRef.current?.contains(target)) {
                    setShowMenu(false);
                    setShowColorGrid(false);
                    setShowDeleteConfirm(false);
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "ClassGroupHeader.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["ClassGroupHeader.useEffect"];
        }
    }["ClassGroupHeader.useEffect"], [
        showMenu
    ]);
    // Focus input when editing starts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClassGroupHeader.useEffect": ()=>{
            if (editing && editInputRef.current) {
                editInputRef.current.focus();
                editInputRef.current.select();
            }
        }
    }["ClassGroupHeader.useEffect"], [
        editing
    ]);
    // Sync editValue when displayName changes externally
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClassGroupHeader.useEffect": ()=>{
            if (!editing) setEditValue(displayName);
        }
    }["ClassGroupHeader.useEffect"], [
        displayName,
        editing
    ]);
    /**
   * Commits the rename and exits edit mode.
   * Saves the alias if the name changed.
   */ function commitRename() {
        const trimmed = editValue.trim();
        if (trimmed && trimmed !== displayName) {
            onRename(groupName, trimmed);
        }
        setEditing(false);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center pl-2.5 pr-2 py-1.5 mx-2 mt-1 rounded-lg group",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggle,
                className: "shrink-0 p-0.5 hover:opacity-80 transition-opacity",
                "aria-label": isCollapsed ? "Expand group" : "Collapse group",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                    size: 12,
                    className: `text-secondary-foreground transition-transform duration-200 ${!isCollapsed ? "rotate-90" : ""}`
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: editInputRef,
                value: editValue,
                onChange: (e)=>setEditValue(e.target.value),
                onBlur: commitRename,
                onKeyDown: (e)=>{
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") {
                        setEditValue(displayName);
                        setEditing(false);
                    }
                },
                className: "text-sm font-semibold text-foreground bg-transparent border-b border-blue-500 outline-none min-w-0 ml-0.5 py-0 flex-1"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                lineNumber: 123,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggle,
                className: "text-sm font-semibold text-foreground ml-0.5 truncate text-left hover:opacity-80 transition-opacity",
                children: displayName
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                lineNumber: 135,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-subtle-foreground mr-1 shrink-0",
                children: count
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            onAddTask && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onAddTask(groupName),
                className: "p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                title: "Add task to this class",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                    lineNumber: 156,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                lineNumber: 151,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                ref: menuBtnRef,
                onClick: ()=>{
                    setShowMenu(!showMenu);
                    setShowColorGrid(false);
                    setShowDeleteConfirm(false);
                },
                className: "p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                title: "Group options",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                    lineNumber: 171,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this),
            showMenu && menuBtnRef.current && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: menuDropdownRef,
                className: "fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[150px] bg-popover",
                style: {
                    top: menuBtnRef.current.getBoundingClientRect().bottom + 4,
                    left: Math.min(menuBtnRef.current.getBoundingClientRect().left, window.innerWidth - 170)
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setEditValue(displayName);
                            setEditing(true);
                            setShowMenu(false);
                        },
                        className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
                                size: 13
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                lineNumber: 196,
                                columnNumber: 13
                            }, this),
                            "Rename"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                        lineNumber: 188,
                        columnNumber: 11
                    }, this),
                    hasAlias && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            onResetName(groupName);
                            setShowMenu(false);
                        },
                        className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                size: 13
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                lineNumber: 208,
                                columnNumber: 15
                            }, this),
                            "Reset name"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                        lineNumber: 201,
                        columnNumber: 13
                    }, this),
                    onColorChange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowColorGrid(!showColorGrid),
                                className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"], {
                                        size: 13
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                        lineNumber: 219,
                                        columnNumber: 17
                                    }, this),
                                    "Change color"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                lineNumber: 215,
                                columnNumber: 15
                            }, this),
                            showColorGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-1.5 px-3 py-2 flex-wrap",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TASK_COLORS"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            onColorChange(groupName, c);
                                            setShowMenu(false);
                                            setShowColorGrid(false);
                                        },
                                        className: "w-5 h-5 rounded-full hover:scale-110 transition-all",
                                        style: {
                                            backgroundColor: c
                                        }
                                    }, c, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                        lineNumber: 225,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                lineNumber: 223,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true),
                    onDeleteClass && groupName !== "General" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-border my-1"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                lineNumber: 243,
                                columnNumber: 15
                            }, this),
                            !showDeleteConfirm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowDeleteConfirm(true),
                                className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                        size: 13
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                        lineNumber: 249,
                                        columnNumber: 19
                                    }, this),
                                    "Delete class"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                lineNumber: 245,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mb-2",
                                        children: [
                                            "Delete ",
                                            count,
                                            " task",
                                            count !== 1 ? "s" : "",
                                            "?"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                        lineNumber: 254,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    onDeleteClass(groupName);
                                                    setShowMenu(false);
                                                    setShowDeleteConfirm(false);
                                                },
                                                className: "text-xs px-2.5 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors",
                                                children: "Delete"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                                lineNumber: 258,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setShowDeleteConfirm(false),
                                                className: "text-xs px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors",
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                                lineNumber: 268,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                        lineNumber: 257,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                                lineNumber: 253,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
                lineNumber: 176,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
_s(ClassGroupHeader, "Hx3tAkyomqmFXQdeZqMjmZgzm90=");
_c = ClassGroupHeader;
var _c;
__turbopack_context__.k.register(_c, "ClassGroupHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/UserAvatar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UserAvatar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function UserAvatar({ url, name, email, size = 28 }) {
    _s();
    const [imgError, setImgError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    function getInitials() {
        if (name) {
            const parts = name.split(" ").filter(Boolean);
            if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            if (parts.length === 1) return parts[0][0].toUpperCase();
        }
        if (email) return email[0].toUpperCase();
        return "?";
    }
    if (url && !imgError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: url,
            alt: name || email,
            referrerPolicy: "no-referrer",
            onError: ()=>setImgError(true),
            className: "rounded-full object-cover shrink-0",
            style: {
                width: size,
                height: size
            }
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/UserAvatar.tsx",
            lineNumber: 45,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-full bg-blue-500 flex items-center justify-center text-white font-medium shrink-0",
        style: {
            width: size,
            height: size,
            fontSize: size * 0.4
        },
        children: getInitials()
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/UserAvatar.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_s(UserAvatar, "0doYx/lFKmVVbvtO/eWR8SJrtgo=");
_c = UserAvatar;
var _c;
__turbopack_context__.k.register(_c, "UserAvatar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/pending-invite-helpers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pendingInviteToPseudoTask",
    ()=>pendingInviteToPseudoTask
]);
function pendingInviteToPseudoTask(invite) {
    return {
        id: invite.shareId,
        user_id: "",
        title: invite.taskTitle,
        description: "",
        due_date: invite.taskDueDate,
        due_time: invite.taskDueTime,
        is_completed: false,
        color: invite.taskColor,
        created_at: invite.createdAt,
        updated_at: invite.createdAt,
        source: null,
        external_id: null,
        course_name: null,
        source_url: null,
        points_possible: null,
        is_submitted: false,
        google_event_id: null,
        dismissed_at: null,
        repeat_interval: null,
        repeat_unit: null,
        repeat_end_date: null,
        repeat_end_count: null,
        late_due_date: null,
        completed_at: null,
        tags: [],
        snoozed_until: null,
        sort_order: null,
        due_date_manually_edited_at: null,
        due_time_manually_edited_at: null
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Structured logger for server-side operations.
 * Outputs JSON-formatted log messages with timestamp, level, context, and data.
 * Server-side only.
 */ __turbopack_context__.s([
    "logger",
    ()=>logger
]);
/**
 * Writes a structured log entry to stdout/stderr.
 *
 * @param level - Log severity level
 * @param context - Short description of the operation (e.g. "fetchCanvasCourses")
 * @param data - Optional key-value pairs with additional context
 */ function log(level, context, data) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        context,
        ...data && {
            data
        }
    };
    const output = JSON.stringify(entry);
    if (level === "error") {
        console.error(output);
    } else if (level === "warn") {
        console.warn(output);
    } else {
        console.log(output);
    }
}
const logger = {
    /**
   * Log an informational message.
   * @param context - Operation name
   * @param data - Additional structured data
   */ info: (context, data)=>log("info", context, data),
    /**
   * Log a warning message.
   * @param context - Operation name
   * @param data - Additional structured data
   */ warn: (context, data)=>log("warn", context, data),
    /**
   * Log an error message.
   * @param context - Operation name
   * @param data - Additional structured data
   */ error: (context, data)=>log("error", context, data)
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/course-name-merge.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCourseNameMap",
    ()=>buildCourseNameMap,
    "extractCourseCode",
    ()=>extractCourseCode,
    "getCanonicalName",
    ()=>getCanonicalName
]);
/**
 * Utilities for merging duplicate courses that appear on both Canvas and Gradescope.
 * Extracts a normalized "core" course code from long platform-specific names
 * and builds a mapping from verbose names to the canonical short name.
 *
 * Example:
 *   Canvas:     "UGBA 101A-LEC-002 Microeconomics for Business Decisions"
 *   Gradescope: "UGBA 101A"
 *   Canonical:  "UGBA 101A"
 *
 * @module course-name-merge
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-client] (ecmascript)");
;
function extractCourseCode(name) {
    // Match patterns like "UGBA 101A", "CS 188", "EE 16B", "MATH 53", "EECS 126"
    // Optionally followed by section info like "-LEC-002" or " - Title"
    const match = name.match(/^([A-Z]{2,6}\s*\d{1,4}[A-Z]?)\b/i);
    if (!match) return null;
    // Normalize: uppercase, collapse whitespace
    return match[1].replace(/\s+/g, " ").trim().toUpperCase();
}
function buildCourseNameMap(courses) {
    // Group courses by extracted code
    const codeGroups = new Map();
    for (const c of courses){
        const code = extractCourseCode(c.name);
        if (!code) continue;
        const group = codeGroups.get(code);
        if (group) {
            group.push(c);
        } else {
            codeGroups.set(code, [
                c
            ]);
        }
    }
    // Build the name map
    const nameMap = new Map();
    for (const [code, group] of codeGroups){
        // Check if this code appears on multiple platforms
        const sources = new Set(group.map((c)=>c.source));
        if (sources.size <= 1 && group.length <= 1) continue;
        // Pick the shortest name as canonical (tends to be the cleanest)
        const canonical = group.reduce((shortest, c)=>c.name.length < shortest.name.length ? c : shortest).name;
        for (const c of group){
            if (c.name !== canonical) {
                nameMap.set(c.name, canonical);
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logger"].info("course-name-merge: mapping course name", {
                    from: c.name,
                    to: canonical,
                    code,
                    source: c.source
                });
            }
        }
    }
    return nameMap;
}
function getCanonicalName(name, nameMap) {
    return nameMap.get(name) ?? name;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TaskList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-client] (ecmascript) <export default as MoreVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/archive.js [app-client] (ecmascript) <export default as Archive>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskItem.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$ClassGroupHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/ClassGroupHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$UserAvatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/UserAvatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$pending$2d$invite$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/pending-invite-helpers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/course-name-merge.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
/**
 * Formats a countdown string from now until the given ISO timestamp.
 * Returns "Xh Ym" for multi-hour durations or "Xm" for under an hour.
 *
 * @param snoozedUntil - ISO 8601 timestamp when the snooze expires
 * @returns Human-readable countdown string, or "< 1m" if nearly expired
 */ function formatCountdown(snoozedUntil) {
    const diff = new Date(snoozedUntil).getTime() - Date.now();
    if (diff <= 0) return "< 1m";
    // If snoozed for more than ~50 years, treat as "forever"
    const totalMinutes = Math.ceil(diff / 60_000);
    const totalHours = Math.floor(totalMinutes / 60);
    if (totalHours > 438_000) return "Hidden";
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
/** Maximum items shown per section before "show more" truncation. */ const ITEMS_PER_SECTION = 10;
/** Shared localStorage key for column/group name aliases (same as board view). */ const COLUMN_ALIASES_KEY = "caltodo_board_column_aliases";
/** localStorage key for completed task auto-hide duration (in hours). */ const COMPLETED_HIDE_KEY = "caltodo_completed_hide_hours";
/** Default auto-hide duration: 24 hours. */ const DEFAULT_HIDE_HOURS = 24;
/** Preset auto-hide options shown in the settings menu. */ const HIDE_OPTIONS = [
    {
        label: "6 hours",
        hours: 6
    },
    {
        label: "12 hours",
        hours: 12
    },
    {
        label: "24 hours",
        hours: 24
    },
    {
        label: "3 days",
        hours: 72
    },
    {
        label: "7 days",
        hours: 168
    },
    {
        label: "Never",
        hours: 0
    }
];
/**
 * Loads the completed task auto-hide duration from localStorage.
 *
 * @returns Duration in hours, or the default (24) if not set
 */ function loadHideHours() {
    try {
        const raw = localStorage.getItem(COMPLETED_HIDE_KEY);
        if (raw === null) return DEFAULT_HIDE_HOURS;
        const val = parseInt(raw, 10);
        return isNaN(val) ? DEFAULT_HIDE_HOURS : val;
    } catch  {
        return DEFAULT_HIDE_HOURS;
    }
}
/**
 * Saves the completed task auto-hide duration to localStorage.
 */ function saveHideHours(hours) {
    try {
        localStorage.setItem(COMPLETED_HIDE_KEY, String(hours));
    } catch  {
    // non-critical
    }
}
/**
 * Loads column name aliases from localStorage.
 *
 * @returns Map of original course_name to display alias
 */ function loadColumnAliases() {
    try {
        const raw = localStorage.getItem(COLUMN_ALIASES_KEY);
        if (!raw) return new Map();
        const entries = JSON.parse(raw);
        return new Map(entries);
    } catch  {
        return new Map();
    }
}
/**
 * Saves column name aliases to localStorage.
 *
 * @param aliases - Map of original course_name to display alias
 */ function saveColumnAliases(aliases) {
    try {
        localStorage.setItem(COLUMN_ALIASES_KEY, JSON.stringify([
            ...aliases.entries()
        ]));
    } catch  {
    // non-critical
    }
}
/**
 * Groups tasks by course_name, merging courses with the same extracted code
 * (e.g. "UGBA 101A-LEC-002" and "UGBA 101A" both become "UGBA 101A").
 * Tasks with null course_name are grouped under "General".
 *
 * @param tasks - Pre-sorted array of tasks
 * @returns Ordered array of [groupName, tasks[]] pairs
 */ function groupByCourse(tasks) {
    // Map from course code → canonical (shortest) display name
    const codeToCanonical = new Map();
    const map = new Map();
    for (const t of tasks){
        const raw = t.course_name || "General";
        const code = raw !== "General" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractCourseCode"])(raw) : null;
        let key;
        if (code) {
            // Use the shortest name as canonical for this code
            const existing = codeToCanonical.get(code);
            if (!existing || raw.length < existing.length) {
                codeToCanonical.set(code, raw);
            }
            key = code;
        } else {
            key = raw;
        }
        const list = map.get(key);
        if (list) {
            list.push(t);
        } else {
            map.set(key, [
                t
            ]);
        }
    }
    // Replace code keys with canonical display names
    const result = [];
    for (const [key, tasks] of map){
        const displayName = codeToCanonical.get(key) || key;
        result.push([
            displayName,
            tasks
        ]);
    }
    return result;
}
/**
 * Sorts tasks by due_date ascending, with sort_order as a tiebreaker for same-date tasks.
 * Undated tasks appear first. This ensures newly synced tasks always appear in
 * chronological order rather than being pushed to the end.
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */ function sortByDueDate(tasks) {
    return [
        ...tasks
    ].sort((a, b)=>{
        // Primary sort: due date ascending (undated tasks first)
        if (!a.due_date && !b.due_date) {
            const aOrd = a.sort_order ?? Infinity;
            const bOrd = b.sort_order ?? Infinity;
            return aOrd - bOrd;
        }
        if (!a.due_date) return -1;
        if (!b.due_date) return 1;
        const dateCmp = a.due_date.localeCompare(b.due_date);
        if (dateCmp !== 0) return dateCmp;
        // Same date: use sort_order as tiebreaker (null sort_order sorts last)
        const aOrd = a.sort_order ?? Infinity;
        const bOrd = b.sort_order ?? Infinity;
        return aOrd - bOrd;
    });
}
function TaskList({ tasks, loading, error, selectedTaskId, onAdd, onToggle, onSelect, onDelete, defaultDate, sortMode = "date", onReorder, onColorChange, onDeleteClass, onAddTaskToClass, pendingInvites = [], onRespondInvite, onAcceptAllInvites }) {
    _s();
    const { unsnoozeTask } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const isMiffy = colorTheme === "miffy";
    const [requestsExpanded, setRequestsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [completedExpanded, setCompletedExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hiddenExpanded, setHiddenExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAllActive, setShowAllActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAllCompleted, setShowAllCompleted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [archiveExpanded, setArchiveExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAllArchived, setShowAllArchived] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmClearArchive, setConfirmClearArchive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    /** Ticks every 60s when Hidden section is expanded to refresh countdowns. */ const [countdownTick, setCountdownTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [collapsedGroups, setCollapsedGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [aliases, setAliases] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "TaskList.useState": ()=>loadColumnAliases()
    }["TaskList.useState"]);
    const [hideHours, setHideHours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "TaskList.useState": ()=>loadHideHours()
    }["TaskList.useState"]);
    const [completedMenuOpen, setCompletedMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const completedMenuBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const completedMenuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Drag-and-drop state (only active in "date" sortMode with onReorder)
    const [draggedId, setDraggedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dropTargetIndex, setDropTargetIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const dragEnabled = sortMode === "date" && !!onReorder;
    /** Pending requestAnimationFrame ID for throttled drag-over updates. */ const dragRafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Toggles a course group's collapsed state. */ const toggleGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskList.useCallback[toggleGroup]": (groupName)=>{
            setCollapsedGroups({
                "TaskList.useCallback[toggleGroup]": (prev)=>{
                    const next = new Set(prev);
                    if (next.has(groupName)) {
                        next.delete(groupName);
                    } else {
                        next.add(groupName);
                    }
                    return next;
                }
            }["TaskList.useCallback[toggleGroup]"]);
        }
    }["TaskList.useCallback[toggleGroup]"], []);
    /** Renames a group by saving a display alias (shared with board view). */ const renameGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskList.useCallback[renameGroup]": (originalName, newDisplayName)=>{
            setAliases({
                "TaskList.useCallback[renameGroup]": (prev)=>{
                    const next = new Map(prev);
                    const trimmed = newDisplayName.trim();
                    if (!trimmed || trimmed === originalName) {
                        next.delete(originalName);
                    } else {
                        next.set(originalName, trimmed);
                    }
                    saveColumnAliases(next);
                    return next;
                }
            }["TaskList.useCallback[renameGroup]"]);
        }
    }["TaskList.useCallback[renameGroup]"], []);
    /** Updates the auto-hide duration for completed tasks. */ const updateHideHours = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskList.useCallback[updateHideHours]": (hours)=>{
            setHideHours(hours);
            saveHideHours(hours);
            setCompletedMenuOpen(false);
        }
    }["TaskList.useCallback[updateHideHours]"], []);
    // Hydrate requestsExpanded and completedExpanded from localStorage (default collapsed)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskList.useEffect": ()=>{
            try {
                const storedRequests = localStorage.getItem("caltodo_requests_expanded");
                if (storedRequests === "true") setRequestsExpanded(true);
                const stored = localStorage.getItem("caltodo_completed_expanded");
                if (stored === "true") setCompletedExpanded(true);
            } catch  {}
        }
    }["TaskList.useEffect"], []);
    // Close completed menu on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskList.useEffect": ()=>{
            if (!completedMenuOpen) return;
            function handleClick(e) {
                const target = e.target;
                if (completedMenuBtnRef.current && !completedMenuBtnRef.current.contains(target) && completedMenuRef.current && !completedMenuRef.current.contains(target)) {
                    setCompletedMenuOpen(false);
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "TaskList.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["TaskList.useEffect"];
        }
    }["TaskList.useEffect"], [
        completedMenuOpen
    ]);
    // 60-second interval to refresh countdown timers when Hidden section is expanded
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskList.useEffect": ()=>{
            if (!hiddenExpanded) return;
            const timer = setInterval({
                "TaskList.useEffect.timer": ()=>setCountdownTick({
                        "TaskList.useEffect.timer": (t)=>t + 1
                    }["TaskList.useEffect.timer"])
            }["TaskList.useEffect.timer"], 60_000);
            return ({
                "TaskList.useEffect": ()=>clearInterval(timer)
            })["TaskList.useEffect"];
        }
    }["TaskList.useEffect"], [
        hiddenExpanded
    ]);
    /** Resets a group alias back to its original name. */ const resetGroupName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskList.useCallback[resetGroupName]": (originalName)=>{
            setAliases({
                "TaskList.useCallback[resetGroupName]": (prev)=>{
                    const next = new Map(prev);
                    next.delete(originalName);
                    saveColumnAliases(next);
                    return next;
                }
            }["TaskList.useCallback[resetGroupName]"]);
        }
    }["TaskList.useCallback[resetGroupName]"], []);
    const { active, snoozed, completed, archived } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TaskList.useMemo": ()=>{
            const now = Date.now();
            const activeList = [];
            const snoozedList = [];
            const completedList = [];
            for (const t of tasks){
                if (t.is_completed) {
                    completedList.push(t);
                } else if (t.snoozed_until && new Date(t.snoozed_until).getTime() > now) {
                    snoozedList.push(t);
                } else {
                    activeList.push(t);
                }
            }
            // Split completed tasks: recent (within auto-hide window) vs archived (older)
            // hideHours=0 means "never hide" — all go to completed, none archived
            // Archive cutoff: tasks completed more than 7 days ago
            const ARCHIVE_CUTOFF_MS = 7 * 24 * 60 * 60 * 1000;
            const archiveCutoff = now - ARCHIVE_CUTOFF_MS;
            const recentCompleted = [];
            const archivedList = [];
            for (const t of completedList){
                const completedTime = t.completed_at ? new Date(t.completed_at).getTime() : now;
                if (completedTime <= archiveCutoff) {
                    archivedList.push(t);
                } else if (hideHours === 0 || !t.completed_at || completedTime > now - hideHours * 60 * 60 * 1000) {
                    recentCompleted.push(t);
                } else {
                    // Between hideHours cutoff and 7-day archive cutoff — still show in archive
                    archivedList.push(t);
                }
            }
            return {
                active: sortByDueDate(activeList),
                snoozed: sortByDueDate(snoozedList),
                completed: sortByDueDate(recentCompleted),
                archived: sortByDueDate(archivedList)
            };
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["TaskList.useMemo"], [
        tasks,
        hideHours,
        countdownTick
    ]);
    /** Active tasks grouped by course when sortMode is "class". */ const activeGroups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TaskList.useMemo[activeGroups]": ()=>sortMode === "class" ? groupByCourse(active) : []
    }["TaskList.useMemo[activeGroups]"], [
        active,
        sortMode
    ]);
    /** Handles drag start: records the dragged task ID. */ const handleDragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskList.useCallback[handleDragStart]": (e, taskId)=>{
            setDraggedId(taskId);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", taskId);
        }
    }["TaskList.useCallback[handleDragStart]"], []);
    /** Handles drag over a task row: determines drop position (above or below). Throttled with RAF. */ const handleDragOver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskList.useCallback[handleDragOver]": (e, index)=>{
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            const clientY = e.clientY;
            const rect = e.currentTarget.getBoundingClientRect();
            if (dragRafRef.current !== null) {
                cancelAnimationFrame(dragRafRef.current);
            }
            dragRafRef.current = requestAnimationFrame({
                "TaskList.useCallback[handleDragOver]": ()=>{
                    dragRafRef.current = null;
                    const midY = rect.top + rect.height / 2;
                    setDropTargetIndex(clientY < midY ? index : index + 1);
                }
            }["TaskList.useCallback[handleDragOver]"]);
        }
    }["TaskList.useCallback[handleDragOver]"], []);
    /** Handles drop: reorders the active task list and calls onReorder. */ const handleDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskList.useCallback[handleDrop]": (e)=>{
            e.preventDefault();
            if (!draggedId || dropTargetIndex === null || !onReorder) {
                setDraggedId(null);
                setDropTargetIndex(null);
                return;
            }
            const currentIndex = active.findIndex({
                "TaskList.useCallback[handleDrop].currentIndex": (t)=>t.id === draggedId
            }["TaskList.useCallback[handleDrop].currentIndex"]);
            if (currentIndex === -1) {
                setDraggedId(null);
                setDropTargetIndex(null);
                return;
            }
            // Build new order by removing the dragged item and inserting at the drop position
            const reordered = active.filter({
                "TaskList.useCallback[handleDrop].reordered": (t)=>t.id !== draggedId
            }["TaskList.useCallback[handleDrop].reordered"]);
            const insertAt = dropTargetIndex > currentIndex ? dropTargetIndex - 1 : dropTargetIndex;
            reordered.splice(insertAt, 0, active[currentIndex]);
            onReorder(reordered.map({
                "TaskList.useCallback[handleDrop]": (t)=>t.id
            }["TaskList.useCallback[handleDrop]"]));
            setDraggedId(null);
            setDropTargetIndex(null);
        }
    }["TaskList.useCallback[handleDrop]"], [
        draggedId,
        dropTargetIndex,
        onReorder,
        active
    ]);
    /** Clears drag state when drag ends (e.g. dropped outside). */ const handleDragEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskList.useCallback[handleDragEnd]": ()=>{
            setDraggedId(null);
            setDropTargetIndex(null);
        }
    }["TaskList.useCallback[handleDragEnd]"], []);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 flex items-center justify-center py-12",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 468,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: "Loading tasks..."
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 469,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                lineNumber: 467,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
            lineNumber: 466,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center py-16 px-4 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground mb-4",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                    lineNumber: 478,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>window.location.reload(),
                    className: "px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity",
                    children: "Refresh"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                    lineNumber: 479,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
            lineNumber: 477,
            columnNumber: 7
        }, this);
    }
    const activeToShow = showAllActive ? active : active.slice(0, ITEMS_PER_SECTION);
    const completedToShow = showAllCompleted ? completed : completed.slice(0, ITEMS_PER_SECTION);
    const archivedToShow = showAllArchived ? archived : archived.slice(0, ITEMS_PER_SECTION);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col flex-1 min-h-0",
        children: [
            pendingInvites.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center mx-2 pl-2.5 pr-1 py-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center flex-1 rounded-lg hover:bg-accent transition-colors cursor-pointer px-0.5 py-0.5 -mx-0.5",
                                onClick: ()=>{
                                    const next = !requestsExpanded;
                                    setRequestsExpanded(next);
                                    try {
                                        localStorage.setItem("caltodo_requests_expanded", String(next));
                                    } catch  {}
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 12,
                                        className: `shrink-0 text-secondary-foreground transition-transform duration-200 ${requestsExpanded ? "rotate-90" : ""}`
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 507,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-semibold text-foreground ml-0.5",
                                        children: "Requests"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 513,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-amber-500 font-medium ml-1.5",
                                        children: pendingInvites.length
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 514,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 499,
                                columnNumber: 13
                            }, this),
                            requestsExpanded && pendingInvites.length > 1 && onAcceptAllInvites && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onAcceptAllInvites();
                                },
                                className: "text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors px-2 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10 shrink-0",
                                children: "Accept all"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 517,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 498,
                        columnNumber: 11
                    }, this),
                    requestsExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1 mt-0.5",
                        children: pendingInvites.map((invite)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-1 md:mx-2 rounded-xl border border-border bg-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 cursor-pointer hover:bg-accent/50 rounded-t-xl transition-colors",
                                        onClick: ()=>onSelect((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$pending$2d$invite$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pendingInviteToPseudoTask"])(invite)),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$UserAvatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                url: invite.inviterAvatar,
                                                name: invite.inviterName,
                                                email: invite.inviterEmail,
                                                size: 24
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                lineNumber: 537,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-medium text-foreground truncate",
                                                        children: invite.taskTitle
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                        lineNumber: 544,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground truncate",
                                                        children: [
                                                            "from ",
                                                            invite.inviterName || invite.inviterEmail,
                                                            invite.taskDueDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "ml-1.5",
                                                                children: [
                                                                    "· due ",
                                                                    new Date(invite.taskDueDate + "T00:00:00").toLocaleDateString("en-US", {
                                                                        month: "short",
                                                                        day: "numeric"
                                                                    })
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                                lineNumber: 550,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                        lineNumber: 547,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                lineNumber: 543,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 533,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 px-3 md:px-4 pb-2.5 pt-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>onRespondInvite?.(invite.shareId, "accept"),
                                                className: "px-3 py-1 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                                                children: "Accept"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                lineNumber: 558,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>onRespondInvite?.(invite.shareId, "decline"),
                                                className: "px-3 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                                children: "Decline"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                lineNumber: 565,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 557,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, invite.shareId, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 529,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 527,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                lineNumber: 497,
                columnNumber: 9
            }, this),
            active.length === 0 && snoozed.length === 0 && completed.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center py-12 text-muted-foreground text-sm gap-3",
                children: [
                    isMiffy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: "/miffy/miffy-pen.png",
                        alt: "",
                        className: "w-20 h-auto opacity-50 select-none pointer-events-none",
                        draggable: false
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 583,
                        columnNumber: 13
                    }, this),
                    "No tasks yet. Press + to add one."
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                lineNumber: 581,
                columnNumber: 9
            }, this),
            active.length > 0 && sortMode === "class" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1",
                children: activeGroups.map(([groupName, groupTasks], groupIdx)=>{
                    const isCollapsed = collapsedGroups.has(groupName);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: groupIdx > 0 ? "mt-6" : "",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$ClassGroupHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                groupName: groupName,
                                displayName: aliases.get(groupName) || groupName,
                                hasAlias: aliases.has(groupName),
                                count: groupTasks.length,
                                isCollapsed: isCollapsed,
                                onToggle: ()=>toggleGroup(groupName),
                                onRename: renameGroup,
                                onResetName: resetGroupName,
                                onColorChange: onColorChange,
                                onDeleteClass: onDeleteClass,
                                onAddTask: onAddTaskToClass
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 601,
                                columnNumber: 17
                            }, this),
                            !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: groupTasks.map((task, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            i > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mx-12 h-px bg-border"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                lineNumber: 618,
                                                columnNumber: 35
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                task: task,
                                                isSelected: selectedTaskId === task.id,
                                                onToggle: onToggle,
                                                onSelect: onSelect,
                                                onDelete: onDelete
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                lineNumber: 619,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, task.id, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 617,
                                        columnNumber: 23
                                    }, this))
                            }, void 0, false)
                        ]
                    }, groupName, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 600,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                lineNumber: 596,
                columnNumber: 9
            }, this) : active.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1",
                children: [
                    activeToShow.map((task, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            draggable: dragEnabled,
                            onDragStart: dragEnabled ? (e)=>handleDragStart(e, task.id) : undefined,
                            onDragOver: dragEnabled ? (e)=>handleDragOver(e, i) : undefined,
                            onDrop: dragEnabled ? handleDrop : undefined,
                            onDragEnd: dragEnabled ? handleDragEnd : undefined,
                            className: dragEnabled ? "cursor-grab active:cursor-grabbing" : "",
                            style: draggedId === task.id ? {
                                opacity: 0.4
                            } : undefined,
                            children: [
                                dropTargetIndex === i && draggedId !== task.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-0.5 bg-blue-500 mx-4 rounded-full"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                    lineNumber: 649,
                                    columnNumber: 17
                                }, this),
                                i > 0 && dropTargetIndex !== i && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mx-12 h-px bg-border"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                    lineNumber: 651,
                                    columnNumber: 50
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    task: task,
                                    isSelected: selectedTaskId === task.id,
                                    onToggle: onToggle,
                                    onSelect: onSelect,
                                    onDelete: onDelete
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                    lineNumber: 652,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, task.id, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                            lineNumber: 637,
                            columnNumber: 13
                        }, this)),
                    dropTargetIndex === activeToShow.length && draggedId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-0.5 bg-blue-500 mx-4 rounded-full"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 663,
                        columnNumber: 13
                    }, this),
                    active.length > ITEMS_PER_SECTION && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowAllActive(!showAllActive),
                        className: "px-8 py-2 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors w-full text-left",
                        children: showAllActive ? "Show less" : `+${active.length - ITEMS_PER_SECTION} more`
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 666,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                lineNumber: 635,
                columnNumber: 9
            }, this) : null,
            snoozed.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center mx-2 pl-2.5 pr-1 py-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer",
                        onClick: ()=>setHiddenExpanded(!hiddenExpanded),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                size: 12,
                                className: `shrink-0 text-secondary-foreground transition-transform duration-200 ${hiddenExpanded ? "rotate-90" : ""}`
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 683,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-foreground ml-0.5",
                                children: "Hidden"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 689,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-subtle-foreground ml-1.5",
                                children: snoozed.length
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 690,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 679,
                        columnNumber: 11
                    }, this),
                    hiddenExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: snoozed.map((task, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cv-auto-task",
                                children: [
                                    i > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mx-12 h-px bg-border"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 696,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center px-4 py-2 group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm text-foreground truncate flex-1 min-w-0",
                                                children: task.title
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                lineNumber: 698,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-subtle-foreground tabular-nums mr-2 shrink-0",
                                                children: formatCountdown(task.snoozed_until)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                lineNumber: 699,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1 shrink-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>unsnoozeTask(task.id),
                                                        className: "p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors",
                                                        title: "Unhide",
                                                        "aria-label": "Unhide",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                            lineNumber: 710,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                        lineNumber: 703,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>onToggle(task.id),
                                                        className: "p-1 text-muted-foreground hover:text-green-600 rounded-lg transition-colors",
                                                        title: "Complete",
                                                        "aria-label": "Complete",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                            lineNumber: 719,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                        lineNumber: 712,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>onDelete(task.id),
                                                        className: "p-1 text-muted-foreground hover:text-red-500 rounded-lg transition-colors",
                                                        title: "Delete",
                                                        "aria-label": "Delete",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                            lineNumber: 728,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                        lineNumber: 721,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                                lineNumber: 702,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 697,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, task.id, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 695,
                                columnNumber: 17
                            }, this))
                    }, void 0, false)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                lineNumber: 678,
                columnNumber: 9
            }, this),
            completed.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center mx-2 pl-2.5 pr-1 py-1.5 rounded-lg hover:bg-accent transition-colors group cursor-pointer",
                        onClick: ()=>{
                            const next = !completedExpanded;
                            setCompletedExpanded(next);
                            try {
                                localStorage.setItem("caltodo_completed_expanded", String(next));
                            } catch  {}
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                size: 12,
                                className: `shrink-0 text-secondary-foreground transition-transform duration-200 ${completedExpanded ? "rotate-90" : ""}`
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 750,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-foreground ml-0.5",
                                children: "Completed"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 756,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-subtle-foreground ml-1.5",
                                children: completed.length
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 757,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                ref: completedMenuBtnRef,
                                type: "button",
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    setCompletedMenuOpen(!completedMenuOpen);
                                },
                                className: "ml-auto p-1 text-muted-foreground hover:text-foreground rounded-lg transition-all opacity-0 group-hover:opacity-100",
                                title: "Auto-hide settings",
                                "aria-label": "Auto-hide settings",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                    lineNumber: 766,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 758,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 742,
                        columnNumber: 11
                    }, this),
                    completedMenuOpen && completedMenuBtnRef.current && typeof document !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: completedMenuRef,
                        className: "fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden min-w-[180px] bg-popover",
                        style: {
                            top: completedMenuBtnRef.current.getBoundingClientRect().bottom + 4,
                            left: Math.min(completedMenuBtnRef.current.getBoundingClientRect().left, window.innerWidth - 196)
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-2 border-b border-border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-medium text-foreground",
                                        children: "Auto-hide after"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 784,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-muted-foreground",
                                        children: "Completed tasks disappear after this time"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                        lineNumber: 785,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 783,
                                columnNumber: 15
                            }, this),
                            HIDE_OPTIONS.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>updateHideHours(opt.hours),
                                    className: `flex items-center w-full text-left px-3 py-1.5 text-xs transition-colors ${hideHours === opt.hours ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20 font-medium" : "text-foreground hover:bg-accent"}`,
                                    children: [
                                        opt.label,
                                        hideHours === opt.hours && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "ml-auto text-blue-500",
                                            children: "✓"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                            lineNumber: 800,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, opt.hours, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                    lineNumber: 788,
                                    columnNumber: 17
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 772,
                        columnNumber: 13
                    }, this), document.body),
                    completedExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            completedToShow.map((task, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "cv-auto-task",
                                    children: [
                                        i > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mx-12 h-px bg-border"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                            lineNumber: 811,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            task: task,
                                            isSelected: selectedTaskId === task.id,
                                            onToggle: onToggle,
                                            onSelect: onSelect,
                                            onDelete: onDelete
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                            lineNumber: 812,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, task.id, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                    lineNumber: 810,
                                    columnNumber: 17
                                }, this)),
                            completed.length > ITEMS_PER_SECTION && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowAllCompleted(!showAllCompleted),
                                className: "px-8 py-2 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors w-full text-left",
                                children: showAllCompleted ? "Show less" : `+${completed.length - ITEMS_PER_SECTION} more`
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 822,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                lineNumber: 741,
                columnNumber: 9
            }, this),
            archived.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 pt-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center mx-2 pl-2.5 pr-1 py-1 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer",
                        onClick: ()=>setArchiveExpanded(!archiveExpanded),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                size: 10,
                                className: `shrink-0 text-muted-foreground/50 transition-transform duration-200 ${archiveExpanded ? "rotate-90" : ""}`
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 841,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"], {
                                size: 10,
                                className: "shrink-0 text-muted-foreground/50 ml-0.5"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 847,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-muted-foreground/70 ml-1",
                                children: "Archive"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 848,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-muted-foreground/40 ml-1",
                                children: archived.length
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 849,
                                columnNumber: 13
                            }, this),
                            archiveExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    if (!confirmClearArchive) {
                                        setConfirmClearArchive(true);
                                        // Auto-reset after 3 seconds if not confirmed
                                        setTimeout(()=>setConfirmClearArchive(false), 3000);
                                        return;
                                    }
                                    // Second click — actually delete
                                    setConfirmClearArchive(false);
                                    for (const task of archived){
                                        onDelete(task.id);
                                    }
                                },
                                className: `ml-auto text-[10px] font-medium transition-colors px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 ${confirmClearArchive ? "text-red-500 opacity-100" : "text-muted-foreground/50 hover:text-red-500"}`,
                                children: confirmClearArchive ? `Delete ${archived.length} tasks?` : "Clear all"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 851,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 837,
                        columnNumber: 11
                    }, this),
                    archiveExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "opacity-60",
                        children: [
                            archivedToShow.map((task, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "cv-auto-task",
                                    children: [
                                        i > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mx-12 h-px bg-border/50"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                            lineNumber: 881,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            task: task,
                                            isSelected: selectedTaskId === task.id,
                                            onToggle: onToggle,
                                            onSelect: onSelect,
                                            onDelete: onDelete
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                            lineNumber: 882,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, task.id, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                    lineNumber: 880,
                                    columnNumber: 17
                                }, this)),
                            archived.length > ITEMS_PER_SECTION && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowAllArchived(!showAllArchived),
                                className: "px-8 py-2 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors w-full text-left",
                                children: showAllArchived ? "Show less" : `+${archived.length - ITEMS_PER_SECTION} more`
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                                lineNumber: 892,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                        lineNumber: 878,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
                lineNumber: 836,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx",
        lineNumber: 494,
        columnNumber: 5
    }, this);
}
_s(TaskList, "vP1pWa3SB/JfZ/9QCIY00xCFbDU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = TaskList;
var _c;
__turbopack_context__.k.register(_c, "TaskList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TimePicker",
    ()=>TimePicker,
    "default",
    ()=>DatePicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfMonth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/startOfMonth.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfMonth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/endOfMonth.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfWeek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/startOfWeek.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfWeek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/endOfWeek.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$eachDayOfInterval$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/eachDayOfInterval.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isSameMonth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/isSameMonth.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isSameDay$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/isSameDay.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isBefore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/isBefore.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfDay$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/startOfDay.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$addMonths$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/addMonths.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$subMonths$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/subMonths.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Repeat$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/repeat.js [app-client] (ecmascript) <export default as Repeat>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flag.js [app-client] (ecmascript) <export default as Flag>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/repeat.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
/** Preset repeat options displayed as quick-select buttons. */ const REPEAT_PRESETS = [
    {
        label: "Daily",
        interval: 1,
        unit: "day"
    },
    {
        label: "Weekly",
        interval: 1,
        unit: "week"
    },
    {
        label: "Biweekly",
        interval: 2,
        unit: "week"
    },
    {
        label: "Monthly",
        interval: 1,
        unit: "month"
    }
];
function TimePicker({ value, onChange }) {
    // Parse current value into 12h components
    let hour12 = 12;
    let minute = 0;
    let ampm = "AM";
    if (value) {
        const [h, m] = value.split(":").map(Number);
        minute = m;
        ampm = h >= 12 ? "PM" : "AM";
        hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    }
    /** Converts 12h components to 24h "HH:MM" string. */ function to24h(h12, min, ap) {
        let h24 = h12;
        if (ap === "AM" && h12 === 12) h24 = 0;
        else if (ap === "PM" && h12 !== 12) h24 = h12 + 12;
        return `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    }
    function setHour(h) {
        onChange(to24h(h, minute, ampm));
    }
    function setMinute(m) {
        onChange(to24h(hour12, m, ampm));
    }
    function toggleAmPm() {
        const next = ampm === "AM" ? "PM" : "AM";
        onChange(to24h(hour12, minute, next));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setHour(hour12 >= 12 ? 1 : hour12 + 1),
                                className: "text-subtle-foreground hover:text-foreground transition-colors cursor-pointer p-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    size: 12,
                                    className: "rotate-90"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-10 h-8 flex items-center justify-center rounded-lg bg-accent text-sm font-medium text-foreground",
                                children: hour12
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setHour(hour12 <= 1 ? 12 : hour12 - 1),
                                className: "text-subtle-foreground hover:text-foreground transition-colors cursor-pointer p-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    size: 12,
                                    className: "-rotate-90"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 104,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-medium text-muted-foreground",
                        children: ":"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setMinute(minute >= 55 ? 0 : minute + 5),
                                className: "text-subtle-foreground hover:text-foreground transition-colors cursor-pointer p-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    size: 12,
                                    className: "rotate-90"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-10 h-8 flex items-center justify-center rounded-lg bg-accent text-sm font-medium text-foreground",
                                children: String(minute).padStart(2, "0")
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 124,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setMinute(minute <= 0 ? 55 : minute - 5),
                                className: "text-subtle-foreground hover:text-foreground transition-colors cursor-pointer p-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    size: 12,
                                    className: "-rotate-90"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 127,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: toggleAmPm,
                        className: "w-10 h-8 rounded-lg bg-accent text-xs font-medium text-foreground hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer",
                        children: ampm
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-end",
                children: value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>onChange(null),
                    className: "text-[10px] text-subtle-foreground hover:text-secondary-foreground transition-colors shrink-0 cursor-pointer",
                    children: "Clear"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                    lineNumber: 149,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
_c = TimePicker;
function DatePicker({ value, timeValue, onChange, onTimeChange, repeatInterval, repeatUnit, onRepeatChange, repeatEndDate, repeatEndCount, onRepeatEndChange }) {
    _s();
    const selectedDate = value ? new Date(value + "T00:00:00") : null;
    const [currentMonth, setCurrentMonth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(selectedDate ?? new Date());
    const [showCustomRepeat, setShowCustomRepeat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [customInterval, setCustomInterval] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(repeatInterval ?? 1);
    const [customUnit, setCustomUnit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(repeatUnit ?? "day");
    const [expandedSection, setExpandedSection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Derive end mode from props
    const endMode = repeatEndDate ? "date" : repeatEndCount ? "count" : "never";
    const [localEndCount, setLocalEndCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(repeatEndCount ?? 5);
    const monthStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfMonth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startOfMonth"])(currentMonth);
    const monthEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfMonth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["endOfMonth"])(currentMonth);
    const calStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfWeek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startOfWeek"])(monthStart);
    const calEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfWeek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["endOfWeek"])(monthEnd);
    const days = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$eachDayOfInterval$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["eachDayOfInterval"])({
        start: calStart,
        end: calEnd
    });
    const weekDays = [
        "Su",
        "Mo",
        "Tu",
        "We",
        "Th",
        "Fr",
        "Sa"
    ];
    const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfDay$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startOfDay"])(new Date());
    /**
   * Checks if a repeat preset matches the current configuration.
   */ function isRepeatPresetActive(p) {
        return repeatInterval === p.interval && repeatUnit === p.unit;
    }
    /**
   * Toggles a collapsible section open/closed.
   * Accordion behavior: only one section open at a time.
   */ function toggleSection(section) {
        setExpandedSection((prev)=>prev === section ? null : section);
    }
    /**
   * Returns the display label for the current time value.
   * Formats 24h time string to 12h format (e.g. "11:30 PM").
   */ function getTimeLabel() {
        if (!timeValue) return "";
        const [h, m] = timeValue.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    }
    /**
   * Returns the display label for the current ends configuration.
   */ function getEndsLabel() {
        if (repeatEndDate) return `On ${repeatEndDate}`;
        if (repeatEndCount) return `After ${repeatEndCount}`;
        return "Never";
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-card rounded-2xl shadow-2xl border border-border p-3 w-64",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setCurrentMonth((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$subMonths$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["subMonths"])(currentMonth, 1)),
                        className: "p-1 text-subtle-foreground hover:text-secondary-foreground rounded-lg hover:bg-accent transition-all",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                            size: 14
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                            lineNumber: 254,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-semibold text-foreground",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(currentMonth, "MMMM yyyy")
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 256,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setCurrentMonth((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$addMonths$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addMonths"])(currentMonth, 1)),
                        className: "p-1 text-subtle-foreground hover:text-secondary-foreground rounded-lg hover:bg-accent transition-all",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                            size: 14
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                            lineNumber: 264,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 259,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-7 mb-0.5",
                children: weekDays.map((day)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center text-[10px] text-subtle-foreground py-0.5 font-medium",
                        children: day
                    }, day, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 271,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                lineNumber: 269,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-7 gap-y-0.5",
                children: days.map((day)=>{
                    const isCurrentMonth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isSameMonth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSameMonth"])(day, currentMonth);
                    const isSelected = selectedDate && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isSameDay$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSameDay"])(day, selectedDate);
                    const isToday = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isSameDay$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSameDay"])(day, today);
                    const isPast = isCurrentMonth && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isBefore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBefore"])(day, today) && !isToday;
                    const dateStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(day, "yyyy-MM-dd");
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>onChange(dateStr),
                        className: `w-8 h-8 text-xs rounded-full flex items-center justify-center mx-auto transition-all ${isSelected ? "bg-blue-500 text-white shadow-sm" : isToday ? "bg-blue-500/10 text-blue-600 font-medium" : isPast ? "text-subtle-foreground hover:bg-accent" : isCurrentMonth ? "text-secondary-foreground hover:bg-accent" : "text-subtle-foreground/30"}`,
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(day, "d")
                    }, dateStr, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 287,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                lineNumber: 278,
                columnNumber: 7
            }, this),
            (onTimeChange || onRepeatChange) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 pt-2 border-t border-border space-y-0.5",
                children: [
                    onTimeChange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleSection("time"),
                                className: "w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-lg transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        size: 14,
                                        className: "text-subtle-foreground shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 320,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-secondary-foreground",
                                        children: "Time"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 321,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-auto text-xs text-subtle-foreground",
                                        children: getTimeLabel()
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 322,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 12,
                                        className: `text-subtle-foreground shrink-0 transition-transform duration-200 ${expandedSection === "time" ? "rotate-90" : ""}`
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 323,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 315,
                                columnNumber: 15
                            }, this),
                            expandedSection === "time" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-2 pb-2 pt-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TimePicker, {
                                    value: timeValue ?? null,
                                    onChange: (t)=>onTimeChange(t)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                    lineNumber: 332,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 331,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 314,
                        columnNumber: 13
                    }, this),
                    onRepeatChange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleSection("repeat"),
                                className: "w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-lg transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Repeat$3e$__["Repeat"], {
                                        size: 14,
                                        className: "text-subtle-foreground shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 349,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-secondary-foreground",
                                        children: "Repeat"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 350,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-auto text-xs text-subtle-foreground",
                                        children: repeatInterval && repeatUnit ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRepeatLabel"])(repeatInterval, repeatUnit) : ""
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 351,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 12,
                                        className: `text-subtle-foreground shrink-0 transition-transform duration-200 ${expandedSection === "repeat" ? "rotate-90" : ""}`
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 354,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 344,
                                columnNumber: 15
                            }, this),
                            expandedSection === "repeat" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-2 pb-1.5 pt-1",
                                children: [
                                    repeatInterval && repeatUnit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-medium text-blue-500",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRepeatLabel"])(repeatInterval, repeatUnit)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                lineNumber: 365,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    onRepeatChange(null, null);
                                                    setShowCustomRepeat(false);
                                                },
                                                className: "text-[10px] text-subtle-foreground hover:text-secondary-foreground transition-colors",
                                                children: "Clear"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                lineNumber: 368,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 364,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-1.5 mb-1.5",
                                        children: REPEAT_PRESETS.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    onRepeatChange(p.interval, p.unit);
                                                    setShowCustomRepeat(false);
                                                },
                                                className: `text-xs py-1.5 px-2 rounded-lg transition-all ${isRepeatPresetActive(p) ? "bg-blue-500 text-white" : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"}`,
                                                children: p.label
                                            }, p.label, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                lineNumber: 384,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 382,
                                        columnNumber: 19
                                    }, this),
                                    !showCustomRepeat ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setShowCustomRepeat(true),
                                        className: "w-full text-xs text-secondary-foreground hover:text-foreground py-1 rounded-lg hover:bg-accent transition-all",
                                        children: "Custom..."
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 404,
                                        columnNumber: 21
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-t border-border pt-2 mt-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-secondary-foreground shrink-0",
                                                        children: "Every"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                        lineNumber: 414,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: 1,
                                                        max: 365,
                                                        value: customInterval,
                                                        onChange: (e)=>setCustomInterval(Math.max(1, parseInt(e.target.value) || 1)),
                                                        className: "w-14 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                        lineNumber: 415,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: customUnit,
                                                        onChange: (e)=>setCustomUnit(e.target.value),
                                                        className: "flex-1 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "day",
                                                                children: customInterval === 1 ? "day" : "days"
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                                lineNumber: 428,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "week",
                                                                children: customInterval === 1 ? "week" : "weeks"
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                                lineNumber: 429,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "month",
                                                                children: customInterval === 1 ? "month" : "months"
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                                lineNumber: 430,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                        lineNumber: 423,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                lineNumber: 413,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>onRepeatChange(customInterval, customUnit),
                                                className: "w-full mt-2 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 py-1.5 rounded-lg transition-colors",
                                                children: "Set"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                lineNumber: 433,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 412,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 362,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 343,
                        columnNumber: 13
                    }, this),
                    repeatInterval && repeatUnit && onRepeatEndChange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleSection("ends"),
                                className: "w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-lg transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"], {
                                        size: 14,
                                        className: "text-subtle-foreground shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 455,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-secondary-foreground",
                                        children: "Ends"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 456,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-auto text-xs text-subtle-foreground",
                                        children: getEndsLabel()
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 457,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 12,
                                        className: `text-subtle-foreground shrink-0 transition-transform duration-200 ${expandedSection === "ends" ? "rotate-90" : ""}`
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                        lineNumber: 458,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 450,
                                columnNumber: 15
                            }, this),
                            expandedSection === "ends" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-2 pb-1.5 pt-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>onRepeatEndChange(null, null),
                                            className: `text-xs py-1.5 px-2 rounded-lg text-left transition-all ${endMode === "never" ? "bg-blue-500 text-white" : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"}`,
                                            children: "Never"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                            lineNumber: 469,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>onRepeatEndChange(null, localEndCount),
                                                    className: `text-xs py-1.5 px-2 rounded-lg transition-all shrink-0 ${endMode === "count" ? "bg-blue-500 text-white" : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"}`,
                                                    children: "After"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                    lineNumber: 483,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    min: 2,
                                                    max: 999,
                                                    value: endMode === "count" ? repeatEndCount ?? localEndCount : localEndCount,
                                                    onChange: (e)=>{
                                                        const val = Math.max(2, parseInt(e.target.value) || 2);
                                                        setLocalEndCount(val);
                                                        if (endMode === "count") {
                                                            onRepeatEndChange(null, val);
                                                        }
                                                    },
                                                    className: "w-14 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                    lineNumber: 494,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-secondary-foreground",
                                                    children: "times"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                    lineNumber: 508,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                            lineNumber: 482,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>{
                                                        const defaultEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$addMonths$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addMonths"])(new Date(), 1), "yyyy-MM-dd");
                                                        onRepeatEndChange(repeatEndDate ?? defaultEnd, null);
                                                    },
                                                    className: `text-xs py-1.5 px-2 rounded-lg transition-all shrink-0 ${endMode === "date" ? "bg-blue-500 text-white" : "bg-accent text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30"}`,
                                                    children: "On"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                    lineNumber: 513,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "date",
                                                    value: repeatEndDate ?? "",
                                                    onChange: (e)=>{
                                                        if (e.target.value) {
                                                            onRepeatEndChange(e.target.value, null);
                                                        }
                                                    },
                                                    className: "flex-1 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                                    lineNumber: 527,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                            lineNumber: 512,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                    lineNumber: 467,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                                lineNumber: 466,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                        lineNumber: 449,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                lineNumber: 311,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>{
                    onChange(null);
                    onTimeChange?.(null);
                },
                className: "mt-2 w-full text-xs text-subtle-foreground hover:text-secondary-foreground py-1 rounded-lg hover:bg-accent transition-all",
                children: "Clear date"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
                lineNumber: 547,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx",
        lineNumber: 246,
        columnNumber: 5
    }, this);
}
_s(DatePicker, "M8I8VK40MdDTE48M6bWo6fW9TRM=");
_c1 = DatePicker;
var _c, _c1;
__turbopack_context__.k.register(_c, "TimePicker");
__turbopack_context__.k.register(_c1, "DatePicker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/RepeatPicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RepeatPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/repeat.ts [app-client] (ecmascript)");
"use client";
;
;
;
/**
 * Returns ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.).
 *
 * @param n - Positive integer
 * @returns Ordinal suffix string ("st", "nd", "rd", or "th")
 */ function getOrdinalSuffix(n) {
    const s = [
        "th",
        "st",
        "nd",
        "rd"
    ];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
/**
 * Builds context-aware repeat options based on the selected due date.
 * Mirrors Google Calendar's repeat dropdown style.
 *
 * @param dueDate - YYYY-MM-DD string or null
 * @returns Array of repeat option objects
 */ function getRepeatOptions(dueDate) {
    const options = [
        {
            label: "Does not repeat",
            interval: null,
            unit: null
        },
        {
            label: "Daily",
            interval: 1,
            unit: "day"
        }
    ];
    if (dueDate) {
        const d = new Date(dueDate + "T00:00:00");
        const dayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(d, "EEEE");
        const dayOfMonth = d.getDate();
        const suffix = getOrdinalSuffix(dayOfMonth);
        options.push({
            label: `Weekly on ${dayName}`,
            interval: 1,
            unit: "week"
        });
        options.push({
            label: `Monthly on the ${dayOfMonth}${suffix}`,
            interval: 1,
            unit: "month"
        });
    } else {
        options.push({
            label: "Weekly",
            interval: 1,
            unit: "week"
        });
        options.push({
            label: "Monthly",
            interval: 1,
            unit: "month"
        });
    }
    return options;
}
function RepeatPicker({ interval, unit, onChange, dueDate, onCustom }) {
    const options = getRepeatOptions(dueDate);
    /** Checks if an option matches the current repeat configuration. */ function isActive(opt) {
        return interval === opt.interval && unit === opt.unit;
    }
    // If current config doesn't match any preset, it's a custom value
    const hasCustomValue = interval !== null && unit !== null && !options.some((o)=>o.interval === interval && o.unit === unit);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-popover rounded-xl shadow-2xl border border-border py-1 w-64 animate-in fade-in zoom-in-95 duration-100",
        children: [
            options.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>onChange(opt.interval, opt.unit),
                    className: `w-full text-left px-4 py-2.5 text-sm transition-colors ${isActive(opt) ? "bg-accent font-medium text-foreground" : "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"}`,
                    children: opt.label
                }, opt.label, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/RepeatPicker.tsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this)),
            hasCustomValue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onCustom,
                className: "w-full text-left px-4 py-2.5 text-sm bg-accent font-medium text-foreground",
                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRepeatLabel"])(interval, unit)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/RepeatPicker.tsx",
                lineNumber: 119,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-border mt-1 pt-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: onCustom,
                    className: "w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    children: "Custom..."
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/RepeatPicker.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/RepeatPicker.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/RepeatPicker.tsx",
        lineNumber: 101,
        columnNumber: 5
    }, this);
}
_c = RepeatPicker;
var _c;
__turbopack_context__.k.register(_c, "RepeatPicker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CustomRecurrenceModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function CustomRecurrenceModal({ open, onClose, interval, unit, repeatEndDate, repeatEndCount, onDone }) {
    _s();
    const [localInterval, setLocalInterval] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(interval ?? 1);
    const [localUnit, setLocalUnit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(unit ?? "week");
    const [endMode, setEndMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(repeatEndDate ? "date" : repeatEndCount ? "count" : "never");
    const [localEndDate, setLocalEndDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(repeatEndDate ?? "");
    const [localEndCount, setLocalEndCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(repeatEndCount ?? 13);
    if (!open) return null;
    /**
   * Submits the configured recurrence and closes the modal.
   */ function handleDone() {
        const endDate = endMode === "date" && localEndDate ? localEndDate : null;
        const endCount = endMode === "count" ? localEndCount : null;
        onDone(localInterval, localUnit, endDate, endCount);
    }
    /**
   * Returns the singular/plural unit label based on the interval.
   *
   * @param u - Repeat unit
   * @returns Label string (e.g. "day", "weeks")
   */ function unitLabel(u) {
        if (localInterval === 1) {
            return u === "day" ? "day" : u === "week" ? "week" : "month";
        }
        return u === "day" ? "days" : u === "week" ? "weeks" : "months";
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[10002] flex items-center justify-center bg-black/40 animate-in fade-in duration-150",
        onMouseDown: (e)=>{
            if (e.target === e.currentTarget) onClose();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-popover rounded-2xl border border-border shadow-2xl w-[400px] max-w-[90vw] p-6 animate-in zoom-in-95 fade-in duration-150",
            onMouseDown: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold text-foreground",
                            children: "Custom recurrence"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            className: "p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer",
                            "aria-label": "Close",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-sm font-medium text-foreground mb-2 block",
                            children: "Repeat every"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    min: 1,
                                    max: 365,
                                    value: localInterval,
                                    onChange: (e)=>setLocalInterval(Math.max(1, parseInt(e.target.value) || 1)),
                                    className: "w-16 px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: localUnit,
                                    onChange: (e)=>setLocalUnit(e.target.value),
                                    className: "px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "day",
                                            children: unitLabel("day")
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 126,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "week",
                                            children: unitLabel("week")
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 127,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "month",
                                            children: unitLabel("month")
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 128,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                    lineNumber: 121,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-sm font-medium text-foreground mb-2 block",
                            children: "Ends"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                            lineNumber: 135,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "flex items-center gap-3 cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "radio",
                                            name: "endMode",
                                            checked: endMode === "never",
                                            onChange: ()=>setEndMode("never"),
                                            className: "accent-blue-500"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 141,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-foreground",
                                            children: "Never"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 148,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                    lineNumber: 140,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "flex items-center gap-3 cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "radio",
                                            name: "endMode",
                                            checked: endMode === "date",
                                            onChange: ()=>setEndMode("date"),
                                            className: "accent-blue-500"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 153,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-foreground",
                                            children: "On"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 160,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            value: localEndDate,
                                            onChange: (e)=>{
                                                setLocalEndDate(e.target.value);
                                                setEndMode("date");
                                            },
                                            className: "px-2 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 161,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                    lineNumber: 152,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "flex items-center gap-3 cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "radio",
                                            name: "endMode",
                                            checked: endMode === "count",
                                            onChange: ()=>setEndMode("count"),
                                            className: "accent-blue-500"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 174,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-foreground",
                                            children: "After"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 181,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            min: 2,
                                            max: 999,
                                            value: localEndCount,
                                            onChange: (e)=>{
                                                setLocalEndCount(Math.max(2, parseInt(e.target.value) || 2));
                                                setEndMode("count");
                                            },
                                            className: "w-16 px-2 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 182,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-foreground",
                                            children: "occurrences"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                            lineNumber: 195,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                                    lineNumber: 173,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                    lineNumber: 134,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-end gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            className: "px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                            lineNumber: 202,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: handleDone,
                            className: "px-6 py-2 text-sm font-medium rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all cursor-pointer",
                            children: "Done"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                            lineNumber: 209,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
                    lineNumber: 201,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
            lineNumber: 86,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this), document.body);
}
_s(CustomRecurrenceModal, "E5XShXElP4rfjw3LumgNiT8u6+w=");
_c = CustomRecurrenceModal;
var _c;
__turbopack_context__.k.register(_c, "CustomRecurrenceModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/color-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Color conversion utilities for HSV/RGB/Hex.
 * Used by ColorWheel and other color-related components.
 */ /**
 * Converts HSV to RGB.
 *
 * @param h - Hue (0-360)
 * @param s - Saturation (0-1)
 * @param v - Value/brightness (0-1)
 * @returns Tuple [r, g, b] each 0-255
 */ __turbopack_context__.s([
    "hexToRgb",
    ()=>hexToRgb,
    "hsvToRgb",
    ()=>hsvToRgb,
    "rgbToHex",
    ()=>rgbToHex,
    "rgbToHsv",
    ()=>rgbToHsv
]);
function hsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs(h / 60 % 2 - 1));
    const m = v - c;
    let r1, g1, b1;
    if (h < 60) {
        r1 = c;
        g1 = x;
        b1 = 0;
    } else if (h < 120) {
        r1 = x;
        g1 = c;
        b1 = 0;
    } else if (h < 180) {
        r1 = 0;
        g1 = c;
        b1 = x;
    } else if (h < 240) {
        r1 = 0;
        g1 = x;
        b1 = c;
    } else if (h < 300) {
        r1 = x;
        g1 = 0;
        b1 = c;
    } else {
        r1 = c;
        g1 = 0;
        b1 = x;
    }
    return [
        Math.round((r1 + m) * 255),
        Math.round((g1 + m) * 255),
        Math.round((b1 + m) * 255)
    ];
}
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d + 6) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
    }
    const s = max === 0 ? 0 : d / max;
    return [
        h,
        s,
        max
    ];
}
function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [
        parseInt(h.slice(0, 2), 16) || 0,
        parseInt(h.slice(2, 4), 16) || 0,
        parseInt(h.slice(4, 6), 16) || 0
    ];
}
function rgbToHex(r, g, b) {
    return "#" + [
        r,
        g,
        b
    ].map((v)=>Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ColorWheel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$color$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/color-utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const RECENT_COLORS_KEY = "caltodo_recent_colors";
const MAX_RECENT = 6;
/** Wheel layout constants. */ const WHEEL_SIZE = 160;
const RING_WIDTH = 20;
const OUTER_R = WHEEL_SIZE / 2;
const INNER_R = OUTER_R - RING_WIDTH;
const CENTER = WHEEL_SIZE / 2;
const SV_SIZE = Math.floor(INNER_R * Math.SQRT2) - 6;
const SV_OFFSET = (WHEEL_SIZE - SV_SIZE) / 2;
function loadRecentColors() {
    try {
        const raw = localStorage.getItem(RECENT_COLORS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
    } catch  {
        return [];
    }
}
function saveRecentColor(color) {
    try {
        const existing = loadRecentColors();
        const upper = color.toUpperCase();
        const filtered = existing.filter((c)=>c.toUpperCase() !== upper);
        localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify([
            color,
            ...filtered
        ].slice(0, MAX_RECENT)));
    } catch  {}
}
function ColorWheel({ value, onChange }) {
    _s();
    const [rgb_r, rgb_g, rgb_b] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$color$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hexToRgb"])(value);
    const [initH, initS, initV] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$color$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rgbToHsv"])(rgb_r, rgb_g, rgb_b);
    const [hue, setHue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initH);
    const [sat, setSat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initS);
    const [val, setVal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initV);
    const [hexInput, setHexInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(value);
    const [recentColors, setRecentColors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [dragging, setDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const wheelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const svRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorWheel.useEffect": ()=>{
            setRecentColors(loadRecentColors());
        }
    }["ColorWheel.useEffect"], []);
    // Sync from external value changes (skip during drag)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorWheel.useEffect": ()=>{
            if (dragging) return;
            const [r2, g2, b2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$color$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hexToRgb"])(value);
            const [h2, s2, v2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$color$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rgbToHsv"])(r2, g2, b2);
            if (s2 > 0.01) setHue(h2);
            setSat(s2);
            setVal(v2);
            setHexInput(value);
        }
    }["ColorWheel.useEffect"], [
        value,
        dragging
    ]);
    const emitColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ColorWheel.useCallback[emitColor]": (h, s, v)=>{
            const [r, g, b] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$color$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hsvToRgb"])(h, s, v);
            onChange((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$color$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rgbToHex"])(r, g, b));
        }
    }["ColorWheel.useCallback[emitColor]"], [
        onChange
    ]);
    /** Ref tracks the latest value so the cleanup effect can save it on unmount. */ const latestValueRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorWheel.useEffect": ()=>{
            latestValueRef.current = value;
        }
    }["ColorWheel.useEffect"], [
        value
    ]);
    /** Save the selected color to recent colors when the wheel closes (unmounts). */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorWheel.useEffect": ()=>{
            return ({
                "ColorWheel.useEffect": ()=>{
                    saveRecentColor(latestValueRef.current);
                }
            })["ColorWheel.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ColorWheel.useEffect"], []);
    // ── Hue ring interaction ──
    /**
   * Converts screen coordinates to hue angle (0-360).
   * CSS conic-gradient starts at top (0deg), atan2 starts at right (0rad).
   * Conversion: hue = (atan2_deg + 90) % 360.
   */ const getHueFromPointer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ColorWheel.useCallback[getHueFromPointer]": (clientX, clientY)=>{
            if (!wheelRef.current) return null;
            const rect = wheelRef.current.getBoundingClientRect();
            const scale = rect.width / WHEEL_SIZE;
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = clientX - cx;
            const dy = clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dragging !== "hue" && (dist < INNER_R * scale - 2 || dist > OUTER_R * scale + 4)) return null;
            const atan2Deg = Math.atan2(dy, dx) * (180 / Math.PI);
            return ((atan2Deg + 90) % 360 + 360) % 360;
        }
    }["ColorWheel.useCallback[getHueFromPointer]"], [
        dragging
    ]);
    const handleWheelPointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ColorWheel.useCallback[handleWheelPointerDown]": (e)=>{
            const h = getHueFromPointer(e.clientX, e.clientY);
            if (h === null) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging("hue");
            setHue(h);
            emitColor(h, sat, val);
        }
    }["ColorWheel.useCallback[handleWheelPointerDown]"], [
        getHueFromPointer,
        sat,
        val,
        emitColor
    ]);
    const handleWheelPointerMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ColorWheel.useCallback[handleWheelPointerMove]": (e)=>{
            if (dragging !== "hue" || !wheelRef.current) return;
            const rect = wheelRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const atan2Deg = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
            const h = ((atan2Deg + 90) % 360 + 360) % 360;
            setHue(h);
            emitColor(h, sat, val);
        }
    }["ColorWheel.useCallback[handleWheelPointerMove]"], [
        dragging,
        sat,
        val,
        emitColor
    ]);
    // ── SV square interaction ──
    const getSVFromPointer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ColorWheel.useCallback[getSVFromPointer]": (clientX, clientY)=>{
            if (!svRef.current) return null;
            const rect = svRef.current.getBoundingClientRect();
            return {
                s: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
                v: Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
            };
        }
    }["ColorWheel.useCallback[getSVFromPointer]"], []);
    const handleSVPointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ColorWheel.useCallback[handleSVPointerDown]": (e)=>{
            e.stopPropagation();
            const sv = getSVFromPointer(e.clientX, e.clientY);
            if (!sv) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging("sv");
            setSat(sv.s);
            setVal(sv.v);
            emitColor(hue, sv.s, sv.v);
        }
    }["ColorWheel.useCallback[handleSVPointerDown]"], [
        getSVFromPointer,
        hue,
        emitColor
    ]);
    const handleSVPointerMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ColorWheel.useCallback[handleSVPointerMove]": (e)=>{
            if (dragging !== "sv") return;
            const sv = getSVFromPointer(e.clientX, e.clientY);
            if (!sv) return;
            setSat(sv.s);
            setVal(sv.v);
            emitColor(hue, sv.s, sv.v);
        }
    }["ColorWheel.useCallback[handleSVPointerMove]"], [
        dragging,
        getSVFromPointer,
        hue,
        emitColor
    ]);
    const handlePointerUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ColorWheel.useCallback[handlePointerUp]": ()=>{
            if (dragging) {
                setDragging(null);
            }
        }
    }["ColorWheel.useCallback[handlePointerUp]"], [
        dragging
    ]);
    // ── Indicator positions ──
    // Hue indicator on the ring: convert hue back to atan2 angle
    const atan2Rad = (hue - 90) * Math.PI / 180;
    const midR = (OUTER_R + INNER_R) / 2;
    const hueX = CENTER + midR * Math.cos(atan2Rad);
    const hueY = CENTER + midR * Math.sin(atan2Rad);
    // Pure hue color for SV square background
    const [pureR, pureG, pureB] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$color$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hsvToRgb"])(hue, 1, 1);
    const pureHue = `rgb(${pureR},${pureG},${pureB})`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center gap-3",
        style: {
            width: WHEEL_SIZE + 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: wheelRef,
                className: "relative touch-none cursor-crosshair",
                style: {
                    width: WHEEL_SIZE,
                    height: WHEEL_SIZE
                },
                onPointerDown: handleWheelPointerDown,
                onPointerMove: handleWheelPointerMove,
                onPointerUp: handlePointerUp,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 rounded-full",
                        style: {
                            background: "conic-gradient(from 0deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
                            mask: `radial-gradient(circle, transparent ${INNER_R - 1}px, black ${INNER_R}px, black ${OUTER_R}px, transparent ${OUTER_R}px)`,
                            WebkitMask: `radial-gradient(circle, transparent ${INNER_R - 1}px, black ${INNER_R}px, black ${OUTER_R}px, transparent ${OUTER_R}px)`
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none",
                        style: {
                            left: hueX - 8,
                            top: hueY - 8,
                            backgroundColor: pureHue,
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: svRef,
                        className: "absolute touch-none cursor-crosshair rounded-sm overflow-hidden",
                        style: {
                            left: SV_OFFSET,
                            top: SV_OFFSET,
                            width: SV_SIZE,
                            height: SV_SIZE
                        },
                        onPointerDown: handleSVPointerDown,
                        onPointerMove: handleSVPointerMove,
                        onPointerUp: handlePointerUp,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0",
                                style: {
                                    background: `linear-gradient(to right, white, ${pureHue})`
                                }
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0",
                                style: {
                                    background: "linear-gradient(to bottom, transparent, black)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none",
                                style: {
                                    left: `calc(${sat * 100}% - 7px)`,
                                    top: `calc(${(1 - val) * 100}% - 7px)`,
                                    boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.4)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                                lineNumber: 227,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                lineNumber: 184,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 w-full px-2 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-8 h-8 rounded-lg border border-border shrink-0 transition-colors",
                        style: {
                            backgroundColor: value
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                        lineNumber: 240,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: hexInput,
                        onChange: (e)=>setHexInput(e.target.value),
                        onBlur: ()=>{
                            let h = hexInput.trim();
                            if (!h.startsWith("#")) h = "#" + h;
                            if (/^#[0-9a-f]{6}$/i.test(h)) {
                                onChange(h);
                            } else {
                                setHexInput(value);
                            }
                        },
                        onKeyDown: (e)=>{
                            if (e.key === "Enter") e.target.blur();
                        },
                        className: "flex-1 min-w-0 text-xs font-mono text-foreground bg-transparent border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring",
                        maxLength: 7
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                        lineNumber: 244,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                lineNumber: 239,
                columnNumber: 7
            }, this),
            recentColors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full px-2 pt-1 border-t border-gray-200 dark:border-gray-500",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] text-muted-foreground dark:text-gray-300 mb-1.5",
                        children: "Recent"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                        lineNumber: 266,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: recentColors.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    onChange(c);
                                    saveRecentColor(c);
                                    setRecentColors(loadRecentColors());
                                },
                                className: `w-5 h-5 rounded-full transition-all duration-150 cursor-pointer ${value.toUpperCase() === c.toUpperCase() ? "ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900 scale-110" : "hover:scale-110"}`,
                                style: {
                                    backgroundColor: c
                                },
                                "aria-label": `Recent color ${c}`
                            }, c, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                                lineNumber: 269,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                        lineNumber: 267,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
                lineNumber: 265,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx",
        lineNumber: 182,
        columnNumber: 5
    }, this);
}
_s(ColorWheel, "WtNHm/GfLUk13jpcL9wNlku9BKQ=");
_c = ColorWheel;
var _c;
__turbopack_context__.k.register(_c, "ColorWheel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TaskCreateModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tag.js [app-client] (ecmascript) <export default as Tag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-start.js [app-client] (ecmascript) <export default as AlignLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Repeat$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/repeat.js [app-client] (ecmascript) <export default as Repeat>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/repeat.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/task-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$DatePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/DatePicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$RepeatPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/RepeatPicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$CustomRecurrenceModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/CustomRecurrenceModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorWheel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function TaskCreateModal({ open, onClose, onAdd, defaultDate, defaultTime, defaultCourseName, editTask, onSave, onDelete, onSaveColorForClass, createTypeToggle, keepMounted }) {
    _s();
    const { availableTags, availableCourses, courseColors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const isMiffy = colorTheme === "miffy";
    const isEditMode = !!editTask;
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [showColorConfirm, setShowColorConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [dueDate, setDueDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultDate ?? null);
    const [dueTime, setDueTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [color, setColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_TASK_COLOR"]);
    const [tags, setTags] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [repeatInterval, setRepeatInterval] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [repeatUnit, setRepeatUnit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [repeatEndDate, setRepeatEndDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [repeatEndCount, setRepeatEndCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [courseName, setCourseName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultCourseName ?? null);
    const [showDatePicker, setShowDatePicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [closing, setClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [datePickerPos, setDatePickerPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    // Inline tag dropdown state
    const [showTagDropdown, setShowTagDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [tagSearch, setTagSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [tagDropdownPos, setTagDropdownPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    // Course dropdown state
    const [showCourseDropdown, setShowCourseDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [courseDropdownPos, setCourseDropdownPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0,
        width: 0
    });
    const [courseSearch, setCourseSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Color popover state (circle next to title)
    const [showColorPopover, setShowColorPopover] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [colorPopoverPos, setColorPopoverPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    // Color wheel popover state (from inside color popover)
    const [showColorWheel, setShowColorWheel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [colorWheelPos, setColorWheelPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    // Time picker state
    const [showTimePicker, setShowTimePicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [timePickerPos, setTimePickerPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    // Repeat picker state
    const [showRepeatPicker, setShowRepeatPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [repeatPickerPos, setRepeatPickerPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    // Custom recurrence modal state
    const [showCustomRecurrence, setShowCustomRecurrence] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const titleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dateRowRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const datePickerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tagAddRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tagDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tagSearchRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const courseRowRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const courseDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const courseSearchRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const colorCircleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const colorPopoverRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const colorWheelBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const colorWheelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const timeFieldRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const timePickerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const repeatFieldRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const repeatPickerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto-focus title when modal opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskCreateModal.useEffect": ()=>{
            if (open) setTimeout({
                "TaskCreateModal.useEffect": ()=>titleRef.current?.focus()
            }["TaskCreateModal.useEffect"], 100);
        }
    }["TaskCreateModal.useEffect"], [
        open
    ]);
    // Set defaultDate, defaultTime, and defaultCourseName in create mode
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskCreateModal.useEffect": ()=>{
            if (open && !editTask) {
                setDueDate(defaultDate ?? null);
                setDueTime(defaultTime ?? null);
                setCourseName(defaultCourseName ?? null);
            }
        }
    }["TaskCreateModal.useEffect"], [
        defaultDate,
        defaultTime,
        defaultCourseName,
        open,
        editTask
    ]);
    // Pre-fill fields in edit mode
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskCreateModal.useEffect": ()=>{
            if (open && editTask) {
                setTitle(editTask.title);
                setDescription(editTask.description || "");
                setDueDate(editTask.due_date);
                setDueTime(editTask.due_time);
                setColor(editTask.color);
                setTags(editTask.tags ?? []);
                setCourseName(editTask.course_name);
                setRepeatInterval(editTask.repeat_interval);
                setRepeatUnit(editTask.repeat_unit);
                setRepeatEndDate(editTask.repeat_end_date);
                setRepeatEndCount(editTask.repeat_end_count);
            }
        }
    }["TaskCreateModal.useEffect"], [
        open,
        editTask
    ]);
    /**
   * Resets all form fields to their initial state.
   */ function resetForm() {
        setTitle("");
        setDescription("");
        setDueDate(defaultDate ?? null);
        setDueTime(null);
        setColor(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_TASK_COLOR"]);
        setTags([]);
        setCourseName(defaultCourseName ?? null);
        setRepeatInterval(null);
        setRepeatUnit(null);
        setRepeatEndDate(null);
        setRepeatEndCount(null);
        setShowDatePicker(false);
        setShowTagDropdown(false);
        setShowCourseDropdown(false);
        setCourseSearch("");
        setShowColorPopover(false);
        setShowColorWheel(false);
        setShowColorConfirm(false);
        setShowTimePicker(false);
        setShowRepeatPicker(false);
        setShowCustomRecurrence(false);
        setTagSearch("");
    }
    /**
   * Animates the modal closed, then calls onClose.
   */ function handleClose() {
        setClosing(true);
        setTimeout(()=>{
            onClose();
            setClosing(false);
            resetForm();
        }, 150);
    }
    /**
   * Builds the current edit updates object.
   */ function buildUpdates() {
        return {
            title: title.trim(),
            description: description.trim(),
            due_date: dueDate,
            due_time: dueTime,
            color,
            tags,
            course_name: courseName,
            repeat_interval: repeatInterval,
            repeat_unit: repeatUnit,
            repeat_end_date: repeatEndDate,
            repeat_end_count: repeatEndCount
        };
    }
    /**
   * Validates and submits the task (create or edit), then closes.
   * In edit mode, if color changed and task has a course_name, shows
   * a confirmation dialog asking whether to apply to all class tasks.
   */ function handleSubmit(e) {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        if (isEditMode && editTask && onSave) {
            // Check if color changed and task belongs to a class
            const colorChanged = color.toUpperCase() !== editTask.color.toUpperCase();
            if (colorChanged && courseName && onSaveColorForClass) {
                setShowColorConfirm(true);
                return;
            }
            onSave(editTask.id, buildUpdates());
            showToast("Task updated");
        } else {
            onAdd({
                title: trimmed,
                description: description.trim() || undefined,
                due_date: dueDate,
                due_time: dueTime,
                color,
                tags: tags.length > 0 ? tags : undefined,
                course_name: courseName || undefined,
                repeat_interval: repeatInterval,
                repeat_unit: repeatUnit,
                repeat_end_date: repeatEndDate,
                repeat_end_count: repeatEndCount
            });
            showToast("Task created");
        }
        handleClose();
    }
    /**
   * Saves only this task's color (from confirmation dialog).
   */ function handleColorConfirmJustThis() {
        if (editTask && onSave) {
            onSave(editTask.id, buildUpdates());
        }
        setShowColorConfirm(false);
        handleClose();
    }
    /**
   * Saves this task and applies color to all tasks in the same class.
   */ function handleColorConfirmAll() {
        if (editTask && onSave && onSaveColorForClass && courseName) {
            onSave(editTask.id, buildUpdates());
            onSaveColorForClass(courseName, color);
        }
        setShowColorConfirm(false);
        handleClose();
    }
    /**
   * Handles delete button click in edit mode.
   */ function handleDelete() {
        if (editTask && onDelete) {
            onDelete(editTask.id);
            handleClose();
        }
    }
    /**
   * Computes fixed-position coordinates for a portal dropdown relative to a trigger.
   * Flips above the trigger if it would overflow the viewport bottom.
   *
   * @param el - The trigger element
   * @param dropdownHeight - Estimated dropdown height in px
   * @returns Position with top and left
   */ const computePortalPos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskCreateModal.useCallback[computePortalPos]": (el, dropdownHeight)=>{
            if (!el) return {
                top: 0,
                left: 0
            };
            const rect = el.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom - 8;
            const top = spaceBelow < dropdownHeight ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
            return {
                top,
                left: rect.left
            };
        }
    }["TaskCreateModal.useCallback[computePortalPos]"], []);
    /**
   * Toggles the color popover below the color circle.
   */ function toggleColorPopover() {
        if (showColorPopover) {
            setShowColorPopover(false);
            return;
        }
        setShowDatePicker(false);
        setShowTagDropdown(false);
        setShowTimePicker(false);
        setShowRepeatPicker(false);
        setShowColorWheel(false);
        setColorPopoverPos(computePortalPos(colorCircleRef.current, 200));
        setShowColorPopover(true);
    }
    /**
   * Toggles the date picker portal and computes its position.
   */ function toggleDatePicker() {
        if (showDatePicker) {
            setShowDatePicker(false);
            return;
        }
        setShowTagDropdown(false);
        setShowTimePicker(false);
        setShowRepeatPicker(false);
        setShowColorPopover(false);
        setDatePickerPos(computePortalPos(dateRowRef.current, 420));
        setShowDatePicker(true);
    }
    /**
   * Toggles the time picker portal and computes its position.
   */ function toggleTimePicker() {
        if (showTimePicker) {
            setShowTimePicker(false);
            return;
        }
        setShowDatePicker(false);
        setShowTagDropdown(false);
        setShowRepeatPicker(false);
        setShowColorPopover(false);
        setTimePickerPos(computePortalPos(timeFieldRef.current, 160));
        setShowTimePicker(true);
    }
    /**
   * Toggles the repeat picker portal and computes its position.
   */ function toggleRepeatPicker() {
        if (showRepeatPicker) {
            setShowRepeatPicker(false);
            return;
        }
        setShowDatePicker(false);
        setShowTagDropdown(false);
        setShowTimePicker(false);
        setShowColorPopover(false);
        setRepeatPickerPos(computePortalPos(repeatFieldRef.current, 260));
        setShowRepeatPicker(true);
    }
    /**
   * Opens the inline tag dropdown, portaled to body.
   */ function openTagDropdown() {
        if (showTagDropdown) {
            setShowTagDropdown(false);
            return;
        }
        setShowDatePicker(false);
        setTagDropdownPos(computePortalPos(tagAddRef.current, 220));
        setShowTagDropdown(true);
        setTagSearch("");
        setTimeout(()=>tagSearchRef.current?.focus(), 50);
    }
    // -- Course selection helper --
    /**
   * Selects a course and auto-sets the color to match existing tasks in that class.
   *
   * @param name - Course name to select, or null to clear
   */ function selectCourse(name) {
        setCourseName(name);
        if (name) {
            const classColor = courseColors.get(name);
            if (classColor) setColor(classColor);
        }
        setCourseSearch("");
        setShowCourseDropdown(false);
    }
    // Filtered course suggestions for the dropdown
    const filteredCourses = courseSearch.trim() ? availableCourses.filter((c)=>c.toLowerCase().includes(courseSearch.toLowerCase())) : availableCourses;
    // -- Inline tag helpers --
    const selectedLower = tags.map((t)=>t.toLowerCase());
    const unselectedTags = availableTags.filter((t)=>!selectedLower.includes(t.toLowerCase()));
    const filteredTagSuggestions = tagSearch.trim() ? unselectedTags.filter((t)=>t.toLowerCase().includes(tagSearch.toLowerCase())) : unselectedTags;
    /**
   * Adds a tag (case-insensitive duplicate check).
   *
   * @param tag - Tag string to add
   */ function addTag(tag) {
        const trimmed = tag.trim();
        if (!trimmed || selectedLower.includes(trimmed.toLowerCase())) return;
        setTags([
            ...tags,
            trimmed
        ]);
        setTagSearch("");
    }
    /**
   * Removes a tag from the selection.
   *
   * @param tag - Tag to remove
   */ function removeTag(tag) {
        setTags(tags.filter((t)=>t !== tag));
    }
    // Click-outside handler for portaled pickers
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskCreateModal.useEffect": ()=>{
            if (!showDatePicker && !showTagDropdown && !showCourseDropdown && !showColorWheel && !showColorPopover && !showTimePicker && !showRepeatPicker) return;
            function handleClick(e) {
                const target = e.target;
                if (showDatePicker && datePickerRef.current && !datePickerRef.current.contains(target) && dateRowRef.current && !dateRowRef.current.contains(target)) {
                    setShowDatePicker(false);
                }
                if (showTagDropdown && tagDropdownRef.current && !tagDropdownRef.current.contains(target) && tagAddRef.current && !tagAddRef.current.contains(target)) {
                    setShowTagDropdown(false);
                }
                if (showCourseDropdown && courseDropdownRef.current && !courseDropdownRef.current.contains(target) && courseRowRef.current && !courseRowRef.current.contains(target)) {
                    setShowCourseDropdown(false);
                }
                if (showColorPopover && colorPopoverRef.current && !colorPopoverRef.current.contains(target) && colorCircleRef.current && !colorCircleRef.current.contains(target)) {
                    setShowColorPopover(false);
                }
                if (showColorWheel && colorWheelRef.current && !colorWheelRef.current.contains(target) && (!colorWheelBtnRef.current || !colorWheelBtnRef.current.contains(target))) {
                    setShowColorWheel(false);
                }
                if (showTimePicker && timePickerRef.current && !timePickerRef.current.contains(target) && timeFieldRef.current && !timeFieldRef.current.contains(target)) {
                    setShowTimePicker(false);
                }
                if (showRepeatPicker && repeatPickerRef.current && !repeatPickerRef.current.contains(target) && repeatFieldRef.current && !repeatFieldRef.current.contains(target)) {
                    setShowRepeatPicker(false);
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "TaskCreateModal.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["TaskCreateModal.useEffect"];
        }
    }["TaskCreateModal.useEffect"], [
        showDatePicker,
        showTagDropdown,
        showCourseDropdown,
        showColorWheel,
        showColorPopover,
        showTimePicker,
        showRepeatPicker
    ]);
    if (!open && !keepMounted) return null;
    /** Display color accounting for active color theme. */ const displayColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getThemeColor"])(color, colorTheme);
    /** Source badge for the tags row (edit mode only, platform label only). */ const sourceBadge = isEditMode && editTask?.source ? ({
        canvas: {
            label: "bCourses",
            cls: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/40"
        },
        gradescope: {
            label: "Gradescope",
            cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-600/40"
        },
        pensieve: {
            label: "Pensive",
            cls: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-600/40"
        }
    })[editTask.source] ?? null : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: !open && keepMounted ? {
            display: 'none'
        } : undefined,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `fixed inset-0 z-50 flex justify-center bg-black/40 ${keepMounted ? "items-start pt-[18vh]" : `items-center transition-opacity duration-150 ${closing ? "opacity-0" : "animate-in fade-in duration-150"}`}`,
            onMouseDown: (e)=>{
                // Only close when clicking the backdrop itself, not portaled children
                if (e.target === e.currentTarget) handleClose();
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `relative bg-card rounded-2xl border border-border shadow-2xl w-[540px] max-w-[95vw] max-h-[90vh] overflow-y-auto ${keepMounted ? "" : `transition-all duration-150 ${closing ? "scale-95 opacity-0" : "animate-in zoom-in-95 fade-in duration-200"}`}`,
                    onMouseDown: (e)=>{
                        const target = e.target;
                        if (showTagDropdown && tagAddRef.current && !tagAddRef.current.contains(target)) {
                            setShowTagDropdown(false);
                        }
                        if (showCourseDropdown && courseRowRef.current && !courseRowRef.current.contains(target)) {
                            setShowCourseDropdown(false);
                        }
                        if (showDatePicker && dateRowRef.current && !dateRowRef.current.contains(target)) {
                            setShowDatePicker(false);
                        }
                        if (showColorPopover && colorCircleRef.current && !colorCircleRef.current.contains(target)) {
                            setShowColorPopover(false);
                        }
                        if (showColorWheel && (!colorWheelBtnRef.current || !colorWheelBtnRef.current.contains(target))) {
                            setShowColorWheel(false);
                        }
                        if (showTimePicker && timeFieldRef.current && !timeFieldRef.current.contains(target)) {
                            setShowTimePicker(false);
                        }
                        if (showRepeatPicker && repeatFieldRef.current && !repeatFieldRef.current.contains(target)) {
                            setShowRepeatPicker(false);
                        }
                        e.stopPropagation();
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleClose,
                            className: "absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors duration-150 cursor-pointer z-10",
                            "aria-label": "Close",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 573,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                            lineNumber: 568,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            className: "pt-12 pb-4",
                            children: [
                                createTypeToggle && !isEditMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-6 pb-5 pt-1",
                                    children: createTypeToggle
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                    lineNumber: 579,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pl-6 pr-6 pb-4 flex items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            ref: colorCircleRef,
                                            type: "button",
                                            onClick: toggleColorPopover,
                                            className: "w-5 h-5 rounded-full shrink-0 cursor-pointer hover:scale-110 transition-all border border-black/10 dark:border-white/10",
                                            style: {
                                                backgroundColor: displayColor
                                            },
                                            "aria-label": "Pick color"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                            lineNumber: 585,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            ref: titleRef,
                                            type: "text",
                                            value: title,
                                            onChange: (e)=>setTitle(e.target.value),
                                            placeholder: "Add title",
                                            className: "w-full text-[22px] text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors duration-200 pr-8",
                                            maxLength: 200
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                            lineNumber: 593,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                    lineNumber: 584,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            ref: courseRowRef,
                                            type: "button",
                                            onClick: ()=>{
                                                if (showCourseDropdown) {
                                                    setShowCourseDropdown(false);
                                                    return;
                                                }
                                                setShowDatePicker(false);
                                                setShowTagDropdown(false);
                                                setShowColorWheel(false);
                                                const pos = computePortalPos(courseRowRef.current, 220);
                                                const rowWidth = courseRowRef.current?.getBoundingClientRect().width ?? 320;
                                                setCourseDropdownPos({
                                                    ...pos,
                                                    width: rowWidth
                                                });
                                                setShowCourseDropdown(true);
                                                setCourseSearch("");
                                                setTimeout(()=>courseSearchRef.current?.focus(), 50);
                                            },
                                            className: "w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.99] cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                    size: 20,
                                                    className: "shrink-0 text-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 627,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-sm leading-snug flex-1 min-w-0 truncate ${courseName ? "text-foreground" : "text-muted-foreground"}`,
                                                    children: courseName || "Set class"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 631,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    size: 14,
                                                    className: "shrink-0 text-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 638,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                            lineNumber: 607,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    ref: dateRowRef,
                                                    type: "button",
                                                    onClick: toggleDatePicker,
                                                    className: "flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.99] cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                                                            size: 20,
                                                            className: "shrink-0 text-foreground"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                            lineNumber: 649,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-sm leading-snug ${dueDate ? "text-foreground" : "text-muted-foreground"}`,
                                                            children: dueDate ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(dueDate + "T00:00:00"), "EEEE, MMMM d") : "Set date"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                            lineNumber: 653,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 643,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    ref: timeFieldRef,
                                                    type: "button",
                                                    onClick: toggleTimePicker,
                                                    className: "flex items-center gap-2 px-4 py-4 rounded-xl text-left transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.99] cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                            size: 16,
                                                            className: "shrink-0 text-foreground"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                            lineNumber: 669,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-sm leading-snug ${dueTime ? "text-foreground" : "text-muted-foreground"}`,
                                                            children: dueTime ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(dueTime) : "Time"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                            lineNumber: 670,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 663,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                            lineNumber: 642,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            ref: repeatFieldRef,
                                            type: "button",
                                            onClick: toggleRepeatPicker,
                                            className: "w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.99] cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Repeat$3e$__["Repeat"], {
                                                    size: 20,
                                                    className: "shrink-0 text-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 687,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm leading-snug text-muted-foreground flex-1 min-w-0 truncate",
                                                    children: repeatInterval && repeatUnit ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRepeatLabel"])(repeatInterval, repeatUnit) : "Does not repeat"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 691,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    size: 14,
                                                    className: "shrink-0 text-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 696,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                            lineNumber: 681,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            ref: tagAddRef,
                                            type: "button",
                                            onClick: openTagDropdown,
                                            className: "w-full flex items-start gap-4 px-4 py-4 rounded-xl text-left transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                                                    size: 20,
                                                    className: "shrink-0 mt-0.5 text-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 706,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center gap-1.5 min-w-0",
                                                    children: [
                                                        sourceBadge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-xs font-medium px-2 py-0.5 rounded-full ${sourceBadge.cls}`,
                                                            children: sourceBadge.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                            lineNumber: 713,
                                                            columnNumber: 19
                                                        }, this),
                                                        tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 max-w-[240px]",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "truncate",
                                                                        children: tag
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                                        lineNumber: 722,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        role: "button",
                                                                        tabIndex: 0,
                                                                        onMouseDown: (e)=>{
                                                                            e.stopPropagation();
                                                                            e.preventDefault();
                                                                            removeTag(tag);
                                                                        },
                                                                        className: "hover:text-blue-800 dark:hover:text-blue-200 transition-colors cursor-pointer",
                                                                        "aria-label": `Remove ${tag}`,
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                            size: 10
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                                            lineNumber: 734,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                                        lineNumber: 723,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                ]
                                                            }, tag, true, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                                lineNumber: 718,
                                                                columnNumber: 19
                                                            }, this)),
                                                        tags.length === 0 && !sourceBadge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm text-muted-foreground",
                                                            children: "Add tags"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                            lineNumber: 739,
                                                            columnNumber: 19
                                                        }, this),
                                                        tags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex items-center gap-1 text-muted-foreground",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                    size: 12
                                                                }, void 0, false, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                                    lineNumber: 743,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs",
                                                                    children: "Tag"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                                    lineNumber: 744,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                            lineNumber: 742,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 710,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                            lineNumber: 700,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__["AlignLeft"], {
                                                    size: 20,
                                                    className: "shrink-0 mt-0.5 text-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 752,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    value: description,
                                                    onChange: (e)=>setDescription(e.target.value),
                                                    placeholder: "Add description",
                                                    rows: 2,
                                                    className: "flex-1 text-sm text-foreground bg-transparent placeholder-muted-foreground/60 focus:outline-none resize-none leading-relaxed",
                                                    maxLength: 2000
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 756,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                            lineNumber: 751,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                    lineNumber: 605,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between px-6 pt-5 mt-3 border-t border-border",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: isEditMode && onDelete && editTask && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: handleDelete,
                                                className: "flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors duration-150 active:scale-[0.97] cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                        size: 15
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                        lineNumber: 777,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Delete"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                lineNumber: 772,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                            lineNumber: 770,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: handleClose,
                                                    className: "px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors duration-150 active:scale-[0.97] cursor-pointer",
                                                    children: "Cancel"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 783,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    disabled: !title.trim(),
                                                    className: "px-6 py-2 text-sm font-medium rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.97] cursor-pointer",
                                                    children: isEditMode ? "Save" : "Save"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                                    lineNumber: 790,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                            lineNumber: 782,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                    lineNumber: 769,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                            lineNumber: 576,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 537,
                    columnNumber: 7
                }, this),
                showDatePicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: datePickerRef,
                    onMouseDown: (e)=>e.stopPropagation(),
                    style: {
                        position: "fixed",
                        top: datePickerPos.top,
                        left: datePickerPos.left,
                        zIndex: 10000
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$DatePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        value: dueDate,
                        onChange: (date)=>{
                            setDueDate(date);
                            setShowDatePicker(false);
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                        lineNumber: 815,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 805,
                    columnNumber: 11
                }, this), document.body),
                showTagDropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: tagDropdownRef,
                    onMouseDown: (e)=>e.stopPropagation(),
                    style: {
                        position: "fixed",
                        top: tagDropdownPos.top,
                        left: tagDropdownPos.left,
                        zIndex: 10000
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-52 bg-popover rounded-xl shadow-2xl border border-border py-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-2.5 pb-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    ref: tagSearchRef,
                                    type: "text",
                                    value: tagSearch,
                                    onChange: (e)=>setTagSearch(e.target.value),
                                    onKeyDown: (e)=>{
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (tagSearch.trim()) {
                                                addTag(tagSearch);
                                                setShowTagDropdown(false);
                                            }
                                        }
                                        if (e.key === "Escape") setShowTagDropdown(false);
                                    },
                                    placeholder: "Search or add tag...",
                                    className: "w-full px-2.5 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                    lineNumber: 842,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 841,
                                columnNumber: 15
                            }, this),
                            filteredTagSuggestions.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        addTag(tag);
                                        setShowTagDropdown(false);
                                    },
                                    className: "w-full text-left px-4 py-1.5 text-sm text-foreground hover:bg-accent transition-colors truncate",
                                    children: tag
                                }, tag, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                    lineNumber: 864,
                                    columnNumber: 17
                                }, this)),
                            tagSearch.trim() && !availableTags.some((t)=>t.toLowerCase() === tagSearch.trim().toLowerCase()) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    addTag(tagSearch);
                                    setShowTagDropdown(false);
                                },
                                className: "w-full text-left px-4 py-1.5 text-sm text-blue-500 hover:bg-accent transition-colors",
                                children: [
                                    "Add “",
                                    tagSearch.trim(),
                                    "”"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 883,
                                columnNumber: 19
                            }, this),
                            filteredTagSuggestions.length === 0 && !tagSearch.trim() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "px-4 py-2 text-sm text-muted-foreground",
                                children: "No tags yet. Type to create one."
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 897,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                        lineNumber: 839,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 829,
                    columnNumber: 11
                }, this), document.body),
                showCourseDropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: courseDropdownRef,
                    onMouseDown: (e)=>e.stopPropagation(),
                    style: {
                        position: "fixed",
                        top: courseDropdownPos.top,
                        left: courseDropdownPos.left,
                        zIndex: 10000
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: courseDropdownPos.width || 320
                        },
                        className: "bg-popover rounded-xl shadow-2xl border border-border py-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-2.5 pb-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    ref: courseSearchRef,
                                    type: "text",
                                    value: courseSearch,
                                    onChange: (e)=>setCourseSearch(e.target.value),
                                    onKeyDown: (e)=>{
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (courseSearch.trim()) {
                                                selectCourse(courseSearch.trim());
                                            }
                                        }
                                        if (e.key === "Escape") setShowCourseDropdown(false);
                                    },
                                    placeholder: "Search or add class...",
                                    className: "w-full px-2.5 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                    lineNumber: 922,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 921,
                                columnNumber: 15
                            }, this),
                            !courseSearch.trim() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>selectCourse(null),
                                className: `w-full text-left px-4 py-1.5 text-sm transition-colors truncate ${!courseName ? "text-blue-500 font-medium" : "text-muted-foreground hover:bg-accent"}`,
                                children: "None"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 942,
                                columnNumber: 17
                            }, this),
                            filteredCourses.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>selectCourse(c),
                                    className: `w-full text-left px-4 py-1.5 text-sm transition-colors truncate ${courseName === c ? "text-blue-500 font-medium" : "text-foreground hover:bg-accent"}`,
                                    children: c
                                }, c, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                    lineNumber: 956,
                                    columnNumber: 17
                                }, this)),
                            courseSearch.trim() && !availableCourses.some((c)=>c.toLowerCase() === courseSearch.trim().toLowerCase()) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>selectCourse(courseSearch.trim()),
                                className: "w-full text-left px-4 py-1.5 text-sm text-blue-500 hover:bg-accent transition-colors",
                                children: [
                                    "Add “",
                                    courseSearch.trim(),
                                    "”"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 974,
                                columnNumber: 19
                            }, this),
                            filteredCourses.length === 0 && !courseSearch.trim() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "px-4 py-2 text-sm text-muted-foreground",
                                children: "No classes yet. Type to create one."
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 984,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                        lineNumber: 919,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 909,
                    columnNumber: 11
                }, this), document.body),
                showColorPopover && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: colorPopoverRef,
                    onMouseDown: (e)=>e.stopPropagation(),
                    style: {
                        position: "fixed",
                        top: colorPopoverPos.top,
                        left: colorPopoverPos.left,
                        zIndex: 10000
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-popover rounded-xl shadow-2xl border border-border p-3 animate-in fade-in zoom-in-95 duration-100",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-6 gap-2",
                            children: [
                                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TASK_COLORS"].map((c)=>{
                                    const dc = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getThemeColor"])(c, colorTheme);
                                    const isSelected = color.toUpperCase() === c.toUpperCase();
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            setColor(c);
                                            setShowColorPopover(false);
                                        },
                                        className: `w-7 h-7 rounded-full transition-all duration-150 cursor-pointer ${isSelected ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900 scale-110" : "hover:scale-110"}`,
                                        style: {
                                            backgroundColor: dc
                                        },
                                        "aria-label": `Color ${c}`
                                    }, c, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                        lineNumber: 1012,
                                        columnNumber: 21
                                    }, this);
                                }),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    ref: colorWheelBtnRef,
                                    type: "button",
                                    onClick: ()=>{
                                        if (showColorWheel) {
                                            setShowColorWheel(false);
                                            return;
                                        }
                                        setShowColorPopover(false);
                                        setColorWheelPos(computePortalPos(colorCircleRef.current, 300));
                                        setShowColorWheel(true);
                                    },
                                    className: "w-7 h-7 rounded-full transition-all duration-150 cursor-pointer hover:scale-110 overflow-hidden",
                                    "aria-label": "Custom color",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "/color-wheel.svg",
                                        alt: "",
                                        className: "w-full h-full",
                                        draggable: false
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                        lineNumber: 1045,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                    lineNumber: 1030,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                            lineNumber: 1007,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                        lineNumber: 1006,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 996,
                    columnNumber: 11
                }, this), document.body),
                showTimePicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: timePickerRef,
                    onMouseDown: (e)=>e.stopPropagation(),
                    style: {
                        position: "fixed",
                        top: timePickerPos.top,
                        left: timePickerPos.left,
                        zIndex: 10000
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-popover rounded-xl shadow-2xl border border-border p-3 animate-in fade-in zoom-in-95 duration-100",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$DatePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TimePicker"], {
                            value: dueTime,
                            onChange: setDueTime
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                            lineNumber: 1067,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                        lineNumber: 1066,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 1056,
                    columnNumber: 11
                }, this), document.body),
                showRepeatPicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: repeatPickerRef,
                    onMouseDown: (e)=>e.stopPropagation(),
                    style: {
                        position: "fixed",
                        top: repeatPickerPos.top,
                        left: repeatPickerPos.left,
                        zIndex: 10000
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$RepeatPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        interval: repeatInterval,
                        unit: repeatUnit,
                        dueDate: dueDate,
                        onChange: (interval, unit)=>{
                            setRepeatInterval(interval);
                            setRepeatUnit(unit);
                            setShowRepeatPicker(false);
                        },
                        onCustom: ()=>{
                            setShowRepeatPicker(false);
                            setShowCustomRecurrence(true);
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                        lineNumber: 1086,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 1076,
                    columnNumber: 11
                }, this), document.body),
                showColorWheel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: colorWheelRef,
                    onMouseDown: (e)=>e.stopPropagation(),
                    style: {
                        position: "fixed",
                        top: colorWheelPos.top,
                        left: colorWheelPos.left,
                        zIndex: 10000
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-popover rounded-xl shadow-2xl border border-border p-3 animate-in fade-in zoom-in-95 duration-100",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorWheel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            value: color,
                            onChange: (c)=>setColor(c)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                            lineNumber: 1118,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                        lineNumber: 1117,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 1107,
                    columnNumber: 11
                }, this), document.body),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$CustomRecurrenceModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    open: showCustomRecurrence,
                    onClose: ()=>setShowCustomRecurrence(false),
                    interval: repeatInterval,
                    unit: repeatUnit,
                    repeatEndDate: repeatEndDate,
                    repeatEndCount: repeatEndCount,
                    onDone: (interval, unit, endDate, endCount)=>{
                        setRepeatInterval(interval);
                        setRepeatUnit(unit);
                        setRepeatEndDate(endDate);
                        setRepeatEndCount(endCount);
                        setShowCustomRecurrence(false);
                    }
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 1128,
                    columnNumber: 7
                }, this),
                showColorConfirm && courseName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed inset-0 z-[10001] flex items-center justify-center bg-black/40",
                    onMouseDown: (e)=>{
                        if (e.target === e.currentTarget) setShowColorConfirm(false);
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-popover rounded-2xl border border-border shadow-2xl w-[340px] max-w-[90vw] p-5 animate-in zoom-in-95 fade-in duration-150",
                        onMouseDown: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-foreground mb-1",
                                children: "Apply color change?"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 1157,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground mb-5",
                                children: [
                                    "Apply to all ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium text-foreground",
                                        children: courseName
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                        lineNumber: 1159,
                                        columnNumber: 30
                                    }, this),
                                    " tasks or just this one?"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 1158,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleColorConfirmAll,
                                        className: "w-full px-4 py-2.5 text-sm font-medium rounded-xl text-foreground hover:bg-accent border border-border transition-colors cursor-pointer",
                                        children: "All tasks"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                        lineNumber: 1162,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleColorConfirmJustThis,
                                        className: "w-full px-4 py-2.5 text-sm font-medium rounded-xl text-foreground hover:bg-accent border border-border transition-colors cursor-pointer",
                                        children: "Just this task"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                        lineNumber: 1169,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                                lineNumber: 1161,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                        lineNumber: 1153,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
                    lineNumber: 1147,
                    columnNumber: 11
                }, this), document.body)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
            lineNumber: 528,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx",
        lineNumber: 527,
        columnNumber: 5
    }, this), document.body);
}
_s(TaskCreateModal, "/LWVPQKePerO0GnQg/TIL9lzchg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = TaskCreateModal;
var _c;
__turbopack_context__.k.register(_c, "TaskCreateModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/SortableColumn.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SortableColumn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@dnd-kit/sortable/dist/sortable.esm.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function SortableColumn({ id, children }) {
    _s();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"])({
        id
    });
    const style = {
        transform: transform ? `translate3d(${Math.round(transform.x)}px, 0, 0)` : undefined,
        transition,
        opacity: isDragging ? 0 : 1
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children({
            setNodeRef,
            style,
            attributes: attributes,
            listeners: listeners,
            isDragging
        })
    }, void 0, false);
}
_s(SortableColumn, "iTIyvp0X9kMGpdHRsWsr2+tGbVI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSortable"]
    ];
});
_c = SortableColumn;
var _c;
__turbopack_context__.k.register(_c, "SortableColumn");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TaskBoardView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-vertical.js [app-client] (ecmascript) <export default as GripVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-client] (ecmascript) <export default as MoreVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-client] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@dnd-kit/core/dist/core.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@dnd-kit/sortable/dist/sortable.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/task-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$SortableColumn$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/SortableColumn.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/course-name-merge.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
/** localStorage key for column name aliases. */ const COLUMN_ALIASES_KEY = "caltodo_board_column_aliases";
/**
 * Loads column name aliases from localStorage.
 *
 * @returns Map of original course_name to display alias
 */ function loadColumnAliases() {
    try {
        const raw = localStorage.getItem(COLUMN_ALIASES_KEY);
        if (!raw) return new Map();
        const entries = JSON.parse(raw);
        return new Map(entries);
    } catch  {
        return new Map();
    }
}
/**
 * Saves column name aliases to localStorage.
 *
 * @param aliases - Map of original course_name to display alias
 */ function saveColumnAliases(aliases) {
    try {
        localStorage.setItem(COLUMN_ALIASES_KEY, JSON.stringify([
            ...aliases.entries()
        ]));
    } catch  {
    // non-critical
    }
}
/** localStorage key for saved column order. */ const COLUMN_ORDER_KEY = "caltodo_board_column_order";
/**
 * Loads saved column order from localStorage.
 *
 * @returns Array of column names in saved order, or empty array on failure
 */ function loadColumnOrder() {
    try {
        const raw = localStorage.getItem(COLUMN_ORDER_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((item)=>typeof item === "string");
    } catch  {
        return [];
    }
}
/**
 * Saves column order to localStorage.
 *
 * @param order - Array of column names in desired order
 */ function saveColumnOrder(order) {
    try {
        localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(order));
    } catch  {
    // non-critical
    }
}
/** Default column name for tasks without a course_name. */ const GENERAL_COLUMN = "General";
/**
 * Groups tasks by course name into a sorted Map, merging courses with the
 * same extracted code (e.g. "UGBA 101A-LEC-002" and "UGBA 101A" merge).
 * Tasks without course_name go under "General".
 *
 * @param tasks - Array of tasks to group
 * @returns Map of canonical column name to tasks array, sorted alphabetically with General last
 */ function groupByCourse(tasks) {
    // Map from course code → canonical (shortest) display name
    const codeToCanonical = new Map();
    const codeGroups = new Map();
    for (const task of tasks){
        const raw = task.course_name || GENERAL_COLUMN;
        const code = raw !== GENERAL_COLUMN ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractCourseCode"])(raw) : null;
        let key;
        if (code) {
            const existing = codeToCanonical.get(code);
            if (!existing || raw.length < existing.length) {
                codeToCanonical.set(code, raw);
            }
            key = code;
        } else {
            key = raw;
        }
        const list = codeGroups.get(key);
        if (list) {
            list.push(task);
        } else {
            codeGroups.set(key, [
                task
            ]);
        }
    }
    // Build result with canonical display names, sorted alphabetically
    const entries = [];
    for (const [key, tasks] of codeGroups){
        const displayName = codeToCanonical.get(key) || key;
        entries.push([
            displayName,
            tasks
        ]);
    }
    entries.sort((a, b)=>{
        if (a[0] === GENERAL_COLUMN) return 1;
        if (b[0] === GENERAL_COLUMN) return -1;
        return a[0].localeCompare(b[0]);
    });
    const sorted = new Map();
    for (const [name, tasks] of entries){
        sorted.set(name, tasks);
    }
    return sorted;
}
/**
 * Reorders a grouped columns Map based on a saved column order.
 * Columns in savedOrder appear first (in that order), then any new columns
 * are appended alphabetically with "General" last.
 * Stale names in savedOrder that don't exist in columns are silently skipped.
 *
 * @param columns - Map of column name to tasks array
 * @param savedOrder - Previously saved array of column names
 * @returns New Map with columns reordered
 */ function applyColumnOrder(columns, savedOrder) {
    const result = new Map();
    const remaining = new Set(columns.keys());
    // Add columns in saved order first
    for (const name of savedOrder){
        if (columns.has(name)) {
            result.set(name, columns.get(name));
            remaining.delete(name);
        }
    }
    // Append any new columns alphabetically, General last
    const newColumns = [
        ...remaining
    ].sort((a, b)=>{
        if (a === GENERAL_COLUMN) return 1;
        if (b === GENERAL_COLUMN) return -1;
        return a.localeCompare(b);
    });
    for (const name of newColumns){
        result.set(name, columns.get(name));
    }
    return result;
}
/** Date bucket labels used for date group-by mode. */ const DATE_BUCKETS = [
    "Today",
    "Next 3 Days",
    "Next 7 Days",
    "Later"
];
/**
 * Groups tasks into 4 date-based columns: Today, Next 3 Days, Next 7 Days, Later.
 * Overdue tasks go into "Today". Tasks without a due_date go into "Later".
 * Empty buckets are preserved so the layout always shows all 4 columns.
 *
 * @param tasks - Array of tasks to group
 * @returns Map of date bucket name to tasks array, in chronological order
 */ function groupByDate(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d3 = new Date(today);
    d3.setDate(d3.getDate() + 3);
    const d7 = new Date(today);
    d7.setDate(d7.getDate() + 7);
    const groups = new Map(DATE_BUCKETS.map((b)=>[
            b,
            []
        ]));
    for (const task of tasks){
        if (!task.due_date) {
            groups.get("Later").push(task);
            continue;
        }
        const due = new Date(task.due_date + "T00:00:00");
        if (due <= today) {
            groups.get("Today").push(task);
        } else if (due <= d3) {
            groups.get("Next 3 Days").push(task);
        } else if (due <= d7) {
            groups.get("Next 7 Days").push(task);
        } else {
            groups.get("Later").push(task);
        }
    }
    return groups;
}
/**
 * Sorts tasks by closest due date first.
 * Tasks without a due date are placed at the end.
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */ function sortByDueDate(tasks) {
    return [
        ...tasks
    ].sort((a, b)=>{
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
    });
}
function TaskBoardView({ tasks, loading, error, selectedTaskId, groupBy = "class", onAdd, onToggle, onSelect, onDelete, onColorChange, onDeleteClass }) {
    _s();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const isMiffy = colorTheme === "miffy";
    const [aliases, setAliases] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "TaskBoardView.useState": ()=>loadColumnAliases()
    }["TaskBoardView.useState"]);
    const [emptyStateCreateOpen, setEmptyStateCreateOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    /** Renames a column by saving a display alias. */ const renameColumn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskBoardView.useCallback[renameColumn]": (originalName, newDisplayName)=>{
            setAliases({
                "TaskBoardView.useCallback[renameColumn]": (prev)=>{
                    const next = new Map(prev);
                    const trimmed = newDisplayName.trim();
                    if (!trimmed || trimmed === originalName) {
                        next.delete(originalName);
                    } else {
                        next.set(originalName, trimmed);
                    }
                    saveColumnAliases(next);
                    return next;
                }
            }["TaskBoardView.useCallback[renameColumn]"]);
        }
    }["TaskBoardView.useCallback[renameColumn]"], []);
    /** Resets a column alias back to its original name. */ const resetColumnName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskBoardView.useCallback[resetColumnName]": (originalName)=>{
            setAliases({
                "TaskBoardView.useCallback[resetColumnName]": (prev)=>{
                    const next = new Map(prev);
                    next.delete(originalName);
                    saveColumnAliases(next);
                    return next;
                }
            }["TaskBoardView.useCallback[resetColumnName]"]);
        }
    }["TaskBoardView.useCallback[resetColumnName]"], []);
    // --- Column drag-and-drop state (@dnd-kit) ---
    const [columnOrder, setColumnOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "TaskBoardView.useState": ()=>loadColumnOrder()
    }["TaskBoardView.useState"]);
    const [activeId, setActiveId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Saved order snapshot to revert on cancel. */ const savedOrderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    /** Always-current column IDs (updated after columns memo, read in callbacks). */ const columnIdsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const isDragEnabled = groupBy === "class";
    /** PointerSensor with 5px activation distance to avoid accidental drags. */ const sensors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensor"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PointerSensor"], {
        activationConstraint: {
            distance: 5
        }
    }));
    /** Sets activeId and snapshots the current column order for potential revert. */ const handleDragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskBoardView.useCallback[handleDragStart]": (event)=>{
            setActiveId(String(event.active.id));
            savedOrderRef.current = columnIdsRef.current;
        }
    }["TaskBoardView.useCallback[handleDragStart]"], []);
    /** Persists the final order to localStorage and clears activeId. */ const handleDragEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskBoardView.useCallback[handleDragEnd]": (event)=>{
            const { active, over } = event;
            if (over && active.id !== over.id) {
                const currentIds = columnIdsRef.current;
                const oldIdx = currentIds.indexOf(String(active.id));
                const newIdx = currentIds.indexOf(String(over.id));
                if (oldIdx !== -1 && newIdx !== -1) {
                    const newOrder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayMove"])(currentIds, oldIdx, newIdx);
                    setColumnOrder(newOrder);
                    saveColumnOrder(newOrder);
                }
            }
            setActiveId(null);
        }
    }["TaskBoardView.useCallback[handleDragEnd]"], []);
    /** Reverts to saved order on cancel (e.g. Escape key). */ const handleDragCancel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TaskBoardView.useCallback[handleDragCancel]": ()=>{
            setColumnOrder(savedOrderRef.current);
            setActiveId(null);
        }
    }["TaskBoardView.useCallback[handleDragCancel]"], []);
    const isDateMode = groupBy === "date";
    // Apply saved column order when in class mode
    const columns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TaskBoardView.useMemo[columns]": ()=>{
            if (isDateMode) return groupByDate(tasks);
            const base = groupByCourse(tasks);
            if (columnOrder.length === 0) return base;
            return applyColumnOrder(base, columnOrder);
        }
    }["TaskBoardView.useMemo[columns]"], [
        tasks,
        isDateMode,
        columnOrder
    ]);
    /** Ordered column IDs for SortableContext. */ const columnIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TaskBoardView.useMemo[columnIds]": ()=>[
                ...columns.keys()
            ]
    }["TaskBoardView.useMemo[columnIds]"], [
        columns
    ]);
    columnIdsRef.current = columnIds;
    /** Active column data for DragOverlay rendering. */ const activeColumnTasks = activeId ? columns.get(activeId) ?? null : null;
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center py-12 text-subtle-foreground text-sm",
            children: "Loading tasks..."
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
            lineNumber: 376,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center py-16 px-4 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground mb-4",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                    lineNumber: 385,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>window.location.reload(),
                    className: "px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity",
                    children: "Refresh"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                    lineNumber: 386,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
            lineNumber: 384,
            columnNumber: 7
        }, this);
    }
    if (columns.size === 0 && !isDateMode) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[320px]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setEmptyStateCreateOpen(true),
                            className: "flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-accent transition-colors cursor-pointer w-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                    lineNumber: 404,
                                    columnNumber: 13
                                }, this),
                                "Add task"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                            lineNumber: 400,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            open: emptyStateCreateOpen,
                            onClose: ()=>setEmptyStateCreateOpen(false),
                            onAdd: (task)=>{
                                onAdd(task);
                                setEmptyStateCreateOpen(false);
                            }
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                            lineNumber: 407,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                    lineNumber: 399,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center py-12 text-subtle-foreground text-sm gap-3",
                    children: [
                        isMiffy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/miffy/miffy-pen.png",
                            alt: "",
                            className: "w-20 h-auto opacity-50 select-none pointer-events-none",
                            draggable: false
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                            lineNumber: 415,
                            columnNumber: 13
                        }, this),
                        "No tasks yet. Press + to add one."
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                    lineNumber: 413,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
            lineNumber: 398,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DndContext"], {
        sensors: sensors,
        collisionDetection: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closestCenter"],
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragCancel: handleDragCancel,
        autoScroll: {
            threshold: {
                x: 0.15,
                y: 0.15
            },
            interval: 5
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SortableContext"], {
                items: columnIds,
                strategy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$sortable$2f$dist$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["horizontalListSortingStrategy"],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex overflow-x-auto gap-6 px-6 pb-6 h-full",
                    children: [
                        ...columns.entries()
                    ].map(([columnName, columnTasks])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$SortableColumn$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            id: columnName,
                            children: ({ setNodeRef, style, attributes, listeners })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: setNodeRef,
                                    style: style,
                                    className: "min-w-[280px] max-w-[320px] flex-shrink-0",
                                    ...attributes,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BoardColumn, {
                                        name: columnName,
                                        displayName: isDateMode ? columnName : aliases.get(columnName) || columnName,
                                        hasAlias: isDateMode ? false : aliases.has(columnName),
                                        hideMenu: isDateMode,
                                        showDragHandle: isDragEnabled,
                                        dragHandleListeners: isDragEnabled ? listeners : undefined,
                                        tasks: columnTasks,
                                        selectedTaskId: selectedTaskId,
                                        onAdd: onAdd,
                                        onToggle: onToggle,
                                        onSelect: onSelect,
                                        onDelete: onDelete,
                                        onRename: renameColumn,
                                        onResetName: resetColumnName,
                                        onColorChange: onColorChange,
                                        onDeleteClass: onDeleteClass
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 448,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                    lineNumber: 442,
                                    columnNumber: 17
                                }, this)
                        }, columnName, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                            lineNumber: 440,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                    lineNumber: 438,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                lineNumber: 437,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DragOverlay"], {
                dropAnimation: {
                    duration: 200,
                    easing: "ease"
                },
                children: activeId && activeColumnTasks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "min-w-[280px] max-w-[320px] opacity-95 shadow-2xl cursor-grabbing",
                    style: {
                        willChange: "transform"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BoardColumn, {
                        name: activeId,
                        displayName: isDateMode ? activeId : aliases.get(activeId) || activeId,
                        hasAlias: isDateMode ? false : aliases.has(activeId),
                        hideMenu: true,
                        showDragHandle: true,
                        tasks: activeColumnTasks,
                        selectedTaskId: selectedTaskId,
                        onAdd: onAdd,
                        onToggle: onToggle,
                        onSelect: onSelect,
                        onDelete: onDelete,
                        onRename: renameColumn,
                        onResetName: resetColumnName,
                        onColorChange: onColorChange,
                        onDeleteClass: onDeleteClass
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 477,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                    lineNumber: 476,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                lineNumber: 474,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
        lineNumber: 429,
        columnNumber: 5
    }, this);
}
_s(TaskBoardView, "Kkc1LyJxVD7DBm3l89tUVWMOv5I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSensors"]
    ];
});
_c = TaskBoardView;
/**
 * Single column in the board view. Plain-text header outside card area,
 * task cards with hover shadow, and collapsible Completed section.
 *
 * @param props - BoardColumnProps
 */ function BoardColumn({ name, displayName, hasAlias, hideMenu = false, showDragHandle = false, dragHandleListeners, tasks, selectedTaskId, onAdd, onToggle, onSelect, onDelete, onRename, onResetName, onColorChange, onDeleteClass }) {
    _s1();
    const BOARD_ITEMS_LIMIT = 5;
    const [completedExpanded, setCompletedExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showAllActive, setShowAllActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAllCompleted, setShowAllCompleted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Compute the most common task color in this column for new task defaults
    const columnColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BoardColumn.useMemo[columnColor]": ()=>{
            if (tasks.length === 0) return undefined;
            const counts = new Map();
            for (const t of tasks){
                counts.set(t.color, (counts.get(t.color) ?? 0) + 1);
            }
            let maxColor = tasks[0].color;
            let maxCount = 0;
            for (const [c, n] of counts){
                if (n > maxCount) {
                    maxColor = c;
                    maxCount = n;
                }
            }
            return maxColor;
        }
    }["BoardColumn.useMemo[columnColor]"], [
        tasks
    ]);
    // Hydrate collapsed state from localStorage after mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BoardColumn.useEffect": ()=>{
            try {
                const key = `caltodo_board_completed_${name}`;
                const saved = localStorage.getItem(key);
                if (saved === "false") setCompletedExpanded(false);
            } catch  {}
        }
    }["BoardColumn.useEffect"], [
        name
    ]);
    const [showMenu, setShowMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAddForm, setShowAddForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editValue, setEditValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(displayName);
    const [showColorGrid, setShowColorGrid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const menuBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const menuDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const editInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close menu on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BoardColumn.useEffect": ()=>{
            if (!showMenu) return;
            function handleClick(e) {
                const target = e.target;
                if (menuBtnRef.current && !menuBtnRef.current.contains(target) && !menuDropdownRef.current?.contains(target)) {
                    setShowMenu(false);
                    setShowColorGrid(false);
                    setShowDeleteConfirm(false);
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "BoardColumn.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["BoardColumn.useEffect"];
        }
    }["BoardColumn.useEffect"], [
        showMenu
    ]);
    // Focus input when editing starts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BoardColumn.useEffect": ()=>{
            if (editing && editInputRef.current) {
                editInputRef.current.focus();
                editInputRef.current.select();
            }
        }
    }["BoardColumn.useEffect"], [
        editing
    ]);
    /** Commits the rename and exits edit mode. */ function commitRename() {
        onRename(name, editValue);
        setEditing(false);
    }
    const { active, completed } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BoardColumn.useMemo": ()=>{
            const activeList = [];
            const completedList = [];
            for (const t of tasks){
                // Treat submitted tasks as completed in board view
                if (t.is_completed || t.is_submitted) {
                    completedList.push(t);
                } else {
                    activeList.push(t);
                }
            }
            return {
                active: sortByDueDate(activeList),
                completed: sortByDueDate(completedList)
            };
        }
    }["BoardColumn.useMemo"], [
        tasks
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-1 pb-3 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 min-w-0",
                        children: [
                            showDragHandle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground/40 hover:text-muted-foreground transition-colors",
                                title: "Drag to reorder",
                                ...dragHandleListeners,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__["GripVertical"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                    lineNumber: 643,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 638,
                                columnNumber: 13
                            }, this),
                            editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: editInputRef,
                                value: editValue,
                                onChange: (e)=>setEditValue(e.target.value),
                                onBlur: commitRename,
                                onKeyDown: (e)=>{
                                    if (e.key === "Enter") commitRename();
                                    if (e.key === "Escape") {
                                        setEditValue(displayName);
                                        setEditing(false);
                                    }
                                },
                                className: "text-sm font-semibold text-foreground bg-transparent border-b border-blue-500 outline-none min-w-0 py-0"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 647,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-foreground truncate",
                                children: displayName
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 659,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-muted-foreground shrink-0",
                                children: active.length
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 661,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 636,
                        columnNumber: 9
                    }, this),
                    !hideMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowAddForm(!showAddForm),
                                className: "p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors",
                                title: "Add task",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                    lineNumber: 670,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 665,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                ref: menuBtnRef,
                                onClick: ()=>setShowMenu(!showMenu),
                                className: "p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors",
                                title: "Column options",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                    lineNumber: 678,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 672,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 664,
                        columnNumber: 11
                    }, this),
                    showMenu && menuBtnRef.current && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: menuDropdownRef,
                        className: "fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[150px] bg-popover",
                        style: {
                            top: menuBtnRef.current.getBoundingClientRect().bottom + 4,
                            left: Math.min(menuBtnRef.current.getBoundingClientRect().left, window.innerWidth - 170)
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setEditValue(displayName);
                                    setEditing(true);
                                    setShowMenu(false);
                                },
                                className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
                                        size: 13
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 702,
                                        columnNumber: 15
                                    }, this),
                                    "Rename"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 694,
                                columnNumber: 13
                            }, this),
                            hasAlias && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    onResetName(name);
                                    setShowMenu(false);
                                },
                                className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                        size: 13
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 713,
                                        columnNumber: 17
                                    }, this),
                                    "Reset name"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 706,
                                columnNumber: 15
                            }, this),
                            onColorChange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowColorGrid(!showColorGrid),
                                        className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"], {
                                                size: 13
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                                lineNumber: 724,
                                                columnNumber: 19
                                            }, this),
                                            "Change color"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 720,
                                        columnNumber: 17
                                    }, this),
                                    showColorGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-1.5 px-3 py-2 flex-wrap",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TASK_COLORS"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    onColorChange(name, c);
                                                    setShowMenu(false);
                                                    setShowColorGrid(false);
                                                },
                                                className: "w-5 h-5 rounded-full hover:scale-110 transition-all",
                                                style: {
                                                    backgroundColor: c
                                                }
                                            }, c, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                                lineNumber: 730,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 728,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true),
                            onDeleteClass && name !== GENERAL_COLUMN && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-t border-border my-1"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 748,
                                        columnNumber: 17
                                    }, this),
                                    !showDeleteConfirm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowDeleteConfirm(true),
                                        className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                size: 13
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                                lineNumber: 754,
                                                columnNumber: 21
                                            }, this),
                                            "Delete class"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 750,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-3 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground mb-2",
                                                children: [
                                                    "Delete ",
                                                    tasks.length,
                                                    " task",
                                                    tasks.length !== 1 ? "s" : "",
                                                    "?"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                                lineNumber: 759,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setShowDeleteConfirm(false),
                                                        className: "px-2.5 py-1 text-xs rounded-lg text-muted-foreground hover:bg-accent transition-colors",
                                                        children: "Cancel"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                                        lineNumber: 763,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            onDeleteClass(name);
                                                            setShowMenu(false);
                                                            setShowDeleteConfirm(false);
                                                        },
                                                        className: "px-2.5 py-1 text-xs rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors",
                                                        children: "Delete"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                                        lineNumber: 769,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                                lineNumber: 762,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 758,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 683,
                        columnNumber: 11
                    }, this), document.body)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                lineNumber: 635,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: showAddForm,
                onClose: ()=>setShowAddForm(false),
                onAdd: (task)=>{
                    onAdd({
                        ...task,
                        course_name: name
                    });
                    setShowAddForm(false);
                }
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                lineNumber: 790,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto flex flex-col gap-2",
                children: [
                    (showAllActive ? active : active.slice(0, BOARD_ITEMS_LIMIT)).map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TaskCard, {
                            task: task,
                            isSelected: selectedTaskId === task.id,
                            onToggle: onToggle,
                            onSelect: onSelect,
                            onDelete: onDelete
                        }, task.id, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                            lineNumber: 803,
                            columnNumber: 11
                        }, this)),
                    active.length > BOARD_ITEMS_LIMIT && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowAllActive(!showAllActive),
                        className: "py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left px-1",
                        children: showAllActive ? "Show less" : `+${active.length - BOARD_ITEMS_LIMIT} more`
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 813,
                        columnNumber: 11
                    }, this),
                    active.length === 0 && completed.length === 0 && (hideMenu ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl border border-dashed border-border/50 py-8 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-muted-foreground",
                            children: "No tasks"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                            lineNumber: 824,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 823,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-muted/50 dark:bg-muted/30 min-h-[200px]",
                        style: {
                            maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 827,
                        columnNumber: 13
                    }, this)),
                    completed.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    const next = !completedExpanded;
                                    setCompletedExpanded(next);
                                    try {
                                        localStorage.setItem(`caltodo_board_completed_${name}`, String(next));
                                    } catch  {}
                                },
                                className: "flex items-center gap-1 px-1 py-1.5 w-full text-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                        size: 14,
                                        className: `shrink-0 text-muted-foreground transition-transform duration-200 ${completedExpanded ? "" : "-rotate-90"}`
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 848,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-semibold text-foreground",
                                        children: "Completed"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 854,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground ml-1",
                                        children: completed.length
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 855,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 840,
                                columnNumber: 13
                            }, this),
                            completedExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2 mt-1",
                                children: [
                                    (showAllCompleted ? completed : completed.slice(0, BOARD_ITEMS_LIMIT)).map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TaskCard, {
                                            task: task,
                                            isSelected: selectedTaskId === task.id,
                                            onToggle: onToggle,
                                            onSelect: onSelect,
                                            onDelete: onDelete
                                        }, task.id, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                            lineNumber: 860,
                                            columnNumber: 19
                                        }, this)),
                                    completed.length > BOARD_ITEMS_LIMIT && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowAllCompleted(!showAllCompleted),
                                        className: "py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left px-1",
                                        children: showAllCompleted ? "Show less" : `+${completed.length - BOARD_ITEMS_LIMIT} more`
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                        lineNumber: 870,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 858,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 839,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                lineNumber: 800,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
        lineNumber: 633,
        columnNumber: 5
    }, this);
}
_s1(BoardColumn, "z404ziTcI1RTFipmD/NcaPeY5/M=");
_c1 = BoardColumn;
/**
 * Individual task card for board view. Rounded card with subtle border,
 * hover shadow, three-dot menu, optional source link, checkbox + title,
 * and combined due date + time label.
 *
 * @param props - TaskCardProps
 */ function TaskCard({ task, isSelected, onToggle, onSelect, onDelete }) {
    _s2();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const isMiffyCard = colorTheme === "miffy";
    const taskColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getThemeColor"])(task.color, colorTheme);
    const [showMenu, setShowMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const menuBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const menuDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isCompleted = task.is_completed || task.is_submitted;
    const rawBadge = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDueDateInfo"])(task.due_date, task.due_time);
    const dueBadge = isCompleted && rawBadge ? {
        ...rawBadge,
        className: "text-muted-foreground"
    } : rawBadge && isMiffyCard && rawBadge.className === "text-blue-400" ? {
        ...rawBadge,
        className: "text-[#e8729a] dark:text-[#f4a0bc]"
    } : rawBadge;
    // Close menu on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskCard.useEffect": ()=>{
            if (!showMenu) return;
            function handleClick(e) {
                const target = e.target;
                if (menuBtnRef.current && !menuBtnRef.current.contains(target) && !menuDropdownRef.current?.contains(target)) {
                    setShowMenu(false);
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "TaskCard.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["TaskCard.useEffect"];
        }
    }["TaskCard.useEffect"], [
        showMenu
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `group relative rounded-xl border bg-card px-3.5 py-3 cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${isSelected ? isMiffyCard ? "border-[#e8729a] shadow-sm" : "border-blue-400 shadow-sm" : "border-input-border hover:shadow-md"} ${isCompleted ? "opacity-50" : ""}`,
                onClick: (e)=>onSelect(task, e.currentTarget.getBoundingClientRect()),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    color: taskColor,
                                    isCompleted: isCompleted,
                                    onToggle: ()=>onToggle(task.id),
                                    size: "sm"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                    lineNumber: 947,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 946,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-sm leading-snug flex-1 min-w-0 ${isCompleted ? "text-muted-foreground" : "text-foreground"}`,
                                children: task.title
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 954,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                ref: menuBtnRef,
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                },
                                className: "flex-shrink-0 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all opacity-0 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100",
                                "aria-label": "Task options",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                    lineNumber: 967,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                lineNumber: 961,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 945,
                        columnNumber: 9
                    }, this),
                    dueBadge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-1.5 pl-[24px]",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-[11px] font-normal ${dueBadge.className} ${isCompleted ? "opacity-70" : ""}`,
                            children: [
                                dueBadge.dateLabel,
                                dueBadge.timeLabel ? ` ${dueBadge.timeLabel}` : ""
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                            lineNumber: 974,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 973,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                lineNumber: 934,
                columnNumber: 7
            }, this),
            showMenu && menuBtnRef.current && typeof document !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-50",
                        onClick: ()=>setShowMenu(false)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 984,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: menuDropdownRef,
                        className: "fixed z-50 bg-card rounded-lg shadow-xl border border-input-border py-1 min-w-[120px]",
                        style: {
                            top: menuBtnRef.current.getBoundingClientRect().bottom + 4,
                            left: Math.min(menuBtnRef.current.getBoundingClientRect().left, window.innerWidth - 140)
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                setShowMenu(false);
                                onDelete(task.id);
                            },
                            className: "flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    size: 13
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                                    lineNumber: 1003,
                                    columnNumber: 15
                                }, this),
                                "Delete"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                            lineNumber: 999,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx",
                        lineNumber: 988,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true), document.body)
        ]
    }, void 0, true);
}
_s2(TaskCard, "ZfyLGZ5yNde5bX22MhdBhTQhzME=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c2 = TaskCard;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "TaskBoardView");
__turbopack_context__.k.register(_c1, "BoardColumn");
__turbopack_context__.k.register(_c2, "TaskCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourseCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
/**
 * A single course card in the courses grid.
 * Shows a colored/image header with course name and task count below.
 * Click opens the course tasks modal.
 *
 * @param courseName - The course display name
 * @param color - The dominant color for this course
 * @param taskCount - Number of active tasks in this course
 * @param onClick - Handler when card is clicked
 */ "use client";
;
;
function CourseCard({ courseName, color, taskCount, onClick }) {
    _s();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const themeColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getThemeColor"])(color, colorTheme);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: "w-full text-left rounded-xl overflow-hidden border border-foreground/[0.08] bg-card hover:shadow-md transition-all hover:-translate-y-0.5 group",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-24 w-full transition-opacity group-hover:opacity-90",
                style: {
                    backgroundColor: `${themeColor}20`,
                    backgroundImage: `linear-gradient(135deg, ${themeColor}30, ${themeColor}10)`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full w-full flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-3xl font-bold opacity-20",
                        style: {
                            color: themeColor
                        },
                        children: courseName.slice(0, 2).toUpperCase()
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3.5 pt-2.5 pb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-2.5 h-2.5 rounded-full shrink-0",
                                style: {
                                    backgroundColor: themeColor
                                }
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[13px] font-semibold text-foreground truncate",
                                children: courseName
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11.5px] text-muted-foreground mt-0.5 block",
                        children: [
                            taskCount,
                            " ",
                            taskCount === 1 ? "task" : "tasks"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_s(CourseCard, "BGWpd93nwnhCFnUYXgLSavqtMso=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = CourseCard;
var _c;
__turbopack_context__.k.register(_c, "CourseCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/Tooltip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Tooltip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Tooltip({ label, children, position = "top", delay = 500 }) {
    _s();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [coords, setCoords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const triggerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Compute tooltip position from trigger bounding rect. */ const updatePosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[updatePosition]": ()=>{
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            const tooltipHeight = 28;
            const gap = 6;
            const preferTop = position === "top";
            const spaceAbove = rect.top;
            const needsFlip = preferTop && spaceAbove < tooltipHeight + gap;
            const top = needsFlip || !preferTop ? rect.bottom + gap : rect.top - tooltipHeight - gap;
            const left = rect.left + rect.width / 2;
            setCoords({
                top,
                left
            });
        }
    }["Tooltip.useCallback[updatePosition]"], [
        position
    ]);
    /** RAF loop that keeps the tooltip anchored to the trigger while visible. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Tooltip.useEffect": ()=>{
            if (!visible) return;
            let running = true;
            function tick() {
                if (!running) return;
                updatePosition();
                rafRef.current = requestAnimationFrame(tick);
            }
            rafRef.current = requestAnimationFrame(tick);
            return ({
                "Tooltip.useEffect": ()=>{
                    running = false;
                    cancelAnimationFrame(rafRef.current);
                }
            })["Tooltip.useEffect"];
        }
    }["Tooltip.useEffect"], [
        visible,
        updatePosition
    ]);
    const handleEnter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[handleEnter]": ()=>{
            timerRef.current = setTimeout({
                "Tooltip.useCallback[handleEnter]": ()=>{
                    updatePosition();
                    setVisible(true);
                }
            }["Tooltip.useCallback[handleEnter]"], delay);
        }
    }["Tooltip.useCallback[handleEnter]"], [
        delay,
        updatePosition
    ]);
    const handleLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[handleLeave]": ()=>{
            if (timerRef.current) clearTimeout(timerRef.current);
            setVisible(false);
            setCoords(null);
        }
    }["Tooltip.useCallback[handleLeave]"], []);
    // Clean up timer on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Tooltip.useEffect": ()=>{
            return ({
                "Tooltip.useEffect": ()=>{
                    if (timerRef.current) clearTimeout(timerRef.current);
                }
            })["Tooltip.useEffect"];
        }
    }["Tooltip.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: triggerRef,
                className: "relative inline-flex",
                onMouseEnter: handleEnter,
                onMouseLeave: handleLeave,
                children: children
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Tooltip.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            visible && coords && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "tooltip",
                className: "fixed px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap pointer-events-none z-[99999]",
                style: {
                    top: coords.top,
                    left: coords.left,
                    transform: "translateX(-50%)"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Tooltip.tsx",
                lineNumber: 106,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true);
}
_s(Tooltip, "HlTXiNvst+ZFlSiscniNk7N98mw=");
_c = Tooltip;
var _c;
__turbopack_context__.k.register(_c, "Tooltip");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TaskActionBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-client] (ecmascript) <export default as MoreVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/Tooltip.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function TaskActionBar({ onEdit, onDelete, onClose, sourceUrl }) {
    _s();
    const [menuOpen, setMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const menuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Close menu on outside click. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskActionBar.useEffect": ()=>{
            if (!menuOpen) return;
            function handleClick(e) {
                if (menuRef.current && !menuRef.current.contains(e.target)) {
                    setMenuOpen(false);
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "TaskActionBar.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["TaskActionBar.useEffect"];
        }
    }["TaskActionBar.useEffect"], [
        menuOpen
    ]);
    const hasMenuItems = !!onDelete || !!sourceUrl;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-end gap-1 px-5 pt-4 pb-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                label: "Edit task",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onEdit,
                    className: "p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
                        size: 18
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                        lineNumber: 60,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            hasMenuItems && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: menuRef,
                className: "relative flex items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        label: "More options",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setMenuOpen((p)=>!p),
                            className: "p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                                lineNumber: 70,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                            lineNumber: 66,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this),
                    menuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-popover shadow-lg p-1 z-10",
                        children: [
                            sourceUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: sourceUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors",
                                onClick: ()=>setMenuOpen(false),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                        size: 14,
                                        className: "text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                                        lineNumber: 83,
                                        columnNumber: 19
                                    }, this),
                                    "Open assignment"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                                lineNumber: 76,
                                columnNumber: 17
                            }, this),
                            onDelete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setMenuOpen(false);
                                    onDelete();
                                },
                                className: "flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                                        lineNumber: 95,
                                        columnNumber: 19
                                    }, this),
                                    "Delete task"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                                lineNumber: 88,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                        lineNumber: 74,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                lineNumber: 64,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                label: "Close",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        size: 18
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_s(TaskActionBar, "m+Bw3p56aCldBbEoFNtGoL2OdKs=");
_c = TaskActionBar;
var _c;
__turbopack_context__.k.register(_c, "TaskActionBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TaskCourseRow",
    ()=>TaskCourseRow,
    "TaskDateTimeLabel",
    ()=>TaskDateTimeLabel,
    "TaskDescriptionRow",
    ()=>TaskDescriptionRow,
    "TaskRepeatLabel",
    ()=>TaskRepeatLabel,
    "TaskTagsRow",
    ()=>TaskTagsRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tag.js [app-client] (ecmascript) <export default as Tag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-start.js [app-client] (ecmascript) <export default as AlignLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
;
;
/** Default icon size matching the ICON_SIZE constant in detail views. */ const DEFAULT_ICON_SIZE = 20;
function TaskDateTimeLabel({ dateLabel, timeLabel }) {
    if (!dateLabel && !timeLabel) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pl-9 text-sm text-secondary-foreground mt-1",
        children: [
            dateLabel,
            timeLabel
        ].filter(Boolean).join(" \u00B7 ")
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c = TaskDateTimeLabel;
function TaskRepeatLabel({ repeatLabel }) {
    if (!repeatLabel) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pl-9 text-sm text-secondary-foreground mt-0.5",
        children: repeatLabel
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_c1 = TaskRepeatLabel;
function TaskCourseRow({ courseName, iconSize = DEFAULT_ICON_SIZE }) {
    if (!courseName) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-4 py-3 min-w-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 w-5 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                    size: iconSize,
                    className: "text-secondary-foreground"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-foreground truncate",
                children: courseName
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_c2 = TaskCourseRow;
function TaskTagsRow({ tags, sourceBadges, iconSize = DEFAULT_ICON_SIZE }) {
    const hasContent = sourceBadges && sourceBadges.length > 0 || tags.length > 0;
    if (!hasContent) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-start gap-4 py-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 w-5 flex items-center justify-center mt-0.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                    size: iconSize,
                    className: "text-secondary-foreground"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-1.5 min-w-0",
                children: [
                    sourceBadges?.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-xs font-medium px-2.5 py-0.5 rounded-full ${b.className}`,
                            children: b.label
                        }, b.label, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this)),
                    tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "px-2.5 py-0.5 text-xs rounded-full bg-accent text-foreground max-w-[200px] truncate",
                            children: tag
                        }, tag, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
}
_c3 = TaskTagsRow;
function TaskDescriptionRow({ description, lineClamp, iconSize = DEFAULT_ICON_SIZE }) {
    if (!description) return null;
    const clampClass = lineClamp ? `line-clamp-${lineClamp}` : "whitespace-pre-wrap";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-start gap-4 py-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 w-5 flex items-center justify-center mt-0.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__["AlignLeft"], {
                    size: iconSize,
                    className: "text-secondary-foreground"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                lineNumber: 153,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `text-sm text-foreground ${clampClass} break-words min-w-0`,
                children: description
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
                lineNumber: 156,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx",
        lineNumber: 152,
        columnNumber: 5
    }, this);
}
_c4 = TaskDescriptionRow;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "TaskDateTimeLabel");
__turbopack_context__.k.register(_c1, "TaskRepeatLabel");
__turbopack_context__.k.register(_c2, "TaskCourseRow");
__turbopack_context__.k.register(_c3, "TaskTagsRow");
__turbopack_context__.k.register(_c4, "TaskDescriptionRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TaskPreviewPopover
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/repeat.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskActionBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
/** Width of the popover in pixels. */ const POPOVER_WIDTH = 448;
/** Estimated max height for overflow detection. */ const POPOVER_MAX_HEIGHT = 520;
/** Gap between anchor and popover edge. */ const GAP = 6;
function TaskPreviewPopover({ task, anchorRect, onClose, onEdit, onDelete, onToggle }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const closingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    /**
   * Triggers the close animation, then calls onClose after it completes.
   */ const animateClose = ()=>{
        if (closingRef.current) return;
        closingRef.current = true;
        setVisible(false);
        setTimeout(onClose, 150);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskPreviewPopover.useEffect": ()=>{
            requestAnimationFrame({
                "TaskPreviewPopover.useEffect": ()=>{
                    requestAnimationFrame({
                        "TaskPreviewPopover.useEffect": ()=>setVisible(true)
                    }["TaskPreviewPopover.useEffect"]);
                }
            }["TaskPreviewPopover.useEffect"]);
        }
    }["TaskPreviewPopover.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskPreviewPopover.useEffect": ()=>{
            function handleKeyDown(e) {
                if (e.key === "Escape") animateClose();
            }
            document.addEventListener("keydown", handleKeyDown);
            return ({
                "TaskPreviewPopover.useEffect": ()=>document.removeEventListener("keydown", handleKeyDown)
            })["TaskPreviewPopover.useEffect"];
        }
    }["TaskPreviewPopover.useEffect"], [
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskPreviewPopover.useEffect": ()=>{
            function handlePointerDown(e) {
                const target = "touches" in e ? e.touches[0]?.target : e.target;
                if (ref.current && target && !ref.current.contains(target)) {
                    // Close immediately (no animation delay) so clicking another task
                    // can set the new preview without it being wiped by a delayed close.
                    onClose();
                }
            }
            document.addEventListener("mousedown", handlePointerDown);
            document.addEventListener("touchstart", handlePointerDown);
            return ({
                "TaskPreviewPopover.useEffect": ()=>{
                    document.removeEventListener("mousedown", handlePointerDown);
                    document.removeEventListener("touchstart", handlePointerDown);
                }
            })["TaskPreviewPopover.useEffect"];
        }
    }["TaskPreviewPopover.useEffect"], [
        onClose
    ]);
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        left: -9999,
        top: -9999
    });
    /**
   * Positions the popover adjacent to the anchor element.
   * Vertically aligns the popover top with the anchor top, then clamps
   * to keep it within the viewport.
   */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "TaskPreviewPopover.useLayoutEffect": ()=>{
            const el = ref.current;
            if (!el) return;
            const popoverHeight = el.scrollHeight;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const anchorCenterX = anchorRect.left + anchorRect.width / 2;
            // Horizontal: place on the side of the anchor towards viewport center
            let left;
            if (anchorCenterX < vw / 2) {
                // Anchor is on left half — popover goes right
                left = anchorRect.right + GAP;
            } else {
                // Anchor is on right half — popover goes left
                left = anchorRect.left - POPOVER_WIDTH - GAP;
            }
            left = Math.max(GAP, Math.min(left, vw - POPOVER_WIDTH - GAP));
            // Vertical: align popover top with anchor top, then clamp to viewport
            let top = anchorRect.top;
            // Clamp to viewport
            if (top + popoverHeight > vh - GAP) {
                top = vh - popoverHeight - GAP;
            }
            top = Math.max(GAP, top);
            setPos({
                left,
                top
            });
        }
    }["TaskPreviewPopover.useLayoutEffect"], [
        anchorRect
    ]);
    const dotColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getThemeColor"])(task.color, colorTheme);
    const dateLabel = task.due_date ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(task.due_date + "T00:00:00"), "EEE, MMM d, yyyy") : null;
    const timeLabel = task.due_time ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(`2000-01-01T${task.due_time}`), "h:mm a") : null;
    const repeatLabel = task.repeat_interval && task.repeat_unit ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRepeatLabel"])(task.repeat_interval, task.repeat_unit) : null;
    const isMobile = ("TURBOPACK compile-time value", "object") !== "undefined" && window.innerWidth < 768;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9998]",
                onClick: animateClose,
                onTouchStart: animateClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                lineNumber: 168,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: ref,
                "data-task-preview-popover": true,
                role: "dialog",
                "aria-label": `Preview: ${task.title}`,
                className: `fixed z-[9999] rounded-2xl shadow-2xl border border-border bg-popover transition-[opacity,transform] duration-150 ease-out ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`,
                style: {
                    left: isMobile ? 12 : pos.left,
                    top: isMobile ? undefined : pos.top,
                    bottom: isMobile ? 12 : undefined,
                    width: isMobile ? "calc(100vw - 24px)" : POPOVER_WIDTH,
                    maxHeight: isMobile ? "70vh" : POPOVER_MAX_HEIGHT,
                    overflowY: "auto"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskActionBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        onEdit: ()=>onEdit(task),
                        onDelete: ()=>onDelete(task.id),
                        onClose: animateClose,
                        sourceUrl: task.source_url
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                        lineNumber: 192,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 pb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        color: dotColor,
                                        isCompleted: task.is_completed,
                                        onToggle: ()=>onToggle(task.id),
                                        size: "lg"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                                        lineNumber: 203,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xl font-semibold text-foreground leading-snug break-words min-w-0",
                                        children: task.title
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                                        lineNumber: 209,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                                lineNumber: 202,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskDateTimeLabel"], {
                                dateLabel: dateLabel,
                                timeLabel: timeLabel
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                                lineNumber: 215,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskRepeatLabel"], {
                                repeatLabel: repeatLabel
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                                lineNumber: 218,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-border my-5"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                                lineNumber: 221,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskCourseRow"], {
                                courseName: task.course_name
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                                lineNumber: 224,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskTagsRow"], {
                                tags: task.tags ?? []
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                                lineNumber: 227,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskDescriptionRow"], {
                                description: task.description,
                                lineClamp: 3
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                                lineNumber: 230,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                        lineNumber: 200,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx",
                lineNumber: 174,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true), document.body);
}
_s(TaskPreviewPopover, "Y0TLnqwhhREjOUK2/s4V3naSb20=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = TaskPreviewPopover;
var _c;
__turbopack_context__.k.register(_c, "TaskPreviewPopover");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourseGridView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/course-name-merge.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$courses$2f$CourseCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/courses/CourseCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$courses$2f$CourseTasksModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
/**
 * Course grid view for the inbox page.
 * Displays a grid of CourseCard components built from active tasks.
 * Clicking a card opens CourseTasksModal with that course's tasks.
 *
 * @param tasks - All user tasks (filtered internally to active only)
 * @param courseColors - Map from course_name to hex color
 * @param loading - Whether tasks are still loading
 */ "use client";
;
;
;
;
;
/**
 * Builds course summaries from active tasks.
 *
 * @param tasks - All tasks
 * @param courseColors - Map from course_name to color
 * @returns Sorted array of { name, color, taskCount }
 */ function buildCourses(tasks, courseColors) {
    const codeToCanonical = new Map();
    const counts = new Map();
    const active = tasks.filter((t)=>!t.is_completed && !t.dismissed_at);
    for (const t of active){
        const raw = t.course_name || "General";
        const code = raw !== "General" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractCourseCode"])(raw) : null;
        let key;
        if (code) {
            const existing = codeToCanonical.get(code);
            if (!existing || raw.length < existing.length) codeToCanonical.set(code, raw);
            key = code;
        } else {
            key = raw;
        }
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    const result = [];
    for (const [key, count] of counts){
        const name = codeToCanonical.get(key) || key;
        result.push({
            name,
            color: courseColors.get(name) || "#6b7280",
            taskCount: count
        });
    }
    result.sort((a, b)=>{
        if (a.name === "General") return 1;
        if (b.name === "General") return -1;
        return a.name.localeCompare(b.name);
    });
    return result;
}
function CourseGridView({ tasks, courseColors, loading }) {
    _s();
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const courses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CourseGridView.useMemo[courses]": ()=>buildCourses(tasks, courseColors)
    }["CourseGridView.useMemo[courses]"], [
        tasks,
        courseColors
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-muted-foreground",
                children: "Loading courses…"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
                lineNumber: 75,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
            lineNumber: 74,
            columnNumber: 7
        }, this);
    }
    if (courses.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex flex-col items-center justify-center gap-2 p-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                    size: 32,
                    className: "text-muted-foreground/30"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sm text-muted-foreground",
                    children: "No courses yet"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-muted-foreground/60",
                    children: "Add tasks with a course name to see them here"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
            lineNumber: 82,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 md:p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
                    children: courses.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$courses$2f$CourseCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            courseName: c.name,
                            color: c.color,
                            taskCount: c.taskCount,
                            onClick: ()=>setSelected({
                                    name: c.name,
                                    color: c.color
                                })
                        }, c.name, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$courses$2f$CourseTasksModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                courseName: selected.name,
                tasks: tasks,
                color: selected.color,
                open: true,
                onClose: ()=>setSelected(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(CourseGridView, "lpuvTFj4fN9KTpYHhA3y5pdzzX0=");
_c = CourseGridView;
var _c;
__turbopack_context__.k.register(_c, "CourseGridView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TaskDetailPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/repeat.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/task-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskActionBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskActionBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskDetailRows.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-list.js [app-client] (ecmascript) <export default as ClipboardList>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
function TaskDetailPanel({ task, onClose, onSave, onDelete }) {
    _s();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const isMiffy = colorTheme === "miffy";
    const [showEditModal, setShowEditModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskDetailPanel.useEffect": ()=>{
            setShowEditModal(false);
        }
    }["TaskDetailPanel.useEffect"], [
        task?.id
    ]);
    if (!task) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 h-full border-l border-border flex flex-col items-center justify-center p-5 gap-3",
            children: [
                isMiffy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: "/miffy/miffy-snoopy.png",
                    alt: "",
                    className: "w-32 h-auto opacity-60 select-none pointer-events-none",
                    draggable: false
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                    lineNumber: 53,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"], {
                    size: 48,
                    strokeWidth: 1.2,
                    className: "text-muted-foreground/30"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                    lineNumber: 55,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Select a task to view details"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
            lineNumber: 51,
            columnNumber: 7
        }, this);
    }
    const dotColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getThemeColor"])(task.color, colorTheme);
    const dateLabel = task.due_date ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(task.due_date + "T00:00:00"), "EEE, MMM d, yyyy") : null;
    const timeLabel = task.due_time ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(`2000-01-01T${task.due_time}`), "h:mm a") : null;
    const repeatLabel = task.repeat_interval && task.repeat_unit ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRepeatLabel"])(task.repeat_interval, task.repeat_unit) : null;
    const sourceBadges = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSourceBadges"])(task);
    const hasTags = sourceBadges.length > 0 || task.tags && task.tags.length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-1 h-full border-l border-border flex flex-col min-w-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskActionBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                onEdit: ()=>setShowEditModal(true),
                onDelete: onDelete ? ()=>{
                    onDelete(task.id);
                    onClose();
                } : undefined,
                onClose: onClose,
                sourceUrl: task.source_url
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto px-6 pb-6 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-4 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                color: dotColor,
                                isCompleted: task.is_completed,
                                onToggle: ()=>onSave(task.id, {
                                        is_completed: !task.is_completed
                                    }),
                                size: "lg"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xl font-semibold text-foreground leading-snug break-words min-w-0",
                                children: task.title
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskDateTimeLabel"], {
                        dateLabel: dateLabel,
                        timeLabel: timeLabel
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskRepeatLabel"], {
                        repeatLabel: repeatLabel
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t border-border my-5"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskCourseRow"], {
                        courseName: task.course_name
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    hasTags && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskTagsRow"], {
                        tags: task.tags ?? [],
                        sourceBadges: sourceBadges
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskDetailRows$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TaskDescriptionRow"], {
                        description: task.description
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: showEditModal,
                onClose: ()=>setShowEditModal(false),
                onAdd: ()=>{},
                editTask: task,
                onSave: (id, updates)=>{
                    onSave(id, updates);
                    setShowEditModal(false);
                },
                onDelete: onDelete ? (id)=>{
                    onDelete(id);
                    setShowEditModal(false);
                    onClose();
                } : undefined
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_s(TaskDetailPanel, "5gX1cY4YI0NIieGDl+Ki29GtYE4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = TaskDetailPanel;
var _c;
__turbopack_context__.k.register(_c, "TaskDetailPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/PageTransition.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PageTransition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
/**
 * Lightweight page transition wrapper.
 * Plays a snappy pop-in animation only on tab/page navigation, not on initial load.
 *
 * @param children - Page content to animate
 */ "use client";
;
;
function PageTransition({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [animKey, setAnimKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const isFirstRender = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PageTransition.useEffect": ()=>{
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            setAnimKey({
                "PageTransition.useEffect": (k)=>k + 1
            }["PageTransition.useEffect"]);
        }
    }["PageTransition.useEffect"], [
        pathname
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: animKey > 0 ? "animate-page-in h-full" : "h-full",
        children: children
    }, animKey, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/PageTransition.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(PageTransition, "PM+ynyXfkOgUONOeDiyhOkTQWpI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = PageTransition;
var _c;
__turbopack_context__.k.register(_c, "PageTransition");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InboxPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/inbox.js [app-client] (ecmascript) <export default as Inbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$range$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarRange$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-range.js [app-client] (ecmascript) <export default as CalendarRange>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-client] (ecmascript) <export default as MoreVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-client] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up-down.js [app-client] (ecmascript) <export default as ArrowUpDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$expand$2d$repeating$2d$tasks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/expand-repeating-tasks.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskBoardView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskBoardView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$courses$2f$CourseGridView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/courses/CourseGridView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskDetailPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskDetailPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskPreviewPopover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/PageTransition.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useOnboardingStatus.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/analytics.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
/** localStorage key to persist dismissal of the "Sync classes" badge. */ const SYNC_BADGE_DISMISSED_KEY = "caltodo_sync_badge_dismissed";
const FILTER_OPTIONS = [
    {
        key: "all",
        label: "Inbox",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"]
    },
    {
        key: "today",
        label: "Today",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"]
    },
    {
        key: "7days",
        label: "Next 7 Days",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$range$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarRange$3e$__["CalendarRange"]
    }
];
/**
 * Formats a Date as "YYYY-MM-DD".
 *
 * @param date - Date to format
 * @returns ISO date string
 */ function toDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
/**
 * Filters tasks by due date relative to today.
 * Expands repeating tasks into virtual instances so they appear
 * on the appropriate dates in the inbox.
 *
 * @param tasks - Array of tasks to filter
 * @param filter - Time window filter ("all" = no filter, "today" = due today or earlier + undated, "7days" = next 7 days)
 * @returns Filtered tasks including virtual repeat instances
 */ function filterTasksByDate(tasks, filter) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayStr = toDateStr(now);
    // Determine expansion range based on filter
    let rangeEnd;
    if (filter === "today") {
        rangeEnd = new Date(now);
    } else if (filter === "7days") {
        rangeEnd = new Date(now);
        rangeEnd.setDate(rangeEnd.getDate() + 7);
    } else {
        // "all" — expand 30 days ahead for upcoming repeat instances
        rangeEnd = new Date(now);
        rangeEnd.setDate(rangeEnd.getDate() + 30);
    }
    const rangeEndStr = toDateStr(rangeEnd);
    const expanded = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$expand$2d$repeating$2d$tasks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expandRepeatingTasks"])(tasks, todayStr, rangeEndStr);
    if (filter === "all") {
        return expanded.filter((t)=>{
            if (!t.due_date) return true;
            return t.due_date <= rangeEndStr;
        });
    }
    if (filter === "today") {
        return expanded.filter((t)=>{
            if (!t.due_date) return true;
            return t.due_date <= todayStr;
        });
    }
    // "7days"
    return expanded.filter((t)=>{
        if (!t.due_date) return true;
        return t.due_date <= rangeEndStr;
    });
}
/**
 * Sorts tasks by sort_order first (manual drag order), then by due_date.
 * Tasks with a non-null sort_order come first, sorted ascending.
 * Tasks with null sort_order follow, sorted by due_date ascending (undated first).
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */ function sortByDate(tasks) {
    return [
        ...tasks
    ].sort((a, b)=>{
        // Primary sort: due date ascending (undated tasks first)
        if (!a.due_date && !b.due_date) {
            // Both undated: use sort_order as tiebreaker if available
            const aOrd = a.sort_order ?? Infinity;
            const bOrd = b.sort_order ?? Infinity;
            return aOrd - bOrd;
        }
        if (!a.due_date) return -1;
        if (!b.due_date) return 1;
        const dateCmp = a.due_date.localeCompare(b.due_date);
        if (dateCmp !== 0) return dateCmp;
        // Same date: use sort_order as tiebreaker (null sort_order sorts last)
        const aOrd = a.sort_order ?? Infinity;
        const bOrd = b.sort_order ?? Infinity;
        return aOrd - bOrd;
    });
}
/**
 * Sorts tasks by course_name alphabetically (null → last), then by due_date within each class.
 *
 * @param tasks - Array of tasks to sort
 * @returns New sorted array (does not mutate input)
 */ function sortByClass(tasks) {
    return [
        ...tasks
    ].sort((a, b)=>{
        const ca = a.course_name || "\uffff";
        const cb = b.course_name || "\uffff";
        const cmp = ca.localeCompare(cb);
        if (cmp !== 0) return cmp;
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return -1;
        if (!b.due_date) return 1;
        return a.due_date.localeCompare(b.due_date);
    });
}
/** localStorage key for remembering sync course selections. */ const SYNC_COURSES_KEY = "caltodo_sync_course_selections";
/**
 * Loads saved sync course selection states from localStorage.
 * Returns a Map of "source:id" → checked boolean.
 */ function loadSavedSelections() {
    try {
        const raw = localStorage.getItem(SYNC_COURSES_KEY);
        if (!raw) return new Map();
        const entries = JSON.parse(raw);
        return new Map(entries);
    } catch  {
        return new Map();
    }
}
/**
 * Saves sync course selection states to localStorage.
 *
 * @param courses - Current course selections to persist
 */ function saveSelections(courses) {
    try {
        const entries = courses.map((c)=>[
                `${c.source}:${c.id}`,
                c.checked
            ]);
        localStorage.setItem(SYNC_COURSES_KEY, JSON.stringify(entries));
    } catch  {
    // non-critical
    }
}
function InboxPage() {
    _s();
    const { tasks, loading, error, addTask, toggleComplete: rawToggle, deleteTask: rawDelete, updateTask: rawUpdate, syncing, triggerSync, reorderTasks, fetchTasks, lastSyncedAt, courseColors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    /** Wraps toggleComplete to resolve virtual repeat instance IDs to real task IDs. */ const toggleComplete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InboxPage.useCallback[toggleComplete]": (id)=>rawToggle((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$expand$2d$repeating$2d$tasks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRealTaskId"])(id))
    }["InboxPage.useCallback[toggleComplete]"], [
        rawToggle
    ]);
    /** Wraps deleteTask to resolve virtual repeat instance IDs to real task IDs. */ const deleteTask = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InboxPage.useCallback[deleteTask]": (id)=>rawDelete((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$expand$2d$repeating$2d$tasks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRealTaskId"])(id))
    }["InboxPage.useCallback[deleteTask]"], [
        rawDelete
    ]);
    /** Wraps updateTask to resolve virtual repeat instance IDs to real task IDs. */ const updateTask = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InboxPage.useCallback[updateTask]": (id, updates)=>rawUpdate((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$expand$2d$repeating$2d$tasks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRealTaskId"])(id), updates)
    }["InboxPage.useCallback[updateTask]"], [
        rawUpdate
    ]);
    const inboxRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { hasCompletedOnboarding, loading: onboardingLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOnboardingStatus"])({
        skipCache: true
    });
    const [syncBadgeDismissed, setSyncBadgeDismissed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedTask, setSelectedTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [listPreviewTask, setListPreviewTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [listPreviewRect, setListPreviewRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [listModalTask, setListModalTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filter, setFilterRaw] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [pendingInvites, setPendingInvites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    /** Sets filter, persists to localStorage, and dispatches event for sidebar. */ const setFilter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InboxPage.useCallback[setFilter]": (f)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])("filter_changed", {
                filter: f
            });
            setFilterRaw(f);
            localStorage.setItem("inbox-filter", f);
            window.dispatchEvent(new CustomEvent("inbox-filter-change", {
                detail: f
            }));
        }
    }["InboxPage.useCallback[setFilter]"], []);
    const [showFilterDropdown, setShowFilterDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showSyncModal, setShowSyncModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [syncCourses, setSyncCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingCourses, setLoadingCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const filterRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const filterDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Guards persist effects from running on mount (which would overwrite hydrated values). */ const hydratedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("list");
    const [showViewMenu, setShowViewMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const viewMenuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const viewMenuDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [sortMode, setSortMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("date");
    const [showSortMenu, setShowSortMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const sortMenuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sortMenuDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [boardGroupBy, setBoardGroupBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("class");
    // Hydrate persisted preferences from localStorage after mount to avoid SSR mismatch
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            const savedFilter = localStorage.getItem("inbox-filter");
            if (savedFilter) setFilterRaw(savedFilter);
            const savedView = localStorage.getItem("inbox-view-mode");
            if (savedView) setViewMode(savedView);
            const savedSort = localStorage.getItem("inbox-sort-mode");
            if (savedSort) setSortMode(savedSort);
            const savedGroup = localStorage.getItem("inbox-board-group");
            if (savedGroup) setBoardGroupBy(savedGroup);
            hydratedRef.current = true;
            try {
                setSyncBadgeDismissed(localStorage.getItem(SYNC_BADGE_DISMISSED_KEY) === "true");
            } catch  {}
        }
    }["InboxPage.useEffect"], []);
    // Fetch pending invites on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            async function fetchPendingInvites() {
                try {
                    const res = await fetch("/api/tasks/invites/pending");
                    if (res.ok) {
                        const data = await res.json();
                        setPendingInvites(data.invites ?? []);
                    }
                } catch  {
                // Non-critical — requests section will just be empty
                }
            }
            fetchPendingInvites();
        }
    }["InboxPage.useEffect"], []);
    /**
   * Handles accepting or declining a task invite.
   * On accept, refetches tasks (new task appeared) and removes from pending list.
   * On decline, removes from pending list.
   *
   * @param shareId - The share to respond to
   * @param action - "accept" or "decline"
   */ const handleRespondInvite = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InboxPage.useCallback[handleRespondInvite]": async (shareId, action)=>{
            try {
                const res = await fetch(`/api/tasks/invite/${shareId}/respond`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        action
                    })
                });
                if (res.ok) {
                    setPendingInvites({
                        "InboxPage.useCallback[handleRespondInvite]": (prev)=>{
                            const updated = prev.filter({
                                "InboxPage.useCallback[handleRespondInvite].updated": (i)=>i.shareId !== shareId
                            }["InboxPage.useCallback[handleRespondInvite].updated"]);
                            return updated;
                        }
                    }["InboxPage.useCallback[handleRespondInvite]"]);
                    // On accept, refetch tasks so the newly copied task appears in the inbox.
                    // Small delay lets the admin-inserted row propagate through RLS.
                    if (action === "accept") {
                        await new Promise({
                            "InboxPage.useCallback[handleRespondInvite]": (r)=>setTimeout(r, 300)
                        }["InboxPage.useCallback[handleRespondInvite]"]);
                        await fetchTasks();
                    }
                }
            } catch  {
            // Non-critical — user can retry
            }
        }
    }["InboxPage.useCallback[handleRespondInvite]"], [
        fetchTasks
    ]);
    /**
   * Accepts all pending invites at once by firing accept for each.
   */ const handleAcceptAllInvites = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InboxPage.useCallback[handleAcceptAllInvites]": async ()=>{
            const invites = [
                ...pendingInvites
            ];
            if (invites.length === 0) return;
            // Clear the list immediately for instant UI feedback
            setPendingInvites([]);
            // Fire all accept calls in parallel
            await Promise.allSettled(invites.map({
                "InboxPage.useCallback[handleAcceptAllInvites]": (invite)=>fetch(`/api/tasks/invite/${invite.shareId}/respond`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            action: "accept"
                        })
                    })
            }["InboxPage.useCallback[handleAcceptAllInvites]"]));
            // Refetch tasks so accepted ones appear
            await new Promise({
                "InboxPage.useCallback[handleAcceptAllInvites]": (r)=>setTimeout(r, 300)
            }["InboxPage.useCallback[handleAcceptAllInvites]"]);
            await fetchTasks();
        }
    }["InboxPage.useCallback[handleAcceptAllInvites]"], [
        pendingInvites,
        fetchTasks
    ]);
    // Auto-select task from ?task= query param (e.g. from notification click-through)
    const taskParamHandled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            if (taskParamHandled.current || loading || tasks.length === 0) return;
            const taskId = searchParams.get("task");
            if (!taskId) return;
            taskParamHandled.current = true;
            const target = tasks.find({
                "InboxPage.useEffect.target": (t)=>t.id === taskId
            }["InboxPage.useEffect.target"]);
            if (target) {
                if (("TURBOPACK compile-time value", "object") !== "undefined" && window.innerWidth < 768) {
                    // Mobile: no anchor rect from deep link — open full modal
                    setListModalTask(target);
                } else {
                    // Desktop: show in detail panel
                    setSelectedTask(target);
                }
            }
            // Clear the URL param without adding a history entry
            inboxRouter.replace("/app/inbox", {
                scroll: false
            });
        }
    }["InboxPage.useEffect"], [
        searchParams,
        tasks,
        loading,
        inboxRouter
    ]);
    const [boardEditTask, setBoardEditTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [boardAnchorRect, setBoardAnchorRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [boardModalTask, setBoardModalTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showAddModal, setShowAddModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [addModalCourseName, setAddModalCourseName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Keep selected task in sync with context after updates (desktop detail panel)
    const currentSelectedTask = selectedTask ? tasks.find((t)=>t.id === selectedTask.id) ?? null : null;
    // Keep list preview task in sync with context after updates (mobile popover)
    const currentListPreviewTask = listPreviewTask ? tasks.find((t)=>t.id === listPreviewTask.id) ?? null : null;
    // Keep board edit task in sync with context after updates
    const currentBoardEditTask = boardEditTask ? tasks.find((t)=>t.id === boardEditTask.id) ?? null : null;
    // Filter tasks by date
    const filteredTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "InboxPage.useMemo[filteredTasks]": ()=>{
            const result = filterTasksByDate(tasks, filter);
            // Debug: log tasks that exist in context but were filtered out
            if (("TURBOPACK compile-time value", "object") !== "undefined" && tasks.length > 0) {
                const filtered = tasks.filter({
                    "InboxPage.useMemo[filteredTasks].filtered": (t)=>!result.some({
                            "InboxPage.useMemo[filteredTasks].filtered": (r)=>r.id === t.id
                        }["InboxPage.useMemo[filteredTasks].filtered"])
                }["InboxPage.useMemo[filteredTasks].filtered"]);
                if (filtered.length > 0) {
                    console.log("[Inbox] Tasks filtered out:", filtered.map({
                        "InboxPage.useMemo[filteredTasks]": (t)=>({
                                id: t.id,
                                title: t.title,
                                due_date: t.due_date,
                                is_completed: t.is_completed,
                                snoozed_until: t.snoozed_until,
                                dismissed_at: t.dismissed_at
                            })
                    }["InboxPage.useMemo[filteredTasks]"]));
                }
            }
            return result;
        }
    }["InboxPage.useMemo[filteredTasks]"], [
        tasks,
        filter
    ]);
    // Apply sort mode to filtered tasks
    const sortedTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "InboxPage.useMemo[sortedTasks]": ()=>sortMode === "class" ? sortByClass(filteredTasks) : sortByDate(filteredTasks)
    }["InboxPage.useMemo[sortedTasks]"], [
        filteredTasks,
        sortMode
    ]);
    // Close filter dropdown on outside click or scroll
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            function handleClick(e) {
                const target = e.target;
                if (filterRef.current && !filterRef.current.contains(target) && !filterDropdownRef.current?.contains(target)) {
                    setShowFilterDropdown(false);
                }
            }
            function handleScroll() {
                setShowFilterDropdown(false);
            }
            if (showFilterDropdown) {
                document.addEventListener("mousedown", handleClick);
                window.addEventListener("scroll", handleScroll, true);
            }
            return ({
                "InboxPage.useEffect": ()=>{
                    document.removeEventListener("mousedown", handleClick);
                    window.removeEventListener("scroll", handleScroll, true);
                }
            })["InboxPage.useEffect"];
        }
    }["InboxPage.useEffect"], [
        showFilterDropdown
    ]);
    // Persist preferences to localStorage (skip mount to avoid overwriting hydrated values)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            if (!hydratedRef.current) return;
            localStorage.setItem("inbox-view-mode", viewMode);
        }
    }["InboxPage.useEffect"], [
        viewMode
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            if (!hydratedRef.current) return;
            localStorage.setItem("inbox-sort-mode", sortMode);
        }
    }["InboxPage.useEffect"], [
        sortMode
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            if (!hydratedRef.current) return;
            localStorage.setItem("inbox-board-group", boardGroupBy);
        }
    }["InboxPage.useEffect"], [
        boardGroupBy
    ]);
    // Auto-reset filter to "all" when board view is in date group mode
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            if (viewMode === "board" && boardGroupBy === "date" && filter !== "all") {
                setFilter("all");
            }
        }
    }["InboxPage.useEffect"], [
        viewMode,
        boardGroupBy,
        filter,
        setFilter
    ]);
    // Close sort menu on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            function handleClick(e) {
                const target = e.target;
                if (sortMenuRef.current && !sortMenuRef.current.contains(target) && !sortMenuDropdownRef.current?.contains(target)) {
                    setShowSortMenu(false);
                }
            }
            if (showSortMenu) {
                document.addEventListener("mousedown", handleClick);
            }
            return ({
                "InboxPage.useEffect": ()=>{
                    document.removeEventListener("mousedown", handleClick);
                }
            })["InboxPage.useEffect"];
        }
    }["InboxPage.useEffect"], [
        showSortMenu
    ]);
    // Listen for tour-triggered view mode changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            function handleTourViewChange(e) {
                const mode = e.detail;
                setViewMode(mode);
            }
            window.addEventListener("tour-set-view-mode", handleTourViewChange);
            return ({
                "InboxPage.useEffect": ()=>window.removeEventListener("tour-set-view-mode", handleTourViewChange)
            })["InboxPage.useEffect"];
        }
    }["InboxPage.useEffect"], []);
    // Close view menu on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InboxPage.useEffect": ()=>{
            function handleClick(e) {
                const target = e.target;
                if (viewMenuRef.current && !viewMenuRef.current.contains(target) && !viewMenuDropdownRef.current?.contains(target)) {
                    setShowViewMenu(false);
                }
            }
            if (showViewMenu) {
                document.addEventListener("mousedown", handleClick);
            }
            return ({
                "InboxPage.useEffect": ()=>{
                    document.removeEventListener("mousedown", handleClick);
                }
            })["InboxPage.useEffect"];
        }
    }["InboxPage.useEffect"], [
        showViewMenu
    ]);
    /**
   * Opens the sync modal and loads ALL available courses from Canvas and Gradescope.
   * Restores previous check/uncheck selections from localStorage.
   */ async function handleSyncClick() {
        setShowSyncModal(true);
        setLoadingCourses(true);
        try {
            const courses = [];
            const saved = loadSavedSelections();
            // Fetch all Canvas courses and all Gradescope courses in parallel
            const [canvasRes, gradescopeRes] = await Promise.all([
                fetch("/api/canvas/courses").catch(()=>null),
                fetch("/api/gradescope/courses", {
                    method: "POST"
                }).catch(()=>null)
            ]);
            if (canvasRes?.ok) {
                const { courses: canvasCourses } = await canvasRes.json();
                for (const c of canvasCourses){
                    const key = `canvas:${c.id}`;
                    courses.push({
                        id: c.id,
                        name: c.name,
                        source: "canvas",
                        checked: saved.has(key) ? saved.get(key) : true
                    });
                }
            }
            if (gradescopeRes?.ok) {
                const { courses: gsCoures } = await gradescopeRes.json();
                for (const c of gsCoures){
                    const key = `gradescope:${c.id}`;
                    courses.push({
                        id: c.id,
                        name: c.name,
                        source: "gradescope",
                        checked: saved.has(key) ? saved.get(key) : true
                    });
                }
            }
            if (courses.length === 0) {
                setShowSyncModal(false);
                triggerSync();
                return;
            }
            setSyncCourses(courses);
        } catch  {
            setShowSyncModal(false);
            triggerSync();
        } finally{
            setLoadingCourses(false);
        }
    }
    /** Toggles a course in the sync modal and persists the change. */ function toggleSyncCourse(id) {
        setSyncCourses((prev)=>{
            const updated = prev.map((c)=>c.id === id ? {
                    ...c,
                    checked: !c.checked
                } : c);
            saveSelections(updated);
            return updated;
        });
    }
    /** Toggles all courses of a specific source in the sync modal. */ function toggleSourceCourses(source) {
        setSyncCourses((prev)=>{
            const sourceCourses = prev.filter((c)=>c.source === source);
            const allChecked = sourceCourses.every((c)=>c.checked);
            const updated = prev.map((c)=>c.source === source ? {
                    ...c,
                    checked: !allChecked
                } : c);
            saveSelections(updated);
            return updated;
        });
    }
    /** Confirms sync with selected courses, passing overrides to sync engine. */ function handleConfirmSync() {
        saveSelections(syncCourses);
        const checkedCourses = syncCourses.filter((c)=>c.checked);
        const canvasCourses = checkedCourses.filter((c)=>c.source === "canvas").map((c)=>({
                id: Number(c.id),
                name: c.name
            }));
        const gradescopeCourses = checkedCourses.filter((c)=>c.source === "gradescope").map((c)=>({
                id: String(c.id),
                name: c.name
            }));
        setShowSyncModal(false);
        triggerSync({
            canvas_courses: canvasCourses.length > 0 ? canvasCourses : undefined,
            gradescope_courses: gradescopeCourses.length > 0 ? gradescopeCourses : undefined
        });
    }
    /**
   * Handles drag-and-drop reorder by mapping new ID order to sort_order values.
   * Uses gaps of 1000 between values to allow future insertions without reindexing.
   *
   * @param reorderedIds - Task IDs in their new display order
   */ const handleReorder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InboxPage.useCallback[handleReorder]": (reorderedIds)=>{
            const updates = reorderedIds.map({
                "InboxPage.useCallback[handleReorder].updates": (id, index)=>({
                        id,
                        sort_order: (index + 1) * 1000
                    })
            }["InboxPage.useCallback[handleReorder].updates"]);
            reorderTasks(updates);
        }
    }["InboxPage.useCallback[handleReorder]"], [
        reorderTasks
    ]);
    const canvasCourses = syncCourses.filter((c)=>c.source === "canvas");
    const gradescopeCourses = syncCourses.filter((c)=>c.source === "gradescope");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row -m-4 md:-m-10 h-[calc(100dvh-3rem)] md:h-dvh",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col min-w-0 min-h-0",
                        style: {
                            flex: "3 1 0%"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 pt-4 pb-3 md:px-8 md:pt-8 md:pb-4 flex items-center justify-between animate-stagger stagger-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2.5 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                id: "tour-filter",
                                                ref: filterRef,
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setShowFilterDropdown(!showFilterDropdown),
                                                        className: "flex items-center gap-2 text-xl font-bold text-foreground hover:opacity-80 transition-opacity",
                                                        children: [
                                                            (()=>{
                                                                const current = FILTER_OPTIONS.find((o)=>o.key === filter) ?? FILTER_OPTIONS[0];
                                                                const Icon = current.icon;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                            size: 20,
                                                                            className: "text-muted-foreground"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                            lineNumber: 620,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        current.label
                                                                    ]
                                                                }, void 0, true);
                                                            })(),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                size: 14,
                                                                className: "text-muted-foreground"
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                lineNumber: 625,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 611,
                                                        columnNumber: 17
                                                    }, this),
                                                    showFilterDropdown && filterRef.current && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        id: "tour-filter-dropdown",
                                                        ref: filterDropdownRef,
                                                        className: "fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[160px] bg-popover",
                                                        style: {
                                                            top: filterRef.current.getBoundingClientRect().bottom + 4,
                                                            left: filterRef.current.getBoundingClientRect().left
                                                        },
                                                        children: FILTER_OPTIONS.map(({ key, label, icon: Icon })=>{
                                                            const isDisabled = viewMode === "board" && boardGroupBy === "date" && key !== "all";
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                disabled: isDisabled,
                                                                onClick: ()=>{
                                                                    if (isDisabled) return;
                                                                    setFilter(key);
                                                                    setShowFilterDropdown(false);
                                                                },
                                                                className: `flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${isDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : filter === key ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`,
                                                                style: {
                                                                    backgroundColor: !isDisabled && filter === key ? "rgba(255,255,255,0.08)" : "transparent"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                        size: 16
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                        lineNumber: 659,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    label
                                                                ]
                                                            }, key, true, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                lineNumber: 640,
                                                                columnNumber: 25
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 628,
                                                        columnNumber: 19
                                                    }, this), document.body)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                lineNumber: 610,
                                                columnNumber: 15
                                            }, this),
                                            !hasCompletedOnboarding && !lastSyncedAt && !syncBadgeDismissed && !onboardingLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative shrink-0 hidden md:flex items-center group/sync",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "/app/settings?section=integrations",
                                                        title: "Connect your class platforms",
                                                        className: "active:scale-95 transition-all relative",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "rounded-full bg-[#007AFF] pl-2.5 pr-3 py-1.5 flex items-center gap-1.5 hover:opacity-80 transition-opacity",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-semibold text-white",
                                                                children: "Sync Classes"
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                lineNumber: 678,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                            lineNumber: 677,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 672,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: (e)=>{
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSyncBadgeDismissed(true);
                                                            try {
                                                                localStorage.setItem(SYNC_BADGE_DISMISSED_KEY, "true");
                                                            } catch  {}
                                                        },
                                                        className: "absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center opacity-0 group-hover/sync:opacity-100 transition-opacity hover:bg-gray-300 dark:hover:bg-zinc-600",
                                                        "aria-label": "Dismiss",
                                                        title: "Dismiss",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "8",
                                                            height: "8",
                                                            viewBox: "0 0 24 24",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            strokeWidth: "3",
                                                            strokeLinecap: "round",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                                    x1: "18",
                                                                    y1: "6",
                                                                    x2: "6",
                                                                    y2: "18"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                    lineNumber: 693,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                                    x1: "6",
                                                                    y1: "6",
                                                                    x2: "18",
                                                                    y2: "18"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                    lineNumber: 694,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                            lineNumber: 692,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 681,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                lineNumber: 671,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                        lineNumber: 608,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                id: "tour-add-task",
                                                onClick: ()=>setShowAddModal(true),
                                                className: "p-1.5 text-foreground hover:bg-accent rounded-lg transition-all",
                                                title: "Add task",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                    size: 18
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                    lineNumber: 709,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                lineNumber: 703,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        ref: sortMenuRef,
                                                        onClick: ()=>setShowSortMenu(!showSortMenu),
                                                        className: "p-1.5 text-foreground hover:bg-accent rounded-lg transition-all",
                                                        title: viewMode === "list" ? "Sort tasks" : "Group by",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpDown$3e$__["ArrowUpDown"], {
                                                            size: 18
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                            lineNumber: 719,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 713,
                                                        columnNumber: 17
                                                    }, this),
                                                    showSortMenu && sortMenuRef.current && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        ref: sortMenuDropdownRef,
                                                        className: "fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[120px] bg-popover",
                                                        style: {
                                                            top: sortMenuRef.current.getBoundingClientRect().bottom + 4,
                                                            right: window.innerWidth - sortMenuRef.current.getBoundingClientRect().right
                                                        },
                                                        children: (()=>{
                                                            const currentValue = viewMode === "list" ? sortMode : boardGroupBy;
                                                            const setValue = viewMode === "list" ? (v)=>setSortMode(v) : (v)=>setBoardGroupBy(v);
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>{
                                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])("sort_mode_changed", {
                                                                                sort: "date"
                                                                            });
                                                                            setValue("date");
                                                                            setShowSortMenu(false);
                                                                        },
                                                                        className: `flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${currentValue === "date" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`,
                                                                        style: {
                                                                            backgroundColor: currentValue === "date" ? "rgba(255,255,255,0.08)" : "transparent"
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                                                                                size: 14
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                                lineNumber: 746,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            "Date"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                        lineNumber: 737,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>{
                                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])("sort_mode_changed", {
                                                                                sort: "class"
                                                                            });
                                                                            setValue("class");
                                                                            setShowSortMenu(false);
                                                                        },
                                                                        className: `flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${currentValue === "class" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`,
                                                                        style: {
                                                                            backgroundColor: currentValue === "class" ? "rgba(255,255,255,0.08)" : "transparent"
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                                                                                size: 14
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                                lineNumber: 758,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            "Class"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                        lineNumber: 749,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true);
                                                        })()
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 722,
                                                        columnNumber: 19
                                                    }, this), document.body)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                lineNumber: 712,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                id: "tour-view-toggle",
                                                ref: viewMenuRef,
                                                onClick: ()=>setShowViewMenu(!showViewMenu),
                                                className: "p-1.5 text-foreground hover:bg-accent rounded-lg transition-all",
                                                title: "View options",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                                                    size: 18
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                    lineNumber: 775,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                lineNumber: 768,
                                                columnNumber: 15
                                            }, this),
                                            showViewMenu && viewMenuRef.current && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                ref: viewMenuDropdownRef,
                                                className: "fixed z-[9999] rounded-xl shadow-2xl border border-border overflow-hidden animate-in min-w-[140px] bg-popover",
                                                style: {
                                                    top: viewMenuRef.current.getBoundingClientRect().bottom + 4,
                                                    right: window.innerWidth - viewMenuRef.current.getBoundingClientRect().right
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])("view_mode_changed", {
                                                                mode: "list"
                                                            });
                                                            setViewMode("list");
                                                            setShowViewMenu(false);
                                                        },
                                                        className: `flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${viewMode === "list" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`,
                                                        style: {
                                                            backgroundColor: viewMode === "list" ? "rgba(255,255,255,0.08)" : "transparent"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                lineNumber: 796,
                                                                columnNumber: 21
                                                            }, this),
                                                            "List"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 787,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        id: "tour-board-option",
                                                        onClick: ()=>{
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])("view_mode_changed", {
                                                                mode: "board"
                                                            });
                                                            setViewMode("board");
                                                            setShowViewMenu(false);
                                                        },
                                                        className: `flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${viewMode === "board" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`,
                                                        style: {
                                                            backgroundColor: viewMode === "board" ? "rgba(255,255,255,0.08)" : "transparent"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                lineNumber: 809,
                                                                columnNumber: 21
                                                            }, this),
                                                            "Board"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 799,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])("view_mode_changed", {
                                                                mode: "courses"
                                                            });
                                                            setViewMode("courses");
                                                            setShowViewMenu(false);
                                                        },
                                                        className: `flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${viewMode === "courses" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`,
                                                        style: {
                                                            backgroundColor: viewMode === "courses" ? "rgba(255,255,255,0.08)" : "transparent"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                lineNumber: 821,
                                                                columnNumber: 21
                                                            }, this),
                                                            "Courses"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 812,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "border-t border-border my-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 824,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            setShowViewMenu(false);
                                                            handleSyncClick();
                                                        },
                                                        disabled: syncing,
                                                        className: "flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                size: 14,
                                                                className: syncing ? "animate-spin" : ""
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                                lineNumber: 830,
                                                                columnNumber: 21
                                                            }, this),
                                                            syncing ? "Syncing..." : "Sync"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 825,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                lineNumber: 779,
                                                columnNumber: 17
                                            }, this), document.body)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                        lineNumber: 701,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                lineNumber: 606,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                open: showAddModal,
                                onClose: ()=>{
                                    setShowAddModal(false);
                                    setAddModalCourseName(null);
                                },
                                onAdd: (task)=>{
                                    addTask(task);
                                    setShowAddModal(false);
                                    setAddModalCourseName(null);
                                },
                                defaultCourseName: addModalCourseName
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                lineNumber: 840,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                id: "tour-task-list",
                                className: "flex-1 overflow-auto animate-stagger stagger-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "animate-view-switch h-full",
                                    children: viewMode === "list" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        tasks: sortedTasks,
                                        loading: loading,
                                        error: error,
                                        selectedTaskId: selectedTask?.id,
                                        sortMode: sortMode,
                                        onAdd: addTask,
                                        onToggle: toggleComplete,
                                        onSelect: (task, anchorRect)=>{
                                            if (("TURBOPACK compile-time value", "object") !== "undefined" && window.innerWidth < 768 && anchorRect) {
                                                // Mobile: show preview popover
                                                setListPreviewTask(task);
                                                setListPreviewRect(anchorRect);
                                            } else {
                                                // Desktop: show in detail panel
                                                setSelectedTask(task);
                                            }
                                        },
                                        onDelete: deleteTask,
                                        onReorder: sortMode === "date" ? handleReorder : undefined,
                                        onColorChange: async (courseName, color)=>{
                                            const matching = sortedTasks.filter((t)=>(t.course_name || "General") === courseName);
                                            for (const t of matching){
                                                await updateTask(t.id, {
                                                    color
                                                });
                                            }
                                        },
                                        onDeleteClass: async (courseName)=>{
                                            const matching = sortedTasks.filter((t)=>(t.course_name || "General") === courseName);
                                            for (const t of matching){
                                                await deleteTask(t.id);
                                            }
                                        },
                                        onAddTaskToClass: (courseName)=>{
                                            setAddModalCourseName(courseName);
                                            setShowAddModal(true);
                                        },
                                        pendingInvites: pendingInvites,
                                        onRespondInvite: handleRespondInvite,
                                        onAcceptAllInvites: handleAcceptAllInvites
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                        lineNumber: 850,
                                        columnNumber: 17
                                    }, this) : viewMode === "courses" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$courses$2f$CourseGridView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        tasks: filteredTasks,
                                        courseColors: courseColors,
                                        loading: loading
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                        lineNumber: 895,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskBoardView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        tasks: filteredTasks,
                                        loading: loading,
                                        error: error,
                                        selectedTaskId: boardEditTask?.id,
                                        groupBy: boardGroupBy,
                                        onAdd: addTask,
                                        onToggle: toggleComplete,
                                        onSelect: (task, anchorRect)=>{
                                            setBoardEditTask(task);
                                            setBoardAnchorRect(anchorRect ?? null);
                                        },
                                        onDelete: deleteTask,
                                        onColorChange: async (courseName, color)=>{
                                            const matching = filteredTasks.filter((t)=>(t.course_name || "General") === courseName);
                                            for (const t of matching){
                                                await updateTask(t.id, {
                                                    color
                                                });
                                            }
                                        },
                                        onDeleteClass: async (courseName)=>{
                                            const matching = filteredTasks.filter((t)=>(t.course_name || "General") === courseName);
                                            for (const t of matching){
                                                await deleteTask(t.id);
                                            }
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                        lineNumber: 901,
                                        columnNumber: 17
                                    }, this)
                                }, viewMode, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                    lineNumber: 848,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                lineNumber: 847,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                        lineNumber: 605,
                        columnNumber: 9
                    }, this),
                    viewMode === "list" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hidden md:flex w-[50%] shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskDetailPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            task: currentSelectedTask,
                            onClose: ()=>setSelectedTask(null),
                            onSave: updateTask,
                            onDelete: deleteTask
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                            lineNumber: 939,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                        lineNumber: 938,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                lineNumber: 603,
                columnNumber: 7
            }, this),
            viewMode === "board" && currentBoardEditTask && boardAnchorRect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskPreviewPopover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                task: currentBoardEditTask,
                anchorRect: boardAnchorRect,
                onClose: ()=>{
                    setBoardEditTask(null);
                    setBoardAnchorRect(null);
                },
                onEdit: (task)=>{
                    setBoardEditTask(null);
                    setBoardAnchorRect(null);
                    setBoardModalTask(task);
                },
                onDelete: async (id)=>{
                    await deleteTask(id);
                    setBoardEditTask(null);
                    setBoardAnchorRect(null);
                },
                onToggle: toggleComplete
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                lineNumber: 951,
                columnNumber: 9
            }, this),
            viewMode === "board" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: !!boardModalTask,
                onClose: ()=>setBoardModalTask(null),
                onAdd: ()=>{},
                editTask: boardModalTask,
                onSave: async (id, updates)=>{
                    await updateTask(id, updates);
                },
                onDelete: async (id)=>{
                    await deleteTask(id);
                    setBoardModalTask(null);
                },
                onSaveColorForClass: async (courseName, color)=>{
                    const matching = tasks.filter((t)=>(t.course_name || "General") === courseName);
                    for (const t of matching)await updateTask(t.id, {
                        color
                    });
                }
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                lineNumber: 971,
                columnNumber: 9
            }, this),
            viewMode === "list" && currentListPreviewTask && listPreviewRect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskPreviewPopover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                task: currentListPreviewTask,
                anchorRect: listPreviewRect,
                onClose: ()=>{
                    setListPreviewTask(null);
                    setListPreviewRect(null);
                },
                onEdit: (task)=>{
                    setListPreviewTask(null);
                    setListPreviewRect(null);
                    setListModalTask(task);
                },
                onDelete: async (id)=>{
                    await deleteTask(id);
                    setListPreviewTask(null);
                    setListPreviewRect(null);
                },
                onToggle: toggleComplete
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                lineNumber: 992,
                columnNumber: 9
            }, this),
            viewMode === "list" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: !!listModalTask,
                onClose: ()=>setListModalTask(null),
                onAdd: ()=>{},
                editTask: listModalTask,
                onSave: async (id, updates)=>{
                    await updateTask(id, updates);
                },
                onDelete: async (id)=>{
                    await deleteTask(id);
                    setListModalTask(null);
                },
                onSaveColorForClass: async (courseName, color)=>{
                    const matching = tasks.filter((t)=>(t.course_name || "General") === courseName);
                    for (const t of matching)await updateTask(t.id, {
                        color
                    });
                }
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                lineNumber: 1012,
                columnNumber: 9
            }, this),
            showSyncModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-card rounded-2xl border border-border shadow-2xl w-full w-[calc(100%-2rem)] max-w-md flex flex-col animate-modal-in",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-5 py-4 border-b border-border flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-semibold text-foreground",
                                    children: "Sync Assignments"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                    lineNumber: 1037,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowSyncModal(false),
                                    className: "p-1 text-subtle-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent",
                                    "aria-label": "Close",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                        lineNumber: 1043,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                    lineNumber: 1038,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                            lineNumber: 1036,
                            columnNumber: 13
                        }, this),
                        loadingCourses ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-h-[60vh] overflow-auto px-5 py-4 space-y-3",
                            children: [
                                ...Array(5)
                            ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 animate-pulse",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-4 h-4 rounded bg-muted shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                            lineNumber: 1051,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-4 bg-muted rounded flex-1",
                                            style: {
                                                maxWidth: `${60 + i * 7 % 30}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                            lineNumber: 1052,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                    lineNumber: 1050,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                            lineNumber: 1048,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-h-[60vh] overflow-auto",
                            children: [
                                canvasCourses.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "px-5 pt-4 pb-2 flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold text-foreground",
                                                    children: "bCourses"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                    lineNumber: 1061,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>toggleSourceCourses("canvas"),
                                                    className: "text-[11px] text-blue-500 hover:text-blue-600 transition-colors",
                                                    children: canvasCourses.every((c)=>c.checked) ? "Deselect all" : "Select all"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                    lineNumber: 1064,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                            lineNumber: 1060,
                                            columnNumber: 21
                                        }, this),
                                        canvasCourses.map((course)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-3 px-5 py-2.5 hover:bg-accent transition-colors cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: course.checked,
                                                        onChange: ()=>toggleSyncCourse(course.id),
                                                        className: "w-4 h-4 rounded accent-blue-500 shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 1076,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm text-foreground truncate",
                                                        children: course.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 1082,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, `canvas-${course.id}`, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                lineNumber: 1072,
                                                columnNumber: 23
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                    lineNumber: 1059,
                                    columnNumber: 19
                                }, this),
                                gradescopeCourses.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "px-5 pt-4 pb-2 flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold text-foreground",
                                                    children: "Gradescope"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                    lineNumber: 1091,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>toggleSourceCourses("gradescope"),
                                                    className: "text-[11px] text-blue-500 hover:text-blue-600 transition-colors",
                                                    children: gradescopeCourses.every((c)=>c.checked) ? "Deselect all" : "Select all"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                    lineNumber: 1094,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                            lineNumber: 1090,
                                            columnNumber: 21
                                        }, this),
                                        gradescopeCourses.map((course)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-3 px-5 py-2.5 hover:bg-accent transition-colors cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: course.checked,
                                                        onChange: ()=>toggleSyncCourse(course.id),
                                                        className: "w-4 h-4 rounded accent-blue-500 shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 1106,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm text-foreground truncate",
                                                        children: course.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                        lineNumber: 1112,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, `gs-${course.id}`, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                                lineNumber: 1102,
                                                columnNumber: 23
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                    lineNumber: 1089,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                            lineNumber: 1057,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-5 py-4 border-t border-border flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setSyncCourses((prev)=>{
                                            const allChecked = prev.every((c)=>c.checked);
                                            const updated = prev.map((c)=>({
                                                    ...c,
                                                    checked: !allChecked
                                                }));
                                            saveSelections(updated);
                                            return updated;
                                        });
                                    },
                                    className: "text-xs text-blue-500 hover:text-blue-600 transition-colors",
                                    children: syncCourses.every((c)=>c.checked) ? "Deselect all" : "Select all"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                    lineNumber: 1122,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleConfirmSync,
                                    disabled: syncCourses.filter((c)=>c.checked).length === 0,
                                    className: "px-5 py-2 rounded-xl text-sm font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-all",
                                    children: [
                                        "Sync ",
                                        syncCourses.filter((c)=>c.checked).length,
                                        " courses"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                                    lineNumber: 1135,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                            lineNumber: 1121,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                    lineNumber: 1034,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
                lineNumber: 1033,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/inbox/page.tsx",
        lineNumber: 602,
        columnNumber: 5
    }, this);
}
_s(InboxPage, "h8gDmwVEm9aAqiJnRgZZDKD+fXo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOnboardingStatus"]
    ];
});
_c = InboxPage;
var _c;
__turbopack_context__.k.register(_c, "InboxPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_claude_worktrees_claude-work_src_8d415577._.js.map