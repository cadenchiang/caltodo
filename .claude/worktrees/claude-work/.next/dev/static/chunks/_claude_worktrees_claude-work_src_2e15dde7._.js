(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/SegmentedControl.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SegmentedControl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Reusable pill-toggle segmented control following the ThemeToggle.tsx
 * sliding-indicator pattern. Generic over option values for type safety.
 *
 * @param options - Array of { value, label } segments to render
 * @param value - Currently selected value
 * @param onChange - Callback fired when a segment is clicked
 * @param size - Visual size: "sm" (28px tall) or "md" (32px tall)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
function SegmentedControl({ options, value, onChange, size = "sm" }) {
    const activeIndex = options.findIndex((o)=>o.value === value);
    const isMd = size === "md";
    const segH = isMd ? "h-8" : "h-7";
    const segPx = isMd ? "px-3" : "px-2.5";
    const textSize = isMd ? "text-sm" : "text-xs";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative inline-flex w-full rounded-lg p-0.5 transition-colors duration-200", "bg-muted border border-border"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute top-0.5 left-0.5 rounded-md bg-popover shadow-sm transition-all duration-200 ease-in-out", segH),
                style: {
                    width: `calc(${100 / options.length}% - 2px)`,
                    transform: `translateX(calc(${activeIndex} * 100% + ${activeIndex} * 2px))`
                },
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SegmentedControl.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            options.map(({ value: optVal, label })=>{
                const isActive = optVal === value;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>onChange(optVal),
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative z-10 flex-1 flex items-center justify-center rounded-md transition-colors duration-150", segH, segPx, textSize, "font-medium whitespace-nowrap", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isActive ? "text-foreground" : "text-muted-foreground"),
                    children: label
                }, optVal, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SegmentedControl.tsx",
                    lineNumber: 63,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SegmentedControl.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_c = SegmentedControl;
var _c;
__turbopack_context__.k.register(_c, "SegmentedControl");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EmojiPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Shared icon picker modal — 2-tab design: Icons (Lucide) and Emojis (curated).
 * Used by both the home board and notes folder icon pickers.
 * Supports optional palette color preview for Lucide icons.
 *
 * @param open - Whether the picker is visible
 * @param onSelect - Callback with the selected icon string (emoji or "lucide:name")
 * @param onClose - Callback to close the picker
 * @param paletteColors - Optional array of hex colors from banner palette
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$emoji$2d$mart$2f$data$2f$sets$2f$15$2f$native$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/node_modules/@emoji-mart/data/sets/15/native.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/SegmentedControl.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/emoji-picker-data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
/**
 * Reverse lookup: native emoji string → searchable keywords.
 * Built once from emoji-mart data for keyword-based emoji search.
 */ const emojiKeywordMap = (()=>{
    const map = new Map();
    const emojis = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$emoji$2d$mart$2f$data$2f$sets$2f$15$2f$native$2e$json__$28$json$29$__["default"].emojis;
    for (const entry of Object.values(emojis)){
        for (const skin of entry.skins){
            map.set(skin.native, [
                entry.name.toLowerCase(),
                ...entry.keywords.map((k)=>k.toLowerCase())
            ]);
        }
    }
    return map;
})();
;
function EmojiPicker({ open, onSelect, onClose, paletteColors = [] }) {
    _s();
    const [previewColor, setPreviewColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("icons");
    const [iconSearch, setIconSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [emojiSearch, setEmojiSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    /** Flat list of all icons filtered by search query. */ const filteredIcons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EmojiPicker.useMemo[filteredIcons]": ()=>{
            const q = iconSearch.toLowerCase().trim();
            if (!q) return null;
            return __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LUCIDE_CATEGORIES"].flatMap({
                "EmojiPicker.useMemo[filteredIcons]": (cat)=>cat.icons.filter({
                        "EmojiPicker.useMemo[filteredIcons]": ({ name })=>name.includes(q) || cat.label.toLowerCase().includes(q)
                    }["EmojiPicker.useMemo[filteredIcons]"])
            }["EmojiPicker.useMemo[filteredIcons]"]);
        }
    }["EmojiPicker.useMemo[filteredIcons]"], [
        iconSearch
    ]);
    /** Filtered emoji categories by search query — matches individual emoji keywords. */ const filteredEmojiCategories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EmojiPicker.useMemo[filteredEmojiCategories]": ()=>{
            const q = emojiSearch.toLowerCase().trim();
            if (!q) return null;
            const results = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMOJI_CATEGORIES"].map({
                "EmojiPicker.useMemo[filteredEmojiCategories].results": (cat)=>{
                    const matchedEmojis = cat.emojis.filter({
                        "EmojiPicker.useMemo[filteredEmojiCategories].results.matchedEmojis": (emoji)=>{
                            if (cat.label.toLowerCase().includes(q)) return true;
                            const keywords = emojiKeywordMap.get(emoji);
                            return keywords?.some({
                                "EmojiPicker.useMemo[filteredEmojiCategories].results.matchedEmojis": (kw)=>kw.includes(q)
                            }["EmojiPicker.useMemo[filteredEmojiCategories].results.matchedEmojis"]) ?? false;
                        }
                    }["EmojiPicker.useMemo[filteredEmojiCategories].results.matchedEmojis"]);
                    return {
                        label: cat.label,
                        emojis: matchedEmojis
                    };
                }
            }["EmojiPicker.useMemo[filteredEmojiCategories].results"]).filter({
                "EmojiPicker.useMemo[filteredEmojiCategories].results": (cat)=>cat.emojis.length > 0
            }["EmojiPicker.useMemo[filteredEmojiCategories].results"]);
            return results;
        }
    }["EmojiPicker.useMemo[filteredEmojiCategories]"], [
        emojiSearch
    ]);
    if (!open) return null;
    /** Select a Lucide icon — store as "lucide:name" format. */ function selectLucide(name) {
        onSelect(`lucide:${name}`);
        onClose();
    }
    /** Select an emoji. */ function selectEmoji(emoji) {
        onSelect(emoji);
        onClose();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 animate-announce-backdrop-in",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-popover rounded-2xl shadow-xl border border-border w-full w-[calc(100%-2rem)] max-w-sm animate-announce-card-in overflow-hidden max-h-[80vh] flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shrink-0 border-b border-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between p-4 pb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-base font-semibold text-foreground",
                                        children: "Choose Icon"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 115,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onClose,
                                        className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                        "aria-label": "Close",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                            lineNumber: 123,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 118,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 pb-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    options: [
                                        {
                                            value: "icons",
                                            label: "Icons"
                                        },
                                        {
                                            value: "emojis",
                                            label: "Emojis"
                                        }
                                    ],
                                    value: activeTab,
                                    onChange: (v)=>setActiveTab(v)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 pb-3",
                                children: [
                                    activeTab === "icons" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: iconSearch,
                                        onChange: (e)=>setIconSearch(e.target.value),
                                        placeholder: "Search icons...",
                                        className: "w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors",
                                        autoFocus: true
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 142,
                                        columnNumber: 15
                                    }, this),
                                    activeTab === "emojis" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: emojiSearch,
                                        onChange: (e)=>setEmojiSearch(e.target.value),
                                        placeholder: "Search emojis...",
                                        className: "w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto px-4 py-3",
                        children: [
                            activeTab === "icons" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: filteredIcons ? filteredIcons.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-9 gap-0.5",
                                    children: filteredIcons.map(({ name, icon: Icon, filled })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>selectLucide(name),
                                            className: "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
                                            title: name,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                size: 20,
                                                fill: filled ? "currentColor" : "none",
                                                style: previewColor ? {
                                                    color: previewColor
                                                } : undefined
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 177,
                                                columnNumber: 25
                                            }, this)
                                        }, name, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                            lineNumber: 171,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                    lineNumber: 169,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground text-center py-6",
                                    children: "No icons found"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                    lineNumber: 186,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        paletteColors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-medium text-foreground mb-2 px-0.5",
                                                    children: "Banner Colors"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                    lineNumber: 192,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        paletteColors.slice(0, 5).map((color)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>setPreviewColor(previewColor === color ? null : color),
                                                                className: `w-7 h-7 rounded-full border-2 transition-all ${previewColor === color ? "border-blue-500 scale-110" : "border-transparent hover:scale-105"}`,
                                                                style: {
                                                                    backgroundColor: color
                                                                },
                                                                title: `Preview icons in ${color}`
                                                            }, color, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                                lineNumber: 197,
                                                                columnNumber: 23
                                                            }, this)),
                                                        previewColor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setPreviewColor(null),
                                                            className: "text-xs text-muted-foreground hover:text-foreground ml-1 transition-colors",
                                                            children: "Reset"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                            lineNumber: 212,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                    lineNumber: 195,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                            lineNumber: 191,
                                            columnNumber: 17
                                        }, this),
                                        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LUCIDE_CATEGORIES"].map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-medium text-foreground mb-2 px-0.5",
                                                        children: cat.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-9 gap-0.5",
                                                        children: cat.icons.map(({ name, icon: Icon, filled })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>selectLucide(name),
                                                                className: "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
                                                                title: name,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                    size: 20,
                                                                    fill: filled ? "currentColor" : "none",
                                                                    style: previewColor ? {
                                                                        color: previewColor
                                                                    } : undefined
                                                                }, void 0, false, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                                    lineNumber: 236,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, name, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                                lineNumber: 230,
                                                                columnNumber: 23
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                        lineNumber: 228,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, cat.label, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 224,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this),
                            activeTab === "emojis" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: filteredEmojiCategories ? filteredEmojiCategories.length > 0 ? filteredEmojiCategories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-medium text-foreground mb-2 px-0.5",
                                                children: cat.label
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 260,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-9 gap-0.5",
                                                children: cat.emojis.map((emoji, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>selectEmoji(emoji),
                                                        className: "w-9 h-9 flex items-center justify-center rounded-lg text-xl hover:bg-muted transition-colors",
                                                        children: emoji
                                                    }, `${cat.label}-${i}`, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                        lineNumber: 265,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 263,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, cat.label, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 259,
                                        columnNumber: 21
                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground text-center py-6",
                                    children: "No emojis found"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                    lineNumber: 277,
                                    columnNumber: 19
                                }, this) : __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMOJI_CATEGORIES"].map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-medium text-foreground mb-2 px-0.5",
                                                children: cat.label
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 282,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-9 gap-0.5",
                                                children: cat.emojis.map((emoji, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>selectEmoji(emoji),
                                                        className: "w-9 h-9 flex items-center justify-center rounded-lg text-xl hover:bg-muted transition-colors",
                                                        children: emoji
                                                    }, `${cat.label}-${i}`, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 285,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, cat.label, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 281,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 254,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
_s(EmojiPicker, "i2rO3w2ht7vxQeRZeJtwvBjWU/Y=");
_c = EmojiPicker;
var _c;
__turbopack_context__.k.register(_c, "EmojiPicker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LUCIDE_ICON_MAP",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LUCIDE_ICON_MAP"],
    "default",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$EmojiPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"],
    "isFilledIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isFilledIcon"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$EmojiPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/emoji-picker-data.ts [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_claude_worktrees_claude-work_src_2e15dde7._.js.map