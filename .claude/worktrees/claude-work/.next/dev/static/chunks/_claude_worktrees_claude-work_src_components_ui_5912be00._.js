(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/.claude/worktrees/claude-work/src/components/ui/EditToggleButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditToggleButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Shared edit/done toggle button.
 * Pencil icon when not editing, iOS-style blue pill with "Done" when editing.
 * Used by the home dashboard and anywhere else that needs an edit mode toggle.
 *
 * @param editing - Whether edit mode is currently active
 * @param onToggle - Callback to toggle edit mode
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as Pencil>");
"use client";
;
;
function EditToggleButton({ editing, onToggle, id }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        id: id,
        onClick: onToggle,
        className: `flex items-center justify-center transition-all duration-200 ${editing ? "px-5 py-2 text-sm font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm active:scale-[0.97]" : "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-[0.95]"}`,
        "aria-label": editing ? "Done editing" : "Edit",
        children: editing ? "Done" : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
            size: 16
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditToggleButton.tsx",
            lineNumber: 32,
            columnNumber: 27
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/EditToggleButton.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_c = EditToggleButton;
var _c;
__turbopack_context__.k.register(_c, "EditToggleButton");
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
"[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FontPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Custom font picker dropdown that renders each option in its own typeface.
 * Groups fonts by category (Sans / Rounded / Serif) with section headers.
 * Dropdown is portaled to document.body to escape modal overflow clipping.
 *
 * @param value - Current font-family CSS value (empty = System Default)
 * @param onChange - Callback with the selected font-family value
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$font$2d$options$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/font-options.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
/**
 * Groups font options by category in display order.
 *
 * @returns Array of [category, options[]] tuples
 */ function groupedFonts() {
    const categories = [
        "sans",
        "rounded",
        "serif"
    ];
    return categories.map((cat)=>[
            cat,
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$font$2d$options$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_OPTIONS"].filter((f)=>f.category === cat)
        ]);
}
function FontPicker({ value, onChange }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const triggerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0,
        width: 0
    });
    /** Normalize empty string (legacy/unsaved) to the system default value. */ const normalizedValue = value || __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$font$2d$options$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYSTEM_DEFAULT_FONT"];
    const currentFont = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$font$2d$options$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_OPTIONS"].find((f)=>f.value === normalizedValue);
    const displayLabel = currentFont?.label || "System Default";
    /** Max dropdown height matches max-h-64 (256px). */ const DROPDOWN_MAX_H = 256;
    /** Compute dropdown position from trigger bounding rect. Flips above if needed. */ const updatePosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FontPicker.useCallback[updatePosition]": ()=>{
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom - 8;
            const flipAbove = spaceBelow < DROPDOWN_MAX_H && rect.top > spaceBelow;
            setPos({
                top: flipAbove ? rect.top - DROPDOWN_MAX_H - 4 : rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
    }["FontPicker.useCallback[updatePosition]"], []);
    /** Open dropdown and compute position. */ function handleToggle() {
        if (!open) updatePosition();
        setOpen((prev)=>!prev);
    }
    /** Close dropdown when clicking outside trigger or dropdown. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FontPicker.useEffect": ()=>{
            if (!open) return;
            function handleClick(e) {
                const target = e.target;
                if (triggerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
                    return;
                }
                setOpen(false);
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "FontPicker.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["FontPicker.useEffect"];
        }
    }["FontPicker.useEffect"], [
        open
    ]);
    /** Close on Escape key. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FontPicker.useEffect": ()=>{
            if (!open) return;
            function handleKey(e) {
                if (e.key === "Escape") setOpen(false);
            }
            document.addEventListener("keydown", handleKey);
            return ({
                "FontPicker.useEffect": ()=>document.removeEventListener("keydown", handleKey)
            })["FontPicker.useEffect"];
        }
    }["FontPicker.useEffect"], [
        open
    ]);
    /** Reposition on scroll/resize while open. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FontPicker.useEffect": ()=>{
            if (!open) return;
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);
            return ({
                "FontPicker.useEffect": ()=>{
                    window.removeEventListener("scroll", updatePosition, true);
                    window.removeEventListener("resize", updatePosition);
                }
            })["FontPicker.useEffect"];
        }
    }["FontPicker.useEffect"], [
        open,
        updatePosition
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                ref: triggerRef,
                type: "button",
                onClick: handleToggle,
                className: "w-full flex items-center justify-between px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
                style: {
                    fontFamily: normalizedValue
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate",
                        children: displayLabel
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        size: 14,
                        className: `shrink-0 ml-2 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            open && typeof document !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: dropdownRef,
                className: "fixed z-[100] max-h-64 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg py-1",
                style: {
                    top: pos.top,
                    left: pos.left,
                    width: pos.width
                },
                children: groupedFonts().map(([category, options])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 pt-2 pb-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-medium text-foreground",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$font$2d$options$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_CATEGORY_LABELS"][category]
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx",
                                    lineNumber: 146,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx",
                                lineNumber: 145,
                                columnNumber: 17
                            }, this),
                            options.map((font)=>{
                                const isSelected = font.value === normalizedValue;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        onChange(font.value);
                                        setOpen(false);
                                    },
                                    className: `w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer ${isSelected ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20" : "text-foreground hover:bg-accent"}`,
                                    style: {
                                        fontFamily: font.value || undefined
                                    },
                                    children: font.label
                                }, font.value || "__default__", false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx",
                                    lineNumber: 155,
                                    columnNumber: 21
                                }, this);
                            })
                        ]
                    }, category, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx",
                        lineNumber: 143,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx",
                lineNumber: 133,
                columnNumber: 11
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/FontPicker.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
_s(FontPicker, "QWti6g2k/YVoFs8Hqi+mYDFXuac=");
_c = FontPicker;
var _c;
__turbopack_context__.k.register(_c, "FontPicker");
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
"[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ColorPickerPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Reusable color picker panel with preset swatches + saved custom colors.
 * Shows a grid of preset colors, a "+" button to save a custom color via
 * native color input, and a row of user-saved colors from localStorage.
 * Optionally shows an "Apply to all widgets?" prompt after color selection.
 *
 * @param value - Current hex color value
 * @param onChange - Callback fired when color changes
 * @param onApplyToAll - Optional callback to apply color to all widgets
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pipette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pipette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pipette.js [app-client] (ecmascript) <export default as Pipette>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorWheel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/ColorWheel.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const SAVED_COLORS_KEY = "caltodo_saved_colors";
const MAX_SAVED = 12;
/**
 * Loads saved custom colors from localStorage.
 *
 * @returns Array of hex color strings
 */ function loadSavedColors() {
    try {
        const raw = localStorage.getItem(SAVED_COLORS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.slice(0, MAX_SAVED) : [];
    } catch  {
        return [];
    }
}
/**
 * Saves a custom color to localStorage (deduplicates, newest first).
 *
 * @param color - Hex color string to save
 */ function addSavedColor(color) {
    try {
        const existing = loadSavedColors();
        const upper = color.toUpperCase();
        const filtered = existing.filter((c)=>c.toUpperCase() !== upper);
        localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify([
            color,
            ...filtered
        ].slice(0, MAX_SAVED)));
    } catch  {}
}
/**
 * Removes a saved color from localStorage.
 *
 * @param color - Hex color string to remove
 */ function removeSavedColor(color) {
    try {
        const existing = loadSavedColors();
        const upper = color.toUpperCase();
        localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(existing.filter((c)=>c.toUpperCase() !== upper)));
    } catch  {}
}
function ColorPickerPanel({ value, onChange, onApplyToAll }) {
    _s();
    const [savedColors, setSavedColors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showWheel, setShowWheel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [wheelColor, setWheelColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(value || "#4285F4");
    const [showApplyPrompt, setShowApplyPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingColor, setPendingColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const promptTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Load saved colors on mount. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorPickerPanel.useEffect": ()=>{
            setSavedColors(loadSavedColors());
        }
    }["ColorPickerPanel.useEffect"], []);
    /** Clear prompt timer on unmount. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorPickerPanel.useEffect": ()=>{
            return ({
                "ColorPickerPanel.useEffect": ()=>{
                    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
                }
            })["ColorPickerPanel.useEffect"];
        }
    }["ColorPickerPanel.useEffect"], []);
    /**
   * Handles color selection — applies it and optionally shows "apply to all" prompt.
   *
   * @param color - Selected hex color
   */ function handleColorSelect(color) {
        onChange(color);
        if (onApplyToAll) {
            setPendingColor(color);
            setShowApplyPrompt(true);
            if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
            promptTimerRef.current = setTimeout(()=>setShowApplyPrompt(false), 4000);
        }
    }
    /**
   * Toggles the color wheel open/closed. Syncs wheel color to current value.
   */ function handleToggleWheel() {
        if (!showWheel) setWheelColor(value || "#4285F4");
        setShowWheel((prev)=>!prev);
    }
    /**
   * Saves the current wheel color to saved colors and selects it.
   */ function handleSaveWheelColor() {
        addSavedColor(wheelColor);
        setSavedColors(loadSavedColors());
        handleColorSelect(wheelColor);
    }
    /** Whether the browser supports the EyeDropper API. */ const hasEyeDropper = ("TURBOPACK compile-time value", "object") !== "undefined" && "EyeDropper" in window;
    /**
   * Opens the native EyeDropper to pick a color from anywhere on screen.
   */ async function handleEyeDropper() {
        try {
            // Hide all overlays/modals so the eyedropper sees the actual page
            document.body.classList.add("eyedropper-active");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dropper = new window.EyeDropper();
            const result = await dropper.open();
            document.body.classList.remove("eyedropper-active");
            if (result?.sRGBHex) {
                handleColorSelect(result.sRGBHex);
            }
        } catch  {
            document.body.classList.remove("eyedropper-active");
        }
    }
    /**
   * Removes a saved color swatch.
   *
   * @param color - Hex color to remove
   * @param e - Mouse event (stopped to prevent selection)
   */ function handleRemoveSaved(color, e) {
        e.stopPropagation();
        removeSavedColor(color);
        setSavedColors(loadSavedColors());
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-6 gap-2 justify-items-center",
                children: [
                    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TASK_COLORS"].map((c)=>{
                        const isSelected = value.toUpperCase() === c.toUpperCase();
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>handleColorSelect(c),
                            className: `w-7 h-7 rounded-full transition-all duration-150 cursor-pointer ${isSelected ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900 scale-110" : "hover:scale-110"}`,
                            style: {
                                backgroundColor: c
                            },
                            "aria-label": `Color ${c}`
                        }, c, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                            lineNumber: 165,
                            columnNumber: 13
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleToggleWheel,
                        className: `w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-150 ${showWheel ? "border-blue-500 scale-110" : "border-border hover:border-muted-foreground"}`,
                        "aria-label": "Add custom color",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            size: 12,
                            className: "text-muted-foreground"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                            lineNumber: 189,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    hasEyeDropper && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleEyeDropper,
                        className: "w-7 h-7 rounded-full border-2 border-border flex items-center justify-center cursor-pointer hover:scale-110 hover:border-muted-foreground transition-all duration-150",
                        "aria-label": "Pick color from screen",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pipette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pipette$3e$__["Pipette"], {
                            size: 12,
                            className: "text-muted-foreground"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                            lineNumber: 200,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                        lineNumber: 194,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this),
            showWheel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-2 pt-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorWheel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        value: wheelColor,
                        onChange: (c)=>{
                            setWheelColor(c);
                            onChange(c);
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                        lineNumber: 208,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleSaveWheelColor,
                        className: "flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                size: 10
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                                lineNumber: 220,
                                columnNumber: 13
                            }, this),
                            "Save color"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                        lineNumber: 215,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                lineNumber: 207,
                columnNumber: 9
            }, this),
            savedColors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pt-1 border-t border-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] text-muted-foreground mb-1.5",
                        children: "Saved"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                        lineNumber: 229,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2",
                        children: savedColors.map((c)=>{
                            const isSelected = value.toUpperCase() === c.toUpperCase();
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>handleColorSelect(c),
                                        className: `w-6 h-6 rounded-full transition-all duration-150 cursor-pointer ${isSelected ? "ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900 scale-110" : "hover:scale-110"}`,
                                        style: {
                                            backgroundColor: c
                                        },
                                        "aria-label": `Saved color ${c}`
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                                        lineNumber: 235,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: (e)=>handleRemoveSaved(c, e),
                                        className: "absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-popover border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                                        "aria-label": `Remove saved color ${c}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 8,
                                            className: "text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                                            lineNumber: 252,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                                        lineNumber: 246,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, c, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                                lineNumber: 234,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                        lineNumber: 230,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                lineNumber: 228,
                columnNumber: 9
            }, this),
            showApplyPrompt && onApplyToAll && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2 pt-2 border-t border-border animate-in fade-in duration-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-muted-foreground",
                        children: "Apply to all widgets?"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                        lineNumber: 264,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setShowApplyPrompt(false),
                                className: "text-[11px] px-2 py-0.5 rounded-md text-muted-foreground hover:bg-muted transition-colors",
                                children: "No"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                                lineNumber: 266,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    onApplyToAll(pendingColor);
                                    setShowApplyPrompt(false);
                                },
                                className: "text-[11px] px-2 py-0.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                                children: "Apply"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                                lineNumber: 273,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                        lineNumber: 265,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
                lineNumber: 263,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this);
}
_s(ColorPickerPanel, "7KC9GClnzYbmOsUbeYzS8hFSTIw=");
_c = ColorPickerPanel;
var _c;
__turbopack_context__.k.register(_c, "ColorPickerPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DROPDOWN_WIDTH",
    ()=>DROPDOWN_WIDTH,
    "PICKER_GAP",
    ()=>PICKER_GAP,
    "PICKER_PAD",
    ()=>PICKER_PAD,
    "computePickerPosition",
    ()=>computePickerPosition,
    "default",
    ()=>ColorPickerPopover
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Portal-based color picker popover. Follows FontPicker.tsx dropdown pattern.
 * Trigger: a small color circle. Dropdown: portaled to document.body with
 * click-outside/Escape dismissal and scroll/resize repositioning.
 *
 * @param label - Label text for the color setting
 * @param value - Current hex color value (empty = default/no color)
 * @param onChange - Callback with new hex value (empty = reset)
 * @param layout - "horizontal" (label left, circle right) or "compact" (label above, circle below)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorPickerPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPanel.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const DROPDOWN_WIDTH = 288;
const PICKER_PAD = 8;
const PICKER_GAP = 8;
function computePickerPosition(triggerRect, dropdownH, viewportW, viewportH) {
    // Horizontal: align left edge to trigger, clamp to viewport
    let left = triggerRect.left;
    left = Math.max(PICKER_PAD, Math.min(left, viewportW - DROPDOWN_WIDTH - PICKER_PAD));
    // Vertical: prefer below, flip above if more room
    const spaceBelow = viewportH - triggerRect.bottom - PICKER_GAP;
    const spaceAbove = triggerRect.top - PICKER_GAP;
    let top;
    if (spaceBelow >= dropdownH || spaceBelow >= spaceAbove) {
        top = triggerRect.bottom + PICKER_GAP;
    } else {
        top = triggerRect.top - dropdownH - PICKER_GAP;
        if (top < PICKER_PAD) top = PICKER_PAD;
    }
    return {
        top,
        left
    };
}
function ColorPickerPopover({ label, value, onChange, layout = "horizontal", defaultValue, onApplyToAll }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isClosing, setIsClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const triggerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        top: 0,
        left: 0
    });
    /** Delegates to pure computePickerPosition(). */ const updatePosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ColorPickerPopover.useCallback[updatePosition]": ()=>{
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            const actualH = dropdownRef.current?.offsetHeight ?? 380;
            setPos(computePickerPosition(rect, actualH, window.innerWidth, window.innerHeight));
        }
    }["ColorPickerPopover.useCallback[updatePosition]"], []);
    /** Reposition when dropdown content resizes (e.g. color wheel expands). */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorPickerPopover.useEffect": ()=>{
            if (!open || !dropdownRef.current) return;
            const observer = new ResizeObserver({
                "ColorPickerPopover.useEffect": ()=>updatePosition()
            }["ColorPickerPopover.useEffect"]);
            observer.observe(dropdownRef.current);
            return ({
                "ColorPickerPopover.useEffect": ()=>observer.disconnect()
            })["ColorPickerPopover.useEffect"];
        }
    }["ColorPickerPopover.useEffect"], [
        open,
        updatePosition
    ]);
    /** Toggle dropdown open/close. */ function handleToggle() {
        if (open || isClosing) {
            handleClose();
        } else {
            updatePosition();
            setOpen(true);
            // Re-measure after render to use actual dropdown height
            requestAnimationFrame(()=>updatePosition());
        }
    }
    /** Animate close then unmount. */ function handleClose() {
        if (!open || isClosing) return;
        setIsClosing(true);
    }
    /** Handle exit animation end — unmount dropdown. */ function handleAnimationEnd() {
        if (isClosing) {
            setOpen(false);
            setIsClosing(false);
        }
    }
    /** Close dropdown when clicking outside trigger or dropdown. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorPickerPopover.useEffect": ()=>{
            if (!open) return;
            function handleClick(e) {
                const target = e.target;
                if (triggerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
                    return;
                }
                handleClose();
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "ColorPickerPopover.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["ColorPickerPopover.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ColorPickerPopover.useEffect"], [
        open,
        isClosing
    ]);
    /** Close on Escape key. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorPickerPopover.useEffect": ()=>{
            if (!open) return;
            function handleKey(e) {
                if (e.key === "Escape") handleClose();
            }
            document.addEventListener("keydown", handleKey);
            return ({
                "ColorPickerPopover.useEffect": ()=>document.removeEventListener("keydown", handleKey)
            })["ColorPickerPopover.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ColorPickerPopover.useEffect"], [
        open,
        isClosing
    ]);
    /** Reposition on scroll/resize while open. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorPickerPopover.useEffect": ()=>{
            if (!open) return;
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);
            return ({
                "ColorPickerPopover.useEffect": ()=>{
                    window.removeEventListener("scroll", updatePosition, true);
                    window.removeEventListener("resize", updatePosition);
                }
            })["ColorPickerPopover.useEffect"];
        }
    }["ColorPickerPopover.useEffect"], [
        open,
        updatePosition
    ]);
    const circleButton = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ref: triggerRef,
        type: "button",
        onClick: handleToggle,
        className: `relative w-7 h-7 rounded-full overflow-hidden cursor-pointer transition-transform hover:scale-110 shrink-0 ${value ? "border-2 border-border" : "border border-dashed border-border"}`,
        "aria-label": `Pick ${label} color`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full",
            style: {
                backgroundColor: value || defaultValue || "var(--muted)"
            }
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
            lineNumber: 180,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
    const dropdown = open && typeof document !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: dropdownRef,
        className: `fixed z-[100] w-72 max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-popover shadow-lg p-3 ${isClosing ? "animate-popover-out" : "animate-popover-in"}`,
        style: {
            top: pos.top,
            left: pos.left
        },
        onAnimationEnd: handleAnimationEnd,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-medium text-foreground",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
                        lineNumber: 200,
                        columnNumber: 11
                    }, this),
                    value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>onChange(""),
                        className: "text-[10px] text-muted-foreground hover:text-foreground transition-colors",
                        children: "Reset"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
                        lineNumber: 202,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
                lineNumber: 199,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ColorPickerPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                value: value || defaultValue || "#000000",
                onChange: onChange,
                onApplyToAll: onApplyToAll
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
                lineNumber: 211,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
        lineNumber: 191,
        columnNumber: 7
    }, this), document.body);
    if (layout === "compact") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center gap-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[10px] text-muted-foreground",
                    children: label
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
                    lineNumber: 219,
                    columnNumber: 9
                }, this),
                circleButton,
                dropdown
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
            lineNumber: 218,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-between",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-foreground",
                children: label
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
                lineNumber: 228,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    circleButton,
                    value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>onChange(""),
                        className: "text-[10px] text-muted-foreground hover:text-foreground transition-colors",
                        children: "Reset"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
                        lineNumber: 232,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
                lineNumber: 229,
                columnNumber: 7
            }, this),
            dropdown
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/ColorPickerPopover.tsx",
        lineNumber: 227,
        columnNumber: 5
    }, this);
}
_s(ColorPickerPopover, "1cbyd+W4nAWLqPdAPIbOyUpBYYA=");
_c = ColorPickerPopover;
var _c;
__turbopack_context__.k.register(_c, "ColorPickerPopover");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SIDE_PANEL_EDGE_PAD",
    ()=>SIDE_PANEL_EDGE_PAD,
    "SIDE_PANEL_GAP",
    ()=>SIDE_PANEL_GAP,
    "SIDE_PANEL_WIDTH",
    ()=>SIDE_PANEL_WIDTH,
    "computeSidePanelPosition",
    ()=>computeSidePanelPosition,
    "default",
    ()=>SidePanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const SIDE_PANEL_WIDTH = 340;
const SIDE_PANEL_GAP = 16;
const SIDE_PANEL_EDGE_PAD = 8;
function computeSidePanelPosition(anchorRect, viewportW, viewportH, panelH) {
    const side = anchorRect.right + SIDE_PANEL_GAP + SIDE_PANEL_WIDTH < viewportW ? "right" : anchorRect.left - SIDE_PANEL_GAP - SIDE_PANEL_WIDTH > SIDE_PANEL_EDGE_PAD ? "left" : "right";
    let left = side === "right" ? anchorRect.right + SIDE_PANEL_GAP : anchorRect.left - SIDE_PANEL_GAP - SIDE_PANEL_WIDTH;
    left = Math.max(SIDE_PANEL_EDGE_PAD, Math.min(left, viewportW - SIDE_PANEL_WIDTH - SIDE_PANEL_EDGE_PAD));
    let top = anchorRect.top;
    if (top + panelH > viewportH - SIDE_PANEL_EDGE_PAD) top = viewportH - panelH - SIDE_PANEL_EDGE_PAD;
    if (top < SIDE_PANEL_EDGE_PAD) top = SIDE_PANEL_EDGE_PAD;
    return {
        side,
        top,
        left
    };
}
function SidePanel({ title, icon: IconComponent, side = "right", position, onClose, children, footer }) {
    _s();
    const [isClosing, setIsClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const panelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SidePanel.useEffect": ()=>{
            setIsMobile(window.innerWidth < 768);
        }
    }["SidePanel.useEffect"], []);
    /**
   * Triggers the close animation.
   */ const triggerClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SidePanel.useCallback[triggerClose]": ()=>{
            setIsClosing(true);
        }
    }["SidePanel.useCallback[triggerClose]"], []);
    /**
   * Calls onClose after the exit animation completes.
   */ function handleAnimEnd() {
        if (isClosing) onClose();
    }
    const animClass = isClosing ? isMobile ? "animate-editor-sheet-out" : `animate-editor-panel-out-${side}` : isMobile ? "animate-editor-sheet-in" : `animate-editor-panel-in-${side}`;
    const panelCls = isMobile ? `fixed bottom-0 left-0 right-0 z-[52] max-h-[60vh] bg-popover border-t border-border rounded-t-2xl shadow-2xl flex flex-col ${animClass}` : `fixed z-[52] bg-popover border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] ${animClass}`;
    const panelStyle = isMobile ? {
        paddingBottom: "env(safe-area-inset-bottom, 0px)"
    } : position;
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
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx",
                                lineNumber: 129,
                                columnNumber: 13
                            }, this),
                            title
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx",
                        lineNumber: 127,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: triggerClose,
                        className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                        "aria-label": "Close",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto",
                children: children
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx",
                lineNumber: 143,
                columnNumber: 7
            }, this),
            footer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-t border-border",
                children: footer
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx",
                lineNumber: 149,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SidePanel.tsx",
        lineNumber: 119,
        columnNumber: 5
    }, this);
}
_s(SidePanel, "6BcquOctdea/zhPt+cNcNvZ4pls=");
_c = SidePanel;
var _c;
__turbopack_context__.k.register(_c, "SidePanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_claude_worktrees_claude-work_src_components_ui_5912be00._.js.map