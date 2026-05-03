module.exports = [
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Digital clock face — time with thin divider and date below.
 * Extracted from the original ClockWidget layout.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */ __turbopack_context__.s([
    "default",
    ()=>DigitalFace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function DigitalFace({ now, is24h, timezone, fontWeight }) {
    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: !is24h,
        ...timezone ? {
            timeZone: timezone
        } : {}
    };
    const dateOptions = {
        weekday: "long",
        month: "short",
        day: "numeric",
        ...timezone ? {
            timeZone: timezone
        } : {}
    };
    const timeStr = now.toLocaleTimeString([], timeOptions);
    const dateStr = now.toLocaleDateString([], dateOptions);
    /** Split time into parts around the colon for blinking. */ const colonIdx = timeStr.indexOf(":");
    const timeBefore = colonIdx >= 0 ? timeStr.slice(0, colonIdx) : timeStr;
    const timeAfter = colonIdx >= 0 ? timeStr.slice(colonIdx + 1) : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col items-center justify-center p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-4xl tracking-tight text-foreground tabular-nums",
                style: {
                    fontWeight: Number(fontWeight)
                },
                children: [
                    timeBefore,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            animation: "colonBlink 1s ease-in-out infinite"
                        },
                        children: ":"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    timeAfter
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-10 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-2"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[11px] tracking-[0.15em] text-foreground",
                children: dateStr
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Analog clock face — SVG circle with hour, minute, and second hands.
 * 12 tick marks around the rim. Responsive via viewBox.
 *
 * @param now - Current Date
 * @param is24h - Unused (analog is always 12-hour visual)
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - Unused for SVG hands
 */ __turbopack_context__.s([
    "default",
    ()=>AnalogFace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
/**
 * Extracts hours, minutes, seconds for a given timezone.
 *
 * @param now - Current Date
 * @param timezone - IANA timezone string or undefined
 * @returns Object with h (0-23), m (0-59), s (0-59)
 */ function getTimeParts(now, timezone) {
    if (!timezone) {
        return {
            h: now.getHours(),
            m: now.getMinutes(),
            s: now.getSeconds()
        };
    }
    const parts = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
        timeZone: timezone
    }).formatToParts(now);
    let h = 0, m = 0, s = 0;
    for (const p of parts){
        if (p.type === "hour") h = parseInt(p.value);
        if (p.type === "minute") m = parseInt(p.value);
        if (p.type === "second") s = parseInt(p.value);
    }
    return {
        h,
        m,
        s
    };
}
function AnalogFace({ now, timezone }) {
    const { h, m, s } = getTimeParts(now, timezone);
    const cx = 100;
    const cy = 100;
    const hourAngle = h % 12 * 30 + m * 0.5;
    const minuteAngle = m * 6;
    const secondAngle = s * 6;
    const ticks = Array.from({
        length: 12
    }, (_, i)=>i * 30);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex items-center justify-center p-3",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            viewBox: "0 0 200 200",
            className: "max-w-[160px] aspect-square",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: cx,
                    cy: cy,
                    r: 92,
                    fill: "none",
                    className: "stroke-border",
                    strokeWidth: 2
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this),
                ticks.map((angle)=>{
                    const isMajor = angle % 90 === 0;
                    const outerR = 88;
                    const innerR = isMajor ? 78 : 82;
                    const rad = (angle - 90) * (Math.PI / 180);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                        x1: cx + innerR * Math.cos(rad),
                        y1: cy + innerR * Math.sin(rad),
                        x2: cx + outerR * Math.cos(rad),
                        y2: cy + outerR * Math.sin(rad),
                        className: "stroke-foreground",
                        strokeWidth: isMajor ? 2.5 : 1.5,
                        strokeLinecap: "round"
                    }, angle, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx",
                        lineNumber: 70,
                        columnNumber: 13
                    }, this);
                }),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: cx,
                    y1: cy,
                    x2: cx,
                    y2: cy - 48,
                    className: "stroke-foreground",
                    strokeWidth: 3.5,
                    strokeLinecap: "round",
                    transform: `rotate(${hourAngle} ${cx} ${cy})`
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: cx,
                    y1: cy,
                    x2: cx,
                    y2: cy - 66,
                    className: "stroke-foreground",
                    strokeWidth: 2.5,
                    strokeLinecap: "round",
                    transform: `rotate(${minuteAngle} ${cx} ${cy})`
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: cx,
                    y1: cy,
                    x2: cx,
                    y2: cy - 70,
                    className: "stroke-red-500",
                    strokeWidth: 1,
                    strokeLinecap: "round",
                    transform: `rotate(${secondAngle} ${cx} ${cy})`
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: cx,
                    cy: cy,
                    r: 3,
                    className: "fill-foreground"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx",
                    lineNumber: 114,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx",
            lineNumber: 54,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/MinimalFace.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Minimal clock face — time only, oversized, ultra-clean.
 * No date, no divider.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */ __turbopack_context__.s([
    "default",
    ()=>MinimalFace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function MinimalFace({ now, is24h, timezone, fontWeight }) {
    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: !is24h,
        ...timezone ? {
            timeZone: timezone
        } : {}
    };
    const secondsOptions = {
        second: "2-digit",
        ...timezone ? {
            timeZone: timezone
        } : {}
    };
    const timeStr = now.toLocaleTimeString([], timeOptions);
    const seconds = now.toLocaleTimeString([], secondsOptions).replace(/[^0-9]/g, "").slice(-2).padStart(2, "0");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col items-center justify-center p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-5xl font-extralight tracking-tighter text-foreground tabular-nums",
                children: timeStr
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/MinimalFace.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-foreground/20 tabular-nums mt-1",
                children: seconds
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/MinimalFace.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/MinimalFace.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Flip clock face — retro flip-card style with each digit in a card.
 * Colon separator between hours and minutes. AM/PM label in 12-hour mode.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */ __turbopack_context__.s([
    "default",
    ()=>FlipFace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
/**
 * Formats time into individual digit strings for flip display.
 *
 * @param now - Current Date
 * @param is24h - Whether to use 24-hour format
 * @param timezone - IANA timezone or undefined
 * @returns Object with digits array and optional period string
 */ function getFlipDigits(now, is24h, timezone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: !is24h,
        ...timezone ? {
            timeZone: timezone
        } : {}
    }).formatToParts(now);
    let hour = "";
    let minute = "";
    let period = "";
    for (const p of parts){
        if (p.type === "hour") hour = p.value.padStart(2, "0");
        if (p.type === "minute") minute = p.value.padStart(2, "0");
        if (p.type === "dayPeriod") period = p.value;
    }
    return {
        digits: [
            hour[0],
            hour[1],
            minute[0],
            minute[1]
        ],
        period
    };
}
/**
 * Single flip digit card.
 *
 * @param digit - Single character to display
 * @param fontWeight - CSS font-weight number
 */ function FlipCard({ digit, fontWeight }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-10 h-16 rounded-xl bg-foreground/[0.06] flex items-center justify-center shadow-sm overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-x-0 top-1/2 h-px bg-foreground/[0.08]"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-2xl tabular-nums text-foreground relative z-10",
                style: {
                    fontWeight
                },
                children: digit
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
function FlipFace({ now, is24h, timezone, fontWeight }) {
    const { digits, period } = getFlipDigits(now, is24h, timezone);
    const weight = Number(fontWeight);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex items-center justify-center gap-1.5 p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FlipCard, {
                digit: digits[0],
                fontWeight: weight
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FlipCard, {
                digit: digits[1],
                fontWeight: weight
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-2xl text-foreground font-bold mx-0.5 -mt-1",
                style: {
                    animation: "colonBlink 1s ease-in-out infinite"
                },
                children: ":"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FlipCard, {
                digit: digits[2],
                fontWeight: weight
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FlipCard, {
                digit: digits[3],
                fontWeight: weight
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            period && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] text-muted-foreground ml-1 self-end mb-1.5 bg-muted rounded-md px-1.5 py-0.5",
                children: period
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
                lineNumber: 84,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/StackedFace.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Stacked clock face — hours large on top, minutes below, thin divider between.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */ __turbopack_context__.s([
    "default",
    ()=>StackedFace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
/**
 * Extracts formatted hour and minute strings.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined
 * @returns Object with hour, minute, and optional period strings
 */ function getStackedParts(now, is24h, timezone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: !is24h,
        ...timezone ? {
            timeZone: timezone
        } : {}
    }).formatToParts(now);
    let hour = "";
    let minute = "";
    let period = "";
    for (const p of parts){
        if (p.type === "hour") hour = p.value.padStart(2, "0");
        if (p.type === "minute") minute = p.value.padStart(2, "0");
        if (p.type === "dayPeriod") period = p.value;
    }
    return {
        hour,
        minute,
        period
    };
}
function StackedFace({ now, is24h, timezone, fontWeight }) {
    const { hour, minute, period } = getStackedParts(now, is24h, timezone);
    const weight = Number(fontWeight);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col items-center justify-center p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-6xl font-extralight tracking-tight text-foreground tabular-nums leading-none",
                children: hour
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/StackedFace.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-8 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-2"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/StackedFace.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-4xl font-extralight tracking-tight text-foreground/60 tabular-nums leading-none",
                children: minute
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/StackedFace.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            period && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] text-muted-foreground mt-2 bg-muted rounded-md px-1.5 py-0.5",
                children: period
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/StackedFace.tsx",
                lineNumber: 63,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/StackedFace.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SplitFace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Split clock face — hours and minutes in separate rounded cards
 * that scale to fill the widget container. Matches the Notion-style
 * large card clock layout.
 *
 * @param now - Current Date
 * @param is24h - 24-hour mode
 * @param timezone - IANA timezone or undefined for local
 * @param fontWeight - CSS font-weight string
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
/**
 * Extracts formatted hours, minutes, period, and day from a Date.
 *
 * @param now - Current Date
 * @param is24h - Whether to use 24-hour format
 * @param timezone - IANA timezone or undefined
 * @returns Object with hour, minute, period, and day strings
 */ function getSplitParts(now, is24h, timezone) {
    const timeParts = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: !is24h,
        ...timezone ? {
            timeZone: timezone
        } : {}
    }).formatToParts(now);
    const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        ...timezone ? {
            timeZone: timezone
        } : {}
    }).format(now);
    let hour = "";
    let minute = "";
    let period = "";
    for (const p of timeParts){
        if (p.type === "hour") hour = p.value.padStart(2, "0");
        if (p.type === "minute") minute = p.value.padStart(2, "0");
        if (p.type === "dayPeriod") period = p.value;
    }
    return {
        hour,
        minute,
        period,
        day: dayName.toUpperCase()
    };
}
function SplitFace({ now, is24h, timezone, fontWeight }) {
    const { hour, minute, period, day } = getSplitParts(now, is24h, timezone);
    const weight = Number(fontWeight);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [size, setSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        w: 0,
        h: 0
    });
    /** Observe container size to scale cards proportionally. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry])=>{
            const { width, height } = entry.contentRect;
            setSize({
                w: width,
                h: height
            });
        });
        ro.observe(el);
        return ()=>ro.disconnect();
    }, []);
    // Scale cards to fill nearly all available space
    // Reserve ~15% height for labels below the cards
    const cardAreaH = size.h * 0.82;
    const availW = size.w * 0.88;
    const gap = Math.max(availW * 0.03, 4);
    const cardW = (availW - gap) / 2;
    const cardH = Math.min(cardAreaH, cardW * 1.2);
    const fontSize = cardH * 0.58;
    const labelSize = Math.max(cardH * 0.13, 10);
    const borderRadius = cardH * 0.12;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "h-full w-full flex items-center justify-center",
        children: size.w > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-start justify-center",
            style: {
                gap
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative flex items-center justify-center overflow-hidden",
                            style: {
                                width: cardW,
                                height: cardH,
                                borderRadius,
                                backgroundColor: "var(--split-card-bg, rgba(200, 190, 180, 0.25))"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-x-0 top-1/2 -translate-y-px",
                                    style: {
                                        height: 1,
                                        backgroundColor: "var(--split-divider, rgba(0,0,0,0.06))"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                                    lineNumber: 97,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "tabular-nums leading-none relative z-10",
                                    style: {
                                        fontSize,
                                        fontWeight: Math.max(weight, 700),
                                        color: "var(--split-digit-color, white)"
                                    },
                                    children: hour
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                                    lineNumber: 101,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                            lineNumber: 88,
                            columnNumber: 13
                        }, this),
                        period && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-muted-foreground uppercase tracking-wider font-semibold",
                            style: {
                                fontSize: labelSize,
                                marginTop: labelSize * 0.4
                            },
                            children: period
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                            lineNumber: 113,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                    lineNumber: 87,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative flex items-center justify-center overflow-hidden",
                            style: {
                                width: cardW,
                                height: cardH,
                                borderRadius,
                                backgroundColor: "var(--split-card-bg, rgba(200, 190, 180, 0.25))"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-x-0 top-1/2 -translate-y-px",
                                    style: {
                                        height: 1,
                                        backgroundColor: "var(--split-divider, rgba(0,0,0,0.06))"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                                    lineNumber: 133,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "tabular-nums leading-none relative z-10",
                                    style: {
                                        fontSize,
                                        fontWeight: Math.max(weight, 700),
                                        color: "var(--split-digit-color, white)"
                                    },
                                    children: minute
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                                    lineNumber: 137,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                            lineNumber: 124,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-muted-foreground uppercase tracking-wider font-semibold",
                            style: {
                                fontSize: labelSize,
                                marginTop: labelSize * 0.4
                            },
                            children: day
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                            lineNumber: 148,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
                    lineNumber: 123,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
            lineNumber: 85,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Barrel exports for clock face components.
 * Provides CLOCK_FACE_MAP for dynamic face lookup by ID.
 */ __turbopack_context__.s([
    "CLOCK_FACE_MAP",
    ()=>CLOCK_FACE_MAP
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$DigitalFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$AnalogFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/AnalogFace.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$MinimalFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/MinimalFace.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$FlipFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/FlipFace.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$StackedFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/StackedFace.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$SplitFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/SplitFace.tsx [app-ssr] (ecmascript)");
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
const CLOCK_FACE_MAP = {
    digital: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$DigitalFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    analog: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$AnalogFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    minimal: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$MinimalFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    flip: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$FlipFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    stacked: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$StackedFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    split: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$SplitFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
};
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx [app-ssr] (ecmascript) <export default as DigitalFace>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DigitalFace",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$DigitalFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$DigitalFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx [app-ssr] (ecmascript)");
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClockWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClockWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Live clock widget — thin dispatcher that delegates to a clock face component.
 * Manages the 1-second timer and resolves the active face from config.
 *
 * @param config - Widget configuration (clockFace, clockFormat, clockTimezone, clockFontWeight)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$DigitalFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DigitalFace$3e$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/clock-faces/DigitalFace.tsx [app-ssr] (ecmascript) <export default as DigitalFace>");
"use client";
;
;
;
function ClockWidget({ config }) {
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setNow(new Date());
        const timer = setInterval(()=>setNow(new Date()), 1000);
        return ()=>clearInterval(timer);
    }, []);
    if (!now) return null;
    const faceId = config?.clockFace || "digital";
    const Face = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLOCK_FACE_MAP"][faceId] || __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$clock$2d$faces$2f$DigitalFace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DigitalFace$3e$__["DigitalFace"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Face, {
        now: now,
        is24h: config?.clockFormat === "24",
        timezone: config?.clockTimezone || undefined,
        fontWeight: config?.clockFontWeight || "300"
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClockWidget.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WidgetEmptyState",
    ()=>WidgetEmptyState,
    "WidgetHeader",
    ()=>WidgetHeader,
    "WidgetProgressBar",
    ()=>WidgetProgressBar,
    "WidgetShell",
    ()=>WidgetShell,
    "WidgetStat",
    ()=>WidgetStat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function WidgetShell({ children, className = "", centered = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `h-full w-full flex flex-col p-3 overflow-hidden ${centered ? "items-center justify-center text-center" : ""} ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
function WidgetHeader({ title, right }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "widget-header flex items-center justify-between mb-2 -mx-3 -mt-3 px-3 h-8 shrink-0 border-b border-foreground/[0.06]",
        style: {
            color: "var(--widget-text-color, var(--foreground))"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-xs font-semibold",
                style: {
                    color: "inherit"
                },
                children: title
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            right && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 shrink-0",
                style: {
                    color: "inherit"
                },
                children: right
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
function WidgetEmptyState({ icon, message, action }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col items-center justify-center p-3 text-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-muted-foreground mb-2",
                children: icon
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground",
                children: message
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            action && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3",
                children: action
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
                lineNumber: 88,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
function WidgetProgressBar({ pct, accentColor, className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `w-full h-1 rounded-full bg-muted overflow-hidden ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full rounded-full transition-all duration-500 ease-out",
            style: {
                width: `${Math.min(100, Math.max(0, pct))}%`,
                backgroundColor: accentColor || "var(--color-blue-500, #3b82f6)"
            }
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
            lineNumber: 112,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
function WidgetStat({ children, tabular = true }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `text-xs text-muted-foreground ${tabular ? "tabular-nums" : ""}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TasksTodayWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Widget showing tasks in an inbox-list style.
 * Supports view modes: Today, This Week, All Inbox.
 * Clicking a task opens a TaskPreviewPopover; edit opens a full modal.
 * Includes a + button for quick inline task creation.
 *
 * @param config - Widget configuration (viewMode, showCompleted)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/inbox.js [app-ssr] (ecmascript) <export default as Inbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Repeat$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/repeat.js [app-ssr] (ecmascript) <export default as Repeat>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/task-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useCompactMode.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/shared/TaskCheckbox.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskCreateModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskPreviewPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/tasks/TaskPreviewPopover.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
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
/** View mode labels for the header. */ const VIEW_LABELS = {
    today: "Today",
    week: "This Week",
    inbox: "All Tasks"
};
/**
 * Returns a YYYY-MM-DD date string for a given Date object.
 *
 * @param d - Date to format
 * @returns YYYY-MM-DD string
 */ function toDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function TasksTodayWidget({ config }) {
    const { tasks, addTask, toggleComplete, deleteTask, updateTask } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const hideCompleted = config?.showCompleted === "false";
    const viewMode = config?.viewMode || "today";
    const { containerRef, compact } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCompactMode"])(160);
    const [showAddModal, setShowAddModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [previewTask, setPreviewTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [previewRect, setPreviewRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editModalTask, setEditModalTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Keep preview task in sync with context updates (e.g. toggle complete). */ const currentPreviewTask = previewTask ? tasks.find((t)=>t.id === previewTask.id) ?? null : null;
    const todayStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>toDateStr(new Date()), []);
    const weekEndStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return toDateStr(d);
    }, []);
    const filteredTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>tasks.filter((t)=>{
            if (t.dismissed_at || t.snoozed_until) return false;
            switch(viewMode){
                case "today":
                    return t.due_date === todayStr;
                case "week":
                    return t.due_date && t.due_date >= todayStr && t.due_date <= weekEndStr;
                case "inbox":
                    return true;
                default:
                    return t.due_date === todayStr;
            }
        }), [
        tasks,
        todayStr,
        weekEndStr,
        viewMode
    ]);
    const completedCount = filteredTasks.filter((t)=>t.is_completed).length;
    const totalCount = filteredTasks.length;
    const label = VIEW_LABELS[viewMode] || "Today";
    /**
   * Opens the task preview popover anchored to the clicked row.
   *
   * @param task - Task to preview
   * @param e - Mouse event used to capture anchor rect and guard checkbox clicks
   */ function handleTaskClick(task, e) {
        const target = e.target;
        if (target.closest("button, input, .no-drag")) return;
        setPreviewTask(task);
        setPreviewRect(e.currentTarget.getBoundingClientRect());
    }
    /** Closes the preview popover and resets anchor state. */ function closePreview() {
        setPreviewTask(null);
        setPreviewRect(null);
    }
    /**
   * Transitions from preview popover to full edit modal.
   *
   * @param task - Task to edit
   */ function handlePreviewEdit(task) {
        closePreview();
        setEditModalTask(task);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "h-full w-full flex flex-col p-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                title: label,
                right: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-muted-foreground tabular-nums",
                            children: [
                                completedCount,
                                "/",
                                totalCount
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                            lineNumber: 127,
                            columnNumber: 13
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            role: "button",
                            tabIndex: 0,
                            onClick: (e)=>{
                                e.stopPropagation();
                                setShowAddModal(true);
                            },
                            onKeyDown: (e)=>{
                                if (e.key === "Enter") {
                                    e.stopPropagation();
                                    setShowAddModal(true);
                                }
                            },
                            className: "no-drag w-5 h-5 flex items-center justify-center rounded text-foreground hover:bg-muted transition-colors cursor-pointer",
                            "aria-label": "Add task",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                                lineNumber: 141,
                                columnNumber: 15
                            }, void 0)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                            lineNumber: 130,
                            columnNumber: 13
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                    lineNumber: 126,
                    columnNumber: 11
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this),
            compact ? null : totalCount === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col items-center justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"], {
                        size: 20,
                        className: "text-foreground mb-2"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                        lineNumber: 151,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-foreground",
                        children: viewMode === "today" ? "Nothing due today" : viewMode === "week" ? "Nothing this week" : "No tasks yet"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                lineNumber: 150,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto -mx-3",
                children: [
                    filteredTasks.filter((t)=>!hideCompleted || !t.is_completed).slice(0, 8).map((task)=>{
                        const taskColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getThemeColor"])(task.color, colorTheme);
                        const dueBadge = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$task$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDueDateInfo"])(task.due_date, task.due_time);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `group flex items-center gap-2 px-3 h-8 transition-colors duration-100 cursor-pointer hover:bg-black/10 dark:hover:bg-white/15 ${task.is_completed ? "opacity-50" : ""} ${previewTask?.id === task.id ? "bg-black/5 dark:bg-white/5" : ""}`,
                            onClick: (e)=>handleTaskClick(task, e),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "no-drag",
                                    onClick: (e)=>e.stopPropagation(),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$shared$2f$TaskCheckbox$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        color: taskColor,
                                        isCompleted: task.is_completed,
                                        onToggle: ()=>toggleComplete(task.id),
                                        size: "sm"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                                        lineNumber: 175,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                                    lineNumber: 174,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `flex-1 min-w-0 truncate text-sm ${task.is_completed ? "text-muted-foreground" : "text-foreground"}`,
                                    children: task.title
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                                    lineNumber: 184,
                                    columnNumber: 19
                                }, this),
                                task.repeat_interval && task.repeat_unit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Repeat$3e$__["Repeat"], {
                                    size: 10,
                                    className: "text-purple-400 shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                                    lineNumber: 194,
                                    columnNumber: 21
                                }, this),
                                dueBadge && !task.is_completed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-xs shrink-0 ${dueBadge.className}`,
                                    children: dueBadge.dateLabel
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                                    lineNumber: 199,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, task.id, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                            lineNumber: 166,
                            columnNumber: 17
                        }, this);
                    }),
                    filteredTasks.filter((t)=>!hideCompleted || !t.is_completed).length > 8 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-foreground pt-1 px-2",
                        children: [
                            "+",
                            filteredTasks.filter((t)=>!hideCompleted || !t.is_completed).length - 8,
                            " more"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                        lineNumber: 207,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                lineNumber: 157,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: showAddModal,
                onClose: ()=>setShowAddModal(false),
                onAdd: (task)=>{
                    addTask(task);
                    setShowAddModal(false);
                },
                defaultDate: viewMode === "today" ? todayStr : null
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                lineNumber: 215,
                columnNumber: 7
            }, this),
            currentPreviewTask && previewRect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskPreviewPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                task: currentPreviewTask,
                anchorRect: previewRect,
                onClose: closePreview,
                onEdit: handlePreviewEdit,
                onDelete: async (id)=>{
                    await deleteTask(id);
                    closePreview();
                },
                onToggle: toggleComplete
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                lineNumber: 227,
                columnNumber: 9
            }, this),
            editModalTask && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$tasks$2f$TaskCreateModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: !!editModalTask,
                onClose: ()=>setEditModalTask(null),
                onAdd: ()=>{},
                editTask: editModalTask,
                onSave: async (id, updates)=>{
                    await updateTask(id, updates);
                },
                onDelete: async (id)=>{
                    await deleteTask(id);
                    setEditModalTask(null);
                }
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
                lineNumber: 242,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/TasksTodayWidget.tsx",
        lineNumber: 122,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/helpers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared helpers for Google Calendar display components.
 * Extracted from GoogleCalendarWidget to avoid duplication.
 *
 * @module gcal-display-helpers
 */ __turbopack_context__.s([
    "GCAL_COLORS",
    ()=>GCAL_COLORS,
    "dayLabel",
    ()=>dayLabel,
    "findNextEventId",
    ()=>findNextEventId,
    "formatCountdown",
    ()=>formatCountdown,
    "formatEventTime",
    ()=>formatEventTime,
    "getEventColor",
    ()=>getEventColor,
    "groupEventsByDay",
    ()=>groupEventsByDay,
    "parseEventDate",
    ()=>parseEventDate
]);
const GCAL_COLORS = {
    "1": "#7986CB",
    "2": "#33B679",
    "3": "#8E24AA",
    "4": "#E67C73",
    "5": "#F6BF26",
    "6": "#F4511E",
    "7": "#039BE5",
    "8": "#616161",
    "9": "#3F51B5",
    "10": "#0B8043",
    "11": "#D50000"
};
function parseEventDate(dateStr) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split("-").map(Number);
        return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
}
function getEventColor(event, calendarColors, fallbackColor) {
    if (event.colorId) return GCAL_COLORS[event.colorId] || fallbackColor;
    if (event.calendarId && calendarColors[event.calendarId]) return calendarColors[event.calendarId];
    return fallbackColor;
}
function formatCountdown(diffMs) {
    if (diffMs <= 0) return "now";
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return "in <1 min";
    if (mins < 60) return `in ${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    if (hrs < 24 && remainMins === 0) return `in ${hrs} hr`;
    if (hrs < 24) return `in ${hrs} hr ${remainMins} min`;
    return "";
}
function groupEventsByDay(events) {
    const map = new Map();
    for (const event of events){
        const key = parseEventDate(event.start).toDateString();
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(event);
    }
    return map;
}
function dayLabel(dateKey, todayKey, tomorrowKey) {
    if (dateKey === todayKey) return "Today";
    if (dateKey === tomorrowKey) return "Tomorrow";
    return new Date(dateKey).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
}
function findNextEventId(events, now) {
    for (const event of events){
        if (event.allDay) continue;
        const end = parseEventDate(event.end);
        if (end > now) return event.id;
    }
    return null;
}
function formatEventTime(event) {
    if (event.allDay) return "All day";
    return new Date(event.start).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EventDetailPopover
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Detail popover for a Google Calendar event.
 * Rendered via portal to document body with backdrop.
 * Displays event title, time, location, description, and calendar link.
 *
 * @param event - The GCalEvent to display
 * @param color - Accent color for the event
 * @param onClose - Callback to close the popover
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/helpers.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/** Popover width in px — matches GCalEventPopover. */ const POPOVER_WIDTH = 448;
/** Minimum gap from viewport edges. */ const GAP = 6;
/**
 * Formats a time range string for an event.
 *
 * @param start - ISO start datetime or date string
 * @param end - ISO end datetime or date string
 * @param allDay - Whether this is an all-day event
 * @returns Formatted string like "Mon, Mar 3 · 8:00 AM – 9:00 AM"
 */ function formatTimeRange(start, end, allDay) {
    if (allDay) {
        const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseEventDate"])(start);
        return s.toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric"
        }) + " · All day";
    }
    const s = new Date(start);
    const e = new Date(end);
    const datePart = s.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
    const startTime = s.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
    const endTime = e.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
    return `${datePart} · ${startTime} – ${endTime}`;
}
/**
 * Strips HTML tags from a string for plain-text display.
 *
 * @param html - HTML string from Google Calendar description
 * @returns Plain text string
 */ function stripHtml(html) {
    return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}
function EventDetailPopover({ event, color, anchorRect, onClose }) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Compute anchor-relative position
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        const el = ref.current;
        if (!el || !anchorRect) return;
        const popoverHeight = el.scrollHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const anchorCenterX = anchorRect.left + anchorRect.width / 2;
        // Horizontal: place to right or left of anchor
        let left;
        if (anchorCenterX < vw / 2) {
            left = anchorRect.right + GAP;
        } else {
            left = anchorRect.left - POPOVER_WIDTH - GAP;
        }
        left = Math.max(GAP, Math.min(left, vw - POPOVER_WIDTH - GAP));
        // Vertical: blend between anchor top and viewport center
        const anchorTop = anchorRect.top;
        const centeredTop = (vh - popoverHeight) / 2;
        const BLEND = 0.35;
        let top = anchorTop + (centeredTop - anchorTop) * BLEND;
        if (top + popoverHeight > vh - GAP) {
            top = vh - popoverHeight - GAP;
        }
        top = Math.max(GAP, top);
        setPos({
            left,
            top
        });
    }, [
        anchorRect
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        }
        document.addEventListener("mousedown", handleClick);
        return ()=>document.removeEventListener("mousedown", handleClick);
    }, [
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleKey(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return ()=>document.removeEventListener("keydown", handleKey);
    }, [
        onClose
    ]);
    const description = event.description ? stripHtml(event.description) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[60]",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: ref,
            onClick: (e)=>e.stopPropagation(),
            className: "absolute bg-popover rounded-lg shadow-2xl border border-border overflow-hidden animate-in",
            style: anchorRect && pos ? {
                left: pos.left,
                top: pos.top,
                width: POPOVER_WIDTH
            } : {
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: POPOVER_WIDTH
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-end gap-1 px-2 pt-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: event.htmlLink,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                            "aria-label": "Open in Google Calendar",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                            lineNumber: 148,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                            "aria-label": "Close",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                    lineNumber: 147,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-4 px-6 pb-4 pt-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-4 h-4 rounded shrink-0 mt-1.5",
                            style: {
                                backgroundColor: color
                            }
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                            lineNumber: 167,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0 flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-[22px] font-normal text-foreground leading-7",
                                    children: event.summary
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground mt-0.5",
                                    children: formatTimeRange(event.start, event.end, event.allDay)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                    lineNumber: 170,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                            lineNumber: 168,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                    lineNumber: 166,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "pb-4",
                    children: [
                        event.location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-4 px-6 py-2.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                    size: 20,
                                    className: "shrink-0 mt-0.5 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                    lineNumber: 179,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-medium text-foreground",
                                    children: event.location
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                    lineNumber: 180,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                            lineNumber: 178,
                            columnNumber: 13
                        }, this),
                        description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-4 px-6 py-2.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                    size: 20,
                                    className: "shrink-0 mt-0.5 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                    lineNumber: 185,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-foreground whitespace-pre-wrap line-clamp-6",
                                    children: description
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                    lineNumber: 186,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                            lineNumber: 184,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4 px-6 py-2.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                    size: 20,
                                    className: "shrink-0 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                    lineNumber: 190,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm text-foreground",
                                    children: event.calendarId || "Google Calendar"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                                    lineNumber: 191,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                            lineNumber: 189,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
                    lineNumber: 176,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
            lineNumber: 137,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ListDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * List display for Google Calendar widget.
 * Events grouped by day with colored sidebar indicators.
 * This is the original/default display style.
 *
 * @param props - GCalDisplayProps
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/helpers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function ListDisplay({ events, calendarColors, fallbackColor, compact }) {
    const [, setTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = setInterval(()=>setTick((t)=>t + 1), 60000);
        return ()=>clearInterval(id);
    }, []);
    const [selectedEvent, setSelectedEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const now = new Date();
    const todayKey = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = tomorrow.toDateString();
    const nextEventId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findNextEventId"])(events, now), // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        events,
        Math.floor(now.getTime() / 60000)
    ]);
    const grouped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["groupEventsByDay"])(events), [
        events
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto space-y-2",
                children: Array.from(grouped.entries()).map(([dateKey, dayEvents], idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex items-center gap-2 px-1 ${idx > 0 ? "mt-1" : ""}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-[10px] font-semibold tracking-wider shrink-0 ${dateKey === todayKey ? "text-blue-500" : "text-foreground"}`,
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dayLabel"])(dateKey, todayKey, tomorrowKey)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                        lineNumber: 48,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-px bg-border"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                        lineNumber: 53,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                lineNumber: 47,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1 mt-1",
                                children: dayEvents.map((event)=>{
                                    const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventColor"])(event, calendarColors, fallbackColor);
                                    const timeStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatEventTime"])(event);
                                    const eventEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseEventDate"])(event.end);
                                    const isPast = eventEnd < now;
                                    const isNext = event.id === nextEventId;
                                    const countdown = isNext && !event.allDay ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCountdown"])(new Date(event.start).getTime() - now.getTime()) : "";
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: (e)=>setSelectedEvent({
                                                event,
                                                color,
                                                rect: e.currentTarget.getBoundingClientRect()
                                            }),
                                        className: `no-drag flex items-center gap-2 bg-muted/50 rounded-lg p-2 hover:bg-black/10 dark:hover:bg-white/15 transition-colors w-full text-left cursor-pointer ${isPast ? "opacity-40" : ""} ${selectedEvent?.event.id === event.id ? "bg-black/5 dark:bg-white/5" : ""}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-[3px] self-stretch rounded-full shrink-0",
                                                style: {
                                                    backgroundColor: color
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                                lineNumber: 75,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0 flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-xs font-medium truncate ${isPast ? "text-muted-foreground line-through" : "text-foreground"}`,
                                                        children: event.summary
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-[10px] mt-0.5 ${isPast ? "text-muted-foreground" : "text-foreground/80"}`,
                                                        children: timeStr
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                                        lineNumber: 85,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                                lineNumber: 79,
                                                columnNumber: 21
                                            }, this),
                                            countdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-medium text-blue-500 shrink-0",
                                                children: countdown
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                                lineNumber: 92,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, event.id, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                        lineNumber: 67,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                                lineNumber: 55,
                                columnNumber: 13
                            }, this)
                        ]
                    }, dateKey, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            selectedEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                event: selectedEvent.event,
                color: selectedEvent.color,
                anchorRect: selectedEvent.rect,
                onClose: ()=>setSelectedEvent(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CompactDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompactDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Compact display for Google Calendar widget.
 * Minimal dense rows — just colored dot, title, and time.
 * No cards or backgrounds, maximum information density.
 *
 * @param props - GCalDisplayProps
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/helpers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function CompactDisplay({ events, calendarColors, fallbackColor }) {
    const [, setTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = setInterval(()=>setTick((t)=>t + 1), 60000);
        return ()=>clearInterval(id);
    }, []);
    const [selectedEvent, setSelectedEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const now = new Date();
    const nextEventId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findNextEventId"])(events, now), // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        events,
        Math.floor(now.getTime() / 60000)
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto",
                children: events.map((event)=>{
                    const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventColor"])(event, calendarColors, fallbackColor);
                    const timeStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatEventTime"])(event);
                    const eventEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseEventDate"])(event.end);
                    const isPast = eventEnd < now;
                    const isNext = event.id === nextEventId;
                    const countdown = isNext && !event.allDay ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCountdown"])(new Date(event.start).getTime() - now.getTime()) : "";
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: (e)=>setSelectedEvent({
                                event,
                                color,
                                rect: e.currentTarget.getBoundingClientRect()
                            }),
                        className: `no-drag flex items-center gap-2 w-full text-left px-1 py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors cursor-pointer ${isPast ? "opacity-35" : ""} ${selectedEvent?.event.id === event.id ? "bg-black/5 dark:bg-white/5" : ""}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-1.5 h-1.5 rounded-full shrink-0",
                                style: {
                                    backgroundColor: color
                                }
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CompactDisplay.tsx",
                                lineNumber: 57,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-[11px] truncate flex-1 ${isPast ? "text-muted-foreground line-through" : "text-foreground"}`,
                                children: event.summary
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CompactDisplay.tsx",
                                lineNumber: 61,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-muted-foreground tabular-nums shrink-0",
                                children: timeStr
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CompactDisplay.tsx",
                                lineNumber: 66,
                                columnNumber: 15
                            }, this),
                            countdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-medium text-blue-500 shrink-0",
                                children: countdown
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CompactDisplay.tsx",
                                lineNumber: 70,
                                columnNumber: 17
                            }, this)
                        ]
                    }, event.id, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CompactDisplay.tsx",
                        lineNumber: 49,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CompactDisplay.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            selectedEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                event: selectedEvent.event,
                color: selectedEvent.color,
                anchorRect: selectedEvent.rect,
                onClose: ()=>setSelectedEvent(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CompactDisplay.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CardsDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Cards display for Google Calendar widget.
 * Each event rendered as a color-accented card with tinted background.
 * Shows time, title, and optional location.
 *
 * @param props - GCalDisplayProps
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/helpers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function CardsDisplay({ events, calendarColors, fallbackColor }) {
    const [, setTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = setInterval(()=>setTick((t)=>t + 1), 60000);
        return ()=>clearInterval(id);
    }, []);
    const [selectedEvent, setSelectedEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const now = new Date();
    const nextEventId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findNextEventId"])(events, now), // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        events,
        Math.floor(now.getTime() / 60000)
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto space-y-1.5",
                children: events.map((event)=>{
                    const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventColor"])(event, calendarColors, fallbackColor);
                    const timeStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatEventTime"])(event);
                    const eventEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseEventDate"])(event.end);
                    const isPast = eventEnd < now;
                    const isNext = event.id === nextEventId;
                    const countdown = isNext && !event.allDay ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCountdown"])(new Date(event.start).getTime() - now.getTime()) : "";
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: (e)=>setSelectedEvent({
                                event,
                                color,
                                rect: e.currentTarget.getBoundingClientRect()
                            }),
                        className: `no-drag w-full text-left rounded-lg p-2 transition-all cursor-pointer hover:brightness-95 dark:hover:brightness-110 ${isPast ? "opacity-35" : ""} ${selectedEvent?.event.id === event.id ? "brightness-90 dark:brightness-120" : ""}`,
                        style: {
                            backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                            borderLeft: `3px solid ${color}`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-xs font-medium truncate ${isPast ? "line-through text-muted-foreground" : "text-foreground"}`,
                                        children: event.summary
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                                        lineNumber: 63,
                                        columnNumber: 17
                                    }, this),
                                    countdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] font-medium text-blue-500 shrink-0",
                                        children: countdown
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                                        lineNumber: 69,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                                lineNumber: 62,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mt-0.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-muted-foreground",
                                        children: timeStr
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                                        lineNumber: 75,
                                        columnNumber: 17
                                    }, this),
                                    event.location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-muted-foreground flex items-center gap-0.5 truncate",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                size: 8,
                                                className: "shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                                                lineNumber: 78,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "truncate",
                                                children: event.location
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                                                lineNumber: 79,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                                        lineNumber: 77,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                                lineNumber: 74,
                                columnNumber: 15
                            }, this)
                        ]
                    }, event.id, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                        lineNumber: 50,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            selectedEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                event: selectedEvent.event,
                color: selectedEvent.color,
                anchorRect: selectedEvent.rect,
                onClose: ()=>setSelectedEvent(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TimelineDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Timeline display for Google Calendar widget.
 * Vertical timeline with colored dots and a connecting line.
 * The next upcoming event is highlighted with a pulsing dot.
 *
 * @param props - GCalDisplayProps
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/helpers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function TimelineDisplay({ events, calendarColors, fallbackColor }) {
    const [, setTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = setInterval(()=>setTick((t)=>t + 1), 60000);
        return ()=>clearInterval(id);
    }, []);
    const [selectedEvent, setSelectedEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const now = new Date();
    const nextEventId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findNextEventId"])(events, now), // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        events,
        Math.floor(now.getTime() / 60000)
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute left-[7px] top-2 bottom-2 w-px bg-border"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    events.map((event, idx)=>{
                        const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventColor"])(event, calendarColors, fallbackColor);
                        const timeStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatEventTime"])(event);
                        const eventEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseEventDate"])(event.end);
                        const isPast = eventEnd < now;
                        const isNext = event.id === nextEventId;
                        const countdown = isNext && !event.allDay ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCountdown"])(new Date(event.start).getTime() - now.getTime()) : "";
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: (e)=>setSelectedEvent({
                                    event,
                                    color,
                                    rect: e.currentTarget.getBoundingClientRect()
                                }),
                            className: `no-drag relative flex items-start gap-3 w-full text-left py-1.5 pl-0 pr-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors cursor-pointer ${isPast ? "opacity-35" : ""} ${selectedEvent?.event.id === event.id ? "bg-black/5 dark:bg-white/5" : ""}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative z-10 mt-1 shrink-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-[15px] h-[15px] rounded-full border-2 ${isNext ? "animate-pulse" : ""}`,
                                        style: {
                                            backgroundColor: isPast ? "transparent" : color,
                                            borderColor: color
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                                        lineNumber: 62,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                                    lineNumber: 61,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0 flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `text-xs font-medium truncate flex-1 ${isPast ? "text-muted-foreground line-through" : "text-foreground"}`,
                                                    children: event.summary
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                                                    lineNumber: 76,
                                                    columnNumber: 19
                                                }, this),
                                                countdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] font-medium text-blue-500 shrink-0",
                                                    children: countdown
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                                                    lineNumber: 82,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                                            lineNumber: 75,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-muted-foreground mt-0.5",
                                            children: timeStr
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                                            lineNumber: 87,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                                    lineNumber: 74,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, event.id, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                            lineNumber: 52,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            selectedEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                event: selectedEvent.event,
                color: selectedEvent.color,
                anchorRect: selectedEvent.rect,
                onClose: ()=>setSelectedEvent(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx",
                lineNumber: 95,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AgendaDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Agenda display for Google Calendar widget.
 * Clean layout with bold times on the left and event details on the right.
 * Separated by subtle horizontal dividers.
 *
 * @param props - GCalDisplayProps
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/helpers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/EventDetailPopover.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function AgendaDisplay({ events, calendarColors, fallbackColor }) {
    const [, setTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = setInterval(()=>setTick((t)=>t + 1), 60000);
        return ()=>clearInterval(id);
    }, []);
    const [selectedEvent, setSelectedEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const now = new Date();
    const nextEventId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findNextEventId"])(events, now), // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        events,
        Math.floor(now.getTime() / 60000)
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto",
                children: events.map((event, idx)=>{
                    const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventColor"])(event, calendarColors, fallbackColor);
                    const eventEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseEventDate"])(event.end);
                    const isPast = eventEnd < now;
                    const isNext = event.id === nextEventId;
                    const countdown = isNext && !event.allDay ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCountdown"])(new Date(event.start).getTime() - now.getTime()) : "";
                    const startDate = new Date(event.start);
                    const timeTop = event.allDay ? "ALL" : startDate.toLocaleTimeString([], {
                        hour: "numeric"
                    }).replace(/\s?(AM|PM)/, "");
                    const timeBottom = event.allDay ? "DAY" : startDate.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit"
                    }).match(/AM|PM/)?.[0] || "";
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: (e)=>setSelectedEvent({
                                event,
                                color,
                                rect: e.currentTarget.getBoundingClientRect()
                            }),
                        className: `no-drag flex items-center gap-3 w-full text-left py-2 px-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${isPast ? "opacity-35" : ""} ${idx > 0 ? "border-t border-border/50" : ""} ${selectedEvent?.event.id === event.id ? "bg-black/5 dark:bg-white/5" : ""}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-8 shrink-0 text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-semibold leading-none tabular-nums ${isPast ? "text-muted-foreground" : "text-foreground"}`,
                                        children: timeTop
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                                        lineNumber: 66,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] text-muted-foreground mt-0.5",
                                        children: timeBottom
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                                        lineNumber: 71,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                                lineNumber: 65,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-0.5 self-stretch rounded-full shrink-0",
                                style: {
                                    backgroundColor: color
                                }
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                                lineNumber: 75,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-xs font-medium truncate ${isPast ? "text-muted-foreground line-through" : "text-foreground"}`,
                                        children: event.summary
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                                        lineNumber: 82,
                                        columnNumber: 17
                                    }, this),
                                    event.location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-muted-foreground truncate mt-0.5",
                                        children: event.location
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                                        lineNumber: 88,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                                lineNumber: 81,
                                columnNumber: 15
                            }, this),
                            countdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] font-medium text-blue-500 shrink-0",
                                children: countdown
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                                lineNumber: 95,
                                columnNumber: 17
                            }, this)
                        ]
                    }, event.id, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                        lineNumber: 56,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            selectedEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$EventDetailPopover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                event: selectedEvent.event,
                color: selectedEvent.color,
                anchorRect: selectedEvent.rect,
                onClose: ()=>setSelectedEvent(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/index.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Google Calendar display component map.
 * Maps display IDs to their React components.
 * Used by GoogleCalendarWidget to render the selected display style.
 */ __turbopack_context__.s([
    "GCAL_DISPLAY_MAP",
    ()=>GCAL_DISPLAY_MAP
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$ListDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/ListDisplay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$CompactDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CompactDisplay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$CardsDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/CardsDisplay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$TimelineDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/TimelineDisplay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$AgendaDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/AgendaDisplay.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
const GCAL_DISPLAY_MAP = {
    list: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$ListDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    compact: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$CompactDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    cards: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$CardsDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    timeline: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$TimelineDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    agenda: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$AgendaDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
};
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GoogleCalendarWidget,
    "getTimeRange",
    ()=>getTimeRange
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Widget showing upcoming Google Calendar events.
 * Supports Today/Week/Month view mode toggle.
 * Fetches from /api/gcal/events with timeMin/timeMax query params.
 * Clicking an event opens an inline detail popover.
 *
 * @param config - Per-widget config (optional calendarId, viewMode)
 * @param onUpdateConfig - Callback to persist config changes
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/swr/dist/index/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useCompactMode.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/gcal-displays/index.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2d$displays$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/gcal-displays.ts [app-ssr] (ecmascript)");
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
const VIEW_MODES = [
    {
        key: "today",
        label: "Today"
    },
    {
        key: "2day",
        label: "2 Days"
    },
    {
        key: "3day",
        label: "3 Days"
    },
    {
        key: "4day",
        label: "4 Days"
    },
    {
        key: "5day",
        label: "5 Days"
    },
    {
        key: "week",
        label: "Week"
    },
    {
        key: "month",
        label: "Month"
    },
    {
        key: "custom",
        label: "Custom"
    }
];
function getTimeRange(mode, customDays) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    switch(mode){
        case "today":
            end.setDate(end.getDate() + 1);
            break;
        case "2day":
            end.setDate(end.getDate() + 2);
            break;
        case "3day":
            end.setDate(end.getDate() + 3);
            break;
        case "4day":
            end.setDate(end.getDate() + 4);
            break;
        case "5day":
            end.setDate(end.getDate() + 5);
            break;
        case "week":
            end.setDate(end.getDate() + 7);
            break;
        case "month":
            end.setDate(end.getDate() + 30);
            break;
        case "custom":
            {
                const days = customDays && customDays >= 1 ? Math.min(customDays, 90) : 7;
                end.setDate(end.getDate() + days);
                break;
            }
    }
    return {
        timeMin: start.toISOString(),
        timeMax: end.toISOString()
    };
}
const GCAL_CACHE_PREFIX = "gcal-widget-cache:";
/**
 * Reads cached Google Calendar events from localStorage for instant rendering.
 *
 * @param key - The SWR key (API URL) used as the cache identifier
 * @returns Cached API response object, or null if not found/invalid
 */ function readGCalCache(key) {
    try {
        const raw = localStorage.getItem(GCAL_CACHE_PREFIX + key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.events)) return parsed;
        return null;
    } catch  {
        return null;
    }
}
/**
 * Writes Google Calendar API response to localStorage for instant rendering on next mount.
 *
 * @param key - The SWR key (API URL) used as the cache identifier
 * @param data - The API response data to cache
 */ function writeGCalCache(key, data) {
    try {
        localStorage.setItem(GCAL_CACHE_PREFIX + key, JSON.stringify(data));
    } catch  {
    // localStorage full or unavailable — silently ignore
    }
}
function GoogleCalendarWidget({ config, editMode, onUpdateConfig }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const viewMode = config.viewMode || "week";
    const { containerRef, compact } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCompactMode"])(160);
    // Parse multi-calendar config: calendarIds (JSON) → calendarId (single) → ["primary"]
    const calendarIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (config.calendarIds) {
            try {
                return JSON.parse(config.calendarIds);
            } catch  {}
        }
        if (config.calendarId) return [
            config.calendarId
        ];
        return [
            "primary"
        ];
    }, [
        config.calendarIds,
        config.calendarId
    ]);
    // Parse calendar color map for fallback event colors
    const calendarColors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (config.calendarColors) {
            try {
                return JSON.parse(config.calendarColors);
            } catch  {}
        }
        return {};
    }, [
        config.calendarColors
    ]);
    // Build SWR key from calendar + view params
    const swrKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const params = new URLSearchParams();
        if (calendarIds.length === 1) {
            params.set("calendarId", calendarIds[0]);
        } else if (calendarIds.length > 1) {
            params.set("calendarIds", calendarIds.join(","));
        }
        const customDays = viewMode === "custom" ? parseInt(config.customDays || "7", 10) : undefined;
        const { timeMin, timeMax } = getTimeRange(viewMode, customDays);
        params.set("timeMin", timeMin);
        params.set("timeMax", timeMax);
        return `/api/gcal/events?${params}`;
    }, [
        calendarIds,
        viewMode,
        config.customDays
    ]);
    // Read cached data for instant render while SWR revalidates in background
    const cachedGcalData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>readGCalCache(swrKey), [
        swrKey
    ]);
    const { data, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(swrKey, async (url)=>{
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    }, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        refreshInterval: 300000,
        fallbackData: cachedGcalData ?? undefined,
        onSuccess: (freshData)=>{
            writeGCalCache(swrKey, freshData);
        }
    });
    const events = data?.events || [];
    const connected = data ? data.connected ?? true : null;
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full flex flex-col p-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 mb-3",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-4 w-28 rounded bg-muted animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                        lineNumber: 185,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                    lineNumber: 184,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2.5 flex-1",
                    children: [
                        1,
                        2,
                        3
                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-1 h-8 rounded bg-muted animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                                    lineNumber: 190,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 space-y-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3 w-3/4 rounded bg-muted animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                                            lineNumber: 192,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-2.5 w-1/2 rounded bg-muted animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                                            lineNumber: 193,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                                    lineNumber: 191,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                            lineNumber: 189,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                    lineNumber: 187,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
            lineNumber: 183,
            columnNumber: 7
        }, this);
    }
    if (connected === false) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetEmptyState"], {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                size: 24
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                lineNumber: 205,
                columnNumber: 15
            }, void 0),
            message: "Connect to see your events",
            action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>router.push("/app/settings?section=integrations"),
                className: "no-drag inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer",
                children: "Sync Google Calendar"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                lineNumber: 208,
                columnNumber: 11
            }, void 0)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
            lineNumber: 204,
            columnNumber: 7
        }, this);
    }
    const accentFallback = config.accentColor || "#4285F4";
    const displayId = config.gcalDisplay || __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2d$displays$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_GCAL_DISPLAY"];
    const DisplayComponent = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GCAL_DISPLAY_MAP"][displayId] || __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$gcal$2d$displays$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GCAL_DISPLAY_MAP"].list;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "h-full w-full flex flex-col p-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                title: "Google Calendar",
                right: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[10px] text-muted-foreground",
                    children: viewMode === "custom" ? `${config.customDays || "7"} Days` : VIEW_MODES.find((m)=>m.key === viewMode)?.label ?? viewMode
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                    lineNumber: 229,
                    columnNumber: 11
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                lineNumber: 226,
                columnNumber: 7
            }, this),
            events.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col items-center justify-center text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                        size: 20,
                        className: "text-foreground mb-2"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-foreground",
                        children: "No events"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                        lineNumber: 240,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                lineNumber: 238,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DisplayComponent, {
                events: events.slice(0, compact ? 3 : 50),
                calendarColors: calendarColors,
                fallbackColor: accentFallback,
                compact: compact
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
                lineNumber: 243,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/GoogleCalendarWidget.tsx",
        lineNumber: 225,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ImageWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Widget that displays a user-uploaded image.
 * Supports click-to-browse and drag-and-drop file selection, then crop + upload.
 *
 * @param config - Widget config containing optional imageUrl
 * @param widgetId - Unique widget instance ID for storage path
 * @param onUpdateConfig - Callback to persist image URL to widget config
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/camera.js [app-ssr] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as ImageIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ImageCropModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/ImageCropModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$image$2d$widget$2d$presets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/image-widget-presets.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function ImageWidget({ config, widgetId, onUpdateConfig, onOpenSettings }) {
    const fileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cropSrc, setCropSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dragOver, setDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    /**
   * Uploads a cropped Blob to Supabase and updates widget config.
   *
   * @param blob - Cropped image blob from ImageCropModal
   */ const handleCroppedUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (blob)=>{
        setCropSrc(null);
        if (!onUpdateConfig) return;
        setUploading(true);
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const ext = blob.type.split("/")[1] === "jpeg" ? "jpg" : blob.type.split("/")[1];
            const path = `${user.id}/board-img-${widgetId}-${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from("avatars").upload(path, blob, {
                cacheControl: "3600",
                upsert: true,
                contentType: blob.type
            });
            if (error) {
                console.error("Image widget upload failed:", error.message);
                return;
            }
            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
            onUpdateConfig({
                imageUrl: `${urlData.publicUrl}?t=${Date.now()}`
            });
        } catch (err) {
            console.error("Image widget upload error:", err);
        } finally{
            setUploading(false);
        }
    }, [
        onUpdateConfig,
        widgetId
    ]);
    /** Opens file picker, then shows crop modal with selected image. */ function handleFileSelect(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        setCropSrc(url);
        e.target.value = "";
    }
    /**
   * Handles file drop on the widget. Accepts first image file and opens crop modal.
   *
   * @param e - React drag event containing dropped files
   */ function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        if (!onUpdateConfig) return;
        const file = Array.from(e.dataTransfer.files).find((f)=>f.type.startsWith("image/"));
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCropSrc(url);
    }
    /** Prevents default browser handling and sets drag-over visual state. */ function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    }
    /** Clears drag-over visual state when cursor leaves the drop zone. */ function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    }
    const fileInput = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        ref: fileRef,
        type: "file",
        accept: "image/jpeg,image/png,image/webp",
        className: "hidden",
        onChange: handleFileSelect
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
        lineNumber: 120,
        columnNumber: 5
    }, this);
    // Resolve preset URLs for display
    const resolvedUrl = config.imageUrl && (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$image$2d$widget$2d$presets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isImageWidgetPreset"])(config.imageUrl) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$image$2d$widget$2d$presets$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveImagePreset"])(config.imageUrl) : config.imageUrl;
    // Image is set — display it, with change button in edit mode
    if (config.imageUrl) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full overflow-hidden relative group",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: resolvedUrl,
                    alt: "Widget image",
                    className: "h-full w-full object-cover",
                    draggable: false
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                    lineNumber: 138,
                    columnNumber: 9
                }, this),
                onUpdateConfig && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: (e)=>{
                            e.stopPropagation();
                            fileRef.current?.click();
                        },
                        className: "no-drag flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white/90 text-gray-900 hover:bg-white transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                                lineNumber: 153,
                                columnNumber: 15
                            }, this),
                            "Change"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                        lineNumber: 146,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                    lineNumber: 145,
                    columnNumber: 11
                }, this),
                fileInput,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ImageCropModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    open: !!cropSrc,
                    imageSrc: cropSrc || "",
                    aspect: 4 / 3,
                    onCrop: handleCroppedUpload,
                    onClose: ()=>{
                        if (cropSrc) URL.revokeObjectURL(cropSrc);
                        setCropSrc(null);
                    }
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                    lineNumber: 159,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
            lineNumber: 137,
            columnNumber: 7
        }, this);
    }
    // No image — show drop zone + upload prompt
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `h-full w-full flex flex-col items-center justify-center p-3 transition-colors ${dragOver ? "border-2 border-dashed border-muted-foreground/40 bg-muted/50" : ""}`,
        onDrop: handleDrop,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        children: [
            uploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                lineNumber: 184,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__["ImageIcon"], {
                        size: 24,
                        className: "text-muted-foreground mb-2"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                        lineNumber: 187,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground mb-1",
                        children: dragOver ? "Drop image here" : "No image"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                        lineNumber: 188,
                        columnNumber: 11
                    }, this),
                    !dragOver && onUpdateConfig && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: (e)=>{
                            e.stopPropagation();
                            onOpenSettings?.();
                        },
                        className: "no-drag flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-foreground hover:bg-muted transition-colors mt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                                lineNumber: 199,
                                columnNumber: 17
                            }, this),
                            "Select Image"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                        lineNumber: 192,
                        columnNumber: 15
                    }, this)
                ]
            }, void 0, true),
            fileInput,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$ImageCropModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: !!cropSrc,
                imageSrc: cropSrc || "",
                aspect: 4 / 3,
                onCrop: handleCroppedUpload,
                onClose: ()=>{
                    if (cropSrc) URL.revokeObjectURL(cropSrc);
                    setCropSrc(null);
                }
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
                lineNumber: 206,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ImageWidget.tsx",
        lineNumber: 175,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClassProgressWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Class Progress widget — Notion-style course cards with color-coded progress.
 * Each course shows a colored dot, name, completion ring, and task count.
 * Clicking a course opens a modal with all assignments for that course.
 *
 * @module ClassProgressWidget
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-ssr] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useCompactMode.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
/** Default palette for courses without a dominant color. */ const COURSE_COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#22c55e",
    "#06b6d4",
    "#eab308",
    "#ef4444",
    "#6366f1",
    "#14b8a6"
];
/**
 * SVG ring progress indicator.
 *
 * @param pct - Completion percentage (0-100)
 * @param color - Stroke color
 * @param size - Ring diameter in pixels
 */ function ProgressRing({ pct, color, size = 32 }) {
    const r = (size - 4) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - pct / 100 * circumference;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: size,
        height: size,
        className: "shrink-0 -rotate-90",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: size / 2,
                cy: size / 2,
                r: r,
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 2.5,
                className: "text-muted/50"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: size / 2,
                cy: size / 2,
                r: r,
                fill: "none",
                stroke: color,
                strokeWidth: 2.5,
                strokeLinecap: "round",
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                className: "transition-all duration-500 ease-out"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
function ClassProgressWidget({ config }) {
    const { tasks, courseColors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const sortMode = config?.progressSort || "count";
    const { containerRef, compact } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCompactMode"])(160);
    const [selectedCourse, setSelectedCourse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const courses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const activeTasks = tasks.filter((t)=>!t.dismissed_at && !t.snoozed_until);
        const map = new Map();
        for (const t of activeTasks){
            const name = t.course_name || "Manual";
            const entry = map.get(name) || {
                completed: 0,
                total: 0,
                tasks: []
            };
            entry.total++;
            entry.tasks.push(t);
            if (t.is_completed) entry.completed++;
            map.set(name, entry);
        }
        const result = [];
        let colorIndex = 0;
        for (const [name, { completed, total, tasks: courseTasks }] of map){
            const color = courseColors.get(name) || COURSE_COLORS[colorIndex % COURSE_COLORS.length];
            result.push({
                name,
                completed,
                total,
                color,
                tasks: courseTasks
            });
            colorIndex++;
        }
        switch(sortMode){
            case "alpha":
                result.sort((a, b)=>a.name.localeCompare(b.name));
                break;
            case "completion":
                result.sort((a, b)=>{
                    const pctA = a.total > 0 ? a.completed / a.total : 0;
                    const pctB = b.total > 0 ? b.completed / b.total : 0;
                    return pctB - pctA || a.name.localeCompare(b.name);
                });
                break;
            default:
                result.sort((a, b)=>b.total - a.total || a.name.localeCompare(b.name));
        }
        return result;
    }, [
        tasks,
        sortMode,
        courseColors
    ]);
    const openCourse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((course)=>{
        setSelectedCourse(course);
    }, []);
    if (courses.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetEmptyState"], {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                size: 24
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                lineNumber: 127,
                columnNumber: 15
            }, void 0),
            message: "No courses synced yet"
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
            lineNumber: 126,
            columnNumber: 7
        }, this);
    }
    const totalTasks = courses.reduce((sum, c)=>sum + c.total, 0);
    const totalCompleted = courses.reduce((sum, c)=>sum + c.completed, 0);
    const overallPct = totalTasks > 0 ? Math.round(totalCompleted / totalTasks * 100) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                className: "h-full w-full flex flex-col p-3 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                        title: "Courses",
                        right: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-muted-foreground tabular-nums",
                            children: [
                                overallPct,
                                "% complete"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                            lineNumber: 143,
                            columnNumber: 13
                        }, void 0)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    compact ? /* Compact: overall bar with course dots */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full h-1.5 rounded-full bg-muted overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-full rounded-full transition-all duration-500",
                                    style: {
                                        width: `${overallPct}%`,
                                        backgroundColor: config?.accentColor || "#3b82f6"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                    lineNumber: 153,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                lineNumber: 152,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-1.5 flex-wrap",
                                children: courses.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        title: `${c.name}: ${c.completed}/${c.total}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 rounded-full shrink-0",
                                                style: {
                                                    backgroundColor: c.color
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 168,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-muted-foreground truncate",
                                                children: c.name
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 172,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, c.name, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 163,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                        lineNumber: 151,
                        columnNumber: 11
                    }, this) : /* Expanded: course cards */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 space-y-1 overflow-y-auto",
                        children: courses.map((c)=>{
                            const pct = c.total > 0 ? Math.round(c.completed / c.total * 100) : 0;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>openCourse(c),
                                className: "no-drag w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-2.5 h-2.5 rounded-full shrink-0",
                                        style: {
                                            backgroundColor: c.color
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 191,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-medium text-foreground truncate group-hover:text-foreground",
                                                children: c.name
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 198,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground tabular-nums",
                                                children: [
                                                    c.completed,
                                                    " of ",
                                                    c.total,
                                                    " done"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 201,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 197,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative shrink-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressRing, {
                                                pct: pct,
                                                color: c.color,
                                                size: 28
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 208,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground tabular-nums",
                                                children: pct
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 209,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 207,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, c.name, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                lineNumber: 185,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                        lineNumber: 181,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this),
            selectedCourse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CourseDetailModal, {
                course: selectedCourse,
                onClose: ()=>setSelectedCourse(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                lineNumber: 222,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
/**
 * Modal showing all assignments for a selected course.
 * Notion-style: clean list, colored header, subtle animations.
 *
 * @param course - The selected course with its tasks
 * @param onClose - Callback to close the modal
 */ function CourseDetailModal({ course, onClose }) {
    const { toggleComplete } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const pct = course.total > 0 ? Math.round(course.completed / course.total * 100) : 0;
    // Sort: incomplete first (by due date), then completed
    const sortedTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            ...course.tasks
        ].sort((a, b)=>{
            if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
            return (a.due_date ?? "").localeCompare(b.due_date ?? "");
        });
    }, [
        course.tasks
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 animate-announce-backdrop-in",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-popover rounded-2xl shadow-2xl border border-border w-full w-[calc(100%-2rem)] max-w-md animate-announce-card-in overflow-hidden max-h-[80vh] flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-b border-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2.5 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-3 h-3 rounded-full shrink-0",
                                                style: {
                                                    backgroundColor: course.color
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 267,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-base font-semibold text-foreground truncate",
                                                children: course.name
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 271,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 266,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onClose,
                                        className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0",
                                        "aria-label": "Close",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                            lineNumber: 280,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 275,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                lineNumber: 265,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-1.5 rounded-full bg-muted overflow-hidden",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-full rounded-full transition-all duration-500",
                                            style: {
                                                width: `${pct}%`,
                                                backgroundColor: course.color
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                            lineNumber: 287,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 286,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground shrink-0 tabular-nums",
                                        children: [
                                            course.completed,
                                            "/",
                                            course.total
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 292,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                lineNumber: 285,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto p-2",
                        children: sortedTasks.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>toggleComplete(task.id),
                                        className: `no-drag mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.is_completed ? "border-transparent" : "border-muted-foreground/30 hover:border-muted-foreground/60"}`,
                                        style: task.is_completed ? {
                                            backgroundColor: course.color
                                        } : undefined,
                                        "aria-label": task.is_completed ? "Mark incomplete" : "Mark complete",
                                        children: task.is_completed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                            size: 10,
                                            className: "text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                            lineNumber: 316,
                                            columnNumber: 39
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 306,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-sm ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`,
                                                children: task.title
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 321,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 mt-0.5",
                                                children: [
                                                    task.due_date && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[11px] text-muted-foreground",
                                                        children: new Date(task.due_date + "T12:00:00").toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric"
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                        lineNumber: 326,
                                                        columnNumber: 21
                                                    }, this),
                                                    task.points_possible != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[11px] text-muted-foreground",
                                                        children: [
                                                            task.points_possible,
                                                            " pts"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                                lineNumber: 324,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                        lineNumber: 320,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, task.id, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                                lineNumber: 301,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                        lineNumber: 299,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/ClassProgressWidget.tsx",
        lineNumber: 257,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/NotesWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NotesWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Inline notes widget — user types directly in the widget.
 * Saves content to widget config on blur/debounce.
 * Supports blank, lined, and grid paper styles.
 *
 * @param config - Widget configuration containing notes content and notesStyle
 * @param onUpdateConfig - Callback to persist note content changes
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
/** Line height in pixels for lined/grid backgrounds. */ const LINE_HEIGHT_PX = 24;
/**
 * Returns inline CSS style for the paper background.
 *
 * @param styleId - Notes style identifier (blank, lined, grid)
 * @param lineColor - CSS color string for the lines
 * @returns React CSSProperties object for the background
 */ function getPaperStyle(styleId, lineColor) {
    switch(styleId){
        case "lined":
            return {
                backgroundImage: `repeating-linear-gradient(transparent, transparent ${LINE_HEIGHT_PX - 1}px, ${lineColor} ${LINE_HEIGHT_PX - 1}px, ${lineColor} ${LINE_HEIGHT_PX}px)`,
                backgroundSize: `100% ${LINE_HEIGHT_PX}px`,
                lineHeight: `${LINE_HEIGHT_PX}px`
            };
        case "grid":
            return {
                backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
                backgroundSize: `${LINE_HEIGHT_PX}px ${LINE_HEIGHT_PX}px`,
                lineHeight: `${LINE_HEIGHT_PX}px`
            };
        default:
            return {};
    }
}
function NotesWidget({ config, onUpdateConfig }) {
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(config?.content || "");
    const debounceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const styleId = config?.notesStyle || "blank";
    const lineColor = "var(--color-border)";
    const paperStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>getPaperStyle(styleId, lineColor), [
        styleId,
        lineColor
    ]);
    // Sync from external config changes (e.g. hydration)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setContent(config?.content || "");
    }, [
        config?.content
    ]);
    /** Debounced save — persists 500ms after user stops typing. */ const handleChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((value)=>{
        setContent(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(()=>{
            onUpdateConfig?.({
                content: value
            });
        }, 500);
    }, [
        onUpdateConfig
    ]);
    // Cleanup debounce on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);
    if (!onUpdateConfig) {
        // View mode — render notes as plain text
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetShell"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                    title: "Notes"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/NotesWidget.tsx",
                    lineNumber: 89,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 overflow-y-auto",
                    style: paperStyle,
                    children: content ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-foreground whitespace-pre-wrap",
                        style: {
                            lineHeight: paperStyle.lineHeight || "1.625"
                        },
                        children: content
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/NotesWidget.tsx",
                        lineNumber: 92,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground italic",
                        children: "No notes yet"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/NotesWidget.tsx",
                        lineNumber: 96,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/NotesWidget.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/NotesWidget.tsx",
            lineNumber: 88,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetShell"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                title: "Notes"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/NotesWidget.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                value: content,
                onChange: (e)=>handleChange(e.target.value),
                onBlur: ()=>onUpdateConfig?.({
                        content
                    }),
                placeholder: "Type your notes here...",
                className: "no-drag flex-1 w-full text-sm bg-transparent text-foreground placeholder-muted-foreground resize-none focus:outline-none",
                style: {
                    ...paperStyle,
                    lineHeight: paperStyle.lineHeight || "1.625"
                }
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/NotesWidget.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/NotesWidget.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-icons.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Weather icon mapping from WMO codes to Lucide React components.
 * Replaces emoji-based weather icons with proper SVG icons.
 * Each entry includes a default color class for themed icon rendering.
 *
 * @module weather-icons
 */ __turbopack_context__.s([
    "getWeatherColorClass",
    ()=>getWeatherColorClass,
    "getWeatherIcon",
    ()=>getWeatherIcon,
    "getWeatherLabel",
    ()=>getWeatherLabel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-ssr] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-sun.js [app-ssr] (ecmascript) <export default as CloudSun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cloud$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud.js [app-ssr] (ecmascript) <export default as Cloud>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$fog$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudFog$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-fog.js [app-ssr] (ecmascript) <export default as CloudFog>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$drizzle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudDrizzle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-drizzle.js [app-ssr] (ecmascript) <export default as CloudDrizzle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-rain.js [app-ssr] (ecmascript) <export default as CloudRain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$snow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSnow$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-snow.js [app-ssr] (ecmascript) <export default as CloudSnow>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/snowflake.js [app-ssr] (ecmascript) <export default as Snowflake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$lightning$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudLightning$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-lightning.js [app-ssr] (ecmascript) <export default as CloudLightning>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thermometer.js [app-ssr] (ecmascript) <export default as Thermometer>");
;
;
/** WMO weather code to Lucide icon component, label, and default color. */ const WMO_MAP = {
    0: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"],
        label: "Clear",
        colorClass: "text-yellow-400"
    },
    1: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSun$3e$__["CloudSun"],
        label: "Mostly Clear",
        colorClass: "text-yellow-300"
    },
    2: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSun$3e$__["CloudSun"],
        label: "Partly Cloudy",
        colorClass: "text-amber-300"
    },
    3: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cloud$3e$__["Cloud"],
        label: "Overcast",
        colorClass: "text-gray-400"
    },
    45: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$fog$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudFog$3e$__["CloudFog"],
        label: "Foggy",
        colorClass: "text-gray-400"
    },
    48: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$fog$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudFog$3e$__["CloudFog"],
        label: "Icy Fog",
        colorClass: "text-gray-400"
    },
    51: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$drizzle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudDrizzle$3e$__["CloudDrizzle"],
        label: "Light Drizzle",
        colorClass: "text-blue-400"
    },
    53: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$drizzle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudDrizzle$3e$__["CloudDrizzle"],
        label: "Drizzle",
        colorClass: "text-blue-400"
    },
    55: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__["CloudRain"],
        label: "Heavy Drizzle",
        colorClass: "text-blue-400"
    },
    61: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__["CloudRain"],
        label: "Light Rain",
        colorClass: "text-blue-500"
    },
    63: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__["CloudRain"],
        label: "Rain",
        colorClass: "text-blue-500"
    },
    65: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__["CloudRain"],
        label: "Heavy Rain",
        colorClass: "text-blue-500"
    },
    71: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$snow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSnow$3e$__["CloudSnow"],
        label: "Light Snow",
        colorClass: "text-sky-300"
    },
    73: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$snow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSnow$3e$__["CloudSnow"],
        label: "Snow",
        colorClass: "text-sky-300"
    },
    75: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__["Snowflake"],
        label: "Heavy Snow",
        colorClass: "text-sky-300"
    },
    80: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$drizzle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudDrizzle$3e$__["CloudDrizzle"],
        label: "Showers",
        colorClass: "text-blue-400"
    },
    81: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__["CloudRain"],
        label: "Moderate Showers",
        colorClass: "text-blue-500"
    },
    82: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__["CloudRain"],
        label: "Heavy Showers",
        colorClass: "text-blue-500"
    },
    95: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$lightning$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudLightning$3e$__["CloudLightning"],
        label: "Thunderstorm",
        colorClass: "text-purple-400"
    },
    96: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$lightning$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudLightning$3e$__["CloudLightning"],
        label: "Thunderstorm + Hail",
        colorClass: "text-purple-400"
    },
    99: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$lightning$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudLightning$3e$__["CloudLightning"],
        label: "Heavy Thunderstorm",
        colorClass: "text-purple-400"
    }
};
const FALLBACK_ENTRY = {
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__["Thermometer"],
    label: "Unknown",
    colorClass: "text-gray-400"
};
function getWeatherIcon(code, size = 20, className) {
    const entry = WMO_MAP[code] || FALLBACK_ENTRY;
    const Icon = entry.icon;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
        size: size,
        className: className ?? entry.colorClass
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-icons.tsx",
        lineNumber: 76,
        columnNumber: 10
    }, this);
}
function getWeatherLabel(code) {
    return (WMO_MAP[code] || FALLBACK_ENTRY).label;
}
function getWeatherColorClass(code) {
    return (WMO_MAP[code] || FALLBACK_ENTRY).colorClass;
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Extracted sub-components for the WeatherDetailModal.
 * Keeps each section focused and the modal file under 300 lines.
 *
 * @module WeatherDetailSections
 */ __turbopack_context__.s([
    "DayForecastList",
    ()=>DayForecastList,
    "HeroSection",
    ()=>HeroSection,
    "HourlyStrip",
    ()=>HourlyStrip,
    "StatsGrid",
    ()=>StatsGrid,
    "uvLabel",
    ()=>uvLabel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thermometer.js [app-ssr] (ecmascript) <export default as Thermometer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.js [app-ssr] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wind$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wind$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wind.js [app-ssr] (ecmascript) <export default as Wind>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gauge.js [app-ssr] (ecmascript) <export default as Gauge>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-ssr] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sunrise$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sunrise$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sunrise.js [app-ssr] (ecmascript) <export default as Sunrise>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sunset$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sunset$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sunset.js [app-ssr] (ecmascript) <export default as Sunset>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-icons.tsx [app-ssr] (ecmascript)");
;
;
;
function uvLabel(uv) {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
}
function HeroSection({ data, selectedDay, fmt }) {
    const isToday = selectedDay === 0;
    const day = data.forecast[selectedDay];
    const displayTemp = isToday ? data.temp : day?.tempMax ?? data.temp;
    const displayCode = isToday ? data.weatherCode : day?.weatherCode ?? data.weatherCode;
    const high = day?.tempMax ?? data.temp;
    const low = day?.tempMin ?? data.temp;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-center py-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center mb-2",
                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(displayCode, 40)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-6xl font-extralight tracking-tighter tabular-nums text-foreground",
                children: fmt(displayTemp)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground mt-1",
                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherLabel"])(displayCode)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground/70 mt-0.5",
                children: [
                    "H:",
                    fmt(high),
                    " L:",
                    fmt(low)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
function HourlyStrip({ hours, fmt, fmtHour, isToday }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 pt-2.5 pb-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-medium text-foreground",
                    children: "Hourly Forecast"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 123,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-px bg-border mx-3"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 125,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex overflow-x-auto gap-0 py-3 px-2 scrollbar-none",
                children: hours.map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-1.5 min-w-[52px] px-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] text-muted-foreground font-medium",
                                children: fmtHour(h.time, isToday ? i : -1)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this),
                            h.precipProb > 20 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] text-blue-400 tabular-nums -my-0.5",
                                children: [
                                    h.precipProb,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                                lineNumber: 136,
                                columnNumber: 15
                            }, this),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(h.weatherCode, 18),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm tabular-nums text-foreground font-medium",
                                children: fmt(h.temp)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                                lineNumber: 141,
                                columnNumber: 13
                            }, this)
                        ]
                    }, h.time, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                        lineNumber: 128,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
        lineNumber: 121,
        columnNumber: 5
    }, this);
}
function DayForecastList({ forecast, selectedDay, onSelectDay, fmt }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 pt-2.5 pb-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-medium text-foreground",
                    children: "7-Day Forecast"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 173,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-px bg-border mx-3"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 175,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "divide-y divide-border",
                children: forecast.map((day, i)=>{
                    const dayLabel = i === 0 ? "Today" : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                        weekday: "short"
                    });
                    const isSelected = i === selectedDay;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>onSelectDay(i),
                        className: `flex items-center gap-2 px-3 py-2.5 w-full text-left transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted" : ""}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `w-10 text-xs ${isSelected ? "font-semibold text-foreground" : "text-muted-foreground"}`,
                                children: dayLabel
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                                lineNumber: 195,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-5 flex justify-center",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(day.weatherCode, 16)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                                lineNumber: 204,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex-1 text-xs text-muted-foreground truncate",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherLabel"])(day.weatherCode)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                                lineNumber: 207,
                                columnNumber: 15
                            }, this),
                            day.precipProb > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-blue-400 w-8 text-right tabular-nums",
                                children: [
                                    day.precipProb,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                                lineNumber: 211,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-16 text-right text-xs tabular-nums text-foreground",
                                children: [
                                    fmt(day.tempMax),
                                    " / ",
                                    fmt(day.tempMin)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                                lineNumber: 215,
                                columnNumber: 15
                            }, this)
                        ]
                    }, day.date, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                        lineNumber: 187,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
function StatsGrid({ data, fmt, fmtTime }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-2 gap-2.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__["Thermometer"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 242,
                    columnNumber: 15
                }, void 0),
                label: "Feels Like",
                value: fmt(data.feelsLike)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 247,
                    columnNumber: 15
                }, void 0),
                label: "Humidity",
                value: `${data.humidity}%`
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 246,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wind$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wind$3e$__["Wind"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 252,
                    columnNumber: 15
                }, void 0),
                label: "Wind",
                value: `${Math.round(data.windSpeed)} km/h`
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 251,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 257,
                    columnNumber: 15
                }, void 0),
                label: "UV Index",
                value: `${Math.round(data.uvIndex)}`,
                sublabel: uvLabel(data.uvIndex)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 256,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 263,
                    columnNumber: 15
                }, void 0),
                label: "Visibility",
                value: `${data.visibility} km`
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__["Gauge"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 268,
                    columnNumber: 15
                }, void 0),
                label: "Pressure",
                value: `${Math.round(data.pressure)} hPa`
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 267,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sunrise$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sunrise$3e$__["Sunrise"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 273,
                    columnNumber: 15
                }, void 0),
                label: "Sunrise",
                value: fmtTime(data.sunrise)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 272,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sunset$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sunset$3e$__["Sunset"], {
                    size: 14
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                    lineNumber: 278,
                    columnNumber: 15
                }, void 0),
                label: "Sunset",
                value: fmtTime(data.sunset)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 277,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
        lineNumber: 240,
        columnNumber: 5
    }, this);
}
/* ── StatCard ──────────────────────────────────────────────────── */ /**
 * Small stat card for the conditions grid — no border, just padding.
 *
 * @param icon - Lucide icon element
 * @param label - Stat label
 * @param value - Stat value
 * @param sublabel - Optional secondary label
 */ function StatCard({ icon, label, value, sublabel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 text-muted-foreground mb-1.5",
                children: [
                    icon,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] font-medium text-muted-foreground",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                        lineNumber: 311,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 309,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-lg font-medium text-foreground leading-none",
                children: value
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 315,
                columnNumber: 7
            }, this),
            sublabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[10px] text-muted-foreground mt-0.5",
                children: sublabel
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
                lineNumber: 319,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx",
        lineNumber: 308,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cToF",
    ()=>cToF,
    "default",
    ()=>WeatherDetailModal,
    "getHoursForDay",
    ()=>getHoursForDay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Apple Weather-inspired detailed conditions modal.
 * Layout: City + temp hero -> hourly scroll strip -> 7-day forecast -> stat grid.
 * Fetches full 7-day hourly + daily data from Open-Meteo API.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param locationName - Display name for location
 * @param tempUnit - Temperature unit preference ("F" or "C")
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WeatherDetailSections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailSections.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function cToF(c) {
    return Math.round(c * 9 / 5 + 32);
}
function getHoursForDay(allHourly, dayIndex, currentHourStart) {
    if (dayIndex === 0) {
        return allHourly.slice(currentHourStart, currentHourStart + 25);
    }
    const dayStart = dayIndex * 24;
    return allHourly.slice(dayStart, dayStart + 24);
}
function WeatherDetailModal({ open, onClose, latitude, longitude, locationName, tempUnit }) {
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [allHourly, setAllHourly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentHourIdx, setCurrentHourIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedDay, setSelectedDay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        let cancelled = false;
        async function fetchDetail() {
            setLoading(true);
            setError("");
            setSelectedDay(0);
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility` + `&hourly=temperature_2m,weather_code,precipitation_probability` + `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,uv_index_max,sunrise,sunset` + `&forecast_days=7&timezone=auto`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("Weather API error");
                const json = await res.json();
                if (cancelled) return;
                // Build full 7-day hourly dataset (no slicing)
                const fullHourly = json.hourly.time.map((time, i)=>({
                        time,
                        temp: json.hourly.temperature_2m[i],
                        weatherCode: json.hourly.weather_code[i],
                        precipProb: json.hourly.precipitation_probability?.[i] ?? 0
                    }));
                // Find current hour index for today filtering
                const nowHour = new Date().getHours();
                const todayIdx = json.hourly.time.findIndex((t)=>{
                    const d = new Date(t);
                    return d.toDateString() === new Date().toDateString() && d.getHours() >= nowHour;
                });
                const startIdx = Math.max(todayIdx, 0);
                setAllHourly(fullHourly);
                setCurrentHourIdx(startIdx);
                setData({
                    temp: json.current.temperature_2m,
                    feelsLike: json.current.apparent_temperature,
                    humidity: json.current.relative_humidity_2m,
                    windSpeed: json.current.wind_speed_10m,
                    weatherCode: json.current.weather_code,
                    pressure: json.current.surface_pressure,
                    visibility: Math.round((json.current.visibility || 0) / 1000),
                    uvIndex: json.daily.uv_index_max?.[0] ?? 0,
                    sunrise: json.daily.sunrise?.[0] ?? "",
                    sunset: json.daily.sunset?.[0] ?? "",
                    hourly: fullHourly.slice(startIdx, startIdx + 25),
                    forecast: json.daily.time.map((date, i)=>({
                            date,
                            tempMax: json.daily.temperature_2m_max[i],
                            tempMin: json.daily.temperature_2m_min[i],
                            weatherCode: json.daily.weather_code[i],
                            precipProb: json.daily.precipitation_probability_max?.[i] ?? 0
                        }))
                });
            } catch (err) {
                if (!cancelled) {
                    setError("Could not load weather details");
                    console.error("[WeatherDetailModal] fetch error:", err);
                }
            } finally{
                if (!cancelled) setLoading(false);
            }
        }
        fetchDetail();
        return ()=>{
            cancelled = true;
        };
    }, [
        open,
        latitude,
        longitude
    ]);
    const handleClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>onClose(), [
        onClose
    ]);
    /** Formats temperature based on unit preference. */ function fmt(celsius) {
        return tempUnit === "C" ? `${Math.round(celsius)}°` : `${cToF(celsius)}°`;
    }
    /** Formats ISO time to short hour label. "Now" for first item when on today. */ function fmtHour(iso, idx) {
        if (idx === 0) return "Now";
        const d = new Date(iso);
        return d.toLocaleTimeString([], {
            hour: "numeric"
        });
    }
    /** Formats ISO time to short time string. */ function fmtTime(iso) {
        if (!iso) return "--";
        return new Date(iso).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
    }
    if (!open || typeof document === "undefined") return null;
    const displayHours = getHoursForDay(allHourly, selectedDay, currentHourIdx);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in",
                onClick: handleClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                lineNumber: 189,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-popover rounded-2xl shadow-2xl border border-border w-full w-[calc(100%-2rem)] max-w-lg animate-announce-card-in overflow-hidden max-h-[85vh] flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between p-3 border-b border-border shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                        size: 14,
                                        className: "text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium text-foreground truncate",
                                        children: locationName
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                        lineNumber: 200,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                lineNumber: 198,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleClose,
                                className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                "aria-label": "Close",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                    lineNumber: 209,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                        lineNumber: 197,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto",
                        children: [
                            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-center py-16",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                    lineNumber: 217,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                lineNumber: 216,
                                columnNumber: 13
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-center py-16",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                    lineNumber: 223,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                lineNumber: 222,
                                columnNumber: 13
                            }, this),
                            data && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 space-y-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WeatherDetailSections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HeroSection"], {
                                        data: data,
                                        selectedDay: selectedDay,
                                        fmt: fmt
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                        lineNumber: 229,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-px bg-border"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                        lineNumber: 231,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WeatherDetailSections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HourlyStrip"], {
                                        hours: displayHours,
                                        fmt: fmt,
                                        fmtHour: fmtHour,
                                        isToday: selectedDay === 0
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                        lineNumber: 232,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-px bg-border"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                        lineNumber: 239,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WeatherDetailSections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DayForecastList"], {
                                        forecast: data.forecast,
                                        selectedDay: selectedDay,
                                        onSelectDay: setSelectedDay,
                                        fmt: fmt
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                        lineNumber: 240,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-px bg-border my-2"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                        lineNumber: 247,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WeatherDetailSections$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatsGrid"], {
                                        data: data,
                                        fmt: fmt,
                                        fmtTime: fmtTime
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                        lineNumber: 248,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                                lineNumber: 228,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx",
        lineNumber: 187,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StandardDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Standard weather display — the original WeatherWidget layout.
 * Today: location, big temp, description, stats row.
 * Week: header with current temp, divider, 7-day forecast list with bar graphs.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-icons.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function StandardDisplay({ current, forecast, locationName, formatTemp, compact, viewMode, config, editMode, onDetailOpen }) {
    const handleClick = ()=>{
        if (!editMode) onDetailOpen();
    };
    if (viewMode === "today") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full flex flex-col justify-between p-3 overflow-hidden cursor-pointer",
            onClick: handleClick,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                            size: 10,
                            className: "text-muted-foreground shrink-0"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[11px] text-muted-foreground truncate",
                            children: locationName
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-extralight tracking-tighter tabular-nums text-foreground leading-none ${compact ? "text-3xl" : "text-5xl"}`,
                                    children: formatTemp(current.temp)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                    lineNumber: 45,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground mt-0.5",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherLabel"])(current.weatherCode)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                    lineNumber: 52,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-muted-foreground",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(current.weatherCode, compact ? 24 : 36)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this),
                !compact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3 text-[11px] text-muted-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: `Feels ${formatTemp(current.feelsLike)}`
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                            lineNumber: 64,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-border",
                            children: "|"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                current.humidity,
                                "%"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                            lineNumber: 66,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-border",
                            children: "|"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                            lineNumber: 67,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                Math.round(current.windSpeed),
                                " km/h"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                            lineNumber: 68,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                    lineNumber: 63,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, this);
    }
    // Week view
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col p-3 overflow-hidden cursor-pointer",
        onClick: handleClick,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                size: 10,
                                className: "text-muted-foreground shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] text-muted-foreground truncate",
                                children: locationName
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg font-extralight tabular-nums text-foreground leading-none",
                                children: formatTemp(current.temp)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-muted-foreground",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(current.weatherCode, 16)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-px bg-border mb-2"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "flex-1 overflow-y-auto space-y-0.5",
                children: forecast.map((day, i)=>{
                    const dayLabel = i === 0 ? "Today" : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                        weekday: "short"
                    });
                    const weekMin = Math.min(...forecast.map((d)=>d.tempMin));
                    const weekMax = Math.max(...forecast.map((d)=>d.tempMax));
                    const range = weekMax - weekMin || 1;
                    const barLeft = (day.tempMin - weekMin) / range * 100;
                    const barWidth = (day.tempMax - day.tempMin) / range * 100;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex items-center gap-2 py-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `w-9 text-[11px] ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`,
                                children: dayLabel
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                lineNumber: 120,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-5 text-center text-muted-foreground",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(day.weatherCode, 14)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                lineNumber: 129,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-6 text-right text-[11px] tabular-nums text-muted-foreground",
                                children: formatTemp(day.tempMin)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                lineNumber: 132,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 h-[3px] rounded-full bg-muted relative mx-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute h-full rounded-full",
                                    style: {
                                        left: `${barLeft}%`,
                                        width: `${Math.max(barWidth, 10)}%`,
                                        backgroundColor: config?.accentColor ? `${config.accentColor}80` : "rgb(96 165 250 / 0.5)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                    lineNumber: 136,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                lineNumber: 135,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-6 text-[11px] tabular-nums text-foreground",
                                children: formatTemp(day.tempMax)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                                lineNumber: 147,
                                columnNumber: 15
                            }, this)
                        ]
                    }, day.date, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                        lineNumber: 119,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MinimalDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Minimal weather display — ultra-clean presentation.
 * Today: centered temp number + small icon only, no stats.
 * Week: condensed single-line forecast rows.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-icons.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function MinimalDisplay({ current, forecast, formatTemp, viewMode, editMode, onDetailOpen }) {
    const handleClick = ()=>{
        if (!editMode) onDetailOpen();
    };
    if (viewMode === "today") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full flex items-center justify-center gap-3 p-3 cursor-pointer",
            onClick: handleClick,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-5xl font-extralight tracking-tighter tabular-nums text-foreground leading-none",
                    children: formatTemp(current.temp)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-muted-foreground",
                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(current.weatherCode, 28)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    // Week view — condensed rows
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col justify-center p-3 overflow-hidden cursor-pointer",
        onClick: handleClick,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
            className: "space-y-1",
            children: forecast.map((day, i)=>{
                const dayLabel = i === 0 ? "Today" : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                    weekday: "short"
                });
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-[11px] w-9 ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`,
                            children: dayLabel
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
                            lineNumber: 57,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-muted-foreground",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(day.weatherCode, 12)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
                            lineNumber: 66,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[11px] tabular-nums text-muted-foreground",
                            children: formatTemp(day.tempMin)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
                            lineNumber: 69,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[11px] tabular-nums text-foreground",
                            children: formatTemp(day.tempMax)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
                            lineNumber: 72,
                            columnNumber: 15
                        }, this)
                    ]
                }, day.date, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
                    lineNumber: 56,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CardDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Card weather display — icon-focused layout.
 * Today: large centered icon, temp below, description text.
 * Week: icon-focused grid/list.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-icons.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function CardDisplay({ current, forecast, formatTemp, viewMode, editMode, onDetailOpen }) {
    const handleClick = ()=>{
        if (!editMode) onDetailOpen();
    };
    if (viewMode === "today") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full flex flex-col items-center justify-center p-3 cursor-pointer",
            onClick: handleClick,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-muted-foreground mb-2",
                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(current.weatherCode, 48)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-4xl font-extralight tracking-tighter tabular-nums text-foreground leading-none",
                    children: formatTemp(current.temp)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-muted-foreground mt-1",
                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherLabel"])(current.weatherCode)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    // Week view — icon-focused list
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col p-3 overflow-hidden cursor-pointer",
        onClick: handleClick,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center gap-2 mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-muted-foreground",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(current.weatherCode, 20)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-lg font-extralight tabular-nums text-foreground leading-none",
                        children: formatTemp(current.temp)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-px bg-border mb-2"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "flex-1 overflow-y-auto space-y-1",
                children: forecast.map((day, i)=>{
                    const dayLabel = i === 0 ? "Today" : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                        weekday: "short"
                    });
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex items-center gap-2 py-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `w-9 text-[11px] ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`,
                                children: dayLabel
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                                lineNumber: 74,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-muted-foreground",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(day.weatherCode, 16)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                                lineNumber: 83,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] text-muted-foreground flex-1 truncate",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherLabel"])(day.weatherCode)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                                lineNumber: 86,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] tabular-nums text-foreground",
                                children: formatTemp(day.tempMax)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                                lineNumber: 89,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] tabular-nums text-muted-foreground",
                                children: formatTemp(day.tempMin)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                                lineNumber: 92,
                                columnNumber: 15
                            }, this)
                        ]
                    }, day.date, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                        lineNumber: 70,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GradientDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Gradient weather display — dynamic gradient background based on weather condition.
 * Today: gradient bg with white text overlay showing temp and icon.
 * Week: gradient header with forecast list below.
 *
 * Gradient mapping (Apple Weather-inspired):
 * - Clear/Sunny (0-1): sky blue
 * - Partly cloudy (2-3): blue-gray
 * - Fog (45,48): gray-slate
 * - Drizzle/Rain (51-82): cool blue
 * - Snow (71-75): white-blue
 * - Thunderstorm (95-99): dark purple
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-icons.tsx [app-ssr] (ecmascript)");
"use client";
;
;
/**
 * Returns a CSS gradient string based on WMO weather code.
 *
 * @param code - WMO weather code
 * @returns CSS linear-gradient string
 */ function getWeatherGradient(code) {
    if (code <= 1) return "linear-gradient(135deg, #47b2ff, #1a8cff)";
    if (code <= 3) return "linear-gradient(135deg, #60a5fa, #94a3b8)";
    if (code <= 48) return "linear-gradient(135deg, #94a3b8, #64748b)";
    if (code <= 55) return "linear-gradient(135deg, #60a5fa, #3b82f6)";
    if (code <= 65) return "linear-gradient(135deg, #3b82f6, #2563eb)";
    if (code <= 75) return "linear-gradient(135deg, #bfdbfe, #93c5fd)";
    if (code <= 82) return "linear-gradient(135deg, #3b82f6, #1d4ed8)";
    return "linear-gradient(135deg, #7c3aed, #4c1d95)";
}
function GradientDisplay({ current, forecast, locationName, formatTemp, viewMode, editMode, onDetailOpen }) {
    const handleClick = ()=>{
        if (!editMode) onDetailOpen();
    };
    const gradient = getWeatherGradient(current.weatherCode);
    if (viewMode === "today") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full flex flex-col justify-between p-3 overflow-hidden cursor-pointer rounded-[inherit]",
            style: {
                background: gradient
            },
            onClick: handleClick,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[11px] text-white/70 truncate",
                    children: locationName
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-5xl font-extralight tracking-tighter tabular-nums text-white leading-none",
                                    children: formatTemp(current.temp)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                                    lineNumber: 67,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-white/70 mt-0.5",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherLabel"])(current.weatherCode)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                                    lineNumber: 70,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-white/80",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(current.weatherCode, 36)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3 text-[11px] text-white/60",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: `Feels ${formatTemp(current.feelsLike)}`
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-white/30",
                            children: "|"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                current.humidity,
                                "%"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-white/30",
                            children: "|"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                Math.round(current.windSpeed),
                                " km/h"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                            lineNumber: 85,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
            lineNumber: 54,
            columnNumber: 7
        }, this);
    }
    // Week view — gradient header + forecast list
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col overflow-hidden cursor-pointer rounded-[inherit]",
        onClick: handleClick,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3 flex items-center justify-between shrink-0",
                style: {
                    background: gradient
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white/80",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(current.weatherCode, 16)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg font-extralight tabular-nums text-white leading-none",
                                children: formatTemp(current.temp)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-white/70 truncate ml-2",
                        children: locationName
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "flex-1 overflow-y-auto p-3 space-y-0.5",
                children: forecast.map((day, i)=>{
                    const dayLabel = i === 0 ? "Today" : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                        weekday: "short"
                    });
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex items-center gap-2 py-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `w-9 text-[11px] ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`,
                                children: dayLabel
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                                lineNumber: 127,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-muted-foreground",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(day.weatherCode, 14)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                                lineNumber: 136,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex-1"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                                lineNumber: 139,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] tabular-nums text-muted-foreground",
                                children: formatTemp(day.tempMin)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                                lineNumber: 140,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] tabular-nums text-foreground",
                                children: formatTemp(day.tempMax)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                                lineNumber: 143,
                                columnNumber: 15
                            }, this)
                        ]
                    }, day.date, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                        lineNumber: 126,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DetailedDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Detailed weather display — extra stats in a grid layout.
 * Today: temp + icon, then 2x2 stat grid (feels like, humidity, wind, description).
 * Week: reuses standard week view (already detailed).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thermometer.js [app-ssr] (ecmascript) <export default as Thermometer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.js [app-ssr] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wind$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wind$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wind.js [app-ssr] (ecmascript) <export default as Wind>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cloud$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud.js [app-ssr] (ecmascript) <export default as Cloud>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-icons.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function DetailedDisplay({ current, forecast, locationName, formatTemp, compact, viewMode, config, editMode, onDetailOpen }) {
    const handleClick = ()=>{
        if (!editMode) onDetailOpen();
    };
    if (viewMode === "today") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full flex flex-col justify-between p-3 overflow-hidden cursor-pointer",
            onClick: handleClick,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                            size: 10,
                            className: "text-muted-foreground shrink-0"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[11px] text-muted-foreground truncate",
                            children: locationName
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `font-extralight tracking-tighter tabular-nums text-foreground leading-none ${compact ? "text-3xl" : "text-4xl"}`,
                            children: formatTemp(current.temp)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-muted-foreground",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(current.weatherCode, compact ? 24 : 32)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this),
                !compact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCell, {
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__["Thermometer"], {
                                size: 10
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 60,
                                columnNumber: 21
                            }, void 0),
                            label: "Feels like",
                            value: formatTemp(current.feelsLike)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                            lineNumber: 59,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCell, {
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"], {
                                size: 10
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 65,
                                columnNumber: 21
                            }, void 0),
                            label: "Humidity",
                            value: `${current.humidity}%`
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                            lineNumber: 64,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCell, {
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wind$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wind$3e$__["Wind"], {
                                size: 10
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 70,
                                columnNumber: 21
                            }, void 0),
                            label: "Wind",
                            value: `${Math.round(current.windSpeed)} km/h`
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCell, {
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Cloud$3e$__["Cloud"], {
                                size: 10
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 75,
                                columnNumber: 21
                            }, void 0),
                            label: "Condition",
                            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherLabel"])(current.weatherCode)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                            lineNumber: 74,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                    lineNumber: 58,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, this);
    }
    // Week view — same as standard (already detailed)
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col p-3 overflow-hidden cursor-pointer",
        onClick: handleClick,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                size: 10,
                                className: "text-muted-foreground shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] text-muted-foreground truncate",
                                children: locationName
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg font-extralight tabular-nums text-foreground leading-none",
                                children: formatTemp(current.temp)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 100,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-muted-foreground",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(current.weatherCode, 16)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-px bg-border mb-2"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "flex-1 overflow-y-auto space-y-0.5",
                children: forecast.map((day, i)=>{
                    const dayLabel = i === 0 ? "Today" : new Date(day.date + "T00:00:00").toLocaleDateString([], {
                        weekday: "short"
                    });
                    const weekMin = Math.min(...forecast.map((d)=>d.tempMin));
                    const weekMax = Math.max(...forecast.map((d)=>d.tempMax));
                    const range = weekMax - weekMin || 1;
                    const barLeft = (day.tempMin - weekMin) / range * 100;
                    const barWidth = (day.tempMax - day.tempMin) / range * 100;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex items-center gap-2 py-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `w-9 text-[11px] ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`,
                                children: dayLabel
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 129,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-5 text-center text-muted-foreground",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(day.weatherCode, 14)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 138,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-6 text-right text-[11px] tabular-nums text-muted-foreground",
                                children: formatTemp(day.tempMin)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 141,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 h-[3px] rounded-full bg-muted relative mx-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute h-full rounded-full",
                                    style: {
                                        left: `${barLeft}%`,
                                        width: `${Math.max(barWidth, 10)}%`,
                                        backgroundColor: config?.accentColor ? `${config.accentColor}80` : "rgb(96 165 250 / 0.5)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                    lineNumber: 145,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 144,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-6 text-[11px] tabular-nums text-foreground",
                                children: formatTemp(day.tempMax)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                                lineNumber: 156,
                                columnNumber: 15
                            }, this)
                        ]
                    }, day.date, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                        lineNumber: 128,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
/**
 * Small stat cell for the 2x2 grid.
 *
 * @param icon - Lucide icon element
 * @param label - Stat label text
 * @param value - Stat value text
 */ function StatCell({ icon, label, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg bg-muted/50 px-2 py-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1 text-muted-foreground mb-0.5",
                children: [
                    icon,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] uppercase tracking-wide",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[11px] text-foreground font-medium truncate block",
                children: value
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
                lineNumber: 189,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx",
        lineNumber: 184,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Barrel exports for weather display components.
 * Provides WEATHER_DISPLAY_MAP for dynamic display lookup by ID.
 */ __turbopack_context__.s([
    "WEATHER_DISPLAY_MAP",
    ()=>WEATHER_DISPLAY_MAP
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$StandardDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/StandardDisplay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$MinimalDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/MinimalDisplay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$CardDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/CardDisplay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$GradientDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/GradientDisplay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$DetailedDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/DetailedDisplay.tsx [app-ssr] (ecmascript)");
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
const WEATHER_DISPLAY_MAP = {
    standard: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$StandardDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    minimal: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$MinimalDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    card: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$CardDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    gradient: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$GradientDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    detailed: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$DetailedDisplay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
};
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WeatherWidget,
    "reverseGeocode",
    ()=>reverseGeocode,
    "weatherFetcher",
    ()=>weatherFetcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Weather widget using Open-Meteo API (free, no key required).
 * Auto-detects location via browser geolocation + reverse geocoding.
 * Dispatches rendering to a selected weather display component.
 * Clicking opens a detailed Apple Weather-style modal.
 *
 * Uses SWR for caching weather data across page navigations.
 *
 * @param config - Widget configuration (weatherView, tempUnit, weatherDisplay)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/swr/dist/index/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-icons.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useCompactMode.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WeatherDetailModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherDetailModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/weather-displays/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$weather$2d$displays$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/weather-displays.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
/**
 * Converts Celsius to Fahrenheit.
 *
 * @param c - Temperature in Celsius
 * @returns Temperature in Fahrenheit, rounded to nearest integer
 */ function cToF(c) {
    return Math.round(c * 9 / 5 + 32);
}
async function reverseGeocode(lat, lon) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`, {
            headers: {
                "User-Agent": "CalTodo/1.0"
            }
        });
        if (!res.ok) return `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;
        const data = await res.json();
        const addr = data.address;
        const city = addr?.city || addr?.town || addr?.village || addr?.suburb || "";
        const state = addr?.state || "";
        // Use state abbreviation if US
        const stateCode = addr?.["ISO3166-2-lvl4"]?.split("-")[1] || state.slice(0, 2);
        if (city && stateCode) return `${city}, ${stateCode}`;
        if (city) return city;
        return `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;
    } catch  {
        return `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;
    }
}
async function weatherFetcher(key) {
    const match = key.match(/^weather:([-\d.]+),([-\d.]+)$/);
    if (!match) throw new Error(`Invalid weather key: ${key}`);
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    const [cityName, weatherRes] = await Promise.all([
        reverseGeocode(lat, lon),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto`)
    ]);
    if (!weatherRes.ok) throw new Error("Weather API error");
    const data = await weatherRes.json();
    return {
        current: {
            temp: data.current.temperature_2m,
            weatherCode: data.current.weather_code,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            feelsLike: data.current.apparent_temperature
        },
        forecast: data.daily.time.map((date, i)=>({
                date,
                tempMax: data.daily.temperature_2m_max[i],
                tempMin: data.daily.temperature_2m_min[i],
                weatherCode: data.daily.weather_code[i]
            })),
        locationName: cityName
    };
}
const WEATHER_CACHE_KEY = "weather-widget-cache";
/**
 * Reads cached weather data from localStorage.
 *
 * @returns Cached object with coords, weather data, and locationName, or null if not found/invalid
 */ function readWeatherCache() {
    try {
        const raw = localStorage.getItem(WEATHER_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.coords?.lat != null && parsed?.coords?.lon != null && parsed?.data?.current) {
            return parsed;
        }
        return null;
    } catch  {
        return null;
    }
}
/**
 * Writes weather data + coords to localStorage for instant rendering on next mount.
 *
 * @param coords - Latitude/longitude used for the fetch
 * @param data - Weather response data to cache
 */ function writeWeatherCache(coords, data) {
    try {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
            coords,
            data
        }));
    } catch  {
    // localStorage full or unavailable — silently ignore
    }
}
function WeatherWidget({ config, editMode }) {
    const viewMode = config?.weatherView || "today";
    const units = config?.tempUnit || "F";
    const displayId = config?.weatherDisplay || __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$weather$2d$displays$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_WEATHER_DISPLAY"];
    // Restore cached coords + data from localStorage for instant render
    const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>readWeatherCache(), []);
    const [coords, setCoords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(cached?.coords ?? null);
    const [geoError, setGeoError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [permDenied, setPermDenied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [retryCount, setRetryCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [detailOpen, setDetailOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { containerRef, compact } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCompactMode"])(160);
    // Part A: Geolocation (stays as useEffect)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        async function getLocation() {
            setGeoError("");
            setPermDenied(false);
            try {
                // Skip permission pre-check on retry — go straight to getCurrentPosition
                // so the browser can re-prompt if the user has reset permissions.
                if (retryCount === 0 && navigator.permissions) {
                    try {
                        const status = await navigator.permissions.query({
                            name: "geolocation"
                        });
                        if (status.state === "denied") {
                            setPermDenied(true);
                            throw new Error("PERMISSION_DENIED");
                        }
                    } catch (permErr) {
                        if (permErr instanceof Error && permErr.message === "PERMISSION_DENIED") {
                            throw permErr;
                        }
                    }
                }
                const pos = await new Promise((resolve, reject)=>{
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        maximumAge: 300000
                    });
                });
                if (cancelled) return;
                setCoords({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                });
            } catch (err) {
                if (cancelled) return;
                const geoErr = err;
                if (geoErr?.code === 1) {
                    setPermDenied(true);
                    setGeoError("Location blocked — enable in site settings");
                } else if (geoErr?.code === 2 || geoErr?.code === 3) {
                    setGeoError("Enable location access");
                } else if (err instanceof Error && err.message === "PERMISSION_DENIED") {
                    setGeoError("Location blocked — enable in site settings");
                } else {
                    setGeoError("Could not load weather");
                }
            }
        }
        getLocation();
        return ()=>{
            cancelled = true;
        };
    }, [
        retryCount
    ]);
    // Part B: Weather data (useSWR — null key skips fetch until coords ready)
    const swrKey = coords ? `weather:${coords.lat},${coords.lon}` : null;
    const { data, isLoading: weatherLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(swrKey, weatherFetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 300000,
        refreshInterval: 900000,
        fallbackData: cached?.data ?? undefined,
        onSuccess: (freshData)=>{
            if (coords) writeWeatherCache(coords, freshData);
        }
    });
    const current = data?.current ?? null;
    const forecast = data?.forecast ?? [];
    const locationName = data?.locationName ?? "";
    // Loading: waiting for geolocation OR weather fetch (with no cached data)
    const loading = !coords ? !geoError : weatherLoading;
    /** Formats temperature based on unit preference. */ function formatTemp(celsius) {
        return units === "C" ? `${Math.round(celsius)}°` : `${cToF(celsius)}°`;
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full flex flex-col justify-between p-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-2.5 w-20 rounded bg-muted animate-pulse"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                    lineNumber: 260,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-10 w-20 rounded bg-muted animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                                    lineNumber: 263,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-3 w-16 rounded bg-muted animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                                    lineNumber: 264,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                            lineNumber: 262,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-9 h-9 rounded-full bg-muted animate-pulse"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                            lineNumber: 266,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                    lineNumber: 261,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-2.5 w-12 rounded bg-muted animate-pulse"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                            lineNumber: 269,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-2.5 w-8 rounded bg-muted animate-pulse"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                            lineNumber: 270,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-2.5 w-14 rounded bg-muted animate-pulse"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                            lineNumber: 271,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                    lineNumber: 268,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
            lineNumber: 259,
            columnNumber: 7
        }, this);
    }
    if (geoError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `h-full w-full flex flex-col items-center justify-center p-3 text-center ${!permDenied ? "cursor-pointer" : ""}`,
            onClick: !permDenied ? ()=>setRetryCount((c)=>c + 1) : undefined,
            role: !permDenied ? "button" : undefined,
            tabIndex: !permDenied ? 0 : undefined,
            onKeyDown: !permDenied ? (e)=>{
                if (e.key === "Enter" || e.key === " ") setRetryCount((c)=>c + 1);
            } : undefined,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-muted-foreground mb-2",
                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$icons$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWeatherIcon"])(3, 24)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                    lineNumber: 286,
                    columnNumber: 9
                }, this),
                permDenied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-muted-foreground mb-1",
                            children: "Location blocked — click the lock icon in your address bar"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                            lineNumber: 291,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setRetryCount((c)=>c + 1),
                            className: "text-xs text-foreground hover:text-muted-foreground transition-colors cursor-pointer",
                            children: "Retry"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                            lineNumber: 294,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-muted-foreground",
                    children: geoError
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                    lineNumber: 303,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
            lineNumber: 279,
            columnNumber: 7
        }, this);
    }
    if (!current) return null;
    // Resolve the display component from the map, fallback to standard
    const Display = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WEATHER_DISPLAY_MAP"][displayId] || __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$weather$2d$displays$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WEATHER_DISPLAY_MAP"].standard;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                className: "h-full w-full rounded-xl transition-[filter] duration-200 hover:brightness-[0.92] dark:hover:brightness-[0.85]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Display, {
                    current: current,
                    forecast: forecast,
                    locationName: locationName,
                    formatTemp: formatTemp,
                    compact: compact,
                    viewMode: viewMode,
                    config: config,
                    editMode: editMode,
                    onDetailOpen: ()=>setDetailOpen(true)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                    lineNumber: 319,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                lineNumber: 318,
                columnNumber: 7
            }, this),
            coords && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WeatherDetailModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: detailOpen,
                onClose: ()=>setDetailOpen(false),
                latitude: coords.lat,
                longitude: coords.lon,
                locationName: locationName,
                tempUnit: units
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeatherWidget.tsx",
                lineNumber: 333,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CalChatWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Cal Chat widget showing recent messages across all course chats.
 * Lists the most recently active courses with their last messages.
 * Shows "No new messages" when there are no discussions.
 *
 * @param config - Widget configuration (unused for now)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useDiscussionBoards.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useCompactMode.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function CalChatWidget({ config }) {
    const { boards, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDiscussionBoards"])();
    const { containerRef, compact } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCompactMode"])(160);
    /** Boards sorted by most recent message first. */ const sortedBoards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            ...boards
        ].filter((b)=>b.last_message_at).sort((a, b)=>{
            const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return bTime - aTime;
        });
    }, [
        boards
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetShell"], {
            centered: true,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                lineNumber: 39,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, this);
    }
    if (sortedBoards.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetEmptyState"], {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                size: 24
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                lineNumber: 47,
                columnNumber: 15
            }, void 0),
            message: "No new messages"
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "h-full w-full flex flex-col p-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                title: "Cal Chat",
                right: compact ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-muted-foreground",
                    children: [
                        sortedBoards.length,
                        " active"
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                    lineNumber: 59,
                    columnNumber: 13
                }, void 0) : undefined
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            compact ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "flex-1 space-y-1.5 overflow-y-auto",
                children: sortedBoards.slice(0, 8).map((board)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex flex-col gap-0.5 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-foreground truncate",
                                        children: board.course.name
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                                        lineNumber: 71,
                                        columnNumber: 17
                                    }, this),
                                    board.last_message_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground shrink-0",
                                        children: formatRelativeTime(board.last_message_at)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                                        lineNumber: 75,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                                lineNumber: 70,
                                columnNumber: 15
                            }, this),
                            board.last_message_body && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground line-clamp-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: [
                                            board.last_message_author,
                                            ": "
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                                        lineNumber: 82,
                                        columnNumber: 19
                                    }, this),
                                    board.last_message_body
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                                lineNumber: 81,
                                columnNumber: 17
                            }, this)
                        ]
                    }, board.course.id, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                        lineNumber: 69,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CalChatWidget.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
/**
 * Formats a timestamp into a short relative time string.
 *
 * @param isoStr - ISO 8601 timestamp string
 * @returns Human-readable relative time (e.g. "2h", "3d", "Jan 5")
 */ function formatRelativeTime(isoStr) {
    const now = Date.now();
    const then = new Date(isoStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24) return `${diffHr}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return new Date(isoStr).toLocaleDateString([], {
        month: "short",
        day: "numeric"
    });
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PomodoroWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Pomodoro timer widget with work/break intervals.
 * Features an SVG circular progress ring, MM:SS countdown,
 * session counter, and Play/Pause/Reset/Skip controls.
 *
 * Timer state is persisted to localStorage — survives page refresh and navigation.
 *
 * @param config - Widget config with workMinutes and breakMinutes
 * @param onUpdateConfig - Callback to persist config changes
 * @param editMode - Whether the dashboard is in edit mode (disables controls)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pause.js [app-ssr] (ecmascript) <export default as Pause>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-forward.js [app-ssr] (ecmascript) <export default as SkipForward>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useCompactMode.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/**
 * Formats seconds into MM:SS string.
 *
 * @param totalSeconds - Number of seconds to format
 * @returns Formatted time string (e.g. "25:00")
 */ function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
const TOTAL_SESSIONS = 4;
const POMO_STORAGE_KEY = "caltodo_pomodoro_state";
/**
 * Reads persisted Pomodoro state from localStorage.
 * If the timer was running when saved, adjusts secondsLeft by elapsed time.
 *
 * @returns Restored state or null if not available
 */ function readPersistedState() {
    try {
        const raw = localStorage.getItem(POMO_STORAGE_KEY);
        if (!raw) return null;
        const state = JSON.parse(raw);
        if (state.running && state.savedAt) {
            const elapsed = Math.floor((Date.now() - state.savedAt) / 1000);
            state.secondsLeft = Math.max(0, state.secondsLeft - elapsed);
        }
        return state;
    } catch  {
        return null;
    }
}
/**
 * Writes Pomodoro state to localStorage for persistence across page refreshes.
 */ function writePersistedState(state) {
    try {
        localStorage.setItem(POMO_STORAGE_KEY, JSON.stringify({
            ...state,
            savedAt: Date.now()
        }));
    } catch  {}
}
/**
 * Plays a mechanical clock tick sound using noise burst + resonant filter.
 * Mimics the sharp "tick" of a wind-up clock mechanism.
 */ function playClickSound() {
    try {
        const ctx = new AudioContext();
        const t = ctx.currentTime;
        // Short noise burst for the mechanical "click"
        const bufferSize = Math.floor(ctx.sampleRate * 0.015);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let i = 0; i < bufferSize; i++){
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        // Bandpass filter to give it a woody, clock-like resonance
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 3200;
        filter.Q.value = 5;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.03);
    } catch  {}
}
/**
 * Plays a classic mechanical alarm bell sound.
 * Rapid alternating strikes like a wind-up alarm clock ringing.
 */ function playRingSound() {
    try {
        const ctx = new AudioContext();
        const t = ctx.currentTime;
        const strikes = 8;
        const interval = 0.12;
        for(let i = 0; i < strikes; i++){
            const offset = t + i * interval;
            // Alternate between two slightly different pitches like a twin-bell alarm
            const freq = i % 2 === 0 ? 2200 : 2600;
            // Bell tone
            const osc = ctx.createOscillator();
            osc.type = "square";
            osc.frequency.value = freq;
            // Metallic overtone
            const osc2 = ctx.createOscillator();
            osc2.type = "sine";
            osc2.frequency.value = freq * 2.76;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, offset);
            gain.gain.linearRampToValueAtTime(0.7, offset + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.001, offset + 0.09);
            const gain2 = ctx.createGain();
            gain2.gain.setValueAtTime(0, offset);
            gain2.gain.linearRampToValueAtTime(0.25, offset + 0.005);
            gain2.gain.exponentialRampToValueAtTime(0.001, offset + 0.07);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc.start(offset);
            osc.stop(offset + 0.1);
            osc2.start(offset);
            osc2.stop(offset + 0.1);
        }
    } catch  {}
}
function PomodoroWidget({ config, onUpdateConfig, editMode }) {
    const workMinutes = Number(config?.workMinutes) || 25;
    const breakMinutes = Number(config?.breakMinutes) || 5;
    const { containerRef, compact } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCompactMode"])(180);
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>readPersistedState()?.phase ?? "work");
    const [secondsLeft, setSecondsLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>readPersistedState()?.secondsLeft ?? workMinutes * 60);
    const [running, setRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>readPersistedState()?.running ?? false);
    const [completedSessions, setCompletedSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>readPersistedState()?.completedSessions ?? 0);
    /** Total seconds for the current phase (used for progress calculation). */ const totalForPhase = phase === "work" ? workMinutes * 60 : breakMinutes * 60;
    const intervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Wall-clock timestamp (ms) when the timer was started/resumed. */ const startTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    /** How many seconds were remaining when the timer was started/resumed. */ const startSecondsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    /** Clears the running interval if active. */ const clearTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);
    /** Reset timer when config changes (work/break minutes). */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setSecondsLeft(phase === "work" ? workMinutes * 60 : breakMinutes * 60);
        setRunning(false);
        clearTimer();
    }, [
        workMinutes,
        breakMinutes,
        clearTimer
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    /**
   * Tick the timer using wall-clock elapsed time so it stays accurate
   * even when the browser tab is backgrounded / throttled.
   */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!running) {
            clearTimer();
            return;
        }
        startTimeRef.current = Date.now();
        startSecondsRef.current = secondsLeft;
        const tick = ()=>{
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const remaining = Math.max(0, startSecondsRef.current - elapsed);
            if (remaining <= 0) {
                // Phase complete — play alarm and notify user
                playRingSound();
                try {
                    if (Notification.permission === "granted") {
                        new Notification(phase === "work" ? "Break time!" : "Back to focus!", {
                            body: phase === "work" ? "Great work! Take a break." : "Break's over. Let's go!",
                            silent: false
                        });
                    }
                } catch  {}
                if (phase === "work") {
                    setCompletedSessions((s)=>s + 1);
                    setPhase("break");
                    setSecondsLeft(breakMinutes * 60);
                } else {
                    setPhase("work");
                    setSecondsLeft(workMinutes * 60);
                }
                // setPhase triggers effect re-run which restarts the interval
                return;
            }
            setSecondsLeft(remaining);
            // Update tab title in the same tick — no separate interval needed
            const label = phase === "work" ? "Focus" : "Break";
            document.title = `${formatTime(remaining)} — ${label} | caltodo`;
        };
        // Set title immediately on start
        const label = phase === "work" ? "Focus" : "Break";
        document.title = `${formatTime(secondsLeft)} — ${label} | caltodo`;
        intervalRef.current = setInterval(tick, 500);
        return clearTimer;
    }, [
        running,
        phase,
        workMinutes,
        breakMinutes,
        clearTimer
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    /** Reset tab title when timer stops. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!running) document.title = "caltodo";
    }, [
        running
    ]);
    /** Persist timer state to localStorage on every change. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        writePersistedState({
            phase,
            secondsLeft,
            running,
            completedSessions
        });
    }, [
        phase,
        secondsLeft,
        running,
        completedSessions
    ]);
    /** Toggle play/pause. Plays click sound on start. Requests notification permission on first start. */ function handlePlayPause() {
        if (editMode) return;
        if (!running) {
            playClickSound();
            if (typeof Notification !== "undefined" && Notification.permission === "default") {
                Notification.requestPermission();
            }
        }
        setRunning((r)=>!r);
    }
    /** Reset timer to beginning of current phase. */ function handleReset() {
        if (editMode) return;
        setRunning(false);
        clearTimer();
        setSecondsLeft(totalForPhase);
    }
    /** Skip to the next phase. */ function handleSkip() {
        if (editMode) return;
        setRunning(false);
        clearTimer();
        if (phase === "work") {
            setCompletedSessions((s)=>s + 1);
            setPhase("break");
            setSecondsLeft(breakMinutes * 60);
        } else {
            setPhase("work");
            setSecondsLeft(workMinutes * 60);
        }
    }
    /** Progress fraction (0 = full, 1 = empty). */ const progress = 1 - secondsLeft / totalForPhase;
    const workColor = config?.accentColor || '#007AFF';
    const breakColor = '#22c55e';
    const ringStroke = phase === "work" ? workColor : breakColor;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "h-full w-full flex flex-col p-3 overflow-hidden",
        children: compact ? /* Compact: single row */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 h-full",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-lg font-light text-foreground tabular-nums flex-1",
                    children: formatTime(secondsLeft)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                    lineNumber: 317,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1 no-drag shrink-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handlePlayPause,
                            disabled: editMode,
                            className: "w-7 h-7 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform disabled:opacity-40",
                            style: {
                                backgroundColor: workColor
                            },
                            "aria-label": running ? "Pause" : "Start",
                            children: running ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                                size: 12
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                                lineNumber: 322,
                                columnNumber: 26
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                size: 12,
                                className: "ml-0.5"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                                lineNumber: 322,
                                columnNumber: 48
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                            lineNumber: 321,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleReset,
                            disabled: editMode,
                            className: "w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40",
                            "aria-label": "Reset",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                size: 10
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                                lineNumber: 325,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                            lineNumber: 324,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                    lineNumber: 320,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
            lineNumber: 316,
            columnNumber: 9
        }, this) : /* Full size: large time, progress bar, label + controls */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-semibold text-muted-foreground tracking-wide uppercase",
                            children: phase === "work" ? "Focus" : "Break"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                            lineNumber: 334,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-1",
                            children: Array.from({
                                length: TOTAL_SESSIONS
                            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    style: {
                                        backgroundColor: i < completedSessions ? workColor : 'var(--color-muted-foreground, #9ca3af)',
                                        opacity: i < completedSessions ? 1 : 0.2
                                    }
                                }, i, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                                    lineNumber: 339,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                            lineNumber: 337,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                    lineNumber: 333,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-5xl font-extralight tracking-tight text-foreground tabular-nums",
                        style: running ? {
                            textShadow: `0 0 20px ${ringStroke}30`
                        } : undefined,
                        children: formatTime(secondsLeft)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                        lineNumber: 353,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                    lineNumber: 352,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-1 rounded-full bg-muted overflow-hidden mb-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full rounded-full transition-all duration-500 ease-out",
                        style: {
                            width: `${progress * 100}%`,
                            backgroundColor: ringStroke
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                        lineNumber: 363,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                    lineNumber: 362,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center gap-3 no-drag",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleReset,
                            disabled: editMode,
                            className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none",
                            "aria-label": "Reset timer",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                                lineNumber: 372,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                            lineNumber: 371,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handlePlayPause,
                            disabled: editMode,
                            className: "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-40 disabled:pointer-events-none",
                            style: {
                                backgroundColor: workColor
                            },
                            "aria-label": running ? "Pause timer" : "Start timer",
                            children: running ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                                lineNumber: 375,
                                columnNumber: 26
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                size: 18,
                                className: "ml-0.5"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                                lineNumber: 375,
                                columnNumber: 48
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                            lineNumber: 374,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSkip,
                            disabled: editMode,
                            className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none",
                            "aria-label": "Skip to next phase",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__["SkipForward"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                                lineNumber: 378,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                            lineNumber: 377,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
                    lineNumber: 370,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/PomodoroWidget.tsx",
        lineNumber: 313,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CountdownWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Countdown widget — big number showing days/hours until a target date.
 * Notion-style: large bold number, small muted label, minimal chrome.
 * Auto-detects next deadline from tasks, or uses a custom date/label.
 *
 * @module CountdownWidget
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hourglass$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hourglass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hourglass.js [app-ssr] (ecmascript) <export default as Hourglass>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/**
 * Computes the time remaining from now to a target date.
 *
 * @param targetDate - ISO date string (YYYY-MM-DD)
 * @returns Object with days, hours, minutes, and whether the target has passed
 */ function getTimeRemaining(targetDate) {
    const target = new Date(targetDate + "T23:59:59");
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return {
        days: 0,
        hours: 0,
        minutes: 0,
        passed: true
    };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    return {
        days,
        hours,
        minutes,
        passed: false
    };
}
function CountdownWidget({ config }) {
    const { tasks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const mode = config?.countdownMode || "auto";
    const customDate = config?.countdownDate || "";
    const customLabel = config?.countdownLabel || "";
    const autoTarget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const now = new Date().toISOString().split("T")[0];
        const upcoming = tasks.filter((t)=>t.due_date && t.due_date >= now && !t.is_completed && !t.dismissed_at).sort((a, b)=>(a.due_date ?? "").localeCompare(b.due_date ?? ""));
        if (upcoming.length === 0) return null;
        return {
            date: upcoming[0].due_date,
            label: upcoming[0].title
        };
    }, [
        tasks
    ]);
    const targetDate = mode === "custom" ? customDate : autoTarget?.date || "";
    const targetLabel = mode === "custom" ? customLabel : autoTarget?.label || "";
    const [remaining, setRemaining] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(targetDate ? getTimeRemaining(targetDate) : null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!targetDate) {
            setRemaining(null);
            return;
        }
        setRemaining(getTimeRemaining(targetDate));
        const interval = setInterval(()=>setRemaining(getTimeRemaining(targetDate)), 60_000);
        return ()=>clearInterval(interval);
    }, [
        targetDate
    ]);
    if (!targetDate || !remaining) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetEmptyState"], {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hourglass$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hourglass$3e$__["Hourglass"], {
                size: 24
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
                lineNumber: 76,
                columnNumber: 15
            }, void 0),
            message: "No upcoming deadlines"
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
            lineNumber: 75,
            columnNumber: 7
        }, this);
    }
    const accentColor = config?.accentColor || "#007AFF";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetShell"], {
        centered: true,
        children: remaining.passed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-2xl font-bold text-foreground",
                    children: "Done!"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
                    lineNumber: 88,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-[11px] text-muted-foreground mt-1 truncate max-w-full",
                    children: targetLabel
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
                    lineNumber: 89,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        {
                            value: remaining.days,
                            label: remaining.days === 1 ? "day" : "days"
                        },
                        {
                            value: remaining.hours,
                            label: remaining.hours === 1 ? "hr" : "hrs"
                        },
                        {
                            value: remaining.minutes,
                            label: "min"
                        }
                    ].map((unit)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-center rounded-xl bg-muted/50 px-3 py-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-2xl font-light tabular-nums leading-none ${remaining.days < 3 ? "text-red-400" : remaining.days < 7 ? "text-amber-400" : ""}`,
                                    style: remaining.days >= 7 ? {
                                        color: accentColor
                                    } : undefined,
                                    children: unit.value
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
                                    lineNumber: 105,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] uppercase tracking-widest text-muted-foreground mt-1",
                                    children: unit.label
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
                                    lineNumber: 117,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, unit.label, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
                            lineNumber: 101,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
                    lineNumber: 95,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-[11px] text-muted-foreground mt-2.5 truncate max-w-full leading-tight",
                    children: targetLabel
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
                    lineNumber: 123,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CountdownWidget.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuickLinksWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Quick Links widget — grid of pinned bookmarks with favicons.
 * Notion-style: clean grid, subtle hover states, favicon + label.
 * Links are stored as JSON in widget config.
 *
 * @module QuickLinksWidget
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/link.js [app-ssr] (ecmascript) <export default as Link>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/**
 * Extracts the favicon URL for a given site.
 *
 * @param url - Full URL string
 * @returns Google favicon service URL
 */ function getFaviconUrl(url) {
    try {
        const hostname = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch  {
        return "";
    }
}
/**
 * Parses links from the widget config JSON string.
 *
 * @param config - Widget config record
 * @returns Array of QuickLink objects
 */ function parseLinks(config) {
    if (!config?.links) return [];
    try {
        return JSON.parse(config.links);
    } catch  {
        return [];
    }
}
function QuickLinksWidget({ config, onUpdateConfig }) {
    const links = parseLinks(config);
    const [adding, setAdding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newUrl, setNewUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [newLabel, setNewLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    /**
   * Saves a new link to the widget config.
   * Normalizes URLs without protocol by prepending https://.
   */ function handleAdd() {
        if (!newUrl.trim()) return;
        let url = newUrl.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        const label = newLabel.trim() || new URL(url).hostname.replace("www.", "");
        const updated = [
            ...links,
            {
                url,
                label
            }
        ];
        onUpdateConfig?.({
            ...config,
            links: JSON.stringify(updated)
        });
        setNewUrl("");
        setNewLabel("");
        setAdding(false);
    }
    /**
   * Removes a link by index from the widget config.
   *
   * @param index - Index of the link to remove
   */ function handleRemove(index) {
        const updated = links.filter((_, i)=>i !== index);
        onUpdateConfig?.({
            ...config,
            links: JSON.stringify(updated)
        });
    }
    if (links.length === 0 && !adding) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetEmptyState"], {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__["Link"], {
                size: 24
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                lineNumber: 92,
                columnNumber: 15
            }, void 0),
            message: "Add your favorite links",
            action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setAdding(true),
                className: "no-drag flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                        size: 12
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                        lineNumber: 99,
                        columnNumber: 13
                    }, void 0),
                    "Add Link"
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                lineNumber: 95,
                columnNumber: 11
            }, void 0)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
            lineNumber: 91,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetShell"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                title: "Quick Links",
                right: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setAdding(true),
                    className: "no-drag w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                    "aria-label": "Add link",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                        size: 12
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                        lineNumber: 117,
                        columnNumber: 13
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                    lineNumber: 112,
                    columnNumber: 11
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 grid grid-cols-2 gap-1.5 overflow-y-auto content-start",
                children: links.map((link, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: link.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "no-drag group flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: getFaviconUrl(link.url),
                                alt: "",
                                className: "w-4 h-4 rounded-sm shrink-0",
                                loading: "lazy"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                                lineNumber: 131,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-foreground truncate",
                                children: link.label
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                                lineNumber: 137,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: (e)=>{
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemove(i);
                                },
                                className: "no-drag absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/10 transition-all",
                                "aria-label": `Remove ${link.label}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 8
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                                    lineNumber: 143,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                                lineNumber: 138,
                                columnNumber: 13
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                        lineNumber: 124,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            adding && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "no-drag mt-2 p-2 rounded-lg border border-border bg-muted/50 space-y-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "url",
                        placeholder: "https://example.com",
                        value: newUrl,
                        onChange: (e)=>setNewUrl(e.target.value),
                        onKeyDown: (e)=>e.key === "Enter" && handleAdd(),
                        className: "w-full px-2 py-1.5 text-xs rounded-md border border-input-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
                        autoFocus: true
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Label (optional)",
                        value: newLabel,
                        onChange: (e)=>setNewLabel(e.target.value),
                        onKeyDown: (e)=>e.key === "Enter" && handleAdd(),
                        className: "w-full px-2 py-1.5 text-xs rounded-md border border-input-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setAdding(false),
                                className: "flex-1 px-2 py-1 text-xs rounded-md text-muted-foreground hover:bg-muted transition-colors",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleAdd,
                                className: "flex-1 px-2 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                                children: "Add"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                        lineNumber: 169,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
                lineNumber: 151,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuickLinksWidget.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HabitTrackerWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Habit Tracker widget — GitHub-style contribution heatmap.
 * Shows last 12 weeks of daily check-ins with color intensity.
 * Streak counter and completion rate. Data stored in widget config.
 *
 * @module HabitTrackerWidget
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/** Day labels for the heatmap grid (Mon, Wed, Fri shown). */ const DAY_LABELS = [
    "",
    "M",
    "",
    "W",
    "",
    "F",
    ""
];
/**
 * Parses the checked dates set from config JSON.
 *
 * @param config - Widget config record
 * @returns Set of checked date strings (YYYY-MM-DD)
 */ function parseCheckedDates(config) {
    if (!config?.checkedDates) return new Set();
    try {
        return new Set(JSON.parse(config.checkedDates));
    } catch  {
        return new Set();
    }
}
/**
 * Generates the last N weeks of dates for the heatmap grid.
 *
 * @param weeks - Number of weeks to generate
 * @returns 2D array of date strings [week][day], column-major for CSS grid
 */ function generateGrid(weeks) {
    const today = new Date();
    const grid = [];
    // Start from (weeks) weeks ago, aligned to Monday
    const start = new Date(today);
    start.setDate(start.getDate() - (start.getDay() + 6) % 7 - (weeks - 1) * 7);
    for(let w = 0; w < weeks; w++){
        const week = [];
        for(let d = 0; d < 7; d++){
            const date = new Date(start);
            date.setDate(start.getDate() + w * 7 + d);
            if (date > today) {
                week.push("");
            } else {
                week.push(date.toISOString().split("T")[0]);
            }
        }
        grid.push(week);
    }
    return grid;
}
/**
 * Calculates the current streak of consecutive checked days ending today.
 *
 * @param checkedDates - Set of checked date strings
 * @returns Number of consecutive days including today (0 if today not checked)
 */ function calculateStreak(checkedDates) {
    const today = new Date();
    let streak = 0;
    const date = new Date(today);
    while(true){
        const key = date.toISOString().split("T")[0];
        if (checkedDates.has(key)) {
            streak++;
            date.setDate(date.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}
function HabitTrackerWidget({ config, onUpdateConfig }) {
    const checkedDates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>parseCheckedDates(config), [
        config
    ]);
    const habitName = config?.habitName || "Daily habit";
    const accentColor = config?.accentColor || "#22c55e";
    const weeks = 12;
    const grid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>generateGrid(weeks), []);
    const streak = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>calculateStreak(checkedDates), [
        checkedDates
    ]);
    // Count total checked in visible grid
    const totalChecked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let count = 0;
        for (const week of grid){
            for (const day of week){
                if (day && checkedDates.has(day)) count++;
            }
        }
        return count;
    }, [
        grid,
        checkedDates
    ]);
    const totalDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let count = 0;
        for (const week of grid){
            for (const day of week){
                if (day) count++;
            }
        }
        return count;
    }, [
        grid
    ]);
    /**
   * Toggles a date's checked state and persists to config.
   *
   * @param dateStr - Date string to toggle (YYYY-MM-DD)
   */ const toggleDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((dateStr)=>{
        if (!dateStr) return;
        const next = new Set(checkedDates);
        if (next.has(dateStr)) {
            next.delete(dateStr);
        } else {
            next.add(dateStr);
        }
        onUpdateConfig?.({
            ...config,
            checkedDates: JSON.stringify([
                ...next
            ])
        });
    }, [
        checkedDates,
        config,
        onUpdateConfig
    ]);
    /**
   * Returns the opacity level for a cell based on whether it's checked.
   *
   * @param dateStr - Date string for the cell
   * @returns CSS opacity value string
   */ function getCellColor(dateStr) {
        if (!dateStr) return "transparent";
        if (checkedDates.has(dateStr)) return accentColor;
        return "var(--muted)";
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col p-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                title: habitName,
                right: streak > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-0.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                            size: 12,
                            className: "text-orange-500"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                            lineNumber: 161,
                            columnNumber: 15
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-bold text-foreground tabular-nums",
                            children: streak
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                            lineNumber: 162,
                            columnNumber: 15
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                    lineNumber: 160,
                    columnNumber: 13
                }, void 0) : undefined
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                lineNumber: 156,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex gap-0.5 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-0.5 shrink-0 mr-1",
                        children: DAY_LABELS.map((label, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-[11px] flex items-center justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-muted-foreground leading-none",
                                    children: label
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                                    lineNumber: 177,
                                    columnNumber: 15
                                }, this)
                            }, i, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                                lineNumber: 173,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex gap-0.5 overflow-x-auto",
                        children: grid.map((week, wi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-0.5 flex-1 min-w-0",
                                children: week.map((day, di)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>toggleDate(day),
                                        disabled: !day,
                                        className: "no-drag w-full aspect-square rounded-[2px] transition-colors hover:opacity-80 disabled:cursor-default",
                                        style: {
                                            backgroundColor: getCellColor(day)
                                        },
                                        title: day || undefined,
                                        "aria-label": day ? `${day}${checkedDates.has(day) ? " (checked)" : ""}` : undefined
                                    }, di, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                                        lineNumber: 187,
                                        columnNumber: 17
                                    }, this))
                            }, wi, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                                lineNumber: 185,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mt-2 pt-2 border-t border-foreground/5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-muted-foreground",
                        children: [
                            totalChecked,
                            "/",
                            totalDays,
                            " days"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                        lineNumber: 204,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-muted-foreground tabular-nums",
                        children: [
                            totalDays > 0 ? Math.round(totalChecked / totalDays * 100) : 0,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                        lineNumber: 207,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/HabitTrackerWidget.tsx",
        lineNumber: 155,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuoteWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Quote of the Day widget — displays a rotating motivational quote.
 * Supports custom quotes: users can edit the text and author in edit mode.
 * Falls back to daily-rotating curated quotes when no custom quote is set.
 *
 * @module QuoteWidget
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-ssr] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/** Curated collection of motivational and study-related quotes. */ const QUOTES = [
    {
        text: "The secret of getting ahead is getting started.",
        author: "Mark Twain",
        category: "motivation"
    },
    {
        text: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius",
        category: "motivation"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        category: "motivation"
    },
    {
        text: "Education is the most powerful weapon which you can use to change the world.",
        author: "Nelson Mandela",
        category: "study"
    },
    {
        text: "The beautiful thing about learning is that no one can take it away from you.",
        author: "B.B. King",
        category: "study"
    },
    {
        text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
        author: "Mahatma Gandhi",
        category: "study"
    },
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "motivation"
    },
    {
        text: "In the middle of difficulty lies opportunity.",
        author: "Albert Einstein",
        category: "motivation"
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson",
        category: "productivity"
    },
    {
        text: "You don't have to be great to start, but you have to start to be great.",
        author: "Zig Ziglar",
        category: "motivation"
    },
    {
        text: "Focus on being productive instead of busy.",
        author: "Tim Ferriss",
        category: "productivity"
    },
    {
        text: "Small daily improvements are the key to staggering long-term results.",
        author: "James Clear",
        category: "productivity"
    },
    {
        text: "The expert in anything was once a beginner.",
        author: "Helen Hayes",
        category: "study"
    },
    {
        text: "Discipline is choosing between what you want now and what you want most.",
        author: "Abraham Lincoln",
        category: "motivation"
    },
    {
        text: "What we learn with pleasure we never forget.",
        author: "Alfred Mercier",
        category: "study"
    },
    {
        text: "The mind is not a vessel to be filled, but a fire to be kindled.",
        author: "Plutarch",
        category: "study"
    },
    {
        text: "Start where you are. Use what you have. Do what you can.",
        author: "Arthur Ashe",
        category: "motivation"
    },
    {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        category: "productivity"
    },
    {
        text: "I find that the harder I work, the more luck I seem to have.",
        author: "Thomas Jefferson",
        category: "productivity"
    },
    {
        text: "It always seems impossible until it's done.",
        author: "Nelson Mandela",
        category: "motivation"
    },
    {
        text: "A person who never made a mistake never tried anything new.",
        author: "Albert Einstein",
        category: "motivation"
    },
    {
        text: "The roots of education are bitter, but the fruit is sweet.",
        author: "Aristotle",
        category: "study"
    },
    {
        text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
        author: "Benjamin Franklin",
        category: "study"
    },
    {
        text: "Productivity is never an accident. It is the result of intelligent effort.",
        author: "Paul J. Meyer",
        category: "productivity"
    },
    {
        text: "Your limitation — it's only your imagination.",
        author: "Unknown",
        category: "motivation"
    },
    {
        text: "Great things never come from comfort zones.",
        author: "Unknown",
        category: "motivation"
    },
    {
        text: "Dream it. Wish it. Do it.",
        author: "Unknown",
        category: "motivation"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "motivation"
    },
    {
        text: "Knowledge is power. Information is liberating.",
        author: "Kofi Annan",
        category: "study"
    },
    {
        text: "Do something today that your future self will thank you for.",
        author: "Sean Patrick Flanery",
        category: "productivity"
    }
];
function QuoteWidget({ config, onUpdateConfig }) {
    const category = config?.quoteCategory || "all";
    const accentColor = config?.accentColor || "#007AFF";
    const customText = config?.customText || "";
    const customAuthor = config?.customAuthor || "";
    const isCustom = !!customText;
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editText, setEditText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(customText);
    const [editAuthor, setEditAuthor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(customAuthor);
    const debounceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    // Sync edit fields when config changes externally
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setEditText(config?.customText || "");
        setEditAuthor(config?.customAuthor || "");
    }, [
        config?.customText,
        config?.customAuthor
    ]);
    /** Daily-rotating quote from the curated list. */ const dailyQuote = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const filtered = category === "all" ? QUOTES : QUOTES.filter((q)=>q.category === category);
        if (filtered.length === 0) return QUOTES[0];
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
        return filtered[dayOfYear % filtered.length];
    }, [
        category
    ]);
    /** The quote to display — custom if set, otherwise daily rotation. */ const displayQuote = isCustom ? {
        text: customText,
        author: customAuthor || "You"
    } : {
        text: dailyQuote.text,
        author: dailyQuote.author
    };
    /** Saves the custom quote with debounce. */ const saveCustomQuote = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((text, author)=>{
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(()=>{
            onUpdateConfig?.({
                ...config,
                customText: text,
                customAuthor: author
            });
        }, 500);
    }, [
        config,
        onUpdateConfig
    ]);
    // Cleanup debounce timer on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);
    /** Resets to daily-rotating quotes. */ const resetToDaily = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setEditText("");
        setEditAuthor("");
        setEditing(false);
        onUpdateConfig?.({
            ...config,
            customText: "",
            customAuthor: ""
        });
    }, [
        config,
        onUpdateConfig
    ]);
    // Edit mode — inline text fields
    if (editing && onUpdateConfig) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetShell"], {
            centered: true,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: editText,
                        onChange: (e)=>{
                            setEditText(e.target.value);
                            saveCustomQuote(e.target.value, editAuthor);
                        },
                        placeholder: "Enter your quote...",
                        className: "w-full bg-transparent font-serif text-base leading-relaxed text-foreground italic resize-none focus:outline-none placeholder-muted-foreground min-h-[60px]",
                        rows: 3,
                        autoFocus: true
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: editAuthor,
                        onChange: (e)=>{
                            setEditAuthor(e.target.value);
                            saveCustomQuote(editText, e.target.value);
                        },
                        placeholder: "Author (optional)",
                        className: "w-full bg-transparent text-[11px] text-muted-foreground tracking-wide focus:outline-none placeholder-muted-foreground/50"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 pt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setEditing(false);
                                    if (editText.trim()) {
                                        onUpdateConfig?.({
                                            ...config,
                                            customText: editText.trim(),
                                            customAuthor: editAuthor.trim()
                                        });
                                    }
                                },
                                className: "text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors",
                                children: "Done"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this),
                            (isCustom || editText) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: resetToDaily,
                                className: "text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                        size: 10
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                                        lineNumber: 179,
                                        columnNumber: 17
                                    }, this),
                                    "Reset to daily"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                                lineNumber: 174,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                        lineNumber: 156,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                lineNumber: 134,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
            lineNumber: 133,
            columnNumber: 7
        }, this);
    }
    // View mode — display quote with edit button on hover
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetShell"], {
        centered: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative group",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-6xl font-serif absolute -top-4 -left-1 opacity-[0.08] leading-none select-none",
                    children: "“"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                    lineNumber: 193,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-serif text-base leading-relaxed text-foreground italic",
                    children: displayQuote.text
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                    lineNumber: 196,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-12 h-0.5 opacity-30 mt-3 rounded-full",
                    style: {
                        backgroundColor: accentColor
                    }
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                    lineNumber: 199,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-[11px] text-muted-foreground mt-2 tracking-wide",
                    children: [
                        "— ",
                        displayQuote.author
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                    lineNumber: 200,
                    columnNumber: 9
                }, this),
                onUpdateConfig && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>{
                        setEditText(isCustom ? customText : "");
                        setEditAuthor(isCustom ? customAuthor : "");
                        setEditing(true);
                    },
                    className: "absolute -top-1 -right-1 p-1.5 rounded-lg bg-card border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent",
                    title: "Edit quote",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
                        size: 12,
                        className: "text-muted-foreground"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                        lineNumber: 216,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
                    lineNumber: 206,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
            lineNumber: 192,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/QuoteWidget.tsx",
        lineNumber: 191,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatsWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Stats / KPI widget — big bold number with trend indicator.
 * Notion-style: large metric, small label, subtle change indicator.
 * Shows task completion stats derived from TaskContext.
 *
 * @module StatsWidget
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-down.js [app-ssr] (ecmascript) <export default as TrendingDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/**
 * Checks if a date string falls within this week (Mon-Sun).
 *
 * @param dateStr - ISO date string
 * @returns true if the date is in the current week
 */ function isThisWeek(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (now.getDay() + 6) % 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return date >= monday && date <= sunday;
}
/**
 * Checks if a date string falls within last week (Mon-Sun).
 *
 * @param dateStr - ISO date string
 * @returns true if the date is in last week
 */ function isLastWeek(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - (now.getDay() + 6) % 7);
    thisMonday.setHours(0, 0, 0, 0);
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);
    const lastSunday = new Date(thisMonday);
    lastSunday.setDate(thisMonday.getDate() - 1);
    lastSunday.setHours(23, 59, 59, 999);
    return date >= lastMonday && date <= lastSunday;
}
function StatsWidget({ config }) {
    const { tasks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const metric = config?.statsMetric || "completion";
    const accentColor = config?.accentColor || "#007AFF";
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const active = tasks.filter((t)=>!t.dismissed_at);
        switch(metric){
            case "completed-week":
                {
                    const thisWeekCount = active.filter((t)=>t.is_completed && t.completed_at && isThisWeek(t.completed_at)).length;
                    const lastWeekCount = active.filter((t)=>t.is_completed && t.completed_at && isLastWeek(t.completed_at)).length;
                    const change = lastWeekCount > 0 ? Math.round((thisWeekCount - lastWeekCount) / lastWeekCount * 100) : thisWeekCount > 0 ? 100 : 0;
                    return {
                        value: thisWeekCount.toString(),
                        label: "Completed this week",
                        change,
                        suffix: ""
                    };
                }
            case "streak":
                {
                    let streak = 0;
                    const date = new Date();
                    while(true){
                        const dayStr = date.toISOString().split("T")[0];
                        const hasCompletion = active.some((t)=>t.is_completed && t.completed_at?.startsWith(dayStr));
                        if (hasCompletion) {
                            streak++;
                            date.setDate(date.getDate() - 1);
                        } else {
                            break;
                        }
                    }
                    return {
                        value: streak.toString(),
                        label: "Day streak",
                        change: 0,
                        suffix: ""
                    };
                }
            case "pending":
                {
                    const pending = active.filter((t)=>!t.is_completed).length;
                    return {
                        value: pending.toString(),
                        label: "Tasks remaining",
                        change: 0,
                        suffix: ""
                    };
                }
            default:
                {
                    const total = active.length;
                    const completed = active.filter((t)=>t.is_completed).length;
                    const pct = total > 0 ? Math.round(completed / total * 100) : 0;
                    return {
                        value: pct.toString(),
                        label: "Overall completion",
                        change: 0,
                        suffix: "%"
                    };
                }
        }
    }, [
        tasks,
        metric
    ]);
    /** Icon badge based on metric type. */ const badgeIcon = metric === "streak" ? "🔥" : metric === "pending" ? "📋" : "✓";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetShell"], {
        centered: true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs mb-2",
                style: {
                    backgroundColor: accentColor
                },
                children: badgeIcon
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-baseline gap-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-5xl font-extralight tabular-nums leading-none",
                        style: {
                            color: accentColor
                        },
                        children: stats.value
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    stats.suffix && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-2xl font-extralight",
                        style: {
                            color: accentColor
                        },
                        children: stats.suffix
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
                        lineNumber: 129,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this),
            stats.change !== 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${stats.change > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-400/10 text-red-400"}`,
                children: [
                    stats.change > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                        size: 12
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
                        lineNumber: 141,
                        columnNumber: 31
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingDown$3e$__["TrendingDown"], {
                        size: 12
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
                        lineNumber: 141,
                        columnNumber: 58
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "tabular-nums",
                        children: [
                            stats.change > 0 ? "+" : "",
                            stats.change,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
                lineNumber: 136,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground mt-1.5",
                children: stats.label
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StatsWidget.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WeeklyHeatmapWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Weekly Heatmap widget — visual representation of task completion activity.
 * GitHub-style contribution grid showing the last 12 weeks of activity.
 * Color intensity based on number of tasks completed each day.
 *
 * @module WeeklyHeatmapWidget
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/** Month abbreviations for the top axis labels. */ const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];
/**
 * Returns the intensity level (0-4) for a given completion count.
 *
 * @param count - Number of tasks completed on a given day
 * @returns Intensity level from 0 (none) to 4 (high)
 */ function getIntensity(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
}
function WeeklyHeatmapWidget({ config }) {
    const { tasks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const accentColor = config?.accentColor || "#22c55e";
    const weeks = 12;
    // Build completion count map from tasks
    const completionMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        for (const t of tasks){
            if (t.is_completed && t.completed_at && !t.dismissed_at) {
                const day = t.completed_at.split("T")[0];
                map.set(day, (map.get(day) || 0) + 1);
            }
        }
        return map;
    }, [
        tasks
    ]);
    // Generate grid of dates
    const { grid, monthLabels, totalCompleted, bestDay } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const today = new Date();
        const g = [];
        const start = new Date(today);
        start.setDate(start.getDate() - (start.getDay() + 6) % 7 - (weeks - 1) * 7);
        const labels = [];
        let lastMonth = -1;
        let total = 0;
        let best = 0;
        for(let w = 0; w < weeks; w++){
            const week = [];
            for(let d = 0; d < 7; d++){
                const date = new Date(start);
                date.setDate(start.getDate() + w * 7 + d);
                if (date > today) {
                    week.push({
                        date: "",
                        count: 0
                    });
                } else {
                    const key = date.toISOString().split("T")[0];
                    const count = completionMap.get(key) || 0;
                    week.push({
                        date: key,
                        count
                    });
                    total += count;
                    if (count > best) best = count;
                    if (date.getMonth() !== lastMonth) {
                        lastMonth = date.getMonth();
                        labels.push({
                            label: MONTHS[lastMonth],
                            col: w
                        });
                    }
                }
            }
            g.push(week);
        }
        return {
            grid: g,
            monthLabels: labels,
            totalCompleted: total,
            bestDay: best
        };
    }, [
        completionMap,
        weeks
    ]);
    /**
   * Returns the background color for a cell based on intensity level.
   * Uses the accent color with varying opacity levels.
   *
   * @param intensity - Level 0-4
   * @returns CSS color string
   */ function getCellStyle(intensity) {
        if (intensity === 0) return "var(--muted)";
        const opacities = [
            0.2,
            0.4,
            0.7,
            1
        ];
        return `color-mix(in srgb, ${accentColor} ${opacities[intensity - 1] * 100}%, transparent)`;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col p-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                title: "Activity",
                right: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-muted-foreground tabular-nums",
                    children: [
                        totalCompleted,
                        " tasks completed"
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                    lineNumber: 109,
                    columnNumber: 11
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-0.5 ml-4 mb-1",
                children: monthLabels.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-muted-foreground",
                        style: {
                            marginLeft: i === 0 ? `${m.col * 14}px` : undefined,
                            width: i < monthLabels.length - 1 ? `${(monthLabels[i + 1].col - m.col) * 14}px` : undefined
                        },
                        children: m.label
                    }, i, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex gap-0.5 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-0.5 shrink-0 mr-1",
                        children: [
                            "",
                            "M",
                            "",
                            "W",
                            "",
                            "F",
                            ""
                        ].map((label, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-[11px] flex items-center justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-muted-foreground leading-none",
                                    children: label
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                                    lineNumber: 139,
                                    columnNumber: 15
                                }, this)
                            }, i, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                                lineNumber: 138,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex gap-0.5 overflow-x-auto",
                        children: grid.map((week, wi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-0.5 flex-1 min-w-0",
                                children: week.map((cell, di)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full aspect-square rounded-[2px] transition-colors",
                                        style: {
                                            backgroundColor: cell.date ? getCellStyle(getIntensity(cell.count)) : "transparent"
                                        },
                                        title: cell.date ? `${cell.date}: ${cell.count} task${cell.count === 1 ? "" : "s"}` : undefined
                                    }, di, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                                        lineNumber: 149,
                                        columnNumber: 17
                                    }, this))
                            }, wi, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                                lineNumber: 147,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-end gap-1 mt-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-muted-foreground mr-1",
                        children: "Less"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    [
                        0,
                        1,
                        2,
                        3,
                        4
                    ].map((level)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-[10px] h-[10px] rounded-[2px]",
                            style: {
                                backgroundColor: getCellStyle(level)
                            }
                        }, level, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                            lineNumber: 169,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-muted-foreground ml-1",
                        children: "More"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/WeeklyHeatmapWidget.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/StickerWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StickerWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function StickerWidget({ config, onUpdateConfig }) {
    const emoji = config?.stickerEmoji || "✨";
    const stickerText = config?.stickerText || "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col items-center justify-center p-3 text-center select-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "leading-none",
                style: {
                    fontSize: "clamp(32px, 8vw, 72px)",
                    animation: "float 3s ease-in-out infinite",
                    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                },
                role: "img",
                "aria-label": "Sticker",
                children: emoji
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StickerWidget.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            stickerText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[11px] text-muted-foreground mt-3 truncate max-w-full",
                children: stickerText
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StickerWidget.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/StickerWidget.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/SpotifyWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SpotifyWidget,
    "parseSpotifyUrl",
    ()=>parseSpotifyUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Spotify embed widget — renders a playable Spotify player via iframe.
 * Users paste a Spotify URL (track, album, playlist, podcast) in the
 * settings panel. Supports custom header text, colors, and dark/light theme.
 *
 * @module SpotifyWidget
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/music.js [app-ssr] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/widgets/WidgetPrimitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function parseSpotifyUrl(url) {
    if (!url) return null;
    const trimmed = url.trim();
    // Handle spotify: URI format (spotify:track:abc123)
    const uriMatch = trimmed.match(/^spotify:(\w+):([a-zA-Z0-9]+)/);
    if (uriMatch) {
        return {
            type: uriMatch[1],
            id: uriMatch[2]
        };
    }
    // Handle open.spotify.com URL format
    try {
        const parsed = new URL(trimmed);
        if (!parsed.hostname.includes("spotify.com")) return null;
        // Path format: /track/abc123 or /embed/track/abc123
        const segments = parsed.pathname.split("/").filter(Boolean);
        // Skip "embed" prefix if present
        const start = segments[0] === "embed" ? 1 : 0;
        const type = segments[start];
        const id = segments[start + 1];
        if (type && id) {
            // Strip query params from id
            return {
                type,
                id: id.split("?")[0]
            };
        }
    } catch  {
    // Not a valid URL
    }
    return null;
}
/** Content type labels for the header. */ const TYPE_LABELS = {
    track: "Track",
    album: "Album",
    playlist: "Playlist",
    episode: "Episode",
    show: "Podcast"
};
/**
 * Builds the Spotify embed iframe URL from a parsed type and ID.
 *
 * @param type - Content type (track, album, playlist, episode, show)
 * @param id - Spotify content ID
 * @param darkMode - Whether to use dark theme (theme=0)
 * @returns Full embed URL string
 */ function buildEmbedUrl(type, id, darkMode = true) {
    return `https://open.spotify.com/embed/${type}/${id}?theme=${darkMode ? "0" : "1"}`;
}
function SpotifyWidget({ config }) {
    const parsed = parseSpotifyUrl(config.spotifyUrl || "");
    // Empty state — direct to settings
    if (!parsed) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetEmptyState"], {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                size: 24
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/SpotifyWidget.tsx",
                lineNumber: 94,
                columnNumber: 15
            }, void 0),
            message: "Click to add a Spotify link in settings"
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/SpotifyWidget.tsx",
            lineNumber: 93,
            columnNumber: 7
        }, this);
    }
    // Render embedded player with optional header
    const useDarkTheme = config.spotifyTheme !== "light";
    const embedUrl = buildEmbedUrl(parsed.type, parsed.id, useDarkTheme);
    const headerText = config.spotifyLabel || TYPE_LABELS[parsed.type] || "Spotify";
    const showHeader = config.spotifyShowHeader !== "false";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetShell"], {
        className: showHeader ? "" : "p-0",
        children: [
            showHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$widgets$2f$WidgetPrimitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WidgetHeader"], {
                title: headerText
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/SpotifyWidget.tsx",
                lineNumber: 109,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex-1 min-h-0 overflow-hidden ${showHeader ? "-mx-3 -mb-3" : ""}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                    src: embedUrl,
                    width: "100%",
                    height: "100%",
                    allow: "encrypted-media",
                    loading: "lazy",
                    className: showHeader ? "" : "rounded-sm",
                    title: "Spotify Player"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/SpotifyWidget.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/SpotifyWidget.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/SpotifyWidget.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MiniCalendarWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfMonth$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/startOfMonth.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfMonth$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/endOfMonth.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfWeek$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/startOfWeek.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfWeek$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/endOfWeek.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$eachDayOfInterval$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/eachDayOfInterval.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isSameMonth$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/isSameMonth.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isToday$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/isToday.js [app-ssr] (ecmascript)");
/**
 * Mini calendar widget showing the current month grid.
 * Highlights today's date. Compact layout for dashboard use.
 *
 * @param config - Widget config (unused currently)
 */ "use client";
;
;
;
const DAY_LABELS = [
    "S",
    "M",
    "T",
    "W",
    "T",
    "F",
    "S"
];
function MiniCalendarWidget({ config }) {
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Date());
    const accentColor = config?.accentColor || "#4285F4";
    // Update at midnight to stay current
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const msUntilMidnight = ()=>{
            const n = new Date();
            const midnight = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
            return midnight.getTime() - n.getTime();
        };
        const timer = setTimeout(()=>setNow(new Date()), msUntilMidnight());
        return ()=>clearTimeout(timer);
    }, [
        now
    ]);
    const monthStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfMonth$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["startOfMonth"])(now);
    const monthEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfMonth$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["endOfMonth"])(now);
    const calStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfWeek$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["startOfWeek"])(monthStart);
    const calEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfWeek$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["endOfWeek"])(monthEnd);
    const days = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$eachDayOfInterval$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["eachDayOfInterval"])({
        start: calStart,
        end: calEnd
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col p-2.5 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mb-1.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs font-semibold text-foreground",
                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(now, "MMMM yyyy")
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-7 gap-0",
                children: DAY_LABELS.map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[9px] font-medium text-muted-foreground/60",
                            children: d
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx",
                            lineNumber: 62,
                            columnNumber: 13
                        }, this)
                    }, i, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-7 gap-0 flex-1",
                children: days.map((day)=>{
                    const inMonth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isSameMonth$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSameMonth"])(day, now);
                    const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isToday$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isToday"])(day);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `w-5 h-5 flex items-center justify-center rounded-full text-[10px] tabular-nums leading-none ${today ? "text-white font-semibold" : inMonth ? "text-foreground" : "text-muted-foreground/30"}`,
                            style: today ? {
                                backgroundColor: accentColor
                            } : undefined,
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(day, "d")
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx",
                            lineNumber: 77,
                            columnNumber: 15
                        }, this)
                    }, day.toISOString(), false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx",
                        lineNumber: 73,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/MiniCalendarWidget.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DailyRemindersWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
/**
 * Daily reminders widget — checkbox list that persists items
 * but resets check state at the start of each new day.
 * Uses localStorage for persistence, keyed by widget config.
 *
 * @param config - Widget config with stored reminders JSON
 * @param onUpdateConfig - Callback to persist config changes
 */ "use client";
;
;
;
/**
 * Returns today's date as YYYY-MM-DD string.
 *
 * @returns Date string for today
 */ function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/**
 * Generates a short unique ID for a reminder item.
 *
 * @returns Unique string ID
 */ function genId() {
    return Math.random().toString(36).slice(2, 8);
}
function DailyRemindersWidget({ config, onUpdateConfig }) {
    // Parse stored reminders from config
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        try {
            return config?.reminders ? JSON.parse(config.reminders) : [];
        } catch  {
            return [];
        }
    });
    // Check state resets daily
    const [checkState, setCheckState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        try {
            const stored = config?.checkState ? JSON.parse(config.checkState) : null;
            if (stored && stored.date === todayKey()) return stored;
            return {
                date: todayKey(),
                checked: {}
            };
        } catch  {
            return {
                date: todayKey(),
                checked: {}
            };
        }
    });
    const [adding, setAdding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newText, setNewText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Focus input when adding mode activates
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (adding) inputRef.current?.focus();
    }, [
        adding
    ]);
    // Reset checks at midnight
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const ms = midnight.getTime() - now.getTime();
        const timer = setTimeout(()=>{
            setCheckState({
                date: todayKey(),
                checked: {}
            });
        }, ms);
        return ()=>clearTimeout(timer);
    }, [
        checkState.date
    ]);
    /**
   * Persists items and check state to widget config.
   *
   * @param newItems - Updated reminder items
   * @param newCheckState - Updated check state
   */ function persist(newItems, newCheckState) {
        onUpdateConfig?.({
            ...config,
            reminders: JSON.stringify(newItems),
            checkState: JSON.stringify(newCheckState)
        });
    }
    /**
   * Toggles the checked state of a reminder item.
   *
   * @param id - The reminder item ID to toggle
   */ function toggleCheck(id) {
        const next = {
            ...checkState,
            checked: {
                ...checkState.checked,
                [id]: !checkState.checked[id]
            }
        };
        setCheckState(next);
        persist(items, next);
    }
    /**
   * Adds a new reminder item to the list.
   */ function addItem() {
        const text = newText.trim();
        if (!text) return;
        const item = {
            id: genId(),
            text
        };
        const next = [
            ...items,
            item
        ];
        setItems(next);
        setNewText("");
        setAdding(false);
        persist(next, checkState);
    }
    /**
   * Removes a reminder item from the list.
   *
   * @param id - The reminder item ID to remove
   */ function removeItem(id) {
        const next = items.filter((i)=>i.id !== id);
        setItems(next);
        const nextCheck = {
            ...checkState
        };
        delete nextCheck.checked[id];
        setCheckState(nextCheck);
        persist(next, nextCheck);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col p-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-semibold text-foreground",
                        children: "– reminders"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setAdding(true),
                        className: "w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
                        title: "Add reminder",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            size: 12,
                            strokeWidth: 2.5
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                            lineNumber: 162,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                lineNumber: 155,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto space-y-1",
                children: [
                    items.map((item)=>{
                        const checked = !!checkState.checked[item.id];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-center gap-2 group cursor-pointer py-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: checked,
                                    onChange: ()=>toggleCheck(item.id),
                                    className: "w-3.5 h-3.5 rounded border-border accent-foreground shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                                    lineNumber: 175,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-xs flex-1 leading-tight transition-all ${checked ? "line-through text-muted-foreground/50" : "text-foreground"}`,
                                    children: item.text
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                                    lineNumber: 181,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: (e)=>{
                                        e.preventDefault();
                                        removeItem(item.id);
                                    },
                                    className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity shrink-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        size: 10
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                                        lineNumber: 197,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                                    lineNumber: 190,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, item.id, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                            lineNumber: 171,
                            columnNumber: 13
                        }, this);
                    }),
                    adding && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 py-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3.5 shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                                lineNumber: 206,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: inputRef,
                                type: "text",
                                value: newText,
                                onChange: (e)=>setNewText(e.target.value),
                                onKeyDown: (e)=>{
                                    if (e.key === "Enter") addItem();
                                    if (e.key === "Escape") {
                                        setAdding(false);
                                        setNewText("");
                                    }
                                },
                                onBlur: ()=>{
                                    if (newText.trim()) addItem();
                                    else {
                                        setAdding(false);
                                        setNewText("");
                                    }
                                },
                                placeholder: "New reminder...",
                                className: "text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 flex-1"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this),
                    items.length === 0 && !adding && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center h-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] text-muted-foreground/50",
                            children: "Click + to add reminders"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                            lineNumber: 235,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                        lineNumber: 234,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
                lineNumber: 167,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/DailyRemindersWidget.tsx",
        lineNumber: 153,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CoursesWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-ssr] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/course-name-merge.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$courses$2f$CourseTasksModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/courses/CourseTasksModal.tsx [app-ssr] (ecmascript)");
/**
 * Courses widget — grid of course cards derived from task course_name values.
 * Clicking a card opens a modal with that course's tasks in list view.
 *
 * @param config - Widget configuration (unused currently)
 */ "use client";
;
;
;
;
;
;
;
;
/**
 * Builds course summaries from tasks.
 *
 * @param tasks - All user tasks
 * @param courseColors - Map from course_name to dominant color
 * @returns Sorted array of { name, color, taskCount }
 */ function buildCourses(tasks, courseColors) {
    const codeToCanonical = new Map();
    const counts = new Map();
    const active = tasks.filter((t)=>!t.is_completed && !t.dismissed_at);
    for (const t of active){
        const raw = t.course_name || "General";
        const code = raw !== "General" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractCourseCode"])(raw) : null;
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
function CoursesWidget({ config }) {
    const { tasks, courseColors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const courses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>buildCourses(tasks, courseColors), [
        tasks,
        courseColors
    ]);
    if (courses.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full flex flex-col items-center justify-center gap-1.5 p-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                    size: 24,
                    className: "text-muted-foreground/30"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-muted-foreground",
                    children: "No courses yet"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
            lineNumber: 73,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full w-full overflow-auto p-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-2",
                    children: courses.map((c)=>{
                        const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getThemeColor"])(c.color, colorTheme);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setSelected({
                                    name: c.name,
                                    color: c.color
                                }),
                            className: "text-left rounded-lg overflow-hidden border border-foreground/[0.06] hover:shadow-sm transition-all hover:-translate-y-px bg-card",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-12 w-full",
                                    style: {
                                        background: `linear-gradient(135deg, ${tc}30, ${tc}10)`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                                    lineNumber: 92,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-2.5 py-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-2 h-2 rounded-full shrink-0",
                                                    style: {
                                                        backgroundColor: tc
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                                                    lineNumber: 98,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[11px] font-semibold text-foreground truncate",
                                                    children: c.name
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                                                    lineNumber: 99,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                                            lineNumber: 97,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-muted-foreground",
                                            children: [
                                                c.taskCount,
                                                " tasks"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                                            lineNumber: 101,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                                    lineNumber: 96,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, c.name, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                            lineNumber: 87,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$courses$2f$CourseTasksModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                courseName: selected.name,
                tasks: tasks,
                color: selected.color,
                open: true,
                onClose: ()=>setSelected(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/widgets/CoursesWidget.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=_claude_worktrees_claude-work_src_components_home_widgets_c34840ec._.js.map