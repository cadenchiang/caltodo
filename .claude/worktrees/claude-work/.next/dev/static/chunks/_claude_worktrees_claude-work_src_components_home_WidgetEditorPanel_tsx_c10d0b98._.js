(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EDGE_PAD",
    ()=>EDGE_PAD,
    "GAP",
    ()=>GAP,
    "PANEL_WIDTH",
    ()=>PANEL_WIDTH,
    "computePanelPosition",
    ()=>computePanelPosition,
    "default",
    ()=>WidgetEditorPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Inline editor panel that appears beside a selected widget.
 * Supports live editing (auto-save on change with 150ms debounce).
 * Replaces the old centered WidgetSettingsModal.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/camera.js [app-client] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-check-big.js [app-client] (ecmascript) <export default as CheckSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as ImageIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-sun.js [app-client] (ecmascript) <export default as CloudSun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$messages$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessagesSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/messages-square.js [app-client] (ecmascript) <export default as MessagesSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-client] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hourglass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hourglass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hourglass.js [app-client] (ecmascript) <export default as Hourglass>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/link.js [app-client] (ecmascript) <export default as Link>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$quote$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Quote$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/quote.js [app-client] (ecmascript) <export default as Quote>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3X3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.js [app-client] (ecmascript) <export default as Grid3X3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/smile.js [app-client] (ecmascript) <export default as Smile>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/music.js [app-client] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useDiscussionBoards.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$FontPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/SegmentedControl.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorPickerPopover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$CalendarPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/CalendarPicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$ClockFacePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/ClockFacePicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WeatherDisplayPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/WeatherDisplayPicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$GCalDisplayPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/GCalDisplayPicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$NotesStylePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/NotesStylePicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$image$2d$widget$2d$presets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/image-widget-presets.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ImageCropModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SidePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx [app-client] (ecmascript)");
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
;
const PANEL_WIDTH = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SidePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SIDE_PANEL_WIDTH"];
const GAP = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SidePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SIDE_PANEL_GAP"];
const EDGE_PAD = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SidePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SIDE_PANEL_EDGE_PAD"];
const computePanelPosition = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SidePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeSidePanelPosition"];
/**
 * Default accent colors per widget type. Matches the fallback each widget
 * uses internally when no custom accentColor is set.
 */ const WIDGET_ACCENT_DEFAULTS = {
    "tasks-today": "#3b82f6",
    "class-progress": "#3b82f6",
    "google-calendar": "#4285F4",
    pomodoro: "#4285F4",
    quote: "#4285F4",
    stats: "#4285F4",
    countdown: "#4285F4"
};
const WIDGET_LABELS = {
    clock: "Clock",
    "tasks-today": "Tasks Widget",
    "class-progress": "Class Progress",
    "google-calendar": "Google Calendar",
    image: "Image",
    notes: "Notes",
    weather: "Weather",
    "cal-chat": "Cal Chat",
    pomodoro: "Pomodoro",
    countdown: "Countdown",
    "quick-links": "Quick Links",
    "habit-tracker": "Habit Tracker",
    quote: "Quote",
    stats: "Stats",
    "weekly-heatmap": "Activity",
    sticker: "Sticker",
    spotify: "Spotify",
    courses: "Courses"
};
/** Maps widget type to its lucide-react icon component for the editor header. */ const WIDGET_ICONS = {
    clock: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
    "tasks-today": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__["CheckSquare"],
    "class-progress": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"],
    "google-calendar": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
    image: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__["ImageIcon"],
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
    weather: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSun$3e$__["CloudSun"],
    "cal-chat": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$messages$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessagesSquare$3e$__["MessagesSquare"],
    pomodoro: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"],
    countdown: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hourglass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hourglass$3e$__["Hourglass"],
    "quick-links": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__["Link"],
    "habit-tracker": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"],
    quote: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$quote$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Quote$3e$__["Quote"],
    stats: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
    "weekly-heatmap": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3X3$3e$__["Grid3X3"],
    sticker: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__["Smile"],
    spotify: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"],
    courses: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"]
};
const WEIGHT_OPTIONS = [
    {
        label: "Thin",
        value: "100"
    },
    {
        label: "Light",
        value: "300"
    },
    {
        label: "Regular",
        value: "400"
    },
    {
        label: "Medium",
        value: "500"
    },
    {
        label: "Bold",
        value: "700"
    }
];
const TIMEZONE_OPTIONS = [
    {
        label: "Local (Auto)",
        value: ""
    },
    {
        label: "New York (EST)",
        value: "America/New_York"
    },
    {
        label: "Chicago (CST)",
        value: "America/Chicago"
    },
    {
        label: "Denver (MST)",
        value: "America/Denver"
    },
    {
        label: "Los Angeles (PST)",
        value: "America/Los_Angeles"
    },
    {
        label: "London (GMT)",
        value: "Europe/London"
    },
    {
        label: "Paris (CET)",
        value: "Europe/Paris"
    },
    {
        label: "Tokyo (JST)",
        value: "Asia/Tokyo"
    },
    {
        label: "Shanghai (CST)",
        value: "Asia/Shanghai"
    },
    {
        label: "Sydney (AEST)",
        value: "Australia/Sydney"
    },
    {
        label: "Dubai (GST)",
        value: "Asia/Dubai"
    }
];
const SEL = "w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function WidgetEditorPanel({ widget, widgetRect, onClose, onUpdateConfig, onRemove, onApplyFontToAll, onApplyBgResetToAll, onApplyTextColorToAll, onApplyBorderToAll, onApplyAccentToAll, savedImages, onAddSavedImage }) {
    _s();
    const { boards } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDiscussionBoards"])();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const panelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isClosing, setIsClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [side, setSide] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("right");
    const [panelPos, setPanelPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [localConfig, setLocalConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        ...widget.config
    });
    const initialConfigRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        ...widget.config
    });
    const isFirstRender = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    const [cropSrc, setCropSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [calendars, setCalendars] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [calendarsLoading, setCalendarsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedCalendarIds, setSelectedCalendarIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set([
        "primary"
    ]));
    const [confirmOverlay, setConfirmOverlay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [expandedPresetCats, setExpandedPresetCats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    /** Toggles a preset category between collapsed (horizontal scroll) and expanded (full grid). */ function togglePresetCat(key) {
        setExpandedPresetCats((prev)=>{
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }
    // Init calendar IDs from config
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WidgetEditorPanel.useEffect": ()=>{
            let ids = [
                "primary"
            ];
            if (widget.config.calendarIds) {
                try {
                    ids = JSON.parse(widget.config.calendarIds);
                } catch  {}
            } else if (widget.config.calendarId) {
                ids = [
                    widget.config.calendarId
                ];
            }
            setSelectedCalendarIds(new Set(ids));
        }
    }["WidgetEditorPanel.useEffect"], [
        widget.config.calendarIds,
        widget.config.calendarId
    ]);
    // Fetch calendars for google-calendar widget
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WidgetEditorPanel.useEffect": ()=>{
            if (widget.type !== "google-calendar") return;
            setCalendarsLoading(true);
            fetch("/api/gcal/calendars?all=true").then({
                "WidgetEditorPanel.useEffect": (r)=>r.ok ? r.json() : null
            }["WidgetEditorPanel.useEffect"]).then({
                "WidgetEditorPanel.useEffect": (d)=>{
                    if (d?.calendars) setCalendars(d.calendars);
                }
            }["WidgetEditorPanel.useEffect"]).catch({
                "WidgetEditorPanel.useEffect": ()=>{}
            }["WidgetEditorPanel.useEffect"]).finally({
                "WidgetEditorPanel.useEffect": ()=>setCalendarsLoading(false)
            }["WidgetEditorPanel.useEffect"]);
        }
    }["WidgetEditorPanel.useEffect"], [
        widget.type
    ]);
    const updateField = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WidgetEditorPanel.useCallback[updateField]": (key, value)=>{
            setLocalConfig({
                "WidgetEditorPanel.useCallback[updateField]": (prev)=>({
                        ...prev,
                        [key]: value
                    })
            }["WidgetEditorPanel.useCallback[updateField]"]);
        }
    }["WidgetEditorPanel.useCallback[updateField]"], []);
    // Auto-save debounced 150ms (skip first render)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WidgetEditorPanel.useEffect": ()=>{
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            const t = setTimeout({
                "WidgetEditorPanel.useEffect.t": ()=>onUpdateConfig(widget.id, localConfig)
            }["WidgetEditorPanel.useEffect.t"], 150);
            return ({
                "WidgetEditorPanel.useEffect": ()=>clearTimeout(t)
            })["WidgetEditorPanel.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["WidgetEditorPanel.useEffect"], [
        localConfig
    ]);
    // Panel positioning — delegates to pure computePanelPosition()
    const updatePosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WidgetEditorPanel.useCallback[updatePosition]": ()=>{
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) return;
            const el = document.querySelector(`[data-widget-id="${widget.id}"]`);
            const rect = el ? el.getBoundingClientRect() : widgetRect;
            const pH = panelRef.current?.offsetHeight ?? 500;
            const { side: placeSide, top, left } = computePanelPosition(rect, window.innerWidth, window.innerHeight, pH);
            setSide(placeSide);
            setPanelPos({
                top,
                left
            });
        }
    }["WidgetEditorPanel.useCallback[updatePosition]"], [
        widget.id,
        widgetRect
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WidgetEditorPanel.useEffect": ()=>{
            updatePosition();
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);
            return ({
                "WidgetEditorPanel.useEffect": ()=>{
                    window.removeEventListener("scroll", updatePosition, true);
                    window.removeEventListener("resize", updatePosition);
                }
            })["WidgetEditorPanel.useEffect"];
        }
    }["WidgetEditorPanel.useEffect"], [
        updatePosition
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WidgetEditorPanel.useEffect": ()=>{
            requestAnimationFrame(updatePosition);
        }
    }["WidgetEditorPanel.useEffect"], [
        updatePosition
    ]);
    // Reposition when async content loads (e.g. calendar list) changes panel height
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WidgetEditorPanel.useEffect": ()=>{
            requestAnimationFrame(updatePosition);
        }
    }["WidgetEditorPanel.useEffect"], [
        calendars,
        updatePosition
    ]);
    function handleDone() {
        const init = initialConfigRef.current;
        if (!colorTheme) {
            if (init.bgColor && !localConfig.bgColor && onApplyBgResetToAll) {
                setConfirmOverlay("bgReset");
                return;
            }
            if ((localConfig.textColor || "") !== (init.textColor || "") && onApplyTextColorToAll) {
                setConfirmOverlay("textColor");
                return;
            }
        }
        if ((localConfig.widgetBorder || "true") !== (init.widgetBorder || "true") && onApplyBorderToAll) {
            setConfirmOverlay("border");
            return;
        }
        triggerClose();
    }
    function triggerClose() {
        setIsClosing(true);
    }
    function handleAnimEnd() {
        if (isClosing) onClose();
    }
    const handleCroppedUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WidgetEditorPanel.useCallback[handleCroppedUpload]": async (blob)=>{
            setCropSrc(null);
            setUploading(true);
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const ext = blob.type.split("/")[1] === "jpeg" ? "jpg" : blob.type.split("/")[1];
                const path = `${user.id}/board-img-${widget.id}-${Date.now()}.${ext}`;
                const { error } = await supabase.storage.from("avatars").upload(path, blob, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: blob.type
                });
                if (error) {
                    console.error("Image upload failed:", error.message);
                    return;
                }
                const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
                const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;
                updateField("imageUrl", imageUrl);
                onAddSavedImage(imageUrl);
            } catch (err) {
                console.error("Image upload error:", err);
            } finally{
                setUploading(false);
            }
        }
    }["WidgetEditorPanel.useCallback[handleCroppedUpload]"], [
        widget.id,
        updateField,
        onAddSavedImage
    ]);
    function handleFileSelect(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        setCropSrc(URL.createObjectURL(f));
        e.target.value = "";
    }
    function handleCalToggle(id) {
        setSelectedCalendarIds((prev)=>{
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            updateField("calendarIds", JSON.stringify([
                ...next
            ]));
            const colorMap = {};
            for (const c of calendars){
                if (next.has(c.id)) colorMap[c.id] = c.backgroundColor;
            }
            if (Object.keys(colorMap).length > 0) updateField("calendarColors", JSON.stringify(colorMap));
            return next;
        });
    }
    const label = WIDGET_LABELS[widget.type] || "Widget";
    const IconComponent = WIDGET_ICONS[widget.type];
    const animClass = isClosing ? isMobile ? "animate-editor-sheet-out" : `animate-editor-panel-out-${side}` : isMobile ? "animate-editor-sheet-in" : `animate-editor-panel-in-${side}`;
    const panelCls = isMobile ? `fixed bottom-0 left-0 right-0 z-[52] max-h-[60vh] bg-popover border-t border-border rounded-t-2xl shadow-2xl flex flex-col ${animClass}` : `fixed z-[52] bg-popover border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] ${animClass}`;
    const panelStyle = isMobile ? undefined : {
        top: panelPos.top,
        left: panelPos.left,
        width: PANEL_WIDTH
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: panelRef,
        className: panelCls,
        style: panelStyle,
        onAnimationEnd: handleAnimEnd,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between p-3 border-b border-border shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-foreground flex items-center gap-2",
                        children: [
                            IconComponent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IconComponent, {
                                size: 15,
                                className: "text-muted-foreground shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 279,
                                columnNumber: 29
                            }, this),
                            label,
                            " Settings"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 278,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleDone,
                        className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                        "aria-label": "Close",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                            lineNumber: 283,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 282,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 277,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3 space-y-3 overflow-y-auto flex-1 text-sm",
                children: [
                    widget.type === "clock" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$ClockFacePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                value: localConfig.clockFace || "digital",
                                onChange: (v)=>updateField("clockFace", v)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 291,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Time Format"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 292,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        options: [
                                            {
                                                value: "12",
                                                label: "12h"
                                            },
                                            {
                                                value: "24",
                                                label: "24h"
                                            }
                                        ],
                                        value: localConfig.clockFormat || "12",
                                        onChange: (v)=>updateField("clockFormat", v)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 292,
                                        columnNumber: 103
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 292,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Timezone"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 293,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: localConfig.clockTimezone || "",
                                        onChange: (e)=>updateField("clockTimezone", e.target.value),
                                        className: SEL,
                                        children: TIMEZONE_OPTIONS.map((tz)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: tz.value,
                                                children: tz.label
                                            }, tz.value, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 293,
                                                columnNumber: 257
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 293,
                                        columnNumber: 100
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 293,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Font Weight"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 294,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: localConfig.clockFontWeight || "300",
                                        onChange: (e)=>updateField("clockFontWeight", e.target.value),
                                        className: SEL,
                                        children: WEIGHT_OPTIONS.map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: w.value,
                                                children: w.label
                                            }, w.value, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 294,
                                                columnNumber: 264
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 294,
                                        columnNumber: 103
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 294,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true),
                    widget.type === "tasks-today" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "View Mode"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 299,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        options: [
                                            {
                                                value: "today",
                                                label: "Today"
                                            },
                                            {
                                                value: "week",
                                                label: "Week"
                                            },
                                            {
                                                value: "inbox",
                                                label: "All"
                                            }
                                        ],
                                        value: localConfig.viewMode || "today",
                                        onChange: (v)=>updateField("viewMode", v)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 299,
                                        columnNumber: 101
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 299,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Show Completed"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 300,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        options: [
                                            {
                                                value: "true",
                                                label: "Show"
                                            },
                                            {
                                                value: "false",
                                                label: "Hide"
                                            }
                                        ],
                                        value: localConfig.showCompleted ?? "true",
                                        onChange: (v)=>updateField("showCompleted", v)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 300,
                                        columnNumber: 106
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 300,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true),
                    widget.type === "class-progress" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-sm font-medium text-foreground mb-1.5",
                                children: "Sort Courses By"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 304,
                                columnNumber: 51
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: localConfig.progressSort || "count",
                                onChange: (e)=>updateField("progressSort", e.target.value),
                                className: SEL,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "count",
                                        children: "Most tasks first"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 304,
                                        columnNumber: 272
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "alpha",
                                        children: "Alphabetical"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 304,
                                        columnNumber: 319
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "completion",
                                        children: "Completion % (highest first)"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 304,
                                        columnNumber: 362
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 304,
                                columnNumber: 142
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 304,
                        columnNumber: 46
                    }, this),
                    widget.type === "google-calendar" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$GCalDisplayPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                value: localConfig.gcalDisplay || "list",
                                onChange: (v)=>updateField("gcalDisplay", v)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 308,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$CalendarPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                calendars: calendars,
                                selectedIds: selectedCalendarIds,
                                onToggle: handleCalToggle,
                                onSelectAll: ()=>{
                                    setSelectedCalendarIds(new Set(calendars.map((c)=>c.id)));
                                    updateField("calendarIds", JSON.stringify(calendars.map((c)=>c.id)));
                                },
                                onDeselectAll: ()=>{
                                    setSelectedCalendarIds(new Set());
                                    updateField("calendarIds", "[]");
                                },
                                loading: calendarsLoading
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 309,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Default View"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 310,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: localConfig.viewMode || "week",
                                        onChange: (e)=>updateField("viewMode", e.target.value),
                                        className: SEL,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "today",
                                                children: "Today"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 310,
                                                columnNumber: 225
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "2day",
                                                children: "2 Days"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 310,
                                                columnNumber: 261
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "3day",
                                                children: "3 Days"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 310,
                                                columnNumber: 297
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "4day",
                                                children: "4 Days"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 310,
                                                columnNumber: 333
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "5day",
                                                children: "5 Days"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 310,
                                                columnNumber: 369
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "week",
                                                children: "Week"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 310,
                                                columnNumber: 405
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "month",
                                                children: "Month"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 310,
                                                columnNumber: 439
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "custom",
                                                children: "Custom..."
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 310,
                                                columnNumber: 475
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 310,
                                        columnNumber: 104
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 310,
                                columnNumber: 11
                            }, this),
                            localConfig.viewMode === "custom" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Number of Days"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 311,
                                        columnNumber: 54
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: 1,
                                        max: 90,
                                        value: localConfig.customDays || "7",
                                        onChange: (e)=>updateField("customDays", e.target.value),
                                        className: SEL
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 311,
                                        columnNumber: 144
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 311,
                                columnNumber: 49
                            }, this)
                        ]
                    }, void 0, true),
                    widget.type === "image" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: fileInputRef,
                                type: "file",
                                accept: "image/*",
                                onChange: handleFileSelect,
                                className: "hidden"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 316,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>fileInputRef.current?.click(),
                                disabled: uploading,
                                className: "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-foreground hover:border-foreground/30 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 317,
                                        columnNumber: 283
                                    }, this),
                                    uploading ? "Uploading\u2026" : "Upload Image"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 317,
                                columnNumber: 11
                            }, this),
                            savedImages.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-foreground",
                                        children: "Your Images"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 319,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto",
                                        children: savedImages.map((url)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>updateField("imageUrl", url),
                                                className: `rounded-md overflow-hidden aspect-[4/3] transition-all ${localConfig.imageUrl === url ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-400"}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: url,
                                                    alt: "",
                                                    className: "w-full h-full object-cover",
                                                    loading: "lazy"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 346
                                                }, this)
                                            }, url, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 320,
                                                columnNumber: 106
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 320,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-foreground",
                                children: "Preset Images"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 322,
                                columnNumber: 11
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$image$2d$widget$2d$presets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IMAGE_WIDGET_PRESET_CATEGORIES"].map((cat)=>{
                                const catKey = `iwc-${cat.label}`;
                                const isExpanded = expandedPresetCats.has(catKey);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] font-medium text-foreground",
                                                    children: cat.label
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                    lineNumber: 329,
                                                    columnNumber: 19
                                                }, this),
                                                cat.presets.length > 4 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>togglePresetCat(catKey),
                                                    className: "text-[9px] text-muted-foreground hover:text-foreground transition-colors",
                                                    children: isExpanded ? "Show Less" : `Show All (${cat.presets.length})`
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                    lineNumber: 331,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 328,
                                            columnNumber: 17
                                        }, this),
                                        isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-4 gap-1.5",
                                            children: cat.presets.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>updateField("imageUrl", `preset:${p.id}`),
                                                    className: `rounded-md overflow-hidden aspect-[4/3] transition-all ${localConfig.imageUrl === `preset:${p.id}` ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-400"}`,
                                                    title: p.label,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: p.url,
                                                        alt: p.label,
                                                        className: "w-full h-full object-cover",
                                                        loading: "lazy"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 25
                                                    }, this)
                                                }, p.id, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                    lineNumber: 343,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 341,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex overflow-x-auto gap-1.5 scrollbar-none",
                                            children: cat.presets.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>updateField("imageUrl", `preset:${p.id}`),
                                                    className: `shrink-0 w-[72px] rounded-md overflow-hidden transition-all ${localConfig.imageUrl === `preset:${p.id}` ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-400"}`,
                                                    title: p.label,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "aspect-[4/3]",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: p.url,
                                                            alt: p.label,
                                                            className: "w-full h-full object-cover",
                                                            loading: "lazy"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                            lineNumber: 353,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                        lineNumber: 352,
                                                        columnNumber: 25
                                                    }, this)
                                                }, p.id, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                    lineNumber: 351,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 349,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, cat.label, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                    lineNumber: 327,
                                    columnNumber: 15
                                }, this);
                            }),
                            localConfig.imageUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>updateField("imageUrl", ""),
                                className: "text-xs text-red-500 hover:text-red-600 transition-colors",
                                children: "Remove image"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 362,
                                columnNumber: 36
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 315,
                        columnNumber: 37
                    }, this),
                    widget.type === "weather" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WeatherDisplayPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                value: localConfig.weatherDisplay || "standard",
                                onChange: (v)=>updateField("weatherDisplay", v)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 367,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "View"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 368,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        options: [
                                            {
                                                value: "today",
                                                label: "Today"
                                            },
                                            {
                                                value: "week",
                                                label: "7-Day"
                                            }
                                        ],
                                        value: localConfig.weatherView || "today",
                                        onChange: (v)=>updateField("weatherView", v)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 368,
                                        columnNumber: 96
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 368,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Temperature"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 369,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        options: [
                                            {
                                                value: "F",
                                                label: "\u00b0F"
                                            },
                                            {
                                                value: "C",
                                                label: "\u00b0C"
                                            }
                                        ],
                                        value: localConfig.tempUnit || "F",
                                        onChange: (v)=>updateField("tempUnit", v)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 369,
                                        columnNumber: 103
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 369,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true),
                    widget.type === "notes" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$NotesStylePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            value: localConfig.notesStyle || "blank",
                            onChange: (v)=>updateField("notesStyle", v)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                            lineNumber: 374,
                            columnNumber: 11
                        }, this)
                    }, void 0, false),
                    widget.type === "countdown" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Mode"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 379,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        options: [
                                            {
                                                value: "auto",
                                                label: "Auto"
                                            },
                                            {
                                                value: "custom",
                                                label: "Custom"
                                            }
                                        ],
                                        value: localConfig.countdownMode || "auto",
                                        onChange: (v)=>updateField("countdownMode", v)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 379,
                                        columnNumber: 96
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 379,
                                columnNumber: 11
                            }, this),
                            (localConfig.countdownMode || "auto") === "auto" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground",
                                children: "Automatically shows your next upcoming deadline."
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 380,
                                columnNumber: 64
                            }, this),
                            localConfig.countdownMode === "custom" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-medium text-foreground mb-1.5",
                                                children: "Target Date"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 382,
                                                columnNumber: 18
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "date",
                                                value: localConfig.countdownDate || "",
                                                onChange: (e)=>updateField("countdownDate", e.target.value),
                                                className: SEL
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 382,
                                                columnNumber: 105
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 382,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-medium text-foreground mb-1.5",
                                                children: "Label"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 383,
                                                columnNumber: 18
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "e.g. Spring Break",
                                                value: localConfig.countdownLabel || "",
                                                onChange: (e)=>updateField("countdownLabel", e.target.value),
                                                className: SEL
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                                lineNumber: 383,
                                                columnNumber: 99
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 383,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true),
                    widget.type === "habit-tracker" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-foreground mb-1.5",
                                    children: "Habit Name"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                    lineNumber: 389,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "e.g. Study 2 hours",
                                    value: localConfig.habitName || "",
                                    onChange: (e)=>updateField("habitName", e.target.value),
                                    className: SEL
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                    lineNumber: 389,
                                    columnNumber: 102
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                            lineNumber: 389,
                            columnNumber: 11
                        }, this)
                    }, void 0, false),
                    widget.type === "quote" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-foreground mb-1.5",
                                    children: "Category"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                    lineNumber: 394,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: localConfig.quoteCategory || "all",
                                    onChange: (e)=>updateField("quoteCategory", e.target.value),
                                    className: SEL,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "all",
                                            children: "All"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 394,
                                            columnNumber: 230
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "motivation",
                                            children: "Motivation"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 394,
                                            columnNumber: 262
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "study",
                                            children: "Study"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 394,
                                            columnNumber: 308
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "productivity",
                                            children: "Productivity"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 394,
                                            columnNumber: 344
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                    lineNumber: 394,
                                    columnNumber: 100
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                            lineNumber: 394,
                            columnNumber: 11
                        }, this)
                    }, void 0, false),
                    widget.type === "stats" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-foreground mb-1.5",
                                    children: "Metric"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                    lineNumber: 399,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: localConfig.statsMetric || "completion",
                                    onChange: (e)=>updateField("statsMetric", e.target.value),
                                    className: SEL,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "completion",
                                            children: "Completion Rate"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 399,
                                            columnNumber: 231
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "completed-week",
                                            children: "Completed This Week"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 399,
                                            columnNumber: 282
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "streak",
                                            children: "Day Streak"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 399,
                                            columnNumber: 341
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "pending",
                                            children: "Tasks Remaining"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                            lineNumber: 399,
                                            columnNumber: 383
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                    lineNumber: 399,
                                    columnNumber: 98
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                            lineNumber: 399,
                            columnNumber: 11
                        }, this)
                    }, void 0, false),
                    widget.type === "sticker" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Emoji"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 404,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: localConfig.stickerEmoji || "✨",
                                        onChange: (e)=>updateField("stickerEmoji", e.target.value),
                                        className: SEL,
                                        maxLength: 4
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 404,
                                        columnNumber: 97
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 404,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Caption"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 405,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Optional text",
                                        value: localConfig.stickerText || "",
                                        onChange: (e)=>updateField("stickerText", e.target.value),
                                        className: SEL
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 405,
                                        columnNumber: 99
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 405,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true),
                    widget.type === "spotify" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Spotify URL"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 410,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "https://open.spotify.com/track/...",
                                        value: localConfig.spotifyUrl || "",
                                        onChange: (e)=>updateField("spotifyUrl", e.target.value),
                                        className: SEL
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 410,
                                        columnNumber: 103
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-muted-foreground mt-1",
                                        children: "Paste a link to a track, album, playlist, or podcast from Spotify."
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 410,
                                        columnNumber: 286
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 410,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Header Label"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 411,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "e.g. My Playlist",
                                        value: localConfig.spotifyLabel || "",
                                        onChange: (e)=>updateField("spotifyLabel", e.target.value),
                                        className: SEL
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 411,
                                        columnNumber: 104
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 411,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Show Header"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 412,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        options: [
                                            {
                                                value: "true",
                                                label: "Show"
                                            },
                                            {
                                                value: "false",
                                                label: "Hide"
                                            }
                                        ],
                                        value: localConfig.spotifyShowHeader ?? "true",
                                        onChange: (v)=>updateField("spotifyShowHeader", v)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 412,
                                        columnNumber: 103
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 412,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                        children: "Player Theme"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 413,
                                        columnNumber: 16
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        options: [
                                            {
                                                value: "dark",
                                                label: "Dark"
                                            },
                                            {
                                                value: "light",
                                                label: "Light"
                                            }
                                        ],
                                        value: localConfig.spotifyTheme || "dark",
                                        onChange: (v)=>updateField("spotifyTheme", v)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                        lineNumber: 413,
                                        columnNumber: 104
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 413,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t border-border"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 417,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-medium text-foreground",
                        children: "Appearance"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 418,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 mb-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>updateField("textBold", localConfig.textBold === "true" ? "false" : "true"),
                                className: `w-8 h-8 rounded-lg border text-sm font-bold flex items-center justify-center transition-colors ${localConfig.textBold === "true" ? "bg-foreground text-background border-foreground" : "border-input-border text-foreground hover:bg-muted"}`,
                                "aria-label": "Toggle bold",
                                children: "B"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 420,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>updateField("textItalic", localConfig.textItalic === "true" ? "false" : "true"),
                                className: `w-8 h-8 rounded-lg border text-sm italic flex items-center justify-center transition-colors ${localConfig.textItalic === "true" ? "bg-foreground text-background border-foreground" : "border-input-border text-foreground hover:bg-muted"}`,
                                "aria-label": "Toggle italic",
                                children: "I"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 428,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 419,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-sm font-medium text-foreground mb-1.5",
                                children: "Border"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 437,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                options: [
                                    {
                                        value: "true",
                                        label: "Show"
                                    },
                                    {
                                        value: "false",
                                        label: "Hide"
                                    }
                                ],
                                value: localConfig.widgetBorder ?? "true",
                                onChange: (v)=>updateField("widgetBorder", v)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 437,
                                columnNumber: 96
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 437,
                        columnNumber: 9
                    }, this),
                    !colorTheme && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-end justify-center gap-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorPickerPopover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                label: "Text",
                                value: localConfig.textColor || "",
                                onChange: (v)=>updateField("textColor", v),
                                layout: "compact",
                                defaultValue: "var(--foreground)"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 441,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorPickerPopover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                label: "Background",
                                value: localConfig.bgColor || "",
                                onChange: (v)=>updateField("bgColor", v),
                                layout: "compact"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 442,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorPickerPopover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                label: "Accent",
                                value: localConfig.accentColor || "",
                                onChange: (v)=>updateField("accentColor", v),
                                layout: "compact",
                                defaultValue: WIDGET_ACCENT_DEFAULTS[widget.type],
                                onApplyToAll: onApplyAccentToAll
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 443,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 440,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-sm font-medium text-foreground mb-1.5",
                                children: "Font (all widgets)"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 446,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$FontPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                value: localConfig.fontFamily || "",
                                onChange: (v)=>{
                                    updateField("fontFamily", v);
                                    onApplyFontToAll?.(v);
                                }
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                                lineNumber: 446,
                                columnNumber: 108
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 446,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 288,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between p-3 border-t border-border shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setConfirmOverlay("delete"),
                        className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors",
                        "aria-label": "Remove Widget",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                            size: 15
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                            lineNumber: 457,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 452,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleDone,
                        className: "px-5 py-2 text-sm font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm active:scale-[0.97] transition-all duration-200",
                        children: "Done"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 459,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 451,
                columnNumber: 7
            }, this),
            cropSrc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ImageCropModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: true,
                imageSrc: cropSrc,
                aspect: 4 / 3,
                onCrop: handleCroppedUpload,
                onClose: ()=>setCropSrc(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 467,
                columnNumber: 19
            }, this),
            confirmOverlay === "bgReset" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmPanel, {
                message: "Reset background on all widgets?",
                onYes: ()=>{
                    onApplyBgResetToAll?.();
                    setConfirmOverlay(null);
                    triggerClose();
                },
                onNo: ()=>{
                    setConfirmOverlay(null);
                    triggerClose();
                },
                yesLabel: "Reset all",
                noLabel: "Just this one"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 470,
                columnNumber: 40
            }, this),
            confirmOverlay === "textColor" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmPanel, {
                message: "Apply this text color to all widgets?",
                onYes: ()=>{
                    onApplyTextColorToAll?.(localConfig.textColor || "");
                    setConfirmOverlay(null);
                    triggerClose();
                },
                onNo: ()=>{
                    setConfirmOverlay(null);
                    triggerClose();
                },
                yesLabel: "Apply to all",
                noLabel: "Just this one"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 471,
                columnNumber: 42
            }, this),
            confirmOverlay === "border" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmPanel, {
                message: `${localConfig.widgetBorder === "false" ? "Hide" : "Show"} border on all widgets?`,
                onYes: ()=>{
                    onApplyBorderToAll?.(localConfig.widgetBorder || "true");
                    setConfirmOverlay(null);
                    triggerClose();
                },
                onNo: ()=>{
                    setConfirmOverlay(null);
                    triggerClose();
                },
                yesLabel: "Apply to all",
                noLabel: "Just this one"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 472,
                columnNumber: 39
            }, this),
            confirmOverlay === "delete" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmPanel, {
                message: "Remove this widget?",
                subtitle: "This action cannot be undone.",
                onYes: ()=>{
                    onRemove(widget.id);
                    onClose();
                },
                onNo: ()=>setConfirmOverlay(null),
                yesLabel: "Remove",
                noLabel: "Cancel",
                destructive: true
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 473,
                columnNumber: 39
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
        lineNumber: 275,
        columnNumber: 5
    }, this);
}
_s(WidgetEditorPanel, "iKPYXZ9LCdY8bucH4iFWj9VSZ8g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDiscussionBoards"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = WidgetEditorPanel;
/** Inline confirmation overlay. */ function ConfirmPanel({ message, subtitle, onYes, onNo, yesLabel, noLabel, destructive }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 z-10 bg-card/95 flex flex-col items-center justify-center p-6 text-center rounded-2xl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium text-foreground mb-1",
                children: message
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 485,
                columnNumber: 7
            }, this),
            subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground mb-4",
                children: subtitle
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 486,
                columnNumber: 20
            }, this),
            !subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 487,
                columnNumber: 21
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onNo,
                        className: "px-4 py-2 text-sm rounded-xl text-muted-foreground hover:bg-muted transition-colors",
                        children: noLabel
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 489,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onYes,
                        className: `px-4 py-2 text-sm rounded-xl text-white transition-colors ${destructive ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`,
                        children: yesLabel
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                        lineNumber: 490,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
                lineNumber: 488,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx",
        lineNumber: 484,
        columnNumber: 5
    }, this);
}
_c1 = ConfirmPanel;
var _c, _c1;
__turbopack_context__.k.register(_c, "WidgetEditorPanel");
__turbopack_context__.k.register(_c1, "ConfirmPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_claude_worktrees_claude-work_src_components_home_WidgetEditorPanel_tsx_c10d0b98._.js.map