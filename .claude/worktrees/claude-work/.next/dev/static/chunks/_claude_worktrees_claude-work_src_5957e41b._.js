(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/hooks/useCompactMode.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCompactMode",
    ()=>useCompactMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useCompactMode(heightThreshold = 160) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [compact, setCompact] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCompactMode.useEffect": ()=>{
            const el = containerRef.current;
            if (!el) return;
            const observer = new ResizeObserver({
                "useCompactMode.useEffect": (entries)=>{
                    for (const entry of entries){
                        setCompact(entry.contentRect.height < heightThreshold);
                    }
                }
            }["useCompactMode.useEffect"]);
            observer.observe(el);
            return ({
                "useCompactMode.useEffect": ()=>observer.disconnect()
            })["useCompactMode.useEffect"];
        }
    }["useCompactMode.useEffect"], [
        heightThreshold
    ]);
    return {
        containerRef,
        compact
    };
}
_s(useCompactMode, "t47NEQsgdIvxKJ39iNHiT3NeGPc=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/.claude/worktrees/claude-work/src/hooks/useWidgetLayout.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useWidgetLayout",
    ()=>useWidgetLayout
]);
/**
 * Hook for managing the Home dashboard widget layout.
 * Server-authoritative with optimistic UI: React state is updated
 * immediately, localStorage serves as a passive cache, and the server
 * is the source of truth with retry + error notification.
 *
 * @module useWidgetLayout
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/widget-types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/board-layout-sync.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/board-layout-cache.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/board-layout-types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/realtime-auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
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
function useWidgetLayout() {
    _s();
    const defaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultLayout"])();
    const [widgets, setWidgets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaults.widgets);
    const [layouts, setLayoutsState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaults.layouts);
    const [boardTitle, setBoardTitleState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("My Board");
    const [boardDescription, setBoardDescriptionState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Tap the edit button to start customizing your board.");
    const [coverImageUrl, setCoverImageUrlState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [boardEmoji, setBoardEmojiState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("\u{1F4D6}");
    const [iconSize, setIconSizeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("md");
    const [titleFontFamily, setTitleFontFamilyState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [titleTextColor, setTitleTextColorState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [titleFontSize, setTitleFontSizeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("lg");
    const [coverHeight, setCoverHeightState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_COVER_HEIGHT"]);
    const [coverPositionY, setCoverPositionYState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_COVER_POSITION_Y"]);
    const [dividerColor, setDividerColorState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [dividerThickness, setDividerThicknessState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [dividerText, setDividerTextState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [dividerVisible, setDividerVisibleState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [savedImages, setSavedImagesState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Refs for board metadata so callbacks read current values without re-creating
    const boardTitleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(boardTitle);
    const boardDescriptionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(boardDescription);
    const coverImageUrlRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(coverImageUrl);
    const boardEmojiRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(boardEmoji);
    const iconSizeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(iconSize);
    const titleFontFamilyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(titleFontFamily);
    const titleTextColorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(titleTextColor);
    const titleFontSizeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(titleFontSize);
    const coverHeightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(coverHeight);
    const coverPositionYRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(coverPositionY);
    const dividerColorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(dividerColor);
    const dividerThicknessRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(dividerThickness);
    const dividerTextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(dividerText);
    const dividerVisibleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(dividerVisible);
    const savedImagesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(savedImages);
    /** Instance-level gate: prevents server saves before initial fetch completes. */ const hydrationCompleteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Register toast error handler for save failures
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useWidgetLayout.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["registerSaveErrorHandler"])({
                "useWidgetLayout.useEffect": ()=>{
                    showToast("Board changes couldn't be saved. They're saved locally.");
                }
            }["useWidgetLayout.useEffect"]);
            return ({
                "useWidgetLayout.useEffect": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["registerSaveErrorHandler"])(null)
            })["useWidgetLayout.useEffect"];
        }
    }["useWidgetLayout.useEffect"], [
        showToast
    ]);
    /**
   * Applies a PersistedLayout to all state + refs.
   * Extracted to avoid duplication between localStorage and server hydration.
   */ const applyLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[applyLayout]": (p)=>{
            setWidgets(p.widgets || []);
            setLayoutsState(p.layouts || {
                lg: [],
                md: [],
                sm: []
            });
            const title = p.boardTitle || "My Board";
            const desc = p.boardDescription || "";
            const cover = p.coverImageUrl ?? "";
            const emoji = p.boardEmoji || "\u{1F4D6}";
            const iSize = p.iconSize || "md";
            setBoardTitleState(title);
            setBoardDescriptionState(desc);
            setCoverImageUrlState(cover);
            setBoardEmojiState(emoji);
            setIconSizeState(iSize);
            const tFont = p.titleFontFamily || "";
            const tColor = p.titleTextColor || "";
            const tSize = p.titleFontSize || "lg";
            const cHeight = p.coverHeight ?? __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_COVER_HEIGHT"];
            const cPosY = p.coverPositionY ?? __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_COVER_POSITION_Y"];
            setTitleFontFamilyState(tFont);
            setTitleTextColorState(tColor);
            setTitleFontSizeState(tSize);
            const sImages = p.savedImages || [];
            const dColor = p.dividerColor || "";
            const dThick = p.dividerThickness ?? 1;
            const dText = p.dividerText || "";
            const dVisible = p.dividerVisible ?? true;
            setCoverHeightState(cHeight);
            setCoverPositionYState(cPosY);
            setSavedImagesState(sImages);
            setDividerColorState(dColor);
            setDividerThicknessState(dThick);
            setDividerTextState(dText);
            setDividerVisibleState(dVisible);
            boardTitleRef.current = title;
            boardDescriptionRef.current = desc;
            coverImageUrlRef.current = cover;
            boardEmojiRef.current = emoji;
            iconSizeRef.current = iSize;
            titleFontFamilyRef.current = tFont;
            titleTextColorRef.current = tColor;
            titleFontSizeRef.current = tSize;
            coverHeightRef.current = cHeight;
            coverPositionYRef.current = cPosY;
            savedImagesRef.current = sImages;
            dividerColorRef.current = dColor;
            dividerThicknessRef.current = dThick;
            dividerTextRef.current = dText;
            dividerVisibleRef.current = dVisible;
        }
    }["useWidgetLayout.useCallback[applyLayout]"], []);
    /**
   * Builds a PersistedLayout from widgets + layouts + optional overrides,
   * writes to localStorage cache, and triggers debounced server save.
   * Overrides win over current ref values — callers pass only changed fields.
   *
   * @param w - Current widget instances
   * @param l - Current grid layouts per breakpoint
   * @param overrides - Partial fields to override (e.g. { boardTitle: "New" })
   */ const persistLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[persistLayout]": (w, l, overrides = {})=>{
            const data = {
                version: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCHEMA_VERSION"],
                widgets: w,
                layouts: l,
                boardTitle: overrides.boardTitle ?? boardTitleRef.current,
                boardDescription: overrides.boardDescription ?? boardDescriptionRef.current,
                coverImageUrl: overrides.coverImageUrl ?? coverImageUrlRef.current,
                boardEmoji: overrides.boardEmoji ?? boardEmojiRef.current,
                iconSize: overrides.iconSize ?? iconSizeRef.current,
                titleFontFamily: overrides.titleFontFamily ?? titleFontFamilyRef.current,
                titleTextColor: overrides.titleTextColor ?? titleTextColorRef.current,
                titleFontSize: overrides.titleFontSize ?? titleFontSizeRef.current,
                coverHeight: overrides.coverHeight ?? coverHeightRef.current,
                coverPositionY: overrides.coverPositionY ?? coverPositionYRef.current,
                dividerColor: overrides.dividerColor ?? dividerColorRef.current,
                dividerThickness: overrides.dividerThickness ?? dividerThicknessRef.current,
                dividerText: overrides.dividerText ?? dividerTextRef.current,
                dividerVisible: overrides.dividerVisible ?? dividerVisibleRef.current,
                savedImages: overrides.savedImages ?? savedImagesRef.current,
                updatedAt: Date.now()
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["writeLayoutCache"])(data);
            if (hydrationCompleteRef.current) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["debouncedServerSave"])(data);
            }
        }
    }["useWidgetLayout.useCallback[persistLayout]"], []);
    // Server-authoritative hydration: localStorage is a read-only cache for
    // instant initial paint. The server is the single source of truth.
    // localStorage never drives saves — only user actions do.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useWidgetLayout.useEffect": ()=>{
            hydrationCompleteRef.current = false;
            // Apply cached layout instantly for fast paint while server fetches
            const localLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["readPersistedLayout"])();
            if (localLayout) {
                applyLayout(localLayout);
                setHydrated(true);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchServerLayout"])().then({
                "useWidgetLayout.useEffect": ({ layout: serverData, updatedAt: serverUpdatedAt })=>{
                    if (serverData) {
                        // Server has data — always apply it (server wins)
                        const serverLayout = serverData;
                        serverLayout.version = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCHEMA_VERSION"];
                        serverLayout.updatedAt = serverUpdatedAt ? new Date(serverUpdatedAt).getTime() : 0;
                        applyLayout(serverLayout);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["writeLayoutCache"])(serverLayout);
                    }
                    // If server has no data, keep defaults in state but do NOT save
                    // them to the server. Only explicit user actions trigger saves.
                    setHydrated(true);
                    hydrationCompleteRef.current = true;
                }
            }["useWidgetLayout.useEffect"]).catch({
                "useWidgetLayout.useEffect": ()=>{
                    // Show UI even on failure
                    setHydrated(true);
                    hydrationCompleteRef.current = true;
                }
            }["useWidgetLayout.useEffect"]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useWidgetLayout.useEffect"], []);
    // Realtime subscription — sync layout changes from other devices
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useWidgetLayout.useEffect": ()=>{
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            let channel = null;
            async function subscribe() {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureRealtimeAuth"])(supabase);
                channel = supabase.channel("board-layout-sync").on("postgres_changes", {
                    event: "UPDATE",
                    schema: "public",
                    table: "board_layouts",
                    filter: `user_id=eq.${user.id}`
                }, {
                    "useWidgetLayout.useEffect.subscribe": (payload)=>{
                        if (!hydrationCompleteRef.current) return;
                        const incoming = payload.new;
                        if (!incoming.layout) return;
                        const incomingLayout = incoming.layout;
                        const incomingTs = incomingLayout.updatedAt ?? 0;
                        // Echo suppression: skip if this is our own save echoing back
                        const currentLocal = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["readPersistedLayout"])();
                        const currentLocalTs = currentLocal?.updatedAt ?? 0;
                        if (incomingTs <= currentLocalTs) return;
                        // Incoming layout is newer (from another device) — apply it
                        incomingLayout.version = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCHEMA_VERSION"];
                        applyLayout(incomingLayout);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["writeLayoutCache"])(incomingLayout);
                    }
                }["useWidgetLayout.useEffect.subscribe"]).subscribe();
            }
            subscribe();
            return ({
                "useWidgetLayout.useEffect": ()=>{
                    if (channel) {
                        supabase.removeChannel(channel);
                    }
                }
            })["useWidgetLayout.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useWidgetLayout.useEffect"], []);
    const setLayouts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[setLayouts]": (_currentLayout, allLayouts)=>{
            setLayoutsState({
                "useWidgetLayout.useCallback[setLayouts]": (prev)=>{
                    if (prev === allLayouts) return prev;
                    setWidgets({
                        "useWidgetLayout.useCallback[setLayouts]": (prevWidgets)=>{
                            persistLayout(prevWidgets, allLayouts);
                            return prevWidgets;
                        }
                    }["useWidgetLayout.useCallback[setLayouts]"]);
                    return allLayouts;
                }
            }["useWidgetLayout.useCallback[setLayouts]"]);
        }
    }["useWidgetLayout.useCallback[setLayouts]"], [
        persistLayout
    ]);
    const addWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[addWidget]": (type, config = {}, position)=>{
            const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateWidgetId"])();
            const reg = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WIDGET_REGISTRY"][type];
            const newWidget = {
                id,
                type,
                config
            };
            const newLayoutItem = {
                i: id,
                x: position?.x ?? 0,
                y: position?.y ?? Infinity,
                w: 2,
                h: 2,
                minW: reg.minW,
                minH: reg.minH
            };
            setWidgets({
                "useWidgetLayout.useCallback[addWidget]": (prev)=>{
                    const updated = [
                        ...prev,
                        newWidget
                    ];
                    setLayoutsState({
                        "useWidgetLayout.useCallback[addWidget]": (prevLayouts)=>{
                            const updatedLayouts = {};
                            for (const bp of Object.keys(prevLayouts)){
                                updatedLayouts[bp] = [
                                    ...prevLayouts[bp] || [],
                                    newLayoutItem
                                ];
                            }
                            if (Object.keys(updatedLayouts).length === 0) {
                                updatedLayouts.lg = [
                                    newLayoutItem
                                ];
                            }
                            persistLayout(updated, updatedLayouts);
                            return updatedLayouts;
                        }
                    }["useWidgetLayout.useCallback[addWidget]"]);
                    return updated;
                }
            }["useWidgetLayout.useCallback[addWidget]"]);
            return id;
        }
    }["useWidgetLayout.useCallback[addWidget]"], [
        persistLayout
    ]);
    const removeWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[removeWidget]": (id)=>{
            setWidgets({
                "useWidgetLayout.useCallback[removeWidget]": (prev)=>{
                    const updated = prev.filter({
                        "useWidgetLayout.useCallback[removeWidget].updated": (w)=>w.id !== id
                    }["useWidgetLayout.useCallback[removeWidget].updated"]);
                    setLayoutsState({
                        "useWidgetLayout.useCallback[removeWidget]": (prevLayouts)=>{
                            const updatedLayouts = {};
                            for (const bp of Object.keys(prevLayouts)){
                                updatedLayouts[bp] = (prevLayouts[bp] || []).filter({
                                    "useWidgetLayout.useCallback[removeWidget]": (l)=>l.i !== id
                                }["useWidgetLayout.useCallback[removeWidget]"]);
                            }
                            persistLayout(updated, updatedLayouts);
                            return updatedLayouts;
                        }
                    }["useWidgetLayout.useCallback[removeWidget]"]);
                    return updated;
                }
            }["useWidgetLayout.useCallback[removeWidget]"]);
        }
    }["useWidgetLayout.useCallback[removeWidget]"], [
        persistLayout
    ]);
    const updateWidgetConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[updateWidgetConfig]": (id, config)=>{
            setWidgets({
                "useWidgetLayout.useCallback[updateWidgetConfig]": (prev)=>{
                    const updated = prev.map({
                        "useWidgetLayout.useCallback[updateWidgetConfig].updated": (w)=>w.id === id ? {
                                ...w,
                                config: {
                                    ...w.config,
                                    ...config
                                }
                            } : w
                    }["useWidgetLayout.useCallback[updateWidgetConfig].updated"]);
                    setLayoutsState({
                        "useWidgetLayout.useCallback[updateWidgetConfig]": (prevLayouts)=>{
                            persistLayout(updated, prevLayouts);
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[updateWidgetConfig]"]);
                    return updated;
                }
            }["useWidgetLayout.useCallback[updateWidgetConfig]"]);
        }
    }["useWidgetLayout.useCallback[updateWidgetConfig]"], [
        persistLayout
    ]);
    const updateAllWidgetConfigs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[updateAllWidgetConfigs]": (config)=>{
            setWidgets({
                "useWidgetLayout.useCallback[updateAllWidgetConfigs]": (prev)=>{
                    const updated = prev.map({
                        "useWidgetLayout.useCallback[updateAllWidgetConfigs].updated": (w)=>({
                                ...w,
                                config: {
                                    ...w.config,
                                    ...config
                                }
                            })
                    }["useWidgetLayout.useCallback[updateAllWidgetConfigs].updated"]);
                    setLayoutsState({
                        "useWidgetLayout.useCallback[updateAllWidgetConfigs]": (prevLayouts)=>{
                            persistLayout(updated, prevLayouts);
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[updateAllWidgetConfigs]"]);
                    return updated;
                }
            }["useWidgetLayout.useCallback[updateAllWidgetConfigs]"]);
        }
    }["useWidgetLayout.useCallback[updateAllWidgetConfigs]"], [
        persistLayout
    ]);
    const setBoardTitle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[setBoardTitle]": (title)=>{
            const trimmed = title.slice(0, 50);
            setBoardTitleState(trimmed);
            boardTitleRef.current = trimmed;
            setWidgets({
                "useWidgetLayout.useCallback[setBoardTitle]": (prev)=>{
                    setLayoutsState({
                        "useWidgetLayout.useCallback[setBoardTitle]": (prevLayouts)=>{
                            persistLayout(prev, prevLayouts, {
                                boardTitle: trimmed
                            });
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[setBoardTitle]"]);
                    return prev;
                }
            }["useWidgetLayout.useCallback[setBoardTitle]"]);
        }
    }["useWidgetLayout.useCallback[setBoardTitle]"], [
        persistLayout
    ]);
    const setBoardDescription = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[setBoardDescription]": (desc)=>{
            const trimmed = desc.slice(0, 200);
            setBoardDescriptionState(trimmed);
            boardDescriptionRef.current = trimmed;
            setWidgets({
                "useWidgetLayout.useCallback[setBoardDescription]": (prev)=>{
                    setLayoutsState({
                        "useWidgetLayout.useCallback[setBoardDescription]": (prevLayouts)=>{
                            persistLayout(prev, prevLayouts, {
                                boardDescription: trimmed
                            });
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[setBoardDescription]"]);
                    return prev;
                }
            }["useWidgetLayout.useCallback[setBoardDescription]"]);
        }
    }["useWidgetLayout.useCallback[setBoardDescription]"], [
        persistLayout
    ]);
    const setCoverImageUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[setCoverImageUrl]": (url)=>{
            setCoverImageUrlState(url);
            coverImageUrlRef.current = url;
            setWidgets({
                "useWidgetLayout.useCallback[setCoverImageUrl]": (prev)=>{
                    setLayoutsState({
                        "useWidgetLayout.useCallback[setCoverImageUrl]": (prevLayouts)=>{
                            persistLayout(prev, prevLayouts, {
                                coverImageUrl: url
                            });
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[setCoverImageUrl]"]);
                    return prev;
                }
            }["useWidgetLayout.useCallback[setCoverImageUrl]"]);
        }
    }["useWidgetLayout.useCallback[setCoverImageUrl]"], [
        persistLayout
    ]);
    const setBoardEmoji = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[setBoardEmoji]": (emoji)=>{
            setBoardEmojiState(emoji);
            boardEmojiRef.current = emoji;
            setWidgets({
                "useWidgetLayout.useCallback[setBoardEmoji]": (prev)=>{
                    setLayoutsState({
                        "useWidgetLayout.useCallback[setBoardEmoji]": (prevLayouts)=>{
                            persistLayout(prev, prevLayouts, {
                                boardEmoji: emoji
                            });
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[setBoardEmoji]"]);
                    return prev;
                }
            }["useWidgetLayout.useCallback[setBoardEmoji]"]);
        }
    }["useWidgetLayout.useCallback[setBoardEmoji]"], [
        persistLayout
    ]);
    const setIconSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[setIconSize]": (size)=>{
            setIconSizeState(size);
            iconSizeRef.current = size;
            setWidgets({
                "useWidgetLayout.useCallback[setIconSize]": (prev)=>{
                    setLayoutsState({
                        "useWidgetLayout.useCallback[setIconSize]": (prevLayouts)=>{
                            persistLayout(prev, prevLayouts, {
                                iconSize: size
                            });
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[setIconSize]"]);
                    return prev;
                }
            }["useWidgetLayout.useCallback[setIconSize]"]);
        }
    }["useWidgetLayout.useCallback[setIconSize]"], [
        persistLayout
    ]);
    const setCoverConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[setCoverConfig]": (height, positionY)=>{
            setCoverHeightState(height);
            setCoverPositionYState(positionY);
            coverHeightRef.current = height;
            coverPositionYRef.current = positionY;
            setWidgets({
                "useWidgetLayout.useCallback[setCoverConfig]": (prev)=>{
                    setLayoutsState({
                        "useWidgetLayout.useCallback[setCoverConfig]": (prevLayouts)=>{
                            persistLayout(prev, prevLayouts, {
                                coverHeight: height,
                                coverPositionY: positionY
                            });
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[setCoverConfig]"]);
                    return prev;
                }
            }["useWidgetLayout.useCallback[setCoverConfig]"]);
        }
    }["useWidgetLayout.useCallback[setCoverConfig]"], [
        persistLayout
    ]);
    const setTitleConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[setTitleConfig]": (fontFamily, textColor, fontSize = "lg")=>{
            setTitleFontFamilyState(fontFamily);
            setTitleTextColorState(textColor);
            setTitleFontSizeState(fontSize);
            titleFontFamilyRef.current = fontFamily;
            titleTextColorRef.current = textColor;
            titleFontSizeRef.current = fontSize;
            setWidgets({
                "useWidgetLayout.useCallback[setTitleConfig]": (prev)=>{
                    setLayoutsState({
                        "useWidgetLayout.useCallback[setTitleConfig]": (prevLayouts)=>{
                            persistLayout(prev, prevLayouts, {
                                titleFontFamily: fontFamily,
                                titleTextColor: textColor,
                                titleFontSize: fontSize
                            });
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[setTitleConfig]"]);
                    return prev;
                }
            }["useWidgetLayout.useCallback[setTitleConfig]"]);
        }
    }["useWidgetLayout.useCallback[setTitleConfig]"], [
        persistLayout
    ]);
    /**
   * Updates the divider color and thickness, persisting to storage.
   *
   * @param color - CSS color string (empty = default theme color)
   * @param thickness - Pixel thickness (1-6)
   */ const setDividerConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[setDividerConfig]": (color, thickness, text, visible)=>{
            setDividerColorState(color);
            setDividerThicknessState(thickness);
            if (text !== undefined) {
                setDividerTextState(text);
                dividerTextRef.current = text;
            }
            if (visible !== undefined) {
                setDividerVisibleState(visible);
                dividerVisibleRef.current = visible;
            }
            dividerColorRef.current = color;
            dividerThicknessRef.current = thickness;
            setWidgets({
                "useWidgetLayout.useCallback[setDividerConfig]": (prev)=>{
                    setLayoutsState({
                        "useWidgetLayout.useCallback[setDividerConfig]": (prevLayouts)=>{
                            persistLayout(prev, prevLayouts, {
                                dividerColor: color,
                                dividerThickness: thickness,
                                ...text !== undefined ? {
                                    dividerText: text
                                } : {},
                                ...visible !== undefined ? {
                                    dividerVisible: visible
                                } : {}
                            });
                            return prevLayouts;
                        }
                    }["useWidgetLayout.useCallback[setDividerConfig]"]);
                    return prev;
                }
            }["useWidgetLayout.useCallback[setDividerConfig]"]);
        }
    }["useWidgetLayout.useCallback[setDividerConfig]"], [
        persistLayout
    ]);
    const addSavedImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[addSavedImage]": (url)=>{
            setSavedImagesState({
                "useWidgetLayout.useCallback[addSavedImage]": (prev)=>{
                    const deduped = prev.filter({
                        "useWidgetLayout.useCallback[addSavedImage].deduped": (u)=>u !== url
                    }["useWidgetLayout.useCallback[addSavedImage].deduped"]);
                    const updated = [
                        url,
                        ...deduped
                    ].slice(0, 20);
                    savedImagesRef.current = updated;
                    setWidgets({
                        "useWidgetLayout.useCallback[addSavedImage]": (prevWidgets)=>{
                            setLayoutsState({
                                "useWidgetLayout.useCallback[addSavedImage]": (prevLayouts)=>{
                                    persistLayout(prevWidgets, prevLayouts, {
                                        savedImages: updated
                                    });
                                    return prevLayouts;
                                }
                            }["useWidgetLayout.useCallback[addSavedImage]"]);
                            return prevWidgets;
                        }
                    }["useWidgetLayout.useCallback[addSavedImage]"]);
                    return updated;
                }
            }["useWidgetLayout.useCallback[addSavedImage]"]);
        }
    }["useWidgetLayout.useCallback[addSavedImage]"], [
        persistLayout
    ]);
    /**
   * Applies a full PersistedLayout (e.g. from a template) and persists it.
   * Generates fresh widget IDs so templates don't collide with existing data.
   *
   * @param template - The full layout to apply
   */ const applyTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWidgetLayout.useCallback[applyTemplate]": (template)=>{
            // Generate fresh widget IDs
            const idMap = new Map();
            const freshWidgets = template.widgets.map({
                "useWidgetLayout.useCallback[applyTemplate].freshWidgets": (w)=>{
                    const newId = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateWidgetId"])();
                    idMap.set(w.id, newId);
                    return {
                        ...w,
                        id: newId
                    };
                }
            }["useWidgetLayout.useCallback[applyTemplate].freshWidgets"]);
            // Remap layout item IDs
            const freshLayouts = {};
            for (const [bp, items] of Object.entries(template.layouts)){
                freshLayouts[bp] = items.map({
                    "useWidgetLayout.useCallback[applyTemplate]": (item)=>({
                            ...item,
                            i: idMap.get(item.i) || item.i
                        })
                }["useWidgetLayout.useCallback[applyTemplate]"]);
            }
            const fresh = {
                ...template,
                widgets: freshWidgets,
                layouts: freshLayouts,
                version: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCHEMA_VERSION"],
                updatedAt: Date.now()
            };
            applyLayout(fresh);
            persistLayout(freshWidgets, freshLayouts, fresh);
        }
    }["useWidgetLayout.useCallback[applyTemplate]"], [
        applyLayout,
        persistLayout
    ]);
    return {
        widgets,
        layouts,
        hydrated,
        boardTitle,
        boardDescription,
        coverImageUrl,
        boardEmoji,
        iconSize,
        titleFontFamily,
        titleTextColor,
        titleFontSize,
        coverHeight,
        coverPositionY,
        dividerColor,
        dividerThickness,
        dividerText,
        dividerVisible,
        setLayouts,
        addWidget,
        removeWidget,
        updateWidgetConfig,
        updateAllWidgetConfigs,
        setBoardTitle,
        setBoardDescription,
        setCoverImageUrl,
        setBoardEmoji,
        setIconSize,
        setTitleConfig,
        setCoverConfig,
        setDividerConfig,
        savedImages,
        addSavedImage,
        applyTemplate
    };
}
_s(useWidgetLayout, "RQQKRe8wUjz6Mt+hBqF8wqiBG70=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Home dashboard page — "Your Board" personal dashboard.
 * Notion-style layout: cover banner → emoji icon → editable title → widget grid.
 * Edit mode toggle: pencil icon (view) / "Done" pill (edit).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$template$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutTemplate$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-template.js [app-client] (ecmascript) <export default as LayoutTemplate>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/PageTransition.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$EditToggleButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/EditToggleButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/WidgetGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetGalleryModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/WidgetGalleryModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetEditorPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardCover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardCover.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardTitle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardTitle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardDescription$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardDescription.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardDivider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardDivider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$EmojiPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/emoji-picker-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardTemplatesModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardTemplatesModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useWidgetLayout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useWidgetLayout.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
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
;
function HomePage() {
    _s();
    const { widgets, layouts, hydrated, boardTitle, boardDescription, coverImageUrl, boardEmoji, iconSize, setLayouts, addWidget, removeWidget, updateWidgetConfig, updateAllWidgetConfigs, setBoardTitle, setBoardDescription, setCoverImageUrl, setBoardEmoji, setIconSize, titleFontFamily, titleTextColor, titleFontSize, coverHeight, coverPositionY, setTitleConfig, setCoverConfig, dividerColor, dividerThickness, dividerText, dividerVisible, setDividerConfig, savedImages, addSavedImage, applyTemplate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useWidgetLayout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWidgetLayout"])();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const [editMode, setEditMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [galleryOpen, setGalleryOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [templatesOpen, setTemplatesOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [settingsWidget, setSettingsWidget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [settingsWidgetRect, setSettingsWidgetRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [emojiPickerOpen, setEmojiPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    /** Widget type being dragged from gallery (null when not drag-to-placing). */ const [draggingType, setDraggingType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Live widget rect for the spotlight overlay (updates on scroll/resize). */ const [spotlightRect, setSpotlightRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const spotlightRafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    // When a color theme is activated, permanently clear custom widget/title/divider colors
    const prevThemeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(colorTheme);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            if (colorTheme && colorTheme !== prevThemeRef.current && hydrated) {
                updateAllWidgetConfigs({
                    textColor: "",
                    bgColor: "",
                    accentColor: ""
                });
                setTitleConfig(titleFontFamily, "", titleFontSize);
                setDividerConfig("", dividerThickness, dividerText, dividerVisible);
            }
            prevThemeRef.current = colorTheme;
        }
    }["HomePage.useEffect"], [
        colorTheme,
        hydrated,
        updateAllWidgetConfigs,
        setTitleConfig,
        setDividerConfig,
        titleFontFamily,
        titleFontSize,
        dividerThickness,
        dividerText,
        dividerVisible
    ]);
    // Listen for tour-controlled edit mode toggle (fired by AppTour click animations)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            function handleTourEditMode(e) {
                const enabled = e.detail === true;
                setEditMode(enabled);
            }
            window.addEventListener("tour-set-edit-mode", handleTourEditMode);
            return ({
                "HomePage.useEffect": ()=>window.removeEventListener("tour-set-edit-mode", handleTourEditMode)
            })["HomePage.useEffect"];
        }
    }["HomePage.useEffect"], []);
    // Track selected widget position for spotlight overlay.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            if (!settingsWidget) {
                setSpotlightRect(null);
                return;
            }
            function updateSpotlight() {
                const el = document.querySelector(`[data-widget-id="${settingsWidget.id}"]`);
                if (el) {
                    const r = el.getBoundingClientRect();
                    setSpotlightRect({
                        top: r.top,
                        left: r.left,
                        width: r.width,
                        height: r.height
                    });
                }
                spotlightRafRef.current = requestAnimationFrame(updateSpotlight);
            }
            updateSpotlight();
            return ({
                "HomePage.useEffect": ()=>cancelAnimationFrame(spotlightRafRef.current)
            })["HomePage.useEffect"];
        }
    }["HomePage.useEffect"], [
        settingsWidget
    ]);
    /** Handles adding a widget from the gallery. */ const handleAddWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HomePage.useCallback[handleAddWidget]": (type)=>{
            addWidget(type);
            showToast("Widget added");
        }
    }["HomePage.useCallback[handleAddWidget]"], [
        addWidget,
        showToast
    ]);
    /** Ref to prevent double-add from both onDrop and dragend firing. */ const dropHandledRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    /** Called when user starts dragging a widget card from the gallery. */ const handleGalleryDragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HomePage.useCallback[handleGalleryDragStart]": (type)=>{
            dropHandledRef.current = false;
            setDraggingType(type);
            // Hide modal visually but keep it mounted so the drag source element
            // stays in the DOM — removing it cancels the browser drag operation.
            setGalleryOpen(false);
        }
    }["HomePage.useCallback[handleGalleryDragStart]"], []);
    /** Called when user drops an external item onto the grid. */ const handleExternalDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HomePage.useCallback[handleExternalDrop]": (item)=>{
            if (dropHandledRef.current) return;
            dropHandledRef.current = true;
            setDraggingType({
                "HomePage.useCallback[handleExternalDrop]": (prev)=>{
                    if (prev) {
                        addWidget(prev, {}, {
                            x: item.x,
                            y: item.y
                        });
                        showToast("Widget added");
                    }
                    return null;
                }
            }["HomePage.useCallback[handleExternalDrop]"]);
        }
    }["HomePage.useCallback[handleExternalDrop]"], [
        addWidget,
        showToast
    ]);
    // Fallback: if drag ends outside the grid, still add the widget at bottom
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            if (!draggingType) return;
            function handleDragEnd() {
                if (dropHandledRef.current) {
                    // Already handled by onDrop — just clean up
                    setDraggingType(null);
                    return;
                }
                dropHandledRef.current = true;
                setDraggingType({
                    "HomePage.useEffect.handleDragEnd": (prev)=>{
                        if (prev) {
                            addWidget(prev);
                            showToast("Widget added");
                        }
                        return null;
                    }
                }["HomePage.useEffect.handleDragEnd"]);
            }
            window.addEventListener("dragend", handleDragEnd);
            return ({
                "HomePage.useEffect": ()=>window.removeEventListener("dragend", handleDragEnd)
            })["HomePage.useEffect"];
        }
    }["HomePage.useEffect"], [
        draggingType,
        addWidget,
        showToast
    ]);
    /** Opens editor panel for a specific widget with its bounding rect. */ const handleWidgetSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HomePage.useCallback[handleWidgetSettings]": (id, rect)=>{
            const widget = widgets.find({
                "HomePage.useCallback[handleWidgetSettings]": (w)=>w.id === id
            }["HomePage.useCallback[handleWidgetSettings]"]) || null;
            setSettingsWidget(widget);
            setSettingsWidgetRect(rect);
        }
    }["HomePage.useCallback[handleWidgetSettings]"], [
        widgets
    ]);
    /** Applies a font to all widgets and the board title. */ const handleApplyFontToAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HomePage.useCallback[handleApplyFontToAll]": (font)=>{
            updateAllWidgetConfigs({
                fontFamily: font
            });
            setTitleConfig(font, titleTextColor, titleFontSize);
            showToast("Font applied to all widgets");
        }
    }["HomePage.useCallback[handleApplyFontToAll]"], [
        updateAllWidgetConfigs,
        setTitleConfig,
        titleTextColor,
        titleFontSize,
        showToast
    ]);
    // Don't render grid until localStorage is hydrated (avoids layout flash)
    if (!hydrated) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                            lineNumber: 204,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground",
                            children: "Loading..."
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                            lineNumber: 205,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                    lineNumber: 203,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                lineNumber: 202,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
            lineNumber: 201,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full overflow-hidden -mx-4 md:-mx-10 -mt-4 md:-mt-10 -mb-4 md:-mb-10",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `h-full flex flex-col ${isDragging ? "overflow-hidden" : "overflow-y-auto"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardCover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        coverImageUrl: coverImageUrl,
                        editMode: editMode,
                        onChangeCover: (url)=>{
                            setCoverImageUrl(url);
                            showToast(url ? "Banner updated" : "Banner removed");
                        },
                        coverHeight: coverHeight,
                        coverPositionY: coverPositionY,
                        onChangeCoverConfig: setCoverConfig
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 217,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 md:px-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative mb-2.5",
                                style: {
                                    marginTop: -((__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ICON_SIZES"].find((s)=>s.value === iconSize)?.px ?? 64) / 2)
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (editMode) setEmojiPickerOpen((p)=>!p);
                                        },
                                        className: `leading-none ${editMode ? "cursor-pointer hover:opacity-80 transition-opacity animate-edit-hint" : "cursor-default"}`,
                                        "aria-label": "Board icon",
                                        children: (()=>{
                                            const sizePx = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ICON_SIZES"].find((s)=>s.value === iconSize)?.px ?? 64;
                                            if (boardEmoji.startsWith("lucide:")) {
                                                const iconName = boardEmoji.slice(7);
                                                const LucideIcon = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LUCIDE_ICON_MAP"][iconName];
                                                if (LucideIcon) {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LucideIcon, {
                                                        size: sizePx,
                                                        strokeWidth: 1.5,
                                                        fill: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isFilledIcon"])(iconName) ? "currentColor" : "none",
                                                        className: "text-foreground"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                                        lineNumber: 245,
                                                        columnNumber: 28
                                                    }, this);
                                                }
                                            }
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: sizePx,
                                                    lineHeight: 1
                                                },
                                                children: boardEmoji
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                                lineNumber: 248,
                                                columnNumber: 24
                                            }, this);
                                        })()
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                        lineNumber: 230,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$EmojiPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"], {
                                        open: emojiPickerOpen,
                                        onSelect: setBoardEmoji,
                                        onClose: ()=>setEmojiPickerOpen(false)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                        lineNumber: 251,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                lineNumber: 229,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardTitle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        title: boardTitle,
                                        editMode: editMode,
                                        titleConfig: {
                                            fontFamily: titleFontFamily,
                                            textColor: titleTextColor,
                                            fontSize: titleFontSize
                                        },
                                        onTitleChange: setBoardTitle,
                                        onTitleConfigChange: (cfg)=>setTitleConfig(cfg.fontFamily || "", cfg.textColor || "", cfg.fontSize || "lg")
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                        lineNumber: 260,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2.5 shrink-0",
                                        children: [
                                            editMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setTemplatesOpen(true),
                                                        className: "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-border bg-white dark:bg-gray-800 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all active:scale-[0.97]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$template$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutTemplate$3e$__["LayoutTemplate"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                                                lineNumber: 275,
                                                                columnNumber: 21
                                                            }, this),
                                                            "Templates"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                                        lineNumber: 271,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        id: "add-widget-btn",
                                                        onClick: ()=>setGalleryOpen(true),
                                                        className: "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-border bg-white dark:bg-gray-800 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all active:scale-[0.97]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                                                lineNumber: 283,
                                                                columnNumber: 21
                                                            }, this),
                                                            "Add Widget"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                                        lineNumber: 278,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$EditToggleButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                id: "edit-toggle-btn",
                                                editing: editMode,
                                                onToggle: ()=>setEditMode((prev)=>!prev)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                                lineNumber: 289,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                        lineNumber: 268,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                lineNumber: 259,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 227,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardDescription$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        description: boardDescription,
                        editMode: editMode,
                        onDescriptionChange: setBoardDescription
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 299,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardDivider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        color: dividerColor,
                        thickness: dividerThickness,
                        text: dividerText,
                        visible: dividerVisible,
                        editMode: editMode,
                        onChange: setDividerConfig
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 306,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "widget-grid",
                        className: "flex-1 min-h-0 pb-20 md:pb-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            widgets: widgets,
                            layouts: layouts,
                            editMode: editMode,
                            onLayoutChange: setLayouts,
                            onRemoveWidget: removeWidget,
                            onWidgetSettings: handleWidgetSettings,
                            onUpdateWidgetConfig: updateWidgetConfig,
                            onDragStart: ()=>setIsDragging(true),
                            onDragStop: ()=>setIsDragging(false),
                            selectedWidgetId: settingsWidget?.id,
                            acceptDrop: !!draggingType,
                            onExternalDrop: handleExternalDrop
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                            lineNumber: 317,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 316,
                        columnNumber: 9
                    }, this),
                    widgets.length === 0 && !editMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col items-center justify-center text-center py-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground mb-3",
                                children: "Your dashboard is empty"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                lineNumber: 336,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setEditMode(true);
                                    setGalleryOpen(true);
                                },
                                className: "flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                        lineNumber: 346,
                                        columnNumber: 15
                                    }, this),
                                    "Add Widgets"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                lineNumber: 339,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 335,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: draggingType && !galleryOpen ? "invisible fixed inset-0 pointer-events-none" : "",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetGalleryModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            open: galleryOpen || !!draggingType,
                            onClose: ()=>setGalleryOpen(false),
                            onAdd: handleAddWidget,
                            onDragStart: handleGalleryDragStart
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                            lineNumber: 356,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 355,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardTemplatesModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        open: templatesOpen,
                        onClose: ()=>setTemplatesOpen(false),
                        onApply: (template)=>{
                            applyTemplate(template.layout);
                            showToast(`Applied "${template.name}" template`);
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 365,
                        columnNumber: 9
                    }, this),
                    settingsWidget && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fixed inset-0 z-[39]",
                                onClick: ()=>setSettingsWidget(null)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                lineNumber: 378,
                                columnNumber: 13
                            }, this),
                            spotlightRect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fixed z-40 rounded-md pointer-events-none",
                                style: {
                                    top: spotlightRect.top,
                                    left: spotlightRect.left,
                                    width: spotlightRect.width,
                                    height: spotlightRect.height,
                                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                lineNumber: 385,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    settingsWidget && settingsWidgetRect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetEditorPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        widget: settingsWidget,
                        widgetRect: settingsWidgetRect,
                        onClose: ()=>setSettingsWidget(null),
                        onUpdateConfig: updateWidgetConfig,
                        onRemove: (id)=>{
                            removeWidget(id);
                            showToast("Widget removed");
                        },
                        onApplyFontToAll: handleApplyFontToAll,
                        onApplyBgResetToAll: ()=>{
                            updateAllWidgetConfigs({
                                bgColor: ""
                            });
                            showToast("Background reset on all widgets");
                        },
                        onApplyTextColorToAll: (color)=>{
                            updateAllWidgetConfigs({
                                textColor: color
                            });
                            showToast("Text color applied to all widgets");
                        },
                        onApplyBorderToAll: (value)=>{
                            updateAllWidgetConfigs({
                                widgetBorder: value
                            });
                            showToast(`Border ${value === "false" ? "hidden" : "shown"} on all widgets`);
                        },
                        onApplyAccentToAll: (color)=>{
                            updateAllWidgetConfigs({
                                accentColor: color
                            });
                            showToast("Accent color applied to all widgets");
                        },
                        savedImages: savedImages,
                        onAddSavedImage: addSavedImage
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 401,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                lineNumber: 215,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
            lineNumber: 214,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
        lineNumber: 213,
        columnNumber: 5
    }, this);
}
_s(HomePage, "K0+7TSFGKROSpnYpI9ZF8TbN7js=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useWidgetLayout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWidgetLayout"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_claude_worktrees_claude-work_src_5957e41b._.js.map