(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/hooks/useDiscussionBoards.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDiscussionBoards",
    ()=>useDiscussionBoards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
const CACHE_KEY = "discussion_boards_cache_v2";
const CACHE_TTL_MS = 60_000; // 1 minute
/**
 * Reads cached boards from sessionStorage.
 * Returns null if cache is missing or expired.
 */ function readCache() {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
        return entry.boards;
    } catch  {
        return null;
    }
}
/**
 * Writes boards to sessionStorage cache.
 */ function writeCache(boards) {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            boards,
            timestamp: Date.now()
        }));
    } catch  {}
}
function useDiscussionBoards() {
    _s();
    // Always start with loading=true to match server render (no sessionStorage on server)
    const [boards, setBoards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchBoards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDiscussionBoards.useCallback[fetchBoards]": async ()=>{
            setError(null);
            try {
                const res = await fetch("/api/discussions/boards");
                if (!res.ok) {
                    const data = await res.json().catch({
                        "useDiscussionBoards.useCallback[fetchBoards]": ()=>({})
                    }["useDiscussionBoards.useCallback[fetchBoards]"]);
                    throw new Error(data.error || `Failed to fetch boards (${res.status})`);
                }
                const data = await res.json();
                // Sort system courses (CalTodo Fam) first, preserve order for the rest
                data.sort({
                    "useDiscussionBoards.useCallback[fetchBoards]": (a, b)=>{
                        const aSystem = a.course.source === "system" ? 0 : 1;
                        const bSystem = b.course.source === "system" ? 0 : 1;
                        return aSystem - bSystem;
                    }
                }["useDiscussionBoards.useCallback[fetchBoards]"]);
                setBoards(data);
                writeCache(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                setError(message);
            } finally{
                setLoading(false);
            }
        }
    }["useDiscussionBoards.useCallback[fetchBoards]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDiscussionBoards.useEffect": ()=>{
            // Show cached data instantly, then revalidate
            const cached = readCache();
            if (cached) {
                setBoards(cached);
                setLoading(false);
            }
            fetchBoards();
        }
    }["useDiscussionBoards.useEffect"], [
        fetchBoards
    ]);
    // Refetch when courses are added/removed in settings
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDiscussionBoards.useEffect": ()=>{
            function handleCoursesChanged() {
                try {
                    sessionStorage.removeItem(CACHE_KEY);
                } catch  {}
                fetchBoards();
            }
            window.addEventListener("caltodo-courses-changed", handleCoursesChanged);
            return ({
                "useDiscussionBoards.useEffect": ()=>window.removeEventListener("caltodo-courses-changed", handleCoursesChanged)
            })["useDiscussionBoards.useEffect"];
        }
    }["useDiscussionBoards.useEffect"], [
        fetchBoards
    ]);
    return {
        boards,
        loading,
        error,
        refetch: fetchBoards
    };
}
_s(useDiscussionBoards, "i2cZP8JA8XSiWgSQaq69PjaNQzo=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CalChatLockedModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function CalChatLockedModal({ open, onClose }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const isTourActive = false; // Tour removed
    /**
   * Navigates to Settings/Integrations to sync classes.
   */ const handleSync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CalChatLockedModal.useCallback[handleSync]": ()=>{
            onClose();
            router.push("/app/settings?section=integrations");
        }
    }["CalChatLockedModal.useCallback[handleSync]"], [
        router,
        onClose
    ]);
    // Close on Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CalChatLockedModal.useEffect": ()=>{
            if (!open) return;
            function handleKeyDown(e) {
                if (e.key === "Escape") onClose();
            }
            document.addEventListener("keydown", handleKeyDown);
            return ({
                "CalChatLockedModal.useEffect": ()=>document.removeEventListener("keydown", handleKeyDown)
            })["CalChatLockedModal.useEffect"];
        }
    }["CalChatLockedModal.useEffect"], [
        open,
        onClose
    ]);
    if (!open) return null;
    /** Card content shared between tour and non-tour rendering. */ const cardContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center mb-4 animate-drop-in",
                style: {
                    animationDelay: "150ms"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                        size: 28,
                        className: "text-orange-500"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-lg font-semibold text-foreground text-center mb-2 animate-drop-in",
                style: {
                    animationDelay: "220ms"
                },
                children: "Chat is locked"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground text-center mb-5 animate-drop-in",
                style: {
                    animationDelay: "290ms"
                },
                children: "Sync your classes to unlock Chat. Connect bCourses, Gradescope, or Pensive to get started."
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-drop-in",
                style: {
                    animationDelay: "360ms"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleSync,
                    className: "w-full px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer active:scale-95 transition-transform duration-150",
                    children: "Sync classes"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-drop-in text-center mt-3",
                style: {
                    animationDelay: "410ms"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                    children: "Close"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
    // During tour: render without backdrop so tour overlay provides dimming
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md animate-announce-backdrop-in",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            id: "tour-calchat-page",
            className: "bg-popover/80 rounded-2xl w-full w-[calc(100%-2rem)] max-w-sm p-6 animate-announce-card-in",
            onClick: (e)=>e.stopPropagation(),
            children: cardContent
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
            lineNumber: 126,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx",
        lineNumber: 122,
        columnNumber: 5
    }, this);
}
_s(CalChatLockedModal, "q4vySHLBlUXBlQyZ2wEhxBcLAz0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = CalChatLockedModal;
var _c;
__turbopack_context__.k.register(_c, "CalChatLockedModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/app/app/discussions/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DiscussionsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useDiscussionBoards.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useOnboardingStatus.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$CalChatLockedModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const MSG_CACHE = "chat_messages_cache_";
const MEM_CACHE = "chat_members_cache_";
const CACHE_TTL = 5 * 60_000;
/**
 * Checks if a fresh cache entry exists.
 *
 * @param key - SessionStorage key
 * @returns true if valid cache exists
 */ function hasFreshCache(key) {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return false;
        const entry = JSON.parse(raw);
        return Date.now() - entry.timestamp < CACHE_TTL;
    } catch  {
        return false;
    }
}
/**
 * Prefetches messages for a course into sessionStorage.
 *
 * @param courseId - Course UUID
 */ async function prefetchMessages(courseId) {
    try {
        const res = await fetch(`/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=50`);
        if (!res.ok) return;
        const data = await res.json();
        const sorted = [
            ...data
        ].reverse();
        sessionStorage.setItem(MSG_CACHE + courseId, JSON.stringify({
            messages: sorted.slice(0, 200),
            timestamp: Date.now()
        }));
    } catch  {}
}
/**
 * Prefetches members for a course into sessionStorage.
 *
 * @param courseId - Course UUID
 */ async function prefetchMembers(courseId) {
    try {
        const res = await fetch(`/api/discussions/members?courseId=${encodeURIComponent(courseId)}`);
        if (!res.ok) return;
        const data = await res.json();
        sessionStorage.setItem(MEM_CACHE + courseId, JSON.stringify({
            members: data,
            timestamp: Date.now()
        }));
    } catch  {}
}
function DiscussionsPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { boards, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDiscussionBoards"])();
    const { hasCompletedOnboarding, loading: onboardingLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOnboardingStatus"])({
        skipCache: true
    });
    const [showLocked, setShowLocked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Redirect to first board's chat only after confirming onboarding
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DiscussionsPage.useEffect": ()=>{
            if (loading || onboardingLoading || !hasCompletedOnboarding || boards.length === 0) return;
            // Prefetch all chats in background
            for (const board of boards){
                if (!hasFreshCache(MSG_CACHE + board.course.id)) {
                    prefetchMessages(board.course.id);
                }
                if (!hasFreshCache(MEM_CACHE + board.course.id)) {
                    prefetchMembers(board.course.id);
                }
            }
            // Navigate to last-viewed chat if valid, otherwise first board
            let target = boards[0];
            try {
                const lastCourseId = localStorage.getItem("calchat_last_course");
                if (lastCourseId) {
                    const match = boards.find({
                        "DiscussionsPage.useEffect.match": (b)=>b.course.id === lastCourseId
                    }["DiscussionsPage.useEffect.match"]);
                    if (match) target = match;
                }
            } catch  {}
            router.replace(`/app/discussions/${target.course.id}?name=${encodeURIComponent(target.course.name)}`);
        }
    }["DiscussionsPage.useEffect"], [
        boards,
        loading,
        onboardingLoading,
        hasCompletedOnboarding,
        router
    ]);
    // Show locked modal after a short delay so user sees loading first
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DiscussionsPage.useEffect": ()=>{
            if (!onboardingLoading && !hasCompletedOnboarding) {
                const timer = setTimeout({
                    "DiscussionsPage.useEffect.timer": ()=>setShowLocked(true)
                }["DiscussionsPage.useEffect.timer"], 800);
                return ({
                    "DiscussionsPage.useEffect": ()=>clearTimeout(timer)
                })["DiscussionsPage.useEffect"];
            }
        }
    }["DiscussionsPage.useEffect"], [
        onboardingLoading,
        hasCompletedOnboarding
    ]);
    // Show loading spinner as base content; overlay locked modal after delay
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "tour-calchat-page",
                className: "flex items-center justify-center h-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/page.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/page.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$CalChatLockedModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: showLocked,
                onClose: ()=>router.push("/app/inbox")
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/page.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(DiscussionsPage, "GoIzITBZWCCfBuQYnVjaPLZViX0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDiscussionBoards"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOnboardingStatus"]
    ];
});
_c = DiscussionsPage;
var _c;
__turbopack_context__.k.register(_c, "DiscussionsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Lock
]);
/**
 * @license lucide-react v0.564.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "18",
            height: "11",
            x: "3",
            y: "11",
            rx: "2",
            ry: "2",
            key: "1w4ew1"
        }
    ],
    [
        "path",
        {
            d: "M7 11V7a5 5 0 0 1 10 0v4",
            key: "fwvmzm"
        }
    ]
];
const Lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("lock", __iconNode);
;
 //# sourceMappingURL=lock.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Lock",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_72a3ac9b._.js.map