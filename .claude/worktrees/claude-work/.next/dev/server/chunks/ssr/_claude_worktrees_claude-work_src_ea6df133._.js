module.exports = [
"[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_TASK_COLOR",
    ()=>DEFAULT_TASK_COLOR,
    "NAV_ITEMS",
    ()=>NAV_ITEMS,
    "TASK_COLORS",
    ()=>TASK_COLORS,
    "getMiffyColor",
    ()=>getMiffyColor,
    "getThemeColor",
    ()=>getThemeColor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-ssr] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/inbox.js [app-ssr] (ecmascript) <export default as Inbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-ssr] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sticky$2d$note$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StickyNote$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sticky-note.js [app-ssr] (ecmascript) <export default as StickyNote>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
;
const NAV_ITEMS = [
    {
        label: "Home",
        href: "/app/home",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"]
    },
    {
        label: "Inbox",
        href: "/app/inbox",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"]
    },
    {
        label: "Calendar",
        href: "/app/calendar",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"]
    },
    {
        label: "Notes",
        href: "/app/notes",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sticky$2d$note$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StickyNote$3e$__["StickyNote"]
    },
    {
        label: "Chat",
        href: "/app/discussions",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"]
    }
];
const TASK_COLORS = [
    "#9CA3AF",
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#F97316"
];
const DEFAULT_TASK_COLOR = "#3B82F6";
/**
 * Miffy theme pink-shade mapping for task colors.
 * Each default color maps to a distinct pink/rose shade for visual differentiation.
 *
 * @param color - Original task hex color
 * @returns Pink-mapped hex color if Miffy mapping exists, otherwise a default blush pink
 */ const MIFFY_COLOR_MAP = {
    "#9CA3AF": "#c8b0b8",
    "#3B82F6": "#e8729a",
    "#EF4444": "#a83860",
    "#10B981": "#f2c4d4",
    "#F59E0B": "#f9dde5",
    "#8B5CF6": "#8c3060",
    "#EC4899": "#f4a0bc",
    "#06B6D4": "#fce8ef",
    "#F97316": "#d4567e",
    "#D1D5DB": "#f0c0d0"
};
function getMiffyColor(color) {
    if (!color) return MIFFY_COLOR_MAP["#D1D5DB"];
    return MIFFY_COLOR_MAP[color.toUpperCase()] ?? MIFFY_COLOR_MAP[color] ?? "#e8729a";
}
/** Nord theme: muted arctic tones for task colors. */ const NORD_COLOR_MAP = {
    "#9CA3AF": "#7b88a0",
    "#3B82F6": "#5e81ac",
    "#EF4444": "#bf616a",
    "#10B981": "#a3be8c",
    "#F59E0B": "#ebcb8b",
    "#8B5CF6": "#b48ead",
    "#EC4899": "#d08770",
    "#06B6D4": "#88c0d0",
    "#F97316": "#d08770",
    "#D1D5DB": "#8890a0"
};
/** Rosewood theme: warm wine-burgundy tones for task colors. */ const ROSEWOOD_COLOR_MAP = {
    "#9CA3AF": "#a08080",
    "#3B82F6": "#a03040",
    "#EF4444": "#801828",
    "#10B981": "#c89898",
    "#F59E0B": "#d8b0a0",
    "#8B5CF6": "#702040",
    "#EC4899": "#c06070",
    "#06B6D4": "#e0c0c0",
    "#F97316": "#b04838",
    "#D1D5DB": "#c0a0a0"
};
/** Midnight theme: electric blue accent tones for task colors. */ const MIDNIGHT_COLOR_MAP = {
    "#9CA3AF": "#607090",
    "#3B82F6": "#3a6cf0",
    "#EF4444": "#e05050",
    "#10B981": "#40a888",
    "#F59E0B": "#d8a040",
    "#8B5CF6": "#6850d0",
    "#EC4899": "#c050a0",
    "#06B6D4": "#40a0d0",
    "#F97316": "#d87030",
    "#D1D5DB": "#7080a0"
};
/** Map of color theme IDs to their task color remap tables. */ const THEME_COLOR_MAPS = {
    miffy: MIFFY_COLOR_MAP,
    nord: NORD_COLOR_MAP,
    rosewood: ROSEWOOD_COLOR_MAP,
    midnight: MIDNIGHT_COLOR_MAP
};
function getThemeColor(color, colorTheme) {
    const map = colorTheme ? THEME_COLOR_MAPS[colorTheme] : undefined;
    if (!map) return color || "#6b7280";
    if (!color) return map["#D1D5DB"] ?? "#6b7280";
    return map[color.toUpperCase()] ?? map[color] ?? color;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/settingsConfig.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_SECTION",
    ()=>DEFAULT_SECTION,
    "SETTINGS_GROUPS",
    ()=>SETTINGS_GROUPS,
    "SETTINGS_SECTIONS",
    ()=>SETTINGS_SECTIONS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plug$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plug$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plug.js [app-ssr] (ecmascript) <export default as Plug>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-ssr] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-ssr] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-ssr] (ecmascript) <export default as Wrench>");
;
const SETTINGS_GROUPS = [
    "General",
    "System"
];
const SETTINGS_SECTIONS = [
    {
        id: "integrations",
        label: "Integrations",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plug$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plug$3e$__["Plug"],
        group: "General"
    },
    {
        id: "classes",
        label: "Classes",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"],
        group: "General"
    },
    {
        id: "appearance",
        label: "Appearance",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"],
        group: "System"
    },
    {
        id: "advanced",
        label: "Advanced",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"],
        group: "System"
    }
];
const DEFAULT_SECTION = "integrations";
}),
"[project]/.claude/worktrees/claude-work/src/components/layout/SidebarNavItem.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SidebarNavItem,
    "navItemClasses",
    ()=>navItemClasses
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function navItemClasses(isActive, _isMiffy) {
    const base = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors";
    if (isActive) {
        return `${base} nav-item-active text-foreground`;
    }
    return `${base} text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]`;
}
function SidebarNavItem({ label, href, icon: Icon, badge, badgeCount, badgeText, id, imageSrc, imageClassName, onClick, active }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const isMiffy = colorTheme === "miffy";
    const isActive = active ?? (pathname === href || pathname.startsWith(href + "/"));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        id: id,
        href: href,
        prefetch: true,
        onClick: onClick,
        className: navItemClasses(isActive, isMiffy),
        children: [
            imageSrc ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: imageSrc,
                alt: "",
                className: `w-5 h-5 object-contain ${imageClassName ?? ""}`
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/SidebarNavItem.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                size: 16
            }, label, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/SidebarNavItem.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/SidebarNavItem.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "ml-auto w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/SidebarNavItem.tsx",
                lineNumber: 84,
                columnNumber: 9
            }, this),
            badgeCount !== undefined && badgeCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "ml-auto min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shrink-0",
                children: badgeCount > 99 ? "99+" : badgeCount
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/SidebarNavItem.tsx",
                lineNumber: 87,
                columnNumber: 9
            }, this),
            badgeText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "ml-auto px-1.5 py-0.5 rounded-md bg-[#007AFF] text-white text-[9px] font-bold tracking-wide shrink-0",
                children: badgeText
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/SidebarNavItem.tsx",
                lineNumber: 92,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/SidebarNavItem.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Toast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/undo-2.js [app-ssr] (ecmascript) <export default as Undo2>");
"use client";
;
;
function Toast({ message, action, progress, dismissing, onDismiss }) {
    const showProgress = typeof progress === "number" && progress < 100;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "status",
        "aria-live": "polite",
        className: `pointer-events-auto relative flex items-center gap-3 rounded-full px-5 py-3 text-sm text-white shadow-lg backdrop-blur-md bg-neutral-800/90 dark:bg-neutral-900/90 overflow-hidden max-w-[calc(100vw-2rem)] ${dismissing ? "animate-toast-out" : "animate-toast-in"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "truncate min-w-0",
                children: message
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            action && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>{
                    action.onClick();
                    onDismiss();
                },
                className: "flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-medium whitespace-nowrap",
                children: [
                    action.icon ?? (action.label === "Undo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__["Undo2"], {
                        size: 14
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx",
                        lineNumber: 59,
                        columnNumber: 54
                    }, this) : null),
                    action.label
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx",
                lineNumber: 52,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onDismiss,
                className: "text-white/60 hover:text-white transition-colors ml-1",
                "aria-label": "Dismiss",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    size: 16
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            showProgress && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-0 left-0 right-0 h-[2px]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full bg-blue-400 transition-all duration-700 ease-out",
                    style: {
                        width: `${progress}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx",
                    lineNumber: 75,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx",
                lineNumber: 74,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$Toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/Toast.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
const DEFAULT_DURATION = 6000;
const DISMISS_ANIMATION_MS = 300;
/** Maximum number of toasts visible at once. */ const MAX_TOASTS = 3;
function ToastProvider({ children }) {
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const idCounter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const timersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    /** Clears dismiss timer for a specific toast. */ const clearTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);
    /** Starts the dismiss animation for a specific toast, then removes it. */ const dismissToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        clearTimer(id);
        setToasts((prev)=>prev.map((t)=>t.id === id ? {
                    ...t,
                    dismissing: true
                } : t));
        setTimeout(()=>{
            setToasts((prev)=>prev.filter((t)=>t.id !== id));
        }, DISMISS_ANIMATION_MS);
    }, [
        clearTimer
    ]);
    /**
   * Displays a toast notification at the bottom of the screen.
   * Stacks with existing toasts up to MAX_TOASTS.
   *
   * @param message - Text to display in the toast
   * @param options - Optional action button and custom duration
   */ const showToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message, options)=>{
        const id = ++idCounter.current;
        const duration = options?.duration ?? DEFAULT_DURATION;
        const hasProgress = typeof options?.progress === "number";
        const newToast = {
            id,
            message,
            action: options?.action,
            duration,
            dismissing: false,
            progress: options?.progress
        };
        setToasts((prev)=>{
            // Remove any progress toasts — a new toast means the prior operation finished
            const filtered = prev.filter((t)=>{
                if (typeof t.progress === "number") {
                    clearTimer(t.id);
                    return false;
                }
                return true;
            });
            const next = [
                ...filtered,
                newToast
            ];
            // Dismiss oldest toasts exceeding the limit
            while(next.length > MAX_TOASTS){
                const oldest = next.shift();
                if (oldest) clearTimer(oldest.id);
            }
            return next;
        });
        if (!hasProgress) {
            const timer = setTimeout(()=>dismissToast(id), duration);
            timersRef.current.set(id, timer);
        } else {
            // Safety: auto-dismiss progress toasts after 60s if never completed
            const safetyTimer = setTimeout(()=>dismissToast(id), 60_000);
            timersRef.current.set(id, safetyTimer);
        }
    }, [
        clearTimer,
        dismissToast
    ]);
    /**
   * Updates the progress value of the most recent toast without replacing it.
   *
   * @param progress - New progress value (0–100)
   */ const updateToastProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((progress)=>{
        setToasts((prev)=>{
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            // Auto-dismiss completed progress toasts after a brief delay
            if (progress >= 100) {
                const timer = setTimeout(()=>dismissToast(last.id), 600);
                timersRef.current.set(last.id, timer);
            }
            return prev.map((t)=>t.id === last.id ? {
                    ...t,
                    progress
                } : t);
        });
    }, [
        dismissToast
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: {
            showToast,
            updateToastProgress
        },
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-36 md:bottom-6 left-0 right-0 z-[200] flex justify-center pointer-events-none px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative grid [&>*]:col-start-1 [&>*]:row-start-1 items-end",
                    children: toasts.map((toast, i)=>{
                        const depth = toasts.length - 1 - i;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "transition-all duration-300 ease-out",
                            style: {
                                transform: `translateY(${depth * -6}px) scale(${1 - depth * 0.035})`,
                                zIndex: 100 - depth,
                                opacity: Math.max(0.5, 1 - depth * 0.12),
                                transformOrigin: "center bottom"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$Toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                message: toast.message,
                                action: toast.action,
                                progress: toast.progress,
                                dismissing: toast.dismissing,
                                onDismiss: ()=>dismissToast(toast.id)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx",
                                lineNumber: 169,
                                columnNumber: 17
                            }, this)
                        }, toast.id, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx",
                            lineNumber: 159,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx",
        lineNumber: 152,
        columnNumber: 5
    }, this);
}
function useToast() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return ctx;
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ContactModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-ssr] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ContactModal({ open, onClose, userName, userEmail }) {
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Focus textarea when modal opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (open && textareaRef.current) {
            setTimeout(()=>textareaRef.current?.focus(), 100);
        }
        if (!open) {
            setMessage("");
        }
    }, [
        open
    ]);
    // Close on Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        function handleKeyDown(e) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", handleKeyDown);
        return ()=>window.removeEventListener("keydown", handleKeyDown);
    }, [
        open,
        onClose
    ]);
    /**
   * Submits the contact form to the API endpoint.
   * Shows a toast on success or failure.
   */ async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: userName || "Anonymous",
                    email: userEmail || null,
                    message: trimmed
                })
            });
            if (res.ok) {
                showToast("Message sent! We'll get back to you soon.");
                onClose();
            } else {
                showToast("Failed to send message. Please try again.");
            }
        } catch  {
            showToast("Failed to send message. Please try again.");
        } finally{
            setSubmitting(false);
        }
    }
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-card rounded-2xl border border-border shadow-2xl w-full w-[calc(100%-2rem)] max-w-md animate-announce-card-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-5 py-4 border-b border-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                        size: 15,
                                        className: "text-subtle-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                        lineNumber: 104,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-sm font-semibold text-foreground",
                                        children: "Contact Us"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                        lineNumber: 105,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "p-1 text-subtle-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent",
                                "aria-label": "Close",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleSubmit,
                        className: "px-5 py-4 space-y-4",
                        children: [
                            (userName || userEmail) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-subtle-foreground",
                                children: [
                                    "Sending as ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium text-secondary-foreground",
                                        children: userName || userEmail
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                        lineNumber: 121,
                                        columnNumber: 26
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                ref: textareaRef,
                                value: message,
                                onChange: (e)=>setMessage(e.target.value),
                                placeholder: "How can we help? Share feedback, report a bug, or ask a question...",
                                rows: 5,
                                className: "w-full text-sm text-foreground bg-transparent border border-input-border rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none placeholder-subtle-foreground transition-all"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                lineNumber: 126,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: !message.trim() || submitting,
                                    className: "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                            lineNumber: 142,
                                            columnNumber: 15
                                        }, this),
                                        submitting ? "Sending..." : "Send"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                    lineNumber: 137,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                                lineNumber: 136,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-ssr] (ecmascript)");
;
/**
 * Guard: ensures the Realtime auth listener is registered exactly once.
 * createBrowserClient already returns a singleton, so this flag prevents
 * duplicate onAuthStateChange subscriptions across repeated createClient() calls.
 */ let realtimeAuthListenerRegistered = false;
function createClient() {
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://dcoowflhqsfggtmnzxfn.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb293ZmxocXNmZ2d0bW56eGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDIxOTgsImV4cCI6MjA4NjU3ODE5OH0.SV3ckwxHJUKP1Yr6VFtkg0GFdkYwEkXQwD6jgqC26V0"));
    if (!realtimeAuthListenerRegistered) {
        realtimeAuthListenerRegistered = true;
        client.auth.onAuthStateChange((event, session)=>{
            if ((event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.access_token) {
                client.realtime.setAuth(session.access_token);
            }
        });
    }
    return client;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/supabase/realtime-auth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureRealtimeAuth",
    ()=>ensureRealtimeAuth
]);
async function ensureRealtimeAuth(supabase) {
    try {
        // getSession() internally awaits initializePromise, so by the time it
        // returns the session has been restored from cookies (if available).
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            supabase.realtime.setAuth(session.access_token);
            return;
        }
        // Fallback: getUser() makes a server call which may trigger token refresh.
        // After it completes, getSession() should return the refreshed session.
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession?.access_token) {
                supabase.realtime.setAuth(retrySession.access_token);
            }
        }
    } catch (err) {
        console.error("[realtime-auth] ensureRealtimeAuth failed:", err);
    }
}
}),
"[project]/.claude/worktrees/claude-work/src/contexts/PresenceContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PresenceProvider",
    ()=>PresenceProvider,
    "usePresence",
    ()=>usePresence
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/realtime-auth.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const PresenceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function PresenceProvider({ children }) {
    const [onlineUsers, setOnlineUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentUserId, setCurrentUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentStatus, setCurrentStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("online");
    const channelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Cached user metadata for re-tracking on status change. */ const userMetaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const mounted = {
            current: true
        };
        let channel = null;
        async function joinPresence() {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ensureRealtimeAuth"])(supabase);
            if (!mounted.current) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !mounted.current) return;
            setCurrentUserId(user.id);
            userMetaRef.current = {
                id: user.id,
                name: user.user_metadata?.full_name ?? null,
                avatar: user.user_metadata?.avatar_url ?? null
            };
            // Use the actual user ID as presence key so each user gets a unique slot
            channel = supabase.channel("presence:global", {
                config: {
                    presence: {
                        key: user.id
                    }
                }
            });
            channel.on("presence", {
                event: "sync"
            }, ()=>{
                if (!channel) return;
                const state = channel.presenceState();
                const users = [];
                for (const key of Object.keys(state)){
                    const presences = state[key];
                    if (presences && presences.length > 0) {
                        users.push(presences[0]);
                    }
                }
                setOnlineUsers(users);
            });
            channel.subscribe(async (status)=>{
                if (status !== "SUBSCRIBED" || !mounted.current) return;
                await channel.track({
                    user_id: user.id,
                    user_name: user.user_metadata?.full_name ?? null,
                    user_avatar: user.user_metadata?.avatar_url ?? null,
                    online_at: new Date().toISOString(),
                    status: "online"
                });
            });
            channelRef.current = channel;
        }
        joinPresence();
        return ()=>{
            mounted.current = false;
            if (channel) {
                // Only untrack if the channel has finished subscribing
                if (channel.state === "joined") {
                    channel.untrack();
                }
                channel.unsubscribe();
            }
            channelRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const onlineUserIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>new Set(onlineUsers.map((u)=>u.user_id)), [
        onlineUsers
    ]);
    /** Derived map of user IDs to their status (defaults to "online" if absent). */ const userStatuses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        for (const u of onlineUsers){
            map.set(u.user_id, u.status ?? "online");
        }
        return map;
    }, [
        onlineUsers
    ]);
    /**
   * Updates the current user's status and re-tracks presence.
   *
   * @param status - The new status to broadcast
   */ const setStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((status)=>{
        setCurrentStatus(status);
        const ch = channelRef.current;
        const meta = userMetaRef.current;
        if (!ch || !meta) return;
        ch.track({
            user_id: meta.id,
            user_name: meta.name,
            user_avatar: meta.avatar,
            online_at: new Date().toISOString(),
            status
        });
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PresenceContext.Provider, {
        value: {
            onlineUsers,
            onlineUserIds,
            userStatuses,
            setStatus,
            currentUserId
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/contexts/PresenceContext.tsx",
        lineNumber: 154,
        columnNumber: 5
    }, this);
}
function usePresence() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PresenceContext);
    if (!ctx) {
        throw new Error("usePresence must be used within a PresenceProvider");
    }
    return ctx;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/nsfw-check.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Client-side NSFW image classification via server API.
 * Sends the image to /api/nsfw-check and returns the result.
 * Fail-open: on any error (network, server), images are treated as safe
 * so legitimate uploads are never blocked.
 *
 * @module nsfw-check
 */ /**
 * Result of NSFW classification for a single image.
 *
 * @property isSensitive - true if combined Porn + Hentai probability > 0.5
 * @property nsfwScore - Combined Porn + Hentai probability (0-1)
 * @property predictions - Raw nsfwjs prediction array
 */ __turbopack_context__.s([
    "classifyImage",
    ()=>classifyImage
]);
/** Safe fallback returned when classification fails (fail-open). */ const SAFE_FALLBACK = {
    isSensitive: false,
    nsfwScore: 0,
    predictions: []
};
async function classifyImage(file) {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/nsfw-check", {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            console.error(`[nsfw-check] Server returned ${response.status}, failing open`);
            return SAFE_FALLBACK;
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("[nsfw-check] Classification failed, failing open:", error);
        return SAFE_FALLBACK;
    }
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ImageCropModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Reusable image crop modal using react-easy-crop.
 * Displays a selected image with an interactive crop area.
 * Returns the cropped image as a Blob via onCrop callback.
 *
 * @param open - Whether the modal is visible
 * @param imageSrc - Object URL or data URL of the image to crop
 * @param aspect - Aspect ratio for crop area (e.g. 1 = square, 16/9). Default 1.
 * @param cropShape - "rect" or "round". Default "rect".
 * @param onCrop - Callback with the cropped Blob
 * @param onClose - Callback to close without cropping
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$easy$2d$crop$2f$index$2e$module$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-easy-crop/index.module.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
"use client";
;
;
;
;
;
/**
 * Creates a cropped image Blob from the source image and crop area.
 * Outputs at native resolution (no upscaling) to preserve sharpness.
 * Uses high-quality JPEG at 0.92 to balance quality and file size.
 *
 * @param imageSrc - Source image URL
 * @param pixelCrop - Pixel coordinates of the crop area from react-easy-crop
 * @returns Promise resolving to a high-quality JPEG Blob
 */ /** Minimum output width for banner crops — matches preset image quality. */ const MIN_BANNER_WIDTH = 1600;
async function getCroppedBlob(imageSrc, pixelCrop) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    await new Promise((resolve, reject)=>{
        image.onload = ()=>resolve();
        image.onerror = reject;
        image.src = imageSrc;
    });
    // Ensure minimum output width so banners stay sharp at full container width.
    // If the crop area is smaller than MIN_BANNER_WIDTH, scale up proportionally.
    let outW = pixelCrop.width;
    let outH = pixelCrop.height;
    if (outW < MIN_BANNER_WIDTH) {
        const scale = MIN_BANNER_WIDTH / outW;
        outW = MIN_BANNER_WIDTH;
        outH = Math.round(pixelCrop.height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outW, outH);
    return new Promise((resolve, reject)=>{
        canvas.toBlob((blob)=>blob ? resolve(blob) : reject(new Error("Blob creation failed")), "image/jpeg", 0.92);
    });
}
function ImageCropModal({ open, imageSrc, aspect = 1, cropShape = "rect", onCrop, onClose }) {
    const [crop, setCrop] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const [zoom, setZoom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const onCropComplete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((_, areaPixels)=>{
        setCroppedAreaPixels(areaPixels);
    }, []);
    /** Exports the cropped region and calls onCrop. */ async function handleSave() {
        if (!croppedAreaPixels) return;
        setSaving(true);
        try {
            const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
            onCrop(blob);
        } catch (err) {
            console.error("Crop failed:", err);
        } finally{
            setSaving(false);
        }
    }
    if (!open || typeof document === "undefined") return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[60] flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 animate-announce-backdrop-in",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-card rounded-2xl shadow-xl w-full w-[calc(100%-2rem)] max-w-sm animate-announce-card-in overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between p-4 border-b border-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-base font-semibold text-foreground",
                                children: "Crop Image"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                "aria-label": "Close",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                                    lineNumber: 140,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative w-full overflow-hidden bg-black",
                        style: {
                            height: 300
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$easy$2d$crop$2f$index$2e$module$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            image: imageSrc,
                            crop: crop,
                            zoom: zoom,
                            aspect: aspect || 4 / 3,
                            cropShape: cropShape,
                            onCropChange: setCrop,
                            onZoomChange: setZoom,
                            onCropComplete: onCropComplete,
                            style: {
                                containerStyle: {
                                    width: "100%",
                                    height: "100%"
                                }
                            }
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                            lineNumber: 146,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 px-6 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-muted-foreground",
                                children: "Zoom"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: 1,
                                max: 3,
                                step: 0.05,
                                value: zoom,
                                onChange: (e)=>setZoom(Number(e.target.value)),
                                className: "flex-1 h-1 accent-blue-500"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end gap-2 p-4 border-t border-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                                lineNumber: 177,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSave,
                                disabled: saving,
                                className: "px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50",
                                children: saving ? "Saving…" : "Crop & Save"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                                lineNumber: 183,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                        lineNumber: 176,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditProfileModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/camera.js [app-ssr] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$PresenceContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/PresenceContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$nsfw$2d$check$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/nsfw-check.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ImageCropModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
/** Status option config for the picker. */ const STATUS_OPTIONS = [
    {
        value: "online",
        label: "Online",
        color: "bg-green-500"
    },
    {
        value: "idle",
        label: "Idle",
        color: "bg-yellow-500"
    },
    {
        value: "dnd",
        label: "Do Not Disturb",
        color: "bg-red-500"
    }
];
function EditProfileModal({ open, onClose, avatarUrl, fullName, email }) {
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    const { userStatuses, setStatus, currentUserId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$PresenceContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePresence"])();
    const currentStatus = (currentUserId ? userStatuses.get(currentUserId) : undefined) ?? "online";
    const [closing, setClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [localAvatar, setLocalAvatar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(avatarUrl ?? null);
    const [nameInput, setNameInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(fullName ?? "");
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [savingName, setSavingName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [imgError, setImgError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const nameInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Sync props when modal opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (open) {
            setLocalAvatar(avatarUrl ?? null);
            setNameInput(fullName ?? "");
            setImgError(false);
            setClosing(false);
        }
    }, [
        open,
        avatarUrl,
        fullName
    ]);
    // Focus name input on open
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (open && nameInputRef.current) {
            setTimeout(()=>nameInputRef.current?.focus(), 150);
        }
    }, [
        open
    ]);
    /**
   * Animates the modal closed then calls onClose.
   */ const handleClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setClosing(true);
        setTimeout(()=>onClose(), 150);
    }, [
        onClose
    ]);
    // Close on Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        function handleKeyDown(e) {
            if (e.key === "Escape") handleClose();
        }
        document.addEventListener("keydown", handleKeyDown);
        return ()=>document.removeEventListener("keydown", handleKeyDown);
    }, [
        open,
        handleClose
    ]);
    /**
   * Returns a high-resolution version of an avatar URL.
   * Google avatar URLs default to 96px; this upgrades to 256px.
   *
   * @param url - Original avatar URL
   * @returns URL with upgraded resolution, or original if not Google
   */ function getHiResAvatar(url) {
        if (url.includes("googleusercontent.com")) {
            return url.replace(/=s\d+-c/, "=s256-c");
        }
        return url;
    }
    /**
   * Generates initials from name or email for the avatar fallback.
   *
   * @returns 1-2 character uppercase initials string
   */ function getInitials() {
        if (nameInput) {
            const parts = nameInput.split(" ").filter(Boolean);
            if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            if (parts.length === 1) return parts[0][0].toUpperCase();
        }
        if (email) return email[0].toUpperCase();
        return "?";
    }
    /**
   * Opens the crop modal after file selection.
   *
   * @param e - File input change event
   */ const [cropSrc, setCropSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast("File too large. Max 5 MB.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        setCropSrc(URL.createObjectURL(file));
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
    /**
   * Uploads a cropped avatar blob to /api/account/avatar.
   * Runs NSFW check, uploads, and syncs state.
   *
   * @param blob - Cropped image blob from ImageCropModal
   */ async function handleCroppedAvatar(blob) {
        setCropSrc(null);
        // NSFW check on the cropped blob
        const file = new File([
            blob
        ], "avatar.jpg", {
            type: blob.type
        });
        const nsfwResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$nsfw$2d$check$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["classifyImage"])(file);
        if (nsfwResult.isSensitive) {
            showToast("This image cannot be used as a profile photo.");
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/account/avatar", {
                method: "POST",
                body: formData
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                showToast(data.error || "Failed to upload photo.");
                return;
            }
            const { avatar_url } = await res.json();
            setLocalAvatar(avatar_url);
            setImgError(false);
            try {
                const cached = localStorage.getItem("caltodo_user_profile");
                if (cached) {
                    const profile = JSON.parse(cached);
                    profile.avatarUrl = avatar_url;
                    localStorage.setItem("caltodo_user_profile", JSON.stringify(profile));
                }
            } catch  {}
            window.dispatchEvent(new CustomEvent("profile-updated", {
                detail: {
                    avatarUrl: avatar_url
                }
            }));
            showToast("Profile photo updated.");
        } catch  {
            showToast("Failed to upload photo.");
        } finally{
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }
    /**
   * Saves the edited display name via PUT /api/account/name.
   * Updates local state, localStorage cache, and dispatches profile-updated event.
   */ async function handleSaveName() {
        const trimmed = nameInput.trim();
        if (!trimmed || trimmed === fullName) {
            handleClose();
            return;
        }
        setSavingName(true);
        try {
            const res = await fetch("/api/account/name", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: trimmed
                })
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                showToast(data.error || "Failed to update name.");
                return;
            }
            try {
                const cached = localStorage.getItem("caltodo_user_profile");
                if (cached) {
                    const profile = JSON.parse(cached);
                    profile.fullName = trimmed;
                    localStorage.setItem("caltodo_user_profile", JSON.stringify(profile));
                }
            } catch  {}
            window.dispatchEvent(new CustomEvent("profile-updated", {
                detail: {
                    fullName: trimmed
                }
            }));
            showToast("Name updated.");
            handleClose();
        } catch  {
            showToast("Failed to update name.");
        } finally{
            setSavingName(false);
        }
    }
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-150 ${closing ? "opacity-0" : "animate-announce-backdrop-in"}`,
        onClick: handleClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative bg-card rounded-2xl border border-border shadow-2xl w-[380px] max-w-[90vw] overflow-hidden transition-all duration-150 ${closing ? "scale-95 opacity-0" : "animate-announce-card-in"}`,
                onClick: (e)=>e.stopPropagation(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleClose,
                        className: "absolute top-3 right-3 z-10 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer",
                        "aria-label": "Close",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                            lineNumber: 265,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                        lineNumber: 260,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 pt-5 pb-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-base font-semibold text-foreground",
                            children: "Edit Profile"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                            lineNumber: 270,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                        lineNumber: 269,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center pb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>fileInputRef.current?.click(),
                                disabled: uploading,
                                className: "relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer disabled:cursor-wait",
                                title: "Change profile photo",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-muted"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                        lineNumber: 282,
                                        columnNumber: 13
                                    }, this),
                                    localAvatar && !imgError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: getHiResAvatar(localAvatar),
                                        alt: "Profile",
                                        className: "absolute inset-0 w-full h-full object-cover",
                                        referrerPolicy: "no-referrer",
                                        onError: ()=>setImgError(true)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                        lineNumber: 284,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-blue-500 flex items-center justify-center text-white text-3xl font-medium",
                                        children: getInitials()
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                        lineNumber: 292,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                                        children: uploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                            lineNumber: 298,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                                            size: 20,
                                            className: "text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                            lineNumber: 300,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                        lineNumber: 296,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                lineNumber: 275,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: fileInputRef,
                                type: "file",
                                accept: "image/jpeg,image/png,image/webp",
                                onChange: handleFileSelect,
                                className: "hidden"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                lineNumber: 304,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                        lineNumber: 274,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 pb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-muted-foreground mb-1 block",
                                children: "Display Name"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                lineNumber: 315,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: nameInputRef,
                                type: "text",
                                value: nameInput,
                                onChange: (e)=>setNameInput(e.target.value),
                                onKeyDown: (e)=>{
                                    if (e.key === "Enter") handleSaveName();
                                },
                                placeholder: "Enter your name",
                                maxLength: 100,
                                className: "w-full px-3 py-2 rounded-xl border border-input-border bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                lineNumber: 318,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                        lineNumber: 314,
                        columnNumber: 9
                    }, this),
                    email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 pb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-muted-foreground mb-1 block",
                                children: "Email"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                lineNumber: 335,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground truncate",
                                children: email
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                lineNumber: 338,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                        lineNumber: 334,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 pb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                                children: "Status"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                lineNumber: 344,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-1.5",
                                children: STATUS_OPTIONS.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setStatus(opt.value),
                                        className: `flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${currentStatus === opt.value ? "border-blue-500 bg-blue-500/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `w-2 h-2 rounded-full ${opt.color}`
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                                lineNumber: 359,
                                                columnNumber: 17
                                            }, this),
                                            opt.label
                                        ]
                                    }, opt.value, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                        lineNumber: 349,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                lineNumber: 347,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                        lineNumber: 343,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 pb-5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSaveName,
                            disabled: savingName,
                            className: "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-40 transition-all",
                            children: [
                                savingName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    size: 14,
                                    className: "animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                    lineNumber: 374,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                                    lineNumber: 376,
                                    columnNumber: 15
                                }, this),
                                "Save"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                            lineNumber: 368,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                        lineNumber: 367,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ImageCropModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: !!cropSrc,
                imageSrc: cropSrc || "",
                aspect: 1,
                cropShape: "round",
                onCrop: handleCroppedAvatar,
                onClose: ()=>{
                    if (cropSrc) URL.revokeObjectURL(cropSrc);
                    setCropSrc(null);
                }
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
                lineNumber: 382,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx",
        lineNumber: 247,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProfilePopup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-ssr] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ContactModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/ContactModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$EditProfileModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/EditProfileModal.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function ProfilePopup({ avatarUrl, fullName, email }) {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmSignOut, setConfirmSignOut] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [imgError, setImgError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showContact, setShowContact] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showEditProfile, setShowEditProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const popupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    // Close on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleClickOutside(e) {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setOpen(false);
                setConfirmSignOut(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return ()=>document.removeEventListener("mousedown", handleClickOutside);
    }, [
        open
    ]);
    // Reset confirm state when popup closes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) setConfirmSignOut(false);
    }, [
        open
    ]);
    /**
   * Generates initials from the user's full name.
   * Falls back to first letter of email or "?" if neither available.
   */ function getInitials() {
        if (fullName) {
            const parts = fullName.split(" ").filter(Boolean);
            if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            if (parts.length === 1) return parts[0][0].toUpperCase();
        }
        if (email) return email[0].toUpperCase();
        return "?";
    }
    const [signingOut, setSigningOut] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    async function handleSignOutClick() {
        if (!confirmSignOut) {
            setConfirmSignOut(true);
            return;
        }
        // Second click confirms
        setSigningOut(true);
        try {
            const res = await fetch("/auth/signout", {
                method: "POST"
            });
            if (!res.ok) {
                throw new Error(`Sign out failed (${res.status})`);
            }
            setOpen(false);
            setConfirmSignOut(false);
            router.push("/");
        } catch  {
            setSigningOut(false);
            setConfirmSignOut(false);
            alert("Failed to sign out. Please try again.");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: popupRef,
        className: "relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setOpen(!open),
                className: "w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all hover:ring-2 hover:ring-ring",
                "aria-label": "Profile menu",
                children: avatarUrl && !imgError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    src: avatarUrl,
                    alt: "Profile",
                    width: 36,
                    height: 36,
                    className: "w-full h-full object-cover",
                    referrerPolicy: "no-referrer",
                    onError: ()=>setImgError(true)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                    lineNumber: 101,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium",
                    children: getInitials()
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                    lineNumber: 111,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ContactModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: showContact,
                onClose: ()=>setShowContact(false),
                userName: fullName,
                userEmail: email
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$EditProfileModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: showEditProfile,
                onClose: ()=>setShowEditProfile(false),
                avatarUrl: avatarUrl,
                fullName: fullName,
                email: email
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-full left-0 mb-2 z-50 w-[min(256px,calc(100vw-16px))] bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3 border-b border-border",
                        children: [
                            fullName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-foreground truncate",
                                children: fullName
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                lineNumber: 142,
                                columnNumber: 15
                            }, this),
                            email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-subtle-foreground truncate",
                                children: email
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                lineNumber: 145,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                        lineNumber: 140,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setOpen(false);
                                    router.push("/app/profile");
                                },
                                className: "flex items-center gap-3 w-full px-4 py-3 text-sm text-secondary-foreground hover:bg-accent transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                        lineNumber: 158,
                                        columnNumber: 15
                                    }, this),
                                    "Profile"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                lineNumber: 151,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setOpen(false);
                                    router.push("/app/settings");
                                },
                                className: "flex items-center gap-3 w-full px-4 py-3 text-sm text-secondary-foreground hover:bg-accent transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                        lineNumber: 168,
                                        columnNumber: 15
                                    }, this),
                                    "Settings"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setOpen(false);
                                    setShowContact(true);
                                },
                                className: "flex items-center gap-3 w-full px-4 py-3 text-sm text-secondary-foreground hover:bg-accent transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                        lineNumber: 178,
                                        columnNumber: 15
                                    }, this),
                                    "Contact"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                lineNumber: 171,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSignOutClick,
                                disabled: signingOut,
                                className: `flex items-center gap-3 w-full px-4 py-3 text-sm rounded-b-xl transition-colors disabled:opacity-60 ${confirmSignOut ? "text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50" : "text-secondary-foreground hover:bg-accent"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                        lineNumber: 190,
                                        columnNumber: 15
                                    }, this),
                                    signingOut ? "Signing out..." : confirmSignOut ? "Click again to confirm" : "Sign Out"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
                lineNumber: 136,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useCalChatUnread.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCalChatUnread",
    ()=>useCalChatUnread
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const CACHE_KEY = "discussion_boards_cache_v2";
const MUTE_KEY_PREFIX = "calchat_muted_";
const READ_AT_PREFIX = "calchat_read_at_";
function useCalChatUnread() {
    const [unreadCount, setUnreadCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const check = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return;
            const entry = JSON.parse(raw);
            const boards = entry.boards ?? [];
            let count = 0;
            for (const board of boards){
                if (!board.last_message_at) continue;
                try {
                    if (localStorage.getItem(MUTE_KEY_PREFIX + board.course.id) === "true") continue;
                    const readAt = localStorage.getItem(READ_AT_PREFIX + board.course.id);
                    if (!readAt) {
                        count++;
                        continue;
                    }
                    if (new Date(board.last_message_at) > new Date(readAt)) count++;
                } catch  {
                // Storage unavailable for this board
                }
            }
            setUnreadCount(count);
        } catch  {
        // Storage unavailable
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        check();
        const interval = setInterval(check, 10_000);
        function handleStorage() {
            check();
        }
        function handleReadUpdate() {
            check();
        }
        window.addEventListener("storage", handleStorage);
        window.addEventListener("calchat-read-update", handleReadUpdate);
        return ()=>{
            clearInterval(interval);
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("calchat-read-update", handleReadUpdate);
        };
    }, [
        check
    ]);
    return unreadCount;
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useOnboardingStatus.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useOnboardingStatus",
    ()=>useOnboardingStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
/** SessionStorage key for caching onboarding status. */ const CACHE_KEY = "caltodo_onboarding_status";
/** Module-level cache so multiple consumers don't re-fetch in the same session. */ let moduleCached = null;
/**
 * Reads cached onboarding status from sessionStorage.
 *
 * @returns cached boolean or null if not present / expired
 */ function readCache() {
    if (moduleCached !== null) return moduleCached;
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        // Cache valid for 5 minutes
        if (Date.now() - entry.timestamp > 5 * 60_000) return null;
        return entry.completed;
    } catch  {
        return null;
    }
}
/**
 * Writes onboarding status to both module cache and sessionStorage.
 *
 * @param completed - Whether onboarding has been completed
 */ function writeCache(completed) {
    // Only cache `true` at module level — caching `false` causes stale reads
    // where non-skipCache consumers never re-fetch after onboarding completes.
    if (completed) {
        moduleCached = completed;
    }
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            completed,
            timestamp: Date.now()
        }));
    } catch  {
    /* non-critical */ }
}
function useOnboardingStatus(options) {
    const skipCache = options?.skipCache ?? false;
    const cached = skipCache ? null : readCache();
    const [completed, setCompleted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(cached ?? false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(cached === null);
    const fetchStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setLoading(true);
        fetch("/api/credentials").then((res)=>res.ok ? res.json() : null).then((data)=>{
            if (!data) return;
            const value = !!data.has_completed_onboarding;
            writeCache(value);
            setCompleted(value);
        }).catch(()=>{
        /* non-critical */ }).finally(()=>setLoading(false));
    }, []);
    // Fetch on mount if no cache (or skipCache forces fresh fetch)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (cached === null) {
            fetchStatus();
        }
    }, [
        cached,
        fetchStatus
    ]);
    // Listen for custom event dispatched after onboarding completion
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleChange(e) {
            const detail = e.detail;
            if (detail?.completed !== undefined) {
                const value = !!detail.completed;
                writeCache(value);
                setCompleted(value);
            }
        }
        window.addEventListener("onboarding-status-change", handleChange);
        return ()=>window.removeEventListener("onboarding-status-change", handleChange);
    }, []);
    return {
        hasCompletedOnboarding: completed,
        loading,
        refresh: fetchStatus
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useDismissedModals.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDismissedModals",
    ()=>useDismissedModals
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
/**
 * Maps server-side modal keys to their corresponding localStorage keys.
 * Maintains backward compatibility with existing localStorage dismiss state.
 */ const KEY_MAP = {
    sync_welcome: "caltodo_sync_dismissed",
    notes_welcome: "caltodo_notes_welcome_seen",
    gcal_announce: "caltodo_gcal_announce_seen",
    integrations_welcome: "caltodo_integrations_welcome_seen",
    calchat_welcome: "calchat_welcome_accepted",
    pensieve_announced: "caltodo_pensieve_announced",
    calchat_announcement: "calchat_announcement_seen"
};
/** Module-level cache so multiple hook consumers share state without re-fetching. */ let cachedModals = null;
/** Whether the module-level fetch has already been initiated this session. */ let fetchInitiated = false;
/**
 * Reads dismissed modal state from localStorage as a fast initial source.
 *
 * @returns DismissedModals populated from localStorage keys
 */ function readLocalStorage() {
    const result = {};
    try {
        for (const [key, lsKey] of Object.entries(KEY_MAP)){
            if (localStorage.getItem(lsKey) === "true") {
                result[key] = true;
            }
        }
    } catch  {
    /* non-critical */ }
    return result;
}
/**
 * Syncs server-side dismissed state to localStorage for fast subsequent reads.
 *
 * @param modals - The current dismissed modals state
 */ function syncToLocalStorage(modals) {
    try {
        for (const [key, lsKey] of Object.entries(KEY_MAP)){
            if (modals[key]) {
                localStorage.setItem(lsKey, "true");
            }
        }
    } catch  {
    /* non-critical */ }
}
function useDismissedModals() {
    const [modals, setModals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>cachedModals ?? readLocalStorage());
    const [loaded, setLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(cachedModals !== null);
    // Fetch server state once per session
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (cachedModals !== null) {
            setModals(cachedModals);
            setLoaded(true);
            return;
        }
        if (fetchInitiated) return;
        fetchInitiated = true;
        const localModals = readLocalStorage();
        fetch("/api/credentials").then((res)=>res.ok ? res.json() : null).then((data)=>{
            if (!data) return;
            const serverModals = data.dismissed_modals ?? {};
            // Merge: server wins, but also include any localStorage-only dismissals
            const merged = {
                ...localModals,
                ...serverModals
            };
            cachedModals = merged;
            setModals(merged);
            syncToLocalStorage(merged);
            setLoaded(true);
        }).catch(()=>{
            // On fetch failure, treat localStorage as source of truth
            cachedModals = localModals;
            setLoaded(true);
        });
    }, []);
    /**
   * Checks if a specific modal has been dismissed.
   *
   * @param key - The modal identifier from DismissedModals
   * @returns true if the modal has been dismissed
   */ const isDismissed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((key)=>{
        return !!modals[key];
    }, [
        modals
    ]);
    /**
   * Marks a modal as dismissed. Updates local state + localStorage immediately,
   * then persists the full state to the server (fire-and-forget).
   *
   * @param key - The modal identifier to dismiss
   */ const dismiss = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((key)=>{
        const updated = {
            ...modals,
            [key]: true
        };
        setModals(updated);
        cachedModals = updated;
        // Write to localStorage immediately for fast subsequent reads
        const lsKey = KEY_MAP[key];
        if (lsKey) {
            try {
                localStorage.setItem(lsKey, "true");
            } catch  {}
        }
        // Persist full state to server (fire-and-forget)
        fetch("/api/credentials", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                dismissed_modals: updated
            })
        }).catch(()=>{});
    }, [
        modals
    ]);
    /**
   * Marks all modals as dismissed. Used after onboarding completion.
   */ const dismissAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const all = {
            sync_welcome: true,
            notes_welcome: true,
            gcal_announce: true,
            integrations_welcome: true,
            calchat_welcome: true,
            pensieve_announced: true,
            calchat_announcement: true
        };
        setModals(all);
        cachedModals = all;
        syncToLocalStorage(all);
        fetch("/api/credentials", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                dismissed_modals: all
            })
        }).catch(()=>{});
    }, []);
    // Listen for reset event (Redo Setup in AdvancedSection)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleReset() {
            cachedModals = null;
            fetchInitiated = false;
            setModals({});
            // Clear localStorage dismiss keys
            try {
                for (const lsKey of Object.values(KEY_MAP)){
                    localStorage.removeItem(lsKey);
                }
            } catch  {}
        }
        window.addEventListener("caltodo-reset-modals", handleReset);
        return ()=>window.removeEventListener("caltodo-reset-modals", handleReset);
    }, []);
    return {
        isDismissed,
        dismiss,
        dismissAll,
        loaded
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/inbox.js [app-ssr] (ecmascript) <export default as Inbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-ssr] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarRange$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-range.js [app-ssr] (ecmascript) <export default as CalendarRange>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/settingsConfig.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$layout$2f$SidebarNavItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/layout/SidebarNavItem.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$layout$2f$ProfilePopup$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/layout/ProfilePopup.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCalChatUnread$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useCalChatUnread.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useOnboardingStatus.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDismissedModals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useDismissedModals.ts [app-ssr] (ecmascript)");
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
/** Filter configuration mapping for dynamic sidebar label. */ const FILTER_CONFIG = {
    all: {
        label: "Inbox",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"]
    },
    today: {
        label: "Today",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"]
    },
    "7days": {
        label: "Next 7 Days",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarRange$3e$__["CalendarRange"]
    }
};
function Sidebar({ avatarUrl, fullName, email }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { colorTheme, resolvedTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const isMiffy = colorTheme === "miffy";
    const isDark = resolvedTheme === "dark";
    const isSettings = pathname.startsWith("/app/settings");
    const [inboxFilter, setInboxFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all");
    // Local avatar/name state for reactive updates from profile changes
    const [localAvatarUrl, setLocalAvatarUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(avatarUrl);
    const [localFullName, setLocalFullName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(fullName);
    // Hydrate inbox filter from localStorage after mount to avoid SSR mismatch
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const saved = localStorage.getItem("inbox-filter");
            if (saved) setInboxFilter(saved);
        } catch  {}
    }, []);
    // Listen for profile updates dispatched from ProfileSection
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleProfileUpdate(e) {
            const detail = e.detail;
            if (detail?.avatarUrl !== undefined) setLocalAvatarUrl(detail.avatarUrl);
            if (detail?.fullName !== undefined) setLocalFullName(detail.fullName);
        }
        window.addEventListener("profile-updated", handleProfileUpdate);
        return ()=>window.removeEventListener("profile-updated", handleProfileUpdate);
    }, []);
    const hasCalChatUnread = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCalChatUnread$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCalChatUnread"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOnboardingStatus"])();
    // Track whether user has dismissed the notes welcome — server-persisted per account.
    // Only show "NEW" badge until the account has seen/dismissed the notes welcome modal.
    const { isDismissed: isModalDismissed, dismiss: dismissModal, loaded: modalsLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDismissedModals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDismissedModals"])();
    const notesIsNew = modalsLoaded && !isModalDismissed("notes_welcome");
    // Derive active settings section directly from URL search params (single source of truth)
    const sectionParam = searchParams.get("section");
    const activeSettingsSection = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SETTINGS_SECTIONS"].some((sec)=>sec.id === sectionParam) ? sectionParam : __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_SECTION"];
    // Cache user profile to localStorage so ProfileSection can read it
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            localStorage.setItem("caltodo_user_profile", JSON.stringify({
                email,
                fullName,
                avatarUrl
            }));
        } catch  {}
    }, [
        email,
        fullName,
        avatarUrl
    ]);
    // Listen for filter changes dispatched by InboxPage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleFilterChange(e) {
            setInboxFilter(e.detail);
        }
        window.addEventListener("inbox-filter-change", handleFilterChange);
        return ()=>window.removeEventListener("inbox-filter-change", handleFilterChange);
    }, []);
    // Hide navigation during onboarding to prevent users from navigating away
    if (pathname.startsWith("/app/onboarding")) return null;
    const inboxConfig = FILTER_CONFIG[inboxFilter] || FILTER_CONFIG.all;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "hidden md:flex glass-strong w-52 h-screen flex-col justify-between py-4 px-3 shrink-0 shadow-lg dark:shadow-black/30",
        style: {
            borderRight: colorTheme ? `1px solid var(--sidebar-border-color)` : undefined
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6 px-3 pt-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "/?landing=1",
                            className: "block hover:opacity-80 transition-opacity",
                            children: isMiffy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: isDark ? "/logo-miffy-dark.png" : "/logo-miffy.png",
                                alt: "caltodo",
                                className: "h-10 object-contain"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                lineNumber: 116,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: "/logo.png",
                                alt: "caltodo",
                                className: "h-10 dark:invert"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                lineNumber: 122,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this),
                    isSettings ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 px-3 py-2.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>router.push("/app/inbox"),
                                        className: "w-7 h-7 rounded-lg border border-border bg-white dark:bg-zinc-800 shadow-sm dark:shadow-none flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer active:scale-[0.95] shrink-0",
                                        title: "Back",
                                        "aria-label": "Back",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                            size: 16,
                                            className: "animate-[fadeIn_150ms_ease-out]"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                            lineNumber: 139,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                        lineNumber: 133,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium text-foreground animate-[fadeIn_150ms_ease-out]",
                                        children: "Settings"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                        lineNumber: 141,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                className: "border-border my-1"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SETTINGS_GROUPS"].map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-foreground/60",
                                            children: group
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                            lineNumber: 146,
                                            columnNumber: 17
                                        }, this),
                                        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SETTINGS_SECTIONS"].filter((s)=>s.group === group).map((section)=>{
                                            const Icon = section.icon;
                                            const isActive = activeSettingsSection === section.id;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    router.push(`/app/settings?section=${section.id}`);
                                                },
                                                className: `w-full cursor-pointer ${(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$layout$2f$SidebarNavItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["navItemClasses"])(isActive, isMiffy)}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                        size: 16,
                                                        className: "shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                                        lineNumber: 160,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: section.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                                        lineNumber: 161,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, section.id, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                                lineNumber: 153,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    ]
                                }, group, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                    lineNumber: 145,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                        lineNumber: 131,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        id: "tour-sidebar-nav",
                        className: "flex flex-col gap-1",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NAV_ITEMS"].map((item)=>{
                            const isInbox = item.href === "/app/inbox";
                            const isCalendar = item.href === "/app/calendar";
                            const isChat = item.href === "/app/discussions";
                            const isNotes = item.href === "/app/notes";
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$layout$2f$SidebarNavItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                label: isInbox ? inboxConfig.label : item.label,
                                href: item.href,
                                icon: isInbox ? inboxConfig.icon : item.icon,
                                badge: false,
                                badgeCount: isChat ? hasCalChatUnread : undefined,
                                badgeText: isNotes && notesIsNew ? "NEW" : undefined,
                                id: `tour-nav-${item.label.toLowerCase()}`,
                                imageSrc: undefined,
                                imageClassName: undefined,
                                onClick: isNotes && notesIsNew ? ()=>{
                                    dismissModal("notes_welcome");
                                } : undefined
                            }, item.href, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                                lineNumber: 176,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                        lineNumber: 169,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-2 flex flex-col gap-2",
                children: [
                    isMiffy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center pointer-events-none select-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/miffy/miffy-flowers.png",
                            alt: "",
                            className: "w-20 h-auto opacity-[0.35]",
                            draggable: false
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                            lineNumber: 200,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                        lineNumber: 199,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$layout$2f$ProfilePopup$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        avatarUrl: localAvatarUrl,
                        fullName: localFullName,
                        email: email
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                        lineNumber: 208,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
                lineNumber: 197,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/Sidebar.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/layout/MobileTabBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MobileTabBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-ssr] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/inbox.js [app-ssr] (ecmascript) <export default as Inbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-ssr] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sticky$2d$note$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StickyNote$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sticky-note.js [app-ssr] (ecmascript) <export default as StickyNote>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-ssr] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarRange$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-range.js [app-ssr] (ecmascript) <export default as CalendarRange>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCalChatUnread$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useCalChatUnread.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useOnboardingStatus.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function MobileTabBar() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [inboxFilter, setInboxFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all");
    const calChatUnreadCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCalChatUnread$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCalChatUnread"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOnboardingStatus"])();
    // Hydrate inbox filter from localStorage after mount to avoid SSR mismatch
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const saved = localStorage.getItem("inbox-filter");
            if (saved) setInboxFilter(saved);
        } catch  {}
    }, []);
    // Listen for filter changes dispatched by InboxPage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleFilterChange(e) {
            setInboxFilter(e.detail);
        }
        window.addEventListener("inbox-filter-change", handleFilterChange);
        return ()=>window.removeEventListener("inbox-filter-change", handleFilterChange);
    }, []);
    // Hide navigation during onboarding, settings, and inside a specific chat
    if (pathname.startsWith("/app/onboarding") || pathname.startsWith("/app/settings")) return null;
    if (pathname.match(/^\/app\/discussions\/[^/]+$/)) return null;
    /** Returns the appropriate inbox icon based on the active filter. */ function getInboxIcon() {
        switch(inboxFilter){
            case "today":
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"];
            case "7days":
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarRange$3e$__["CalendarRange"];
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"];
        }
    }
    /** Returns the inbox label based on the active filter. */ function getInboxLabel() {
        switch(inboxFilter){
            case "today":
                return "Today";
            case "7days":
                return "7 Days";
            default:
                return "Inbox";
        }
    }
    const InboxIcon = getInboxIcon();
    const tabs = [
        {
            label: "Home",
            href: "/app/home",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"],
            badge: false
        },
        {
            label: getInboxLabel(),
            href: "/app/inbox",
            icon: InboxIcon,
            badge: false
        },
        {
            label: "Calendar",
            href: "/app/calendar",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"],
            badge: false
        },
        {
            label: "Notes",
            href: "/app/notes",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sticky$2d$note$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StickyNote$3e$__["StickyNote"],
            badge: false
        },
        {
            label: "Chat",
            href: "/app/discussions",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
            badge: false,
            badgeCount: calChatUnreadCount
        },
        {
            label: "Settings",
            href: "/app/settings",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
            badge: false
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border shadow-[0_-1px_3px_rgba(0,0,0,0.08)] dark:shadow-black/30",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-around",
                style: {
                    paddingBottom: "env(safe-area-inset-bottom)"
                },
                children: tabs.map((tab)=>{
                    const isActive = pathname.startsWith(tab.href);
                    const Icon = tab.icon;
                    const isChat = tab.href === "/app/discussions";
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: tab.href,
                        onClick: undefined,
                        className: `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] flex-1 py-2 transition-colors relative ${isActive ? "text-blue-500" : "text-muted-foreground hover:text-foreground"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/MobileTabBar.tsx",
                                        lineNumber: 139,
                                        columnNumber: 17
                                    }, this),
                                    tab.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/MobileTabBar.tsx",
                                        lineNumber: 141,
                                        columnNumber: 19
                                    }, this),
                                    tab.badgeCount !== undefined && tab.badgeCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5",
                                        children: tab.badgeCount > 99 ? "99+" : tab.badgeCount
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/MobileTabBar.tsx",
                                        lineNumber: 144,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/MobileTabBar.tsx",
                                lineNumber: 138,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] mt-0.5 font-medium",
                                children: tab.label
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/MobileTabBar.tsx",
                                lineNumber: 149,
                                columnNumber: 15
                            }, this)
                        ]
                    }, tab.href, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/MobileTabBar.tsx",
                        lineNumber: 128,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/MobileTabBar.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/MobileTabBar.tsx",
            lineNumber: 118,
            columnNumber: 5
        }, this)
    }, void 0, false);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/repeat.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utility functions for computing repeating task dates and labels.
 */ __turbopack_context__.s([
    "computeNextDueDate",
    ()=>computeNextDueDate,
    "getRepeatLabel",
    ()=>getRepeatLabel,
    "shouldSpawnNext",
    ()=>shouldSpawnNext
]);
function computeNextDueDate(currentDueDate, interval, unit) {
    const date = new Date(currentDueDate + "T00:00:00");
    if (isNaN(date.getTime())) return currentDueDate;
    switch(unit){
        case "day":
            date.setDate(date.getDate() + interval);
            break;
        case "week":
            date.setDate(date.getDate() + interval * 7);
            break;
        case "month":
            {
                const targetMonth = date.getMonth() + interval;
                const originalDay = date.getDate();
                date.setMonth(targetMonth, 1);
                const maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                date.setDate(Math.min(originalDay, maxDay));
                break;
            }
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function getRepeatLabel(interval, unit) {
    if (interval === 1) {
        if (unit === "day") return "Daily";
        if (unit === "week") return "Weekly";
        if (unit === "month") return "Monthly";
    }
    if (interval === 2 && unit === "week") return "Biweekly";
    const unitPlural = interval === 1 ? unit : `${unit}s`;
    return `Every ${interval} ${unitPlural}`;
}
function shouldSpawnNext(nextDueDate, repeatEndDate, repeatEndCount) {
    // Check end date: next occurrence must not exceed the end date
    if (repeatEndDate) {
        if (nextDueDate > repeatEndDate) return false;
    }
    // Check end count: if count is 1 or less, this was the last occurrence
    // (count represents remaining occurrences including current; when current
    // is completed, count was already decremented before calling this)
    if (repeatEndCount !== null && repeatEndCount !== undefined) {
        if (repeatEndCount <= 1) return false;
    }
    return true;
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NEW_ASSIGNMENTS_EVENT",
    ()=>NEW_ASSIGNMENTS_EVENT,
    "default",
    ()=>NewAssignmentsModal,
    "showNewAssignmentsModal",
    ()=>showNewAssignmentsModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Modal that lists newly synced assignments.
 * Triggered via a "new-assignments-detected" custom DOM event from TaskContext.
 * Shows assignment titles, course names, due dates, and source platform.
 *
 * @module NewAssignmentsModal
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const NEW_ASSIGNMENTS_EVENT = "new-assignments-detected";
function showNewAssignmentsModal(taskIds) {
    window.dispatchEvent(new CustomEvent(NEW_ASSIGNMENTS_EVENT, {
        detail: {
            taskIds
        }
    }));
}
function NewAssignmentsModal() {
    const { tasks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const [taskIds, setTaskIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const open = taskIds.length > 0;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleEvent(e) {
            const detail = e.detail;
            if (detail.taskIds.length > 0) {
                setTaskIds(detail.taskIds);
            }
        }
        window.addEventListener(NEW_ASSIGNMENTS_EVENT, handleEvent);
        return ()=>window.removeEventListener(NEW_ASSIGNMENTS_EVENT, handleEvent);
    }, []);
    const handleClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setTaskIds([]), []);
    if (!open || typeof document === "undefined") return null;
    const newTasks = taskIds.map((id)=>tasks.find((t)=>t.id === id)).filter(Boolean);
    /**
   * Formats a due date string into a short readable format.
   *
   * @param dateStr - ISO date string or null
   * @returns Formatted date like "Mar 5" or "No due date"
   */ function formatDue(dateStr) {
        if (!dateStr) return "No due date";
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    }
    /** Maps source to a display label. */ function sourceLabel(source) {
        if (source === "canvas") return "bCourses";
        if (source === "gradescope") return "Gradescope";
        if (source === "pensieve") return "Pensive";
        return "";
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in",
                onClick: handleClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-popover rounded-2xl shadow-2xl border border-border w-full w-[calc(100%-2rem)] max-w-md animate-announce-card-in overflow-hidden max-h-[70vh] flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between p-4 border-b border-border shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-base font-semibold text-foreground",
                                children: [
                                    newTasks.length,
                                    " New Assignment",
                                    newTasks.length !== 1 ? "s" : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleClose,
                                className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                "aria-label": "Close",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                    lineNumber: 101,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "flex-1 overflow-y-auto divide-y divide-border",
                        children: newTasks.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "px-4 py-3 flex items-start gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium text-foreground truncate",
                                                children: task.title
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                                lineNumber: 110,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 mt-0.5",
                                                children: [
                                                    task.course_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-muted-foreground truncate",
                                                        children: task.course_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                                        lineNumber: 115,
                                                        columnNumber: 21
                                                    }, this),
                                                    task.source && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-muted-foreground/60",
                                                        children: sourceLabel(task.source)
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                                        lineNumber: 120,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                                lineNumber: 113,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                        lineNumber: 109,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 shrink-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-muted-foreground tabular-nums",
                                                children: formatDue(task.due_date)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                                lineNumber: 127,
                                                columnNumber: 17
                                            }, this),
                                            task.source_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: task.source_url,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                className: "text-muted-foreground hover:text-foreground transition-colors",
                                                onClick: (e)=>e.stopPropagation(),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                                lineNumber: 131,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                        lineNumber: 126,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, task.id, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                                lineNumber: 108,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end p-4 border-t border-border shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleClose,
                            className: "px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                            children: "Got it"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                            lineNumber: 148,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/gcal/read-sync-stream.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared NDJSON stream reader for the /api/gcal/initial-sync endpoint.
 * Used by both GoogleCalendarSettings (manual sync) and TaskContext (post-assignment sync).
 *
 * Reads newline-delimited JSON events from the response stream:
 *   {"type":"start","total":N}
 *   {"type":"progress","synced":N,"total":N}
 *   {"type":"done","synced":N,"total":N,"errors":[]}
 */ /** Result shape returned by the "done" event. */ __turbopack_context__.s([
    "readSyncStream",
    ()=>readSyncStream
]);
async function readSyncStream(response, callbacks) {
    const reader = response.body?.getReader();
    if (!reader) return null;
    const decoder = new TextDecoder();
    let buffer = "";
    let finalResult = null;
    while(true){
        const { done, value } = await reader.read();
        if (done) {
            buffer += decoder.decode();
            break;
        }
        buffer += decoder.decode(value, {
            stream: true
        });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines){
            if (!line.trim()) continue;
            try {
                const event = JSON.parse(line);
                if (event.type === "start" || event.type === "progress") {
                    callbacks.onProgress(event.synced ?? 0, event.total);
                } else if (event.type === "done") {
                    finalResult = event;
                    callbacks.onDone();
                }
            } catch  {}
        }
    }
    if (buffer.trim()) {
        try {
            const event = JSON.parse(buffer);
            if (event.type === "done") {
                finalResult = event;
                callbacks.onDone();
            }
        } catch  {}
    }
    return finalResult;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/sounds.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "playMessageReceived",
    ()=>playMessageReceived,
    "playMessageSent",
    ()=>playMessageSent,
    "playTaskComplete",
    ()=>playTaskComplete
]);
/**
 * Sound effects using the Web Audio API.
 * Synthesizes short, subtle tones without external audio files.
 * Includes task completion, chat send/receive sounds.
 */ let audioCtx = null;
/**
 * Returns a shared AudioContext, creating one lazily on first use.
 * Returns null if Web Audio is unavailable.
 *
 * @returns AudioContext instance or null
 */ function getAudioContext() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
/** Pre-decoded audio buffer for zero-latency playback via Web Audio API. */ let taskCompleteBuffer = null;
let bufferLoading = false;
/**
 * Fetches and decodes the task completion sound into a Web Audio buffer.
 * Called lazily on first play; subsequent plays are instant.
 */ async function ensureBuffer() {
    const ctx = getAudioContext();
    if (!ctx) return null;
    if (taskCompleteBuffer) return taskCompleteBuffer;
    if (bufferLoading) return null;
    bufferLoading = true;
    try {
        const res = await fetch("/sounds/task-complete.mp3");
        const arrayBuf = await res.arrayBuffer();
        taskCompleteBuffer = await ctx.decodeAudioData(arrayBuf);
        return taskCompleteBuffer;
    } catch  {
        bufferLoading = false;
        return null;
    }
}
// Kick off preload as soon as module is imported (non-blocking)
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
function playTaskComplete() {
    const ctx = getAudioContext();
    if (!ctx) return;
    function play() {
        if (!taskCompleteBuffer || !ctx) return;
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = taskCompleteBuffer;
        gain.gain.value = 0.5;
        source.connect(gain).connect(ctx.destination);
        source.start(0);
    }
    if (ctx.state === "suspended") {
        ctx.resume().then(play).catch(()=>{});
    } else {
        play();
    }
}
function playMessageSent() {
    const ctx = getAudioContext();
    if (!ctx) return;
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") {
        ctx.resume().catch(()=>{});
    }
    const now = ctx.currentTime;
    // First tone — lower pitch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1200, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);
    // Second tone — higher pitch, slight delay
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1500, now + 0.06);
    gain2.gain.setValueAtTime(0.08, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.15);
}
function playMessageReceived() {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
        ctx.resume().catch(()=>{});
    }
    const now = ctx.currentTime;
    // Three-note descending chime
    const notes = [
        1400,
        1100,
        1300
    ];
    const offsets = [
        0,
        0.08,
        0.16
    ];
    notes.forEach((freq, i)=>{
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + offsets[i]);
        gain.gain.setValueAtTime(0.06, now + offsets[i]);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + 0.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + offsets[i]);
        osc.stop(now + offsets[i] + 0.1);
    });
}
}),
"[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TaskProvider",
    ()=>TaskProvider,
    "useTaskContext",
    ()=>useTaskContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/undo-2.js [app-ssr] (ecmascript) <export default as Undo2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/analytics.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/repeat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$NewAssignmentsModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/NewAssignmentsModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2f$read$2d$sync$2d$stream$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/gcal/read-sync-stream.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sounds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/sounds.ts [app-ssr] (ecmascript)");
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
/** localStorage key and version for stale-while-revalidate task caching. */ const CACHE_KEY = "caltodo_tasks_cache";
const CACHE_VERSION = 1;
/**
 * Reads cached tasks from localStorage.
 * Returns null if cache is missing, corrupt, or version-mismatched.
 */ function getCachedTasks() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
/**
 * Writes tasks to localStorage cache.
 * Silently fails if localStorage is full or unavailable.
 */ function setCachedTasks(tasks) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
/** Clears the localStorage task cache. */ function clearCachedTasks() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
/** How often auto-sync runs in milliseconds (5 minutes). */ const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000;
/** Minimum time between auto-syncs to avoid rapid re-triggers (2 minutes). */ const AUTO_SYNC_COOLDOWN_MS = 2 * 60 * 1000;
const TaskContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function TaskProvider({ children }) {
    const { showToast, updateToastProgress } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    const [tasks, setTasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [syncing, setSyncing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [lastSyncedAt, setLastSyncedAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [syncResult, setSyncResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const hasCacheRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    // Hydrate from localStorage before first paint (useLayoutEffect runs synchronously
    // after DOM mutations but before the browser paints, eliminating the loading flash)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        const cached = getCachedTasks();
        if (cached) {
            setTasks(cached);
            setLoading(false);
            hasCacheRef.current = true;
        }
    }, []);
    /**
   * Ref holding the last successfully fetched task list.
   * Used as a reliable baseline for sync change detection instead of
   * the potentially-stale `tasks` state from React closures.
   */ const taskBaselineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    /**
   * Whether the initial fetchTasks has completed at least once.
   * Notifications are suppressed until this is true to avoid
   * false "new assignment" alerts on first load.
   */ const hasInitialFetchRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    /**
   * Syncs any tasks with due dates but no google_event_id to Google Calendar.
   * Called after assignment sync completes. Silently skips if GCal is not connected.
   *
   * @param signal - Optional AbortSignal for clean cancellation
   */ /**
   * Syncs unsynced tasks to GCal silently. Runs in the background without
   * toasts or banners — sync failures are not auth failures and shouldn't
   * prompt the user to reconnect. Only logs warnings on error.
   *
   * @param signal - Optional AbortSignal for clean cancellation
   */ const syncUnsyncedToGCal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (signal)=>{
        try {
            const checkRes = await fetch("/api/gcal/unsynced-count", {
                signal
            });
            if (!checkRes.ok) return;
            const checkData = await checkRes.json();
            if (!checkData.connected || checkData.count === 0) return;
            const syncRes = await fetch("/api/gcal/initial-sync", {
                method: "POST",
                signal
            });
            const contentType = syncRes.headers.get("Content-Type") ?? "";
            if (contentType.includes("application/json")) {
                // Silently consume JSON response — no toasts or banners
                await syncRes.json();
                return;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2f$read$2d$sync$2d$stream$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readSyncStream"])(syncRes, {
                onProgress: ()=>{},
                onDone: ()=>{}
            });
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return;
            console.warn("Post-sync GCal sync failed:", err);
        }
    }, []);
    const fetchTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        // Only show loading spinner if we have no cached data
        if (!hasCacheRef.current) {
            setLoading(true);
        }
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
        }
        const { data, error: fetchError } = await supabase.from("tasks").select("*").is("dismissed_at", null).order("created_at", {
            ascending: false
        });
        if (fetchError) {
            setError(fetchError.message);
            setLoading(false);
            return [];
        }
        const freshTasks = data ?? [];
        setTasks(freshTasks);
        setCachedTasks(freshTasks);
        taskBaselineRef.current = freshTasks;
        hasInitialFetchRef.current = true;
        setLoading(false);
        return freshTasks;
    }, []);
    const fetchLastSynced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const res = await fetch("/api/credentials");
            if (res.ok) {
                const creds = await res.json();
                setLastSyncedAt(creds.last_synced_at);
            }
        } catch  {
        // Non-critical, silently ignore
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchTasks();
        fetchLastSynced();
    }, [
        fetchTasks,
        fetchLastSynced
    ]);
    // Auto-sync: runs on initial load (if stale) and every 5 minutes.
    // Uses AbortController to cleanly cancel in-flight requests on unmount/re-render.
    // Suppresses notifications on first sync to avoid false positives from empty baseline.
    const lastAutoSyncRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const autoSyncAbortRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isFirstAutoSyncRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let mounted = true;
        const abortController = new AbortController();
        autoSyncAbortRef.current = abortController;
        /**
     * Runs sync silently if enough time has passed since the last sync.
     * Skips change detection on the first sync after mount.
     */ async function autoSync() {
            const now = Date.now();
            if (syncing || now - lastAutoSyncRef.current < AUTO_SYNC_COOLDOWN_MS) return;
            lastAutoSyncRef.current = now;
            const shouldNotify = !isFirstAutoSyncRef.current && hasInitialFetchRef.current;
            isFirstAutoSyncRef.current = false;
            try {
                const res = await fetch("/api/assignments/sync", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    }),
                    signal: abortController.signal
                });
                if (!mounted || abortController.signal.aborted) return;
                if (res.ok) {
                    const result = await res.json();
                    if (!mounted || abortController.signal.aborted) return;
                    setSyncResult(result);
                    setLastSyncedAt(result.last_synced_at);
                    const freshTasks = await fetchTasks();
                    if (!mounted || abortController.signal.aborted) return;
                    // Show a toast popup when new assignments are discovered
                    if (shouldNotify) {
                        const beforeIds = new Set(taskBaselineRef.current.map((t)=>t.id));
                        const newAssignments = freshTasks.filter((t)=>!beforeIds.has(t.id) && t.source);
                        if (newAssignments.length > 0) {
                            const ids = newAssignments.map((t)=>t.id);
                            const msg = newAssignments.length === 1 ? "1 new assignment found" : `${newAssignments.length} new assignments found`;
                            showToast(msg, {
                                action: {
                                    label: "View now",
                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx",
                                        lineNumber: 313,
                                        columnNumber: 25
                                    }, this),
                                    onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$NewAssignmentsModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["showNewAssignmentsModal"])(ids)
                                }
                            });
                        }
                    }
                    // Prompt user about new unselected Canvas courses (one-time per course, stored on account)
                    if (result.new_canvas_courses && result.new_canvas_courses.length > 0) {
                        // Fetch dismissed course IDs from credentials
                        let dismissedIds = [];
                        try {
                            const credCheck = await fetch("/api/credentials");
                            if (credCheck.ok) {
                                const credJson = await credCheck.json();
                                dismissedIds = credJson.dismissed_canvas_course_ids || [];
                            }
                        } catch  {}
                        const dismissed = new Set(dismissedIds);
                        const unprompted = result.new_canvas_courses.filter((c)=>!dismissed.has(c.id));
                        if (unprompted.length > 0) {
                            // Mark as dismissed so we never show again
                            const updatedDismissed = [
                                ...dismissedIds,
                                ...unprompted.map((c)=>c.id)
                            ];
                            fetch("/api/credentials", {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    dismissed_canvas_course_ids: updatedDismissed
                                })
                            });
                            const names = unprompted.map((c)=>c.name.replace(/\s*\(Spring 2026\)\s*/g, "").trim());
                            const msg = unprompted.length === 1 ? `New class detected: ${names[0]}` : `${unprompted.length} new classes detected`;
                            showToast(msg, {
                                action: {
                                    label: "Add",
                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx",
                                        lineNumber: 350,
                                        columnNumber: 25
                                    }, this),
                                    onClick: async ()=>{
                                        try {
                                            const credRes = await fetch("/api/credentials");
                                            if (!credRes.ok) return;
                                            const credData = await credRes.json();
                                            const current = credData.selected_canvas_courses || [];
                                            const updated = [
                                                ...current,
                                                ...unprompted
                                            ];
                                            await fetch("/api/credentials", {
                                                method: "PUT",
                                                headers: {
                                                    "Content-Type": "application/json"
                                                },
                                                body: JSON.stringify({
                                                    selected_canvas_courses: updated
                                                })
                                            });
                                            showToast(`Added ${unprompted.length} class${unprompted.length > 1 ? "es" : ""}. Syncing...`);
                                            fetch("/api/assignments/sync", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json"
                                                },
                                                body: JSON.stringify({
                                                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                                    platforms: [
                                                        "canvas"
                                                    ]
                                                })
                                            });
                                        } catch  {
                                            showToast("Failed to add classes. Try again in Settings.");
                                        }
                                    }
                                },
                                duration: 600000
                            });
                        }
                    }
                    // Sync any newly imported tasks (with due dates) to GCal
                    syncUnsyncedToGCal(abortController.signal);
                } else {
                    // Even if assignment sync fails, still sync any unsynced tasks to GCal
                    syncUnsyncedToGCal(abortController.signal);
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                // Silent failure for auto-sync — still try GCal sync
                syncUnsyncedToGCal(abortController.signal);
            }
        }
        // Auto-sync on mount after a short delay (let initial fetch finish first)
        const mountTimer = setTimeout(()=>autoSync(), 3000);
        // Set up periodic auto-sync
        const intervalTimer = setInterval(()=>autoSync(), AUTO_SYNC_INTERVAL_MS);
        return ()=>{
            mounted = false;
            clearTimeout(mountTimer);
            clearInterval(intervalTimer);
            abortController.abort();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        syncing,
        fetchTasks,
        syncUnsyncedToGCal
    ]);
    /**
   * Adds a task with optimistic UI: immediately shows in the list with a temp ID,
   * then replaces with the real record on Supabase success. Reverts on failure.
   */ async function addTask(taskData) {
        if (!userId) {
            setError("Not authenticated. Please sign in again.");
            return;
        }
        // Optimistic: create a temporary task object that appears instantly
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const optimisticTask = {
            id: tempId,
            user_id: userId,
            title: taskData.title,
            description: taskData.description ?? "",
            due_date: taskData.due_date ?? null,
            due_time: taskData.due_time ?? null,
            is_completed: false,
            color: taskData.color ?? "#3B82F6",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            source: null,
            external_id: null,
            course_name: taskData.course_name ?? null,
            source_url: null,
            points_possible: null,
            is_submitted: false,
            google_event_id: null,
            dismissed_at: null,
            repeat_interval: taskData.repeat_interval ?? null,
            repeat_unit: taskData.repeat_unit ?? null,
            repeat_end_date: taskData.repeat_end_date ?? null,
            repeat_end_count: taskData.repeat_end_count ?? null,
            late_due_date: null,
            completed_at: null,
            tags: taskData.tags ?? [],
            snoozed_until: null,
            sort_order: null,
            due_date_manually_edited_at: null,
            due_time_manually_edited_at: null
        };
        setTasks((prev)=>{
            const updated = [
                optimisticTask,
                ...prev
            ];
            setCachedTasks(updated);
            return updated;
        });
        setError(null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("task_created");
        // Separate invite emails from task columns before inserting
        const { inviteEmails, ...taskColumns } = taskData;
        // Persist to Supabase and replace temp with real record
        const { data, error: insertError } = await supabase.from("tasks").insert({
            ...taskColumns,
            user_id: userId
        }).select().single();
        if (insertError) {
            // Revert: remove the optimistic task
            setTasks((prev)=>{
                const reverted = prev.filter((t)=>t.id !== tempId);
                setCachedTasks(reverted);
                return reverted;
            });
            setError(insertError.message);
            return;
        }
        if (data) {
            // Replace optimistic task with real DB record
            setTasks((prev)=>{
                const updated = prev.map((t)=>t.id === tempId ? data : t);
                setCachedTasks(updated);
                // Keep baseline in sync so detectSyncChanges reflects local state
                taskBaselineRef.current = updated;
                return updated;
            });
            // Fire-and-forget: send invites if any emails were provided
            if (inviteEmails && inviteEmails.length > 0) {
                for (const email of inviteEmails){
                    fetch("/api/tasks/invite", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            taskId: data.id,
                            email
                        })
                    }).catch((err)=>{
                        console.warn("Task invite failed:", err);
                    });
                }
            }
        }
    }
    async function updateTask(id, updates) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("task_updated");
        // When the user manually edits due_date / due_time on a synced task,
        // stamp the corresponding manual-edit column so sync-engine.ts won't
        // overwrite the change on the next Gradescope/Canvas/etc. sync.
        // See migration 20260409000001 and upsertAssignments() for details.
        const stampedUpdates = {
            ...updates
        };
        const nowIso = new Date().toISOString();
        // Caller can pre-supply *_manually_edited_at to override the auto-stamp
        // (e.g. an Undo action restoring the previous lock state).
        if (Object.prototype.hasOwnProperty.call(updates, "due_date") && !Object.prototype.hasOwnProperty.call(updates, "due_date_manually_edited_at")) {
            stampedUpdates.due_date_manually_edited_at = nowIso;
        }
        if (Object.prototype.hasOwnProperty.call(updates, "due_time") && !Object.prototype.hasOwnProperty.call(updates, "due_time_manually_edited_at")) {
            stampedUpdates.due_time_manually_edited_at = nowIso;
        }
        setTasks((prev)=>{
            const updated = prev.map((t)=>t.id === id ? {
                    ...t,
                    ...stampedUpdates,
                    updated_at: new Date().toISOString()
                } : t);
            setCachedTasks(updated);
            // Keep baseline in sync so detectSyncChanges doesn't fire false
            // notifications for user-initiated changes (e.g. manual completion)
            taskBaselineRef.current = updated;
            return updated;
        });
        const { error: updateError } = await supabase.from("tasks").update(stampedUpdates).eq("id", id);
        if (updateError) {
            setError(updateError.message);
            fetchTasks();
        }
    }
    async function toggleComplete(id) {
        const task = tasks.find((t)=>t.id === id);
        if (!task) return;
        const willComplete = !task.is_completed;
        if (willComplete) (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sounds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playTaskComplete"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])(willComplete ? "task_completed" : "task_uncompleted");
        await updateTask(id, {
            is_completed: willComplete,
            completed_at: willComplete ? new Date().toISOString() : null
        });
        // Track spawned task info for undo cleanup
        let spawnedNextDueDate = null;
        // Spawn next occurrence for repeating tasks (with end condition checks)
        if (willComplete && task.repeat_interval && task.repeat_unit && task.due_date && !task.source) {
            const nextDueDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeNextDueDate"])(task.due_date, task.repeat_interval, task.repeat_unit);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$repeat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldSpawnNext"])(nextDueDate, task.repeat_end_date, task.repeat_end_count)) {
                spawnedNextDueDate = nextDueDate;
                // Decrement end count for the spawned task (if count-based end)
                const nextEndCount = task.repeat_end_count ? task.repeat_end_count - 1 : null;
                await addTask({
                    title: task.title,
                    description: task.description || undefined,
                    due_date: nextDueDate,
                    due_time: task.due_time,
                    color: task.color,
                    course_name: task.course_name || undefined,
                    tags: task.tags?.length ? task.tags : undefined,
                    repeat_interval: task.repeat_interval,
                    repeat_unit: task.repeat_unit,
                    repeat_end_date: task.repeat_end_date,
                    repeat_end_count: nextEndCount
                });
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("repeat_task_spawned");
            }
        }
        if (willComplete) {
            const taskTitle = task.title;
            const nextDate = spawnedNextDueDate;
            showToast("Task completed", {
                action: {
                    label: "Undo",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__["Undo2"], {
                        size: 14
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx",
                        lineNumber: 605,
                        columnNumber: 17
                    }, this),
                    onClick: ()=>{
                        updateTask(id, {
                            is_completed: false,
                            completed_at: null
                        });
                        // Clean up spawned repeat task if undo is clicked
                        if (nextDate) {
                            setTasks((prev)=>{
                                const spawned = prev.find((t)=>t.title === taskTitle && t.due_date === nextDate && !t.is_completed && t.id !== id);
                                if (!spawned) return prev;
                                // Hard-delete spawned task from DB (manual task, no sync concern)
                                supabase.from("tasks").delete().eq("id", spawned.id).then(()=>{});
                                const updated = prev.filter((t)=>t.id !== spawned.id);
                                setCachedTasks(updated);
                                return updated;
                            });
                        }
                    }
                }
            });
        }
    }
    /**
   * Snoozes a task by setting snoozed_until to a future timestamp.
   * Optimistically removes the task from the list immediately.
   *
   * @param id - Task ID to snooze
   * @param hours - Number of hours to hide the task
   */ async function snoozeTask(id, hours) {
        const snoozedUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("task_snoozed", {
            hours
        });
        await updateTask(id, {
            snoozed_until: snoozedUntil
        });
    }
    /**
   * Clears the snooze on a task so it reappears immediately.
   *
   * @param id - Task ID to unsnooze
   */ async function unsnoozeTask(id) {
        await updateTask(id, {
            snoozed_until: null
        });
    }
    /**
   * Batch-updates sort_order for multiple tasks to persist manual drag-to-reorder.
   * Optimistically updates local state and cache, then persists to Supabase.
   * On failure, reverts by re-fetching tasks from the server.
   *
   * @param updates - Array of { id, sort_order } pairs to apply
   */ async function reorderTasks(updates) {
        const orderMap = new Map(updates.map((u)=>[
                u.id,
                u.sort_order
            ]));
        // Optimistic update
        setTasks((prev)=>{
            const updated = prev.map((t)=>orderMap.has(t.id) ? {
                    ...t,
                    sort_order: orderMap.get(t.id)
                } : t);
            setCachedTasks(updated);
            taskBaselineRef.current = updated;
            return updated;
        });
        try {
            await Promise.all(updates.map((u)=>supabase.from("tasks").update({
                    sort_order: u.sort_order
                }).eq("id", u.id)));
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("reorderTasks failed, reconciling from server:", message);
            setError(message);
            fetchTasks();
        }
    }
    /**
   * Deletes a task. Synced tasks (with source + external_id) are soft-deleted
   * by setting dismissed_at so the sync engine won't resurrect them.
   * Manual tasks are hard-deleted since they can't be recreated by sync.
   */ async function deleteTask(id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("task_deleted");
        const taskToDelete = tasks.find((t)=>t.id === id);
        setTasks((prev)=>{
            const updated = prev.filter((t)=>t.id !== id);
            setCachedTasks(updated);
            // Keep baseline in sync so detectSyncChanges reflects local state
            taskBaselineRef.current = updated;
            return updated;
        });
        const isSyncedTask = taskToDelete?.source && taskToDelete?.external_id;
        const { error: deleteError } = isSyncedTask ? await supabase.from("tasks").update({
            dismissed_at: new Date().toISOString()
        }).eq("id", id) : await supabase.from("tasks").delete().eq("id", id);
        if (deleteError) {
            setError(deleteError.message);
            fetchTasks();
        }
    }
    /**
   * Hard-deletes all tasks from a specific integration source.
   * Permanently removes matching rows from Supabase.
   * Optimistically removes matching tasks from local state; reverts on failure.
   *
   * @param source - The integration source to delete tasks for ("canvas" | "gradescope" | "pensieve")
   */ async function deleteTasksBySource(source) {
        if (!userId) {
            setError("Not authenticated. Please sign in again.");
            return;
        }
        const previousTasks = [
            ...tasks
        ];
        const matchingIds = tasks.filter((t)=>t.source === source).map((t)=>t.id);
        if (matchingIds.length === 0) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("all_tasks_deleted");
        // Optimistic: remove matching tasks from local state
        setTasks((prev)=>{
            const updated = prev.filter((t)=>t.source !== source);
            setCachedTasks(updated);
            taskBaselineRef.current = updated;
            return updated;
        });
        // Hard-delete from Supabase
        const { error: deleteError } = await supabase.from("tasks").delete().eq("user_id", userId).eq("source", source);
        if (deleteError) {
            setError(deleteError.message);
            setTasks(previousTasks);
            setCachedTasks(previousTasks);
            fetchTasks();
        }
    }
    /**
   * Deletes all syllabus tasks matching a specific course_name.
   * Allows users to remove tasks from a single uploaded syllabus
   * without affecting tasks from other syllabus uploads.
   *
   * @param courseName - The course_name to match for deletion
   */ async function deleteSyllabusTasksByCourse(courseName) {
        if (!userId) {
            setError("Not authenticated. Please sign in again.");
            return;
        }
        const previousTasks = [
            ...tasks
        ];
        const matchingIds = tasks.filter((t)=>t.source === "syllabus" && t.course_name === courseName).map((t)=>t.id);
        if (matchingIds.length === 0) return;
        // Optimistic: remove matching tasks from local state
        setTasks((prev)=>{
            const updated = prev.filter((t)=>!(t.source === "syllabus" && t.course_name === courseName));
            setCachedTasks(updated);
            taskBaselineRef.current = updated;
            return updated;
        });
        // Hard-delete from Supabase
        const { error: deleteError } = await supabase.from("tasks").delete().eq("user_id", userId).eq("source", "syllabus").eq("course_name", courseName);
        if (deleteError) {
            setError(deleteError.message);
            setTasks(previousTasks);
            setCachedTasks(previousTasks);
            fetchTasks();
        }
    }
    /**
   * Deletes all Canvas tasks whose external_id starts with the given prefix.
   * Used for disconnect cleanup of additional Canvas accounts, where external_ids
   * are namespaced as "<account_id>:<assignment_id>".
   *
   * @param prefix - The external_id prefix to match (e.g. "canvas-abc123:")
   */ async function deleteTasksByExternalIdPrefix(prefix) {
        if (!userId) {
            setError("Not authenticated. Please sign in again.");
            return;
        }
        const matchingTasks = tasks.filter((t)=>t.source === "canvas" && t.external_id?.startsWith(prefix));
        if (matchingTasks.length === 0) return;
        const matchingIds = new Set(matchingTasks.map((t)=>t.id));
        const previousTasks = [
            ...tasks
        ];
        // Optimistic: remove matching tasks from local state
        setTasks((prev)=>{
            const updated = prev.filter((t)=>!matchingIds.has(t.id));
            setCachedTasks(updated);
            taskBaselineRef.current = updated;
            return updated;
        });
        // Hard-delete from Supabase (these are synced tasks but the account is being removed)
        const { error: deleteError } = await supabase.from("tasks").delete().eq("user_id", userId).eq("source", "canvas").like("external_id", `${prefix}%`);
        if (deleteError) {
            setError(deleteError.message);
            setTasks(previousTasks);
            setCachedTasks(previousTasks);
            fetchTasks();
        }
    }
    /**
   * Deletes all tasks whose course_name matches any of the given names.
   * Hard-deletes from Supabase and optimistically removes from local state.
   *
   * @param courseNames - Array of course name strings to match
   * @returns Number of tasks deleted (0 if none matched or on error)
   */ async function deleteTasksByCourseNames(courseNames) {
        if (!userId || courseNames.length === 0) return 0;
        const matchingTasks = tasks.filter((t)=>t.course_name && courseNames.includes(t.course_name));
        if (matchingTasks.length === 0) return 0;
        const count = matchingTasks.length;
        const matchingIds = new Set(matchingTasks.map((t)=>t.id));
        const previousTasks = [
            ...tasks
        ];
        // Optimistic: remove matching tasks from local state
        setTasks((prev)=>{
            const updated = prev.filter((t)=>!matchingIds.has(t.id));
            setCachedTasks(updated);
            taskBaselineRef.current = updated;
            return updated;
        });
        // Hard-delete from Supabase
        const { error: deleteError } = await supabase.from("tasks").delete().eq("user_id", userId).in("course_name", courseNames);
        if (deleteError) {
            setError(deleteError.message);
            setTasks(previousTasks);
            setCachedTasks(previousTasks);
            fetchTasks();
            return 0;
        }
        return count;
    }
    /**
   * Soft-hides tasks by setting dismissed_at for all tasks matching given course names.
   * Optimistically removes from local state; reverts on error.
   *
   * @param courseNames - Array of course name strings to match
   * @returns Number of tasks hidden (0 if none matched or on error)
   */ async function dismissTasksByCourseNames(courseNames) {
        if (!userId || courseNames.length === 0) return 0;
        const matchingTasks = tasks.filter((t)=>t.course_name && courseNames.includes(t.course_name));
        if (matchingTasks.length === 0) return 0;
        const count = matchingTasks.length;
        const matchingIds = new Set(matchingTasks.map((t)=>t.id));
        const previousTasks = [
            ...tasks
        ];
        // Optimistic: remove matching tasks from local state (they're "dismissed")
        setTasks((prev)=>{
            const updated = prev.filter((t)=>!matchingIds.has(t.id));
            setCachedTasks(updated);
            taskBaselineRef.current = updated;
            return updated;
        });
        const { error: dismissError } = await supabase.from("tasks").update({
            dismissed_at: new Date().toISOString()
        }).eq("user_id", userId).in("course_name", courseNames).is("dismissed_at", null);
        if (dismissError) {
            setError(dismissError.message);
            setTasks(previousTasks);
            setCachedTasks(previousTasks);
            fetchTasks();
            return 0;
        }
        return count;
    }
    /**
   * Un-hides tasks by clearing dismissed_at for all tasks matching given course names.
   * Re-fetches tasks from Supabase to restore them into local state.
   *
   * @param courseNames - Array of course name strings to match
   * @returns Number of tasks restored (0 if none matched or on error)
   */ async function undismissTasksByCourseNames(courseNames) {
        if (!userId || courseNames.length === 0) return 0;
        const { data, error: undismissError } = await supabase.from("tasks").update({
            dismissed_at: null
        }).eq("user_id", userId).in("course_name", courseNames).not("dismissed_at", "is", null).select("id");
        if (undismissError) {
            setError(undismissError.message);
            return 0;
        }
        const restoredCount = data?.length ?? 0;
        if (restoredCount > 0) {
            await fetchTasks();
        }
        return restoredCount;
    }
    /**
   * Bulk-imports syllabus-extracted assignments as tasks.
   * Generates external_id per task for dedup, upserts to Supabase with source="syllabus".
   *
   * @param syllabusTasks - Array of extracted assignment objects to import
   */ async function importSyllabusTasks(syllabusTasks, color) {
        if (!userId || syllabusTasks.length === 0) return;
        const rows = syllabusTasks.map((t)=>{
            // Generate a deterministic external_id for dedup
            const raw = `${t.title}|${t.due_date ?? ""}`;
            let hash = 0;
            for(let i = 0; i < raw.length; i++){
                hash = (hash << 5) - hash + raw.charCodeAt(i) | 0;
            }
            const externalId = `syllabus-${Math.abs(hash).toString(36)}`;
            return {
                user_id: userId,
                title: t.title,
                description: t.description ?? "",
                due_date: t.due_date ?? null,
                due_time: t.due_time ?? null,
                source: "syllabus",
                external_id: externalId,
                color: color ?? "#8B5CF6",
                course_name: t.course_name ?? null,
                points_possible: t.points_possible ?? null,
                is_completed: false,
                is_submitted: false
            };
        });
        // Optimistic: add to local state
        const optimisticTasks = rows.map((r)=>({
                ...r,
                id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                source_url: null,
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
            }));
        setTasks((prev)=>{
            const updated = [
                ...optimisticTasks,
                ...prev
            ];
            setCachedTasks(updated);
            return updated;
        });
        // Upsert to Supabase — conflict on (user_id, source, external_id)
        const { error: upsertError } = await supabase.from("tasks").upsert(rows, {
            onConflict: "user_id,source,external_id"
        });
        if (upsertError) {
            setError(upsertError.message);
        }
        // Reconcile from server to get real IDs
        await fetchTasks();
    }
    /**
   * Deletes all tasks for the current user.
   * Synced tasks are soft-deleted (dismissed_at set) to prevent sync resurrection.
   * Manual tasks are hard-deleted since they can't reappear.
   * Optimistically clears local state + cache; reverts on failure.
   */ async function deleteAllTasks() {
        if (!userId) {
            setError("Not authenticated. Please sign in again.");
            return;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("all_tasks_deleted");
        const previousTasks = [
            ...tasks
        ];
        setTasks([]);
        clearCachedTasks();
        taskBaselineRef.current = [];
        // Soft-delete synced tasks, hard-delete manual tasks (in parallel)
        const [softDeleteResult, hardDeleteResult] = await Promise.all([
            supabase.from("tasks").update({
                dismissed_at: new Date().toISOString()
            }).eq("user_id", userId).not("source", "is", null),
            supabase.from("tasks").delete().eq("user_id", userId).is("source", null)
        ]);
        const deleteError = softDeleteResult.error || hardDeleteResult.error;
        if (deleteError) {
            setError(deleteError.message);
            setTasks(previousTasks);
            setCachedTasks(previousTasks);
            fetchTasks();
        }
    }
    /**
   * Triggers a full sync from Canvas + Gradescope, then refreshes tasks.
   * Manages a simulated progress bar during the sync.
   */ async function triggerSync(courseOverrides, platforms) {
        // Abort any in-flight auto-sync to prevent race condition where both
        // auto-sync and manual sync update taskBaselineRef concurrently
        autoSyncAbortRef.current?.abort();
        setSyncing(true);
        setError(null);
        setSyncResult(null);
        showToast("Syncing assignments...", {
            duration: 60_000,
            progress: 0
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("sync_started");
        // Simulate progress: tick up to 90% while fetch is in-flight
        let currentProgress = 0;
        const progressInterval = setInterval(()=>{
            currentProgress = Math.min(currentProgress + 5, 90);
            updateToastProgress(currentProgress);
        }, 500);
        try {
            const res = await fetch("/api/assignments/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    ...courseOverrides,
                    ...platforms ? {
                        platforms
                    } : {}
                })
            });
            if (!res.ok) {
                const body = await res.json().catch(()=>({}));
                throw new Error(body.error || `Sync failed: ${res.status}`);
            }
            const result = await res.json();
            // Complete the progress bar before showing the result toast
            clearInterval(progressInterval);
            updateToastProgress(100);
            setSyncResult(result);
            setLastSyncedAt(result.last_synced_at);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("sync_completed", {
                added: result.canvas.synced + result.gradescope.synced + result.pensieve.synced,
                errors: result.canvas.errors.length + result.gradescope.errors.length + result.pensieve.errors.length
            });
            // Brief pause so the user sees 100% before the result toast replaces it
            await new Promise((r)=>setTimeout(r, 400));
            // Build and show sync result toast globally
            const parts = [];
            if (result.canvas.synced > 0) parts.push(`${result.canvas.synced} from bCourses`);
            if (result.gradescope.synced > 0) parts.push(`${result.gradescope.synced} from Gradescope`);
            if (result.pensieve.synced > 0) parts.push(`${result.pensieve.synced} from Pensieve`);
            const syncErrors = [
                ...result.canvas.errors,
                ...result.gradescope.errors,
                ...result.pensieve.errors
            ];
            let toastMsg = parts.length > 0 ? `Synced ${parts.join(", ")}. All tasks are up to date.` : "All tasks are up to date — no new assignments found.";
            if (syncErrors.length > 0) {
                toastMsg += ` ${syncErrors.map((m)=>m.replace(/Go to Settings to add them\.?/, "")).join(". ").trim()}`;
            }
            showToast(toastMsg, {
                duration: 8_000,
                action: {
                    label: "Inbox",
                    onClick: ()=>{
                        window.location.href = "/app/inbox";
                    }
                }
            });
            // Refresh tasks list after sync to include new assignments
            await fetchTasks();
            // Sync any newly imported tasks (with due dates) to GCal
            syncUnsyncedToGCal();
            // Notify IntegrationProvider to refresh credentials (updates Classes tab)
            window.dispatchEvent(new CustomEvent("credentials-changed"));
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trackEvent"])("sync_failed", {
                error: message
            });
            setError(message);
            clearInterval(progressInterval);
            showToast(`Sync failed: ${message}`, {
                duration: 6_000
            });
        } finally{
            clearInterval(progressInterval);
            setSyncing(false);
        }
    }
    /**
   * Distinct user-assigned tag names across all tasks (excludes course names).
   * Used to populate the tag picker dropdown.
   */ const availableTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const tagSet = new Set([
            "bCourses",
            "Canvas",
            "Gradescope",
            "Pensive"
        ]);
        for (const t of tasks){
            if (t.tags) {
                for (const tag of t.tags)tagSet.add(tag);
            }
        }
        return Array.from(tagSet).sort();
    }, [
        tasks
    ]);
    /** Distinct non-null course_name values across all tasks, sorted alphabetically. */ const availableCourses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const set = new Set();
        for (const t of tasks){
            if (t.course_name) set.add(t.course_name);
        }
        return Array.from(set).sort();
    }, [
        tasks
    ]);
    /** Maps each course_name to its most common task color. */ const courseColors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const counts = new Map();
        for (const t of tasks){
            if (!t.course_name) continue;
            if (!counts.has(t.course_name)) counts.set(t.course_name, new Map());
            const m = counts.get(t.course_name);
            m.set(t.color, (m.get(t.color) || 0) + 1);
        }
        const result = new Map();
        for (const [course, m] of counts){
            let best = "";
            let max = 0;
            for (const [c, n] of m){
                if (n > max) {
                    max = n;
                    best = c;
                }
            }
            if (best) result.set(course, best);
        }
        return result;
    }, [
        tasks
    ]);
    // Keep the latest method implementations in a ref so we can expose
    // stable-identity wrappers to consumers. Without this, the provider's value
    // object would change on every render (method closures are recreated each
    // render), causing every subscriber's memoized effects/callbacks to bust.
    const methodsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        addTask,
        updateTask,
        toggleComplete,
        deleteTask,
        deleteTasksBySource,
        deleteSyllabusTasksByCourse,
        importSyllabusTasks,
        deleteTasksByExternalIdPrefix,
        deleteTasksByCourseNames,
        dismissTasksByCourseNames,
        undismissTasksByCourseNames,
        deleteAllTasks,
        snoozeTask,
        unsnoozeTask,
        reorderTasks,
        triggerSync,
        fetchTasks
    });
    methodsRef.current = {
        addTask,
        updateTask,
        toggleComplete,
        deleteTask,
        deleteTasksBySource,
        deleteSyllabusTasksByCourse,
        importSyllabusTasks,
        deleteTasksByExternalIdPrefix,
        deleteTasksByCourseNames,
        dismissTasksByCourseNames,
        undismissTasksByCourseNames,
        deleteAllTasks,
        snoozeTask,
        unsnoozeTask,
        reorderTasks,
        triggerSync,
        fetchTasks
    };
    // Stable method wrappers — created once, always call the freshest impl via ref.
    const stableMethods = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            addTask: (...args)=>methodsRef.current.addTask(...args),
            updateTask: (...args)=>methodsRef.current.updateTask(...args),
            toggleComplete: (...args)=>methodsRef.current.toggleComplete(...args),
            deleteTask: (...args)=>methodsRef.current.deleteTask(...args),
            deleteTasksBySource: (...args)=>methodsRef.current.deleteTasksBySource(...args),
            deleteSyllabusTasksByCourse: (...args)=>methodsRef.current.deleteSyllabusTasksByCourse(...args),
            importSyllabusTasks: (...args)=>methodsRef.current.importSyllabusTasks(...args),
            deleteTasksByExternalIdPrefix: (...args)=>methodsRef.current.deleteTasksByExternalIdPrefix(...args),
            deleteTasksByCourseNames: (...args)=>methodsRef.current.deleteTasksByCourseNames(...args),
            dismissTasksByCourseNames: (...args)=>methodsRef.current.dismissTasksByCourseNames(...args),
            undismissTasksByCourseNames: (...args)=>methodsRef.current.undismissTasksByCourseNames(...args),
            deleteAllTasks: (...args)=>methodsRef.current.deleteAllTasks(...args),
            snoozeTask: (...args)=>methodsRef.current.snoozeTask(...args),
            unsnoozeTask: (...args)=>methodsRef.current.unsnoozeTask(...args),
            reorderTasks: (...args)=>methodsRef.current.reorderTasks(...args),
            triggerSync: (...args)=>methodsRef.current.triggerSync(...args),
            fetchTasks: (...args)=>methodsRef.current.fetchTasks(...args)
        }), []);
    // Memoize the full context value so subscribers only re-render when state
    // actually changes, not on every provider render.
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            tasks,
            loading,
            error,
            syncing,
            lastSyncedAt,
            syncResult,
            availableTags,
            availableCourses,
            courseColors,
            ...stableMethods
        }), [
        tasks,
        loading,
        error,
        syncing,
        lastSyncedAt,
        syncResult,
        availableTags,
        availableCourses,
        courseColors,
        stableMethods
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TaskContext.Provider, {
        value: contextValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx",
        lineNumber: 1326,
        columnNumber: 5
    }, this);
}
function useTaskContext() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(TaskContext);
    if (!ctx) {
        throw new Error("useTaskContext must be used within a TaskProvider");
    }
    return ctx;
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GETTING_STARTED_COMPLETE_EVENT",
    ()=>GETTING_STARTED_COMPLETE_EVENT,
    "default",
    ()=>GettingStartedWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/** localStorage keys for Getting Started widget state. */ const VISIBLE_KEY = "caltodo_getting_started_visible";
const COLLAPSED_KEY = "caltodo_getting_started_collapsed";
const GETTING_STARTED_COMPLETE_EVENT = "caltodo-getting-started-complete";
/**
 * Reads a boolean localStorage value safely.
 *
 * @param key - The localStorage key
 * @returns true if the stored value is "true", false otherwise
 */ function readFlag(key) {
    try {
        return localStorage.getItem(key) === "true";
    } catch  {
        return false;
    }
}
/**
 * Writes a boolean localStorage value safely.
 *
 * @param key - The localStorage key
 * @param value - The boolean value to store
 */ function writeFlag(key, value) {
    try {
        if (value) {
            localStorage.setItem(key, "true");
        } else {
            localStorage.removeItem(key);
        }
    } catch  {}
}
function GettingStartedWidget() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const tourDone = true; // Tour removed — always complete
    const { tasks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const [show, setShow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [entered, setEntered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [exiting, setExiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const exitingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Sync is done when any task has a source (synced from a platform)
    const syncDone = tasks.some((t)=>t.source !== null);
    // Initialize state from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const isVisible = readFlag(VISIBLE_KEY);
        setShow(isVisible);
        setCollapsed(readFlag(COLLAPSED_KEY));
        // If already visible from a previous session, skip entrance animation
        if (isVisible) setEntered(true);
    }, []);
    // Listen for custom event to show with entrance animation (from SyncClassesModal)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleShow() {
            setShow(true);
            setCollapsed(false);
            setEntered(false);
            setExiting(false);
            exitingRef.current = false;
            writeFlag(COLLAPSED_KEY, false);
            // Trigger entrance animation after a brief delay
            requestAnimationFrame(()=>{
                requestAnimationFrame(()=>setEntered(true));
            });
        }
        window.addEventListener("caltodo-show-getting-started", handleShow);
        return ()=>window.removeEventListener("caltodo-show-getting-started", handleShow);
    }, []);
    // Exit animation + hide when both items are done
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!syncDone || !tourDone || !show) return;
        if (exitingRef.current) return;
        // Wait 2s so user sees 2/2, then animate out
        const delayTimer = setTimeout(()=>{
            exitingRef.current = true;
            setExiting(true);
            // After exit animation completes, hide and notify
            const animTimer = setTimeout(()=>{
                setShow(false);
                setEntered(false);
                setExiting(false);
                writeFlag(VISIBLE_KEY, false);
                writeFlag(COLLAPSED_KEY, false);
                window.dispatchEvent(new CustomEvent(GETTING_STARTED_COMPLETE_EVENT));
            }, 400);
            return ()=>clearTimeout(animTimer);
        }, 2000);
        return ()=>clearTimeout(delayTimer);
    }, [
        syncDone,
        tourDone,
        show
    ]);
    /**
   * Toggles the collapsed state and persists it.
   */ const toggleCollapse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setCollapsed((prev)=>{
            const next = !prev;
            writeFlag(COLLAPSED_KEY, next);
            return next;
        });
    }, []);
    /**
   * Navigates to integrations settings when clicking the sync row.
   */ const handleSyncClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        router.push("/app/settings?section=integrations");
    }, [
        router
    ]);
    /**
   * Opens the tour start dialog so the user can choose to start or skip.
   * Dispatches the restart-tour event which TourTrigger listens for.
   */ const handleTourClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        try {
            localStorage.removeItem("caltodo_tour_completed");
            localStorage.removeItem("caltodo_tour_pending");
        } catch  {}
        window.dispatchEvent(new CustomEvent("caltodo-restart-tour"));
    }, []);
    // Hide on onboarding and discussions routes
    if (pathname?.startsWith("/app/onboarding") || pathname?.startsWith("/app/discussions")) {
        return null;
    }
    if (!show) return null;
    const doneCount = (syncDone ? 1 : 0) + (("TURBOPACK compile-time truthy", 1) ? 1 : "TURBOPACK unreachable");
    const progressPercent = doneCount / 2 * 100;
    // Entrance: slide up + fade in. Exit: slide down + fade out.
    const isVisible = entered && !exiting;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-20 right-4 z-50 md:bottom-8 md:right-8 w-[300px] md:w-[320px] transition-all duration-400 ease-out",
        style: {
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-2xl border border-border bg-popover shadow-lg overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: toggleCollapse,
                    className: "w-full flex items-center gap-2.5 px-5 py-3.5 hover:bg-muted/50 transition-colors",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                            lineNumber: 185,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-sm font-semibold text-foreground flex-1 text-left",
                            children: "getting started"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                            lineNumber: 186,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-muted-foreground mr-1",
                            children: [
                                doneCount,
                                "/2"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                            lineNumber: 189,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            size: 14,
                            className: `text-muted-foreground transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                            lineNumber: 192,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                    lineNumber: 180,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid transition-[grid-template-rows] duration-250 ease-out",
                    style: {
                        gridTemplateRows: collapsed ? "0fr" : "1fr"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-border"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: syncDone ? undefined : handleSyncClick,
                                disabled: syncDone,
                                className: "w-full flex items-start gap-3.5 px-5 py-4 text-left hover:bg-muted/60 transition-colors disabled:hover:bg-transparent",
                                style: {
                                    opacity: collapsed ? 0 : 1,
                                    transform: collapsed ? "translateY(-4px)" : "translateY(0)",
                                    transition: "opacity 200ms ease 50ms, transform 200ms ease 50ms"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `mt-0.5 w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${syncDone ? "bg-blue-500 border-blue-500 text-white" : "border-border"}`,
                                        children: syncDone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                            size: 13,
                                            strokeWidth: 3
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                            lineNumber: 226,
                                            columnNumber: 30
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                        lineNumber: 219,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-sm font-medium leading-snug ${syncDone ? "line-through text-muted-foreground" : "text-foreground"}`,
                                                children: "sync your classes"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                                lineNumber: 229,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                                children: "connect your class platforms to auto-import assignments"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                                lineNumber: 232,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                        lineNumber: 228,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                lineNumber: 208,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-border"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                lineNumber: 239,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ("TURBOPACK compile-time truthy", 1) ? undefined : "TURBOPACK unreachable",
                                disabled: tourDone,
                                className: "w-full flex items-start gap-3.5 px-5 py-4 text-left hover:bg-muted/60 transition-colors disabled:hover:bg-transparent",
                                style: {
                                    opacity: collapsed ? 0 : 1,
                                    transform: collapsed ? "translateY(-4px)" : "translateY(0)",
                                    transition: "opacity 200ms ease 100ms, transform 200ms ease 100ms"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `mt-0.5 w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${("TURBOPACK compile-time truthy", 1) ? "bg-blue-500 border-blue-500 text-white" : "TURBOPACK unreachable"}`,
                                        children: tourDone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                            size: 13,
                                            strokeWidth: 3
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                            lineNumber: 258,
                                            columnNumber: 30
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                        lineNumber: 251,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-sm font-medium leading-snug ${("TURBOPACK compile-time truthy", 1) ? "line-through text-muted-foreground" : "TURBOPACK unreachable"}`,
                                                children: "take a tour"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                                lineNumber: 261,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                                children: "learn how to use your inbox, calendar, and more"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                                lineNumber: 264,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                        lineNumber: 260,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                lineNumber: 240,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-5 pb-4 pt-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-1.5 rounded-full bg-muted overflow-hidden",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full rounded-full bg-blue-500 transition-all duration-500",
                                        style: {
                                            width: `${progressPercent}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                        lineNumber: 273,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                    lineNumber: 272,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                                lineNumber: 271,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
                    lineNumber: 201,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
            lineNumber: 178,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GettingStartedWidget.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CanvasTokenExpiredModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
"use client";
;
;
;
;
/** localStorage key to suppress modal for 24 hours after dismissal. */ const DISMISS_KEY = "caltodo_canvas_token_expired_dismissed";
/** Number of days before a Canvas token expires. */ const TOKEN_EXPIRY_DAYS = 120;
/** Number of hours to suppress modal after dismissal. */ const DISMISS_HOURS = 24;
/**
 * Checks if the user dismissed the modal within the last 24 hours.
 *
 * @returns true if modal should be suppressed
 */ function isDismissed() {
    try {
        const raw = localStorage.getItem(DISMISS_KEY);
        if (!raw) return false;
        const dismissedAt = Number(raw);
        return Date.now() - dismissedAt < DISMISS_HOURS * 60 * 60 * 1000;
    } catch  {
        return false;
    }
}
function CanvasTokenExpiredModal() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [show, setShow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isDismissed()) return;
        async function checkExpiration() {
            try {
                const res = await fetch("/api/credentials");
                if (!res.ok) return;
                const creds = await res.json();
                // Only show if user has a canvas token AND it has a creation date
                if (!creds.canvas_token || !creds.canvas_token_created_at) return;
                const createdAt = new Date(creds.canvas_token_created_at).getTime();
                const expiresAt = createdAt + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
                if (Date.now() > expiresAt) {
                    setShow(true);
                }
            } catch  {
            // Non-critical — silently skip
            }
        }
        checkExpiration();
    }, []);
    /**
   * Dismisses the modal and stores dismissal timestamp in localStorage.
   */ function handleDismiss() {
        setShow(false);
        try {
            localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch  {
        // non-critical
        }
    }
    if (!show) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-popover rounded-2xl border border-border shadow-2xl w-full w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center mb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            size: 24,
                            className: "text-amber-500"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
                            lineNumber: 88,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
                        lineNumber: 87,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-lg font-semibold text-foreground text-center mb-2",
                    children: "Your bCourses API key has expired"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
                    lineNumber: 92,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground text-center mb-6",
                    children: "bCourses API keys expire after 120 days. Please generate a new one in Settings to continue syncing assignments."
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                setShow(false);
                                router.push("/app/settings");
                            },
                            className: "w-full px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity",
                            children: "Go to Settings"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
                            lineNumber: 101,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleDismiss,
                            className: "w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
                            children: "Dismiss"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
                    lineNumber: 100,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
            lineNumber: 85,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CanvasTokenExpiredModal.tsx",
        lineNumber: 84,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/CalChatAnnouncementModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CalChatAnnouncementModal
]);
"use client";
function CalChatAnnouncementModal() {
    return null;
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SyncClassesModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useOnboardingStatus.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDismissedModals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useDismissedModals.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-ssr] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
"use client";
;
;
;
;
;
;
/** localStorage key to check if tour has already been completed. */ const TOUR_COMPLETED_KEY = "caltodo_tour_completed";
/** localStorage key for the Getting Started widget visibility. */ const GETTING_STARTED_VISIBLE_KEY = "caltodo_getting_started_visible";
function SyncClassesModal() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { hasCompletedOnboarding, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOnboardingStatus"])();
    const { isDismissed, dismiss, loaded: modalsLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDismissedModals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDismissedModals"])();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [exiting, setExiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [redoActive, setRedoActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [screen, setScreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    // Listen for redo-setup event — force-show the wizard on next inbox visit
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleReset() {
            setRedoActive(true);
        }
        window.addEventListener("caltodo-redo-setup", handleReset);
        return ()=>window.removeEventListener("caltodo-redo-setup", handleReset);
    }, []);
    // Dedicated redo path — bypasses all other checks for reliability
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!redoActive) return;
        if (!pathname?.startsWith("/app/inbox") && !pathname?.startsWith("/app/home")) return;
        const timer = setTimeout(()=>setVisible(true), 400);
        return ()=>clearTimeout(timer);
    }, [
        redoActive,
        pathname
    ]);
    // Standard show logic for first-time users (shows on /app/home or /app/inbox).
    // Waits for both the onboarding API and dismissed modals to load before deciding.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (redoActive) return; // redo has its own path
        if (!pathname?.startsWith("/app/inbox") && !pathname?.startsWith("/app/home")) return;
        if (loading || !modalsLoaded) return; // Wait for API before deciding
        if (hasCompletedOnboarding) {
            if (visible) setVisible(false);
            return;
        }
        if (isDismissed("sync_welcome")) return;
        try {
            if (localStorage.getItem(TOUR_COMPLETED_KEY) === "true") return;
        } catch  {
            return;
        }
        setVisible(true);
    }, [
        pathname,
        loading,
        hasCompletedOnboarding,
        redoActive,
        visible,
        modalsLoaded,
        isDismissed
    ]);
    /**
   * Closes the modal with exit animation, persists dismissal to server,
   * and shows the Getting Started widget.
   */ const closeAndShowWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        dismiss("sync_welcome");
        try {
            localStorage.removeItem("caltodo_redo_active");
            localStorage.setItem(GETTING_STARTED_VISIBLE_KEY, "true");
        } catch  {}
        setRedoActive(false);
        setExiting(true);
        setTimeout(()=>{
            setVisible(false);
            setExiting(false);
            setScreen(1);
            window.dispatchEvent(new CustomEvent("caltodo-show-getting-started"));
        }, 120);
    }, [
        dismiss
    ]);
    /**
   * Dismisses the modal, shows the widget, and navigates to integrations.
   */ const handleSyncClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        closeAndShowWidget();
        setTimeout(()=>router.push("/app/settings?section=integrations"), 150);
    }, [
        closeAndShowWidget,
        router
    ]);
    /**
   * Dismisses the modal, shows the widget, and starts the tour.
   */ const handleTourClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        closeAndShowWidget();
        setTimeout(()=>{
            try {
                localStorage.removeItem("caltodo_tour_completed");
                localStorage.removeItem("caltodo_tour_pending");
            } catch  {}
            window.dispatchEvent(new CustomEvent("caltodo-restart-tour"));
        }, 150);
    }, [
        closeAndShowWidget
    ]);
    /**
   * Closes the modal without showing the widget (backdrop click).
   */ const closeModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        dismiss("sync_welcome");
        try {
            localStorage.removeItem("caltodo_redo_active");
        } catch  {}
        setRedoActive(false);
        setExiting(true);
        setTimeout(()=>{
            setVisible(false);
            setExiting(false);
            setScreen(1);
        }, 120);
    }, [
        dismiss
    ]);
    if (!visible) return null;
    const backdropClass = exiting ? "animate-announce-backdrop-out" : "animate-announce-backdrop-in";
    const cardClass = exiting ? "animate-announce-card-out" : "animate-announce-card-in";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm ${backdropClass}`,
        onClick: closeModal,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-popover rounded-2xl shadow-2xl w-full w-[calc(100%-2rem)] max-w-md overflow-hidden ${cardClass}`,
            onClick: (e)=>e.stopPropagation(),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex transition-transform duration-400 ease-in-out",
                style: {
                    width: "200%",
                    transform: screen === 1 ? "translateX(0)" : "translateX(-50%)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-1/2 p-8 flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-center gap-2 mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-1 w-12 rounded-full bg-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-1 w-12 rounded-full bg-muted-foreground/25"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 168,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 flex flex-col items-center justify-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: "/logo.png",
                                            alt: "caltodo",
                                            className: "h-12 dark:invert"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                            lineNumber: 175,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 174,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold text-foreground mb-2 text-center",
                                        children: "welcome to caltodo"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 183,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-muted-foreground mb-10 leading-relaxed text-center max-w-[260px]",
                                        children: "your assignments, your schedule, your classmates — one place."
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 188,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setScreen(2),
                                        className: "px-8 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer active:scale-95",
                                        children: "next →"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 193,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                lineNumber: 172,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                        lineNumber: 164,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-1/2 p-8 flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setScreen(1),
                                        className: "p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg cursor-pointer",
                                        "aria-label": "Back",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                            size: 18
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                            lineNumber: 211,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 206,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-center gap-2 flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-1 w-12 rounded-full bg-muted-foreground/25"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                lineNumber: 214,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-1 w-12 rounded-full bg-foreground"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                lineNumber: 215,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 213,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-[26px]"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 218,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                lineNumber: 205,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-semibold text-foreground mb-2",
                                children: "get started"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                lineNumber: 222,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground mb-6 leading-relaxed",
                                children: "here's what you can do to make caltodo yours."
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                lineNumber: 227,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleSyncClick,
                                        className: "w-full flex items-start gap-3.5 py-4 border-t border-border text-left hover:bg-accent -mx-2 px-2 rounded-lg transition-colors cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                size: 18,
                                                className: "text-foreground shrink-0 mt-0.5"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                lineNumber: 239,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-medium text-foreground",
                                                        children: "sync your classes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                        lineNumber: 241,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                                        children: "connect bCourses, Gradescope, or Pensive to import assignments"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                        lineNumber: 242,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                lineNumber: 240,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 234,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: closeAndShowWidget,
                                        className: "w-full flex items-start gap-3.5 py-4 border-t border-border text-left hover:bg-accent -mx-2 px-2 rounded-lg transition-colors cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                                size: 18,
                                                className: "text-foreground shrink-0 mt-0.5"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                lineNumber: 254,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-medium text-foreground",
                                                        children: "chat with classmates"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                        lineNumber: 256,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                                        children: "discuss assignments and share notes in class threads"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                        lineNumber: 257,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                                lineNumber: 255,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                        lineNumber: 249,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                lineNumber: 232,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: closeAndShowWidget,
                                    className: "px-8 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer active:scale-95",
                                    children: "start organizing →"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                    lineNumber: 267,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                                lineNumber: 266,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
                lineNumber: 156,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
            lineNumber: 151,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SyncClassesModal.tsx",
        lineNumber: 147,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/calchat-cache.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateBoardCacheTimestamp",
    ()=>updateBoardCacheTimestamp
]);
/**
 * CalChat cache utility.
 * Updates the board-level `last_message_at` timestamp in sessionStorage
 * so the unread badge re-counts immediately when a new message arrives.
 *
 * @module calchat-cache
 */ /** SessionStorage key shared with useDiscussionBoards and GlobalChatNotifier. */ const DEFAULT_CACHE_KEY = "discussion_boards_cache_v2";
function updateBoardCacheTimestamp(courseId, cacheKey = DEFAULT_CACHE_KEY) {
    try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
            const entry = JSON.parse(raw);
            const boards = entry.boards ?? [];
            let updated = false;
            for (const board of boards){
                if (board.course.id === courseId) {
                    board.last_message_at = new Date().toISOString();
                    updated = true;
                    break;
                }
            }
            if (updated) {
                sessionStorage.setItem(cacheKey, JSON.stringify(entry));
            }
        }
    } catch  {
    /* sessionStorage unavailable or corrupt JSON — safe to ignore */ }
    // Always dispatch the event so listeners re-check, even if storage failed
    try {
        window.dispatchEvent(new CustomEvent("calchat-read-update", {
            detail: {
                courseId
            }
        }));
    } catch  {
    /* window/CustomEvent unavailable (SSR edge case) */ }
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GlobalChatNotifier
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/realtime-auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sounds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/sounds.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$calchat$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/calchat-cache.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-ssr] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
"use client";
;
;
;
;
;
;
;
;
/** SessionStorage key shared with useDiscussionBoards for board cache. */ const CACHE_KEY = "discussion_boards_cache_v2";
/** localStorage prefix for per-course mute state. */ const MUTE_KEY_PREFIX = "calchat_muted_";
/** localStorage prefix for last-sent timestamp (set by useCourseChat). */ const SENT_KEY_PREFIX = "calchat_last_sent_";
/** Window in ms to suppress notifications after the user sends a message. */ const SELF_SEND_COOLDOWN_MS = 5000;
/** How long the banner stays visible before auto-dismissing (ms). */ const BANNER_DURATION = 4000;
/**
 * Reads the user's enrolled course IDs from the discussion boards sessionStorage cache.
 *
 * @returns Array of cached board objects with course info
 */ function getCourseIdsFromCache() {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return [];
        const entry = JSON.parse(raw);
        return entry.boards ?? [];
    } catch  {
        return [];
    }
}
let notifIdCounter = 0;
function GlobalChatNotifier() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathnameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(pathname);
    pathnameRef.current = pathname;
    const channelsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const subscribedIdsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const userIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    /**
   * Shows an in-app notification banner for an incoming chat message.
   * Auto-dismisses after BANNER_DURATION ms with an exit animation.
   *
   * @param senderName - Display name of the message sender
   * @param courseName - Name of the course/chat
   * @param courseId - Course UUID for navigation
   * @param body - Message body text
   */ const showNotification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((senderName, courseName, courseId, body)=>{
        const id = ++notifIdCounter;
        const truncatedBody = body.length > 80 ? body.slice(0, 80) + "..." : body;
        setNotifications((prev)=>[
                ...prev,
                {
                    id,
                    senderName,
                    courseName,
                    courseId,
                    body: truncatedBody,
                    exiting: false
                }
            ]);
        // Auto-dismiss after duration
        setTimeout(()=>{
            setNotifications((prev)=>prev.map((n)=>n.id === id ? {
                        ...n,
                        exiting: true
                    } : n));
            setTimeout(()=>{
                setNotifications((prev)=>prev.filter((n)=>n.id !== id));
            }, 300);
        }, BANNER_DURATION);
    }, []);
    /**
   * Manually dismisses a notification banner with exit animation.
   *
   * @param id - Notification ID to dismiss
   */ const dismissNotification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setNotifications((prev)=>prev.map((n)=>n.id === id ? {
                    ...n,
                    exiting: true
                } : n));
        setTimeout(()=>{
            setNotifications((prev)=>prev.filter((n)=>n.id !== id));
        }, 300);
    }, []);
    /**
   * Navigates to the chat for a notification and dismisses it.
   *
   * @param notif - The notification to act on
   */ const handleNotificationClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((notif)=>{
        dismissNotification(notif.id);
        router.push(`/app/discussions/${notif.courseId}?name=${encodeURIComponent(notif.courseName)}`);
    }, [
        dismissNotification,
        router
    ]);
    /**
   * Subscribes to realtime INSERT events for a set of course IDs.
   * Only creates new subscriptions for courses not already subscribed.
   *
   * @param boards - Array of cached board objects with course info
   * @param supabase - Supabase client instance
   */ const subscribeToBoards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (boards, supabase)=>{
        // Ensure Realtime carries the user's JWT before subscribing,
        // otherwise RLS blocks all postgres_changes events.
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ensureRealtimeAuth"])(supabase);
        for (const board of boards){
            const courseId = board.course.id;
            if (subscribedIdsRef.current.has(courseId)) continue;
            const channel = supabase.channel(`global-notif:${courseId}`);
            channel.on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "chat_messages",
                filter: `course_id=eq.${courseId}`
            }, (payload)=>{
                const msg = payload.new;
                // Skip if user ID not yet resolved (defense-in-depth against race)
                if (!userIdRef.current) return;
                // Skip own messages
                if (msg.author_id === userIdRef.current) return;
                // Secondary defense: skip if user recently sent a message to this
                // course. Covers the edge case where the Realtime event arrives
                // after a quick page navigation changes the pathname but before
                // the author_id filter can catch it (e.g. latency / anonymous ID).
                try {
                    const lastSent = parseInt(localStorage.getItem(SENT_KEY_PREFIX + courseId) || "0");
                    if (Date.now() - lastSent < SELF_SEND_COOLDOWN_MS) return;
                } catch  {
                /* localStorage unavailable */ }
                // Skip if currently viewing this specific chat
                if (pathnameRef.current.includes(courseId)) return;
                // Skip if muted
                try {
                    if (localStorage.getItem(MUTE_KEY_PREFIX + courseId) === "true") return;
                } catch  {}
                // Update board cache so unread badge increments immediately
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$calchat$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateBoardCacheTimestamp"])(courseId, CACHE_KEY);
                // Play receive sound
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sounds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playMessageReceived"])();
                // Show in-app notification banner
                const senderLabel = msg.author_name ?? "Anonymous";
                const courseName = board.course.name ?? "Chat";
                showNotification(senderLabel, courseName, courseId, msg.body);
            });
            channel.subscribe();
            channelsRef.current.push(channel);
            subscribedIdsRef.current.add(courseId);
        }
    }, [
        showNotification
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
        // Get current user ID before subscribing — prevents race condition where
        // Realtime events arrive before userIdRef is set, causing own messages
        // to trigger notification banners.
        supabase.auth.getUser().then(({ data })=>{
            userIdRef.current = data.user?.id ?? null;
            const boards = getCourseIdsFromCache();
            if (boards.length > 0) {
                subscribeToBoards(boards, supabase);
            }
        });
        // Re-check cache periodically for newly joined courses
        const interval = setInterval(()=>{
            const latest = getCourseIdsFromCache();
            if (latest.length > subscribedIdsRef.current.size) {
                subscribeToBoards(latest, supabase);
            }
        }, 15_000);
        return ()=>{
            clearInterval(interval);
            channelsRef.current.forEach((ch)=>ch.unsubscribe());
            channelsRef.current = [];
            subscribedIdsRef.current.clear();
        };
    }, [
        subscribeToBoards
    ]);
    if (notifications.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-4 right-4 z-[10002] flex flex-col gap-2 pointer-events-none",
        children: notifications.map((notif)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `pointer-events-auto max-w-sm w-80 rounded-2xl shadow-lg border border-border bg-popover backdrop-blur-sm cursor-pointer transition-all duration-300 ${notif.exiting ? "opacity-0 -translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100 animate-chat-notif-in"}`,
                onClick: ()=>handleNotificationClick(notif),
                role: "button",
                tabIndex: 0,
                onKeyDown: (e)=>{
                    if (e.key === "Enter") handleNotificationClick(notif);
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-3 p-3.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-9 h-9 rounded-full bg-green-500/15 dark:bg-green-400/15 flex items-center justify-center shrink-0 mt-0.5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                size: 18,
                                className: "text-green-500 dark:text-green-400"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                                lineNumber: 270,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                            lineNumber: 269,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-semibold text-foreground truncate",
                                            children: notif.senderName
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                                            lineNumber: 276,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] text-muted-foreground shrink-0",
                                            children: "now"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                                            lineNumber: 279,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                                    lineNumber: 275,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] text-muted-foreground font-medium truncate",
                                    children: notif.courseName
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                                    lineNumber: 283,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-secondary-foreground mt-0.5 line-clamp-2 leading-relaxed",
                                    children: notif.body
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                                    lineNumber: 286,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                            lineNumber: 274,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: (e)=>{
                                e.stopPropagation();
                                dismissNotification(notif.id);
                            },
                            className: "w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0",
                            "aria-label": "Dismiss notification",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 14,
                                className: "text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                                lineNumber: 301,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                            lineNumber: 292,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                    lineNumber: 267,
                    columnNumber: 11
                }, this)
            }, notif.id, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
                lineNumber: 253,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/GlobalChatNotifier.tsx",
        lineNumber: 251,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/PostHogIdentify.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PostHogIdentify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$dist$2f$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/posthog-js/dist/module.js [app-ssr] (ecmascript)");
"use client";
;
;
function PostHogIdentify({ userId, email, fullName }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!userId) return;
        // Exclude the app owner from analytics to avoid skewing results.
        // Hardcoded because ADMIN_EMAIL is a server-side env var unavailable on the client.
        if (email === "cadenchiang@berkeley.edu") {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$dist$2f$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].opt_out_capturing();
            return;
        }
        // Users without an email haven't completed sign-up — skip tracking
        if (!email) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$dist$2f$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].identify(userId, {
                userId,
                $name: "Didn't sign up"
            });
            return;
        }
        const properties = {
            userId,
            email,
            $email: email
        };
        if (fullName) {
            properties.$name = fullName;
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$dist$2f$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].identify(email, properties);
    }, [
        userId,
        email,
        fullName
    ]);
    return null;
}
}),
"[project]/.claude/worktrees/claude-work/src/components/PostHogPageView.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PostHogPageView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/posthog-js/react/dist/esm/index.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/**
 * Captures a PostHog `$pageview` event on every client-side navigation.
 * Next.js App Router performs SPA navigations that don't trigger the
 * browser's native pageview, so this component listens to pathname and
 * search-param changes and fires the event manually.
 *
 * Must be rendered inside <PostHogProvider> and wrapped in <Suspense>
 * because useSearchParams() requires it in App Router.
 */ function PostHogPageViewInner() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const posthog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePostHog"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (pathname && posthog) {
            let url = window.origin + pathname;
            const search = searchParams.toString();
            if (search) {
                url += "?" + search;
            }
            posthog.capture("$pageview", {
                $current_url: url
            });
        }
    }, [
        pathname,
        searchParams,
        posthog
    ]);
    return null;
}
function PostHogPageView() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: null,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PostHogPageViewInner, {}, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/PostHogPageView.tsx",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/PostHogPageView.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_claude_worktrees_claude-work_src_ea6df133._.js.map