module.exports = [
"[project]/.claude/worktrees/claude-work/src/lib/task-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatTime12h",
    ()=>formatTime12h,
    "getDueDateInfo",
    ()=>getDueDateInfo,
    "getSourceBadges",
    ()=>getSourceBadges
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-ssr] (ecmascript) <locals>");
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
            label: `Late due ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(task.late_due_date + "T00:00:00"), "MMM d")}`,
            className: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-600/40"
        });
    }
    return badges;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/color-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/.claude/worktrees/claude-work/src/lib/gcal-displays.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Google Calendar display registry.
 * Defines available display style IDs, labels, and descriptions
 * used by the GCalDisplayPicker and GoogleCalendarWidget dispatcher.
 */ /** Union of all supported Google Calendar display identifiers. */ __turbopack_context__.s([
    "DEFAULT_GCAL_DISPLAY",
    ()=>DEFAULT_GCAL_DISPLAY,
    "GCAL_DISPLAYS",
    ()=>GCAL_DISPLAYS
]);
const GCAL_DISPLAYS = [
    {
        id: "list",
        label: "List",
        description: "Events grouped by day"
    },
    {
        id: "compact",
        label: "Compact",
        description: "Minimal dense rows"
    },
    {
        id: "cards",
        label: "Cards",
        description: "Color-accented event cards"
    },
    {
        id: "timeline",
        label: "Timeline",
        description: "Vertical timeline dots"
    },
    {
        id: "agenda",
        label: "Agenda",
        description: "Bold times, clean layout"
    }
];
const DEFAULT_GCAL_DISPLAY = "list";
}),
"[project]/.claude/worktrees/claude-work/src/lib/image-widget-presets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Preset images for the Image Widget.
 * Uses Unsplash source URLs with 4:3 aspect ratio crops to match widget display.
 * IDs use "iw" prefix to avoid collision with BoardCover's "p" IDs.
 *
 * @see src/components/home/widgets/ImageWidget.tsx
 */ /** A single image widget preset entry. */ __turbopack_context__.s([
    "IMAGE_WIDGET_PRESETS",
    ()=>IMAGE_WIDGET_PRESETS,
    "IMAGE_WIDGET_PRESET_CATEGORIES",
    ()=>IMAGE_WIDGET_PRESET_CATEGORIES,
    "isImageWidgetPreset",
    ()=>isImageWidgetPreset,
    "resolveImagePreset",
    ()=>resolveImagePreset
]);
const IMAGE_WIDGET_PRESETS = [
    // Nature & Landscapes
    {
        id: "iw1",
        label: "Mountain Lake",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw2",
        label: "Ocean Horizon",
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw3",
        label: "Forest Canopy",
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw4",
        label: "Desert Dunes",
        url: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw5",
        label: "Cherry Blossoms",
        url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw6",
        label: "Northern Lights",
        url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw7",
        label: "Autumn Road",
        url: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw8",
        label: "Tropical Beach",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=1200&fit=crop&q=90"
    },
    // Skies & Sunsets
    {
        id: "iw9",
        label: "Pink Clouds",
        url: "https://images.unsplash.com/photo-1525920980995-f8a382bf42c5?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw10",
        label: "Sunset Beach",
        url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw11",
        label: "Golden Hour",
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw12",
        label: "Sunset Hills",
        url: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600&h=1200&fit=crop&q=90"
    },
    // Mountains & Valleys
    {
        id: "iw13",
        label: "Misty Mountains",
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw14",
        label: "Snow Peaks",
        url: "https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw15",
        label: "Green Valley",
        url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw16",
        label: "Patagonia",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=1200&fit=crop&q=90"
    },
    // Water & Oceans
    {
        id: "iw17",
        label: "Ocean Wave",
        url: "https://images.unsplash.com/photo-1488330890490-c291ecf62571?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw18",
        label: "Waterfall",
        url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw19",
        label: "Coral Reef",
        url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1600&h=1200&fit=crop&q=90"
    },
    // Flora & Gardens
    {
        id: "iw20",
        label: "Wildflowers",
        url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw21",
        label: "Tulip Field",
        url: "https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw22",
        label: "Bamboo Forest",
        url: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw23",
        label: "Rainforest",
        url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600&h=1200&fit=crop&q=90"
    },
    // City & Architecture
    {
        id: "iw24",
        label: "City Night",
        url: "https://images.unsplash.com/photo-1520962922320-2038eebab146?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw25",
        label: "Manhattan",
        url: "https://images.unsplash.com/photo-1544511916-0148ccdeb877?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw26",
        label: "Golden Gate",
        url: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw27",
        label: "Japanese Garden",
        url: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=1600&h=1200&fit=crop&q=90"
    },
    // Space & Night
    {
        id: "iw28",
        label: "Milky Way",
        url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600&h=1200&fit=crop&q=90"
    },
    {
        id: "iw29",
        label: "Starry Sky",
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=1200&fit=crop&q=90"
    },
    // Abstract
    {
        id: "iw30",
        label: "Neon Lights",
        url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1600&h=1200&fit=crop&q=90"
    }
];
const IMAGE_WIDGET_PRESET_CATEGORIES = [
    {
        label: "Nature & Landscapes",
        presets: IMAGE_WIDGET_PRESETS.slice(0, 8)
    },
    {
        label: "Skies & Sunsets",
        presets: IMAGE_WIDGET_PRESETS.slice(8, 12)
    },
    {
        label: "Mountains & Valleys",
        presets: IMAGE_WIDGET_PRESETS.slice(12, 16)
    },
    {
        label: "Water & Oceans",
        presets: IMAGE_WIDGET_PRESETS.slice(16, 19)
    },
    {
        label: "Flora & Gardens",
        presets: IMAGE_WIDGET_PRESETS.slice(19, 23)
    },
    {
        label: "City & Architecture",
        presets: IMAGE_WIDGET_PRESETS.slice(23, 27)
    },
    {
        label: "Space & Night",
        presets: IMAGE_WIDGET_PRESETS.slice(27, 29)
    },
    {
        label: "Abstract",
        presets: IMAGE_WIDGET_PRESETS.slice(29, 30)
    }
];
/** Map from preset ID to preset object for O(1) lookups. */ const PRESET_MAP = new Map(IMAGE_WIDGET_PRESETS.map((p)=>[
        p.id,
        p
    ]));
function isImageWidgetPreset(url) {
    return url.startsWith("preset:");
}
function resolveImagePreset(url) {
    const id = url.replace("preset:", "");
    const preset = PRESET_MAP.get(id);
    return preset?.url ?? IMAGE_WIDGET_PRESETS[0].url;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/weather-displays.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Weather display registry.
 * Defines available weather display IDs, labels, and descriptions
 * used by the WeatherDisplayPicker and WeatherWidget dispatcher.
 */ /** Union of all supported weather display identifiers. */ __turbopack_context__.s([
    "DEFAULT_WEATHER_DISPLAY",
    ()=>DEFAULT_WEATHER_DISPLAY,
    "WEATHER_DISPLAYS",
    ()=>WEATHER_DISPLAYS
]);
const WEATHER_DISPLAYS = [
    {
        id: "standard",
        label: "Standard",
        description: "Location, temp, description, stats"
    },
    {
        id: "minimal",
        label: "Minimal",
        description: "Just temp and icon"
    },
    {
        id: "card",
        label: "Card",
        description: "Large icon with temp below"
    },
    {
        id: "gradient",
        label: "Gradient",
        description: "Dynamic gradient background"
    },
    {
        id: "detailed",
        label: "Detailed",
        description: "Extra stats in a grid"
    }
];
const DEFAULT_WEATHER_DISPLAY = "standard";
}),
"[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/.claude/worktrees/claude-work/src/lib/course-name-merge.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-ssr] (ecmascript)");
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
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logger"].info("course-name-merge: mapping course name", {
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
}),
"[project]/.claude/worktrees/claude-work/src/lib/pending-invite-helpers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/.claude/worktrees/claude-work/src/lib/widget-types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Widget type registry for the Home dashboard.
 * Defines available widget types, their size constraints, and default layout.
 *
 * @module widget-types
 */ __turbopack_context__.s([
    "WIDGET_REGISTRY",
    ()=>WIDGET_REGISTRY,
    "generateWidgetId",
    ()=>generateWidgetId,
    "getDefaultLayout",
    ()=>getDefaultLayout
]);
const WIDGET_REGISTRY = {
    "tasks-today": {
        type: "tasks-today",
        label: "Tasks",
        description: "Your tasks with completion count",
        iconName: "CheckSquare",
        category: "popular",
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    clock: {
        type: "clock",
        label: "Clock",
        description: "Live time and date",
        iconName: "Clock",
        category: "popular",
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 3,
        defaultW: 2,
        defaultH: 2
    },
    image: {
        type: "image",
        label: "Image",
        description: "Drag-and-drop image display",
        iconName: "ImageIcon",
        category: "media",
        minW: 1,
        minH: 1,
        maxW: 6,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    "class-progress": {
        type: "class-progress",
        label: "Class Progress",
        description: "Per-course completion bars",
        iconName: "GraduationCap",
        category: "info",
        minW: 2,
        minH: 1,
        maxW: 4,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    "google-calendar": {
        type: "google-calendar",
        label: "Google Calendar",
        description: "Upcoming events from Google Calendar",
        iconName: "Calendar",
        category: "popular",
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    notes: {
        type: "notes",
        label: "Notes",
        description: "Quick inline notes",
        iconName: "FileText",
        category: "productivity",
        minW: 1,
        minH: 1,
        maxW: 6,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    weather: {
        type: "weather",
        label: "Weather",
        description: "Current weather and forecast",
        iconName: "CloudSun",
        category: "popular",
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    "cal-chat": {
        type: "cal-chat",
        label: "Cal Chat",
        description: "Recent messages from Cal Chat",
        iconName: "MessagesSquare",
        category: "social",
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    pomodoro: {
        type: "pomodoro",
        label: "Pomodoro",
        description: "Focus timer with work and break intervals",
        iconName: "Timer",
        category: "popular",
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    countdown: {
        type: "countdown",
        label: "Countdown",
        description: "Days until your next deadline or event",
        iconName: "Hourglass",
        category: "productivity",
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 3,
        defaultW: 2,
        defaultH: 1
    },
    "quick-links": {
        type: "quick-links",
        label: "Quick Links",
        description: "Pinned bookmarks with favicons",
        iconName: "Link",
        category: "productivity",
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    "habit-tracker": {
        type: "habit-tracker",
        label: "Habit Tracker",
        description: "GitHub-style heatmap with streaks",
        iconName: "Flame",
        category: "productivity",
        minW: 2,
        minH: 1,
        maxW: 4,
        maxH: 3,
        defaultW: 2,
        defaultH: 2
    },
    quote: {
        type: "quote",
        label: "Quote",
        description: "Daily motivational quotes",
        iconName: "Quote",
        category: "media",
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 3,
        defaultW: 2,
        defaultH: 1
    },
    stats: {
        type: "stats",
        label: "Stats",
        description: "Task completion metrics and trends",
        iconName: "BarChart3",
        category: "info",
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 3,
        defaultW: 2,
        defaultH: 1
    },
    "weekly-heatmap": {
        type: "weekly-heatmap",
        label: "Activity",
        description: "Weekly productivity heatmap",
        iconName: "Grid3X3",
        category: "info",
        minW: 2,
        minH: 1,
        maxW: 4,
        maxH: 3,
        defaultW: 2,
        defaultH: 2
    },
    sticker: {
        type: "sticker",
        label: "Sticker",
        description: "Decorative emoji or text",
        iconName: "Smile",
        category: "media",
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
        defaultW: 1,
        defaultH: 1
    },
    spotify: {
        type: "spotify",
        label: "Spotify",
        description: "Embed a track, album, or playlist",
        iconName: "Music",
        category: "media",
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    },
    "mini-calendar": {
        type: "mini-calendar",
        label: "Mini Calendar",
        description: "Current month grid with today highlighted",
        iconName: "CalendarDays",
        category: "info",
        minW: 1,
        minH: 1,
        maxW: 2,
        maxH: 2,
        defaultW: 1,
        defaultH: 1
    },
    "daily-reminders": {
        type: "daily-reminders",
        label: "Daily Reminders",
        description: "Checkbox list that resets each day",
        iconName: "ListChecks",
        category: "productivity",
        minW: 1,
        minH: 1,
        maxW: 3,
        maxH: 3,
        defaultW: 1,
        defaultH: 2
    },
    courses: {
        type: "courses",
        label: "Courses",
        description: "Course folders with task counts",
        iconName: "GraduationCap",
        category: "info",
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 4,
        defaultW: 2,
        defaultH: 2
    }
};
function generateWidgetId() {
    return `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function getDefaultLayout() {
    return {
        widgets: [],
        layouts: {
            lg: [],
            md: [],
            sm: []
        }
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/font-options.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared curated font options for board title and widget customization.
 * Single source of truth — imported by BoardTitle, WidgetSettingsModal, and FontPicker.
 *
 * Grouped: Sans → Rounded → Serif → (no Mono — removed ugly defaults).
 * Removed: Georgia, Palatino, Menlo, Helvetica Neue.
 * Added: Instrument Serif (Notion-like, loaded via next/font in layout.tsx).
 */ __turbopack_context__.s([
    "FONT_CATEGORY_LABELS",
    ()=>FONT_CATEGORY_LABELS,
    "FONT_OPTIONS",
    ()=>FONT_OPTIONS,
    "SYSTEM_DEFAULT_FONT",
    ()=>SYSTEM_DEFAULT_FONT
]);
const FONT_OPTIONS = [
    // Sans — clean, modern
    {
        label: "System Default",
        value: "var(--font-geist-sans), sans-serif",
        category: "sans"
    },
    {
        label: "Inter",
        value: "'Inter', sans-serif",
        category: "sans"
    },
    {
        label: "DM Sans",
        value: "'DM Sans', sans-serif",
        category: "sans"
    },
    {
        label: "Plus Jakarta Sans",
        value: "'Plus Jakarta Sans', sans-serif",
        category: "sans"
    },
    {
        label: "Outfit",
        value: "'Outfit', sans-serif",
        category: "sans"
    },
    {
        label: "Manrope",
        value: "'Manrope', sans-serif",
        category: "sans"
    },
    {
        label: "Urbanist",
        value: "'Urbanist', sans-serif",
        category: "sans"
    },
    {
        label: "Sora",
        value: "'Sora', sans-serif",
        category: "sans"
    },
    // Rounded — friendly, soft
    {
        label: "Nunito",
        value: "'Nunito', sans-serif",
        category: "rounded"
    },
    {
        label: "Quicksand",
        value: "'Quicksand', sans-serif",
        category: "rounded"
    },
    {
        label: "Varela Round",
        value: "'Varela Round', sans-serif",
        category: "rounded"
    },
    // Serif — editorial, Notion-like
    {
        label: "Instrument Serif",
        value: "var(--font-instrument-serif), serif",
        category: "serif"
    },
    {
        label: "Playfair Display",
        value: "'Playfair Display', serif",
        category: "serif"
    },
    {
        label: "DM Serif Display",
        value: "'DM Serif Display', serif",
        category: "serif"
    },
    {
        label: "Source Serif 4",
        value: "'Source Serif 4', serif",
        category: "serif"
    }
];
const SYSTEM_DEFAULT_FONT = "var(--font-geist-sans), sans-serif";
const FONT_CATEGORY_LABELS = {
    sans: "Sans",
    rounded: "Rounded",
    serif: "Serif"
};
}),
"[project]/.claude/worktrees/claude-work/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/clock-faces.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Clock face registry.
 * Defines available clock face IDs, labels, and descriptions
 * used by the ClockFacePicker and ClockWidget dispatcher.
 */ /** Union of all supported clock face identifiers. */ __turbopack_context__.s([
    "CLOCK_FACES",
    ()=>CLOCK_FACES,
    "DEFAULT_CLOCK_FACE",
    ()=>DEFAULT_CLOCK_FACE
]);
const CLOCK_FACES = [
    {
        id: "digital",
        label: "Digital",
        description: "Time with date below"
    },
    {
        id: "analog",
        label: "Analog",
        description: "Classic round clock"
    },
    {
        id: "minimal",
        label: "Minimal",
        description: "Time only, oversized"
    },
    {
        id: "flip",
        label: "Flip",
        description: "Retro flip-card digits"
    },
    {
        id: "stacked",
        label: "Stacked",
        description: "Hours large, minutes below"
    },
    {
        id: "split",
        label: "Split",
        description: "Hours & minutes in cards"
    }
];
const DEFAULT_CLOCK_FACE = "digital";
}),
"[project]/.claude/worktrees/claude-work/src/lib/notes-styles.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Notes style registry.
 * Defines available notes background style IDs, labels, and descriptions
 * used by the NotesStylePicker and NotesWidget.
 */ /** Union of all supported notes style identifiers. */ __turbopack_context__.s([
    "DEFAULT_NOTES_STYLE",
    ()=>DEFAULT_NOTES_STYLE,
    "NOTES_STYLES",
    ()=>NOTES_STYLES
]);
const NOTES_STYLES = [
    {
        id: "blank",
        label: "Blank",
        description: "Plain background"
    },
    {
        id: "lined",
        label: "Lined",
        description: "Horizontal ruled lines"
    },
    {
        id: "grid",
        label: "Grid",
        description: "Graph paper grid"
    }
];
const DEFAULT_NOTES_STYLE = "blank";
}),
"[project]/.claude/worktrees/claude-work/src/lib/extract-palette.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "colorDistance",
    ()=>colorDistance,
    "extractPalette",
    ()=>extractPalette,
    "isBoringColor",
    ()=>isBoringColor,
    "quantizePixels",
    ()=>quantizePixels,
    "rgbToHex",
    ()=>rgbToHex
]);
/**
 * Canvas-based dominant color extraction from images.
 * Zero external dependencies — uses only the browser Canvas API.
 *
 * Loads an image onto a small canvas, samples pixel data,
 * quantizes into ~5 dominant distinct colors, and filters
 * near-white/near-black values.
 *
 * @module extract-palette
 */ /** Minimum distance between two colors (in RGB space) to be considered distinct. */ const MIN_COLOR_DISTANCE = 60;
/** Lightness thresholds to filter boring near-white and near-black colors. */ const MIN_LIGHTNESS = 25;
const MAX_LIGHTNESS = 230;
/** Target number of palette colors to return. */ const TARGET_COLORS = 5;
/** Downscaled canvas size for fast pixel sampling. */ const SAMPLE_SIZE = 100;
function rgbToHex(r, g, b) {
    return "#" + [
        r,
        g,
        b
    ].map((c)=>Math.round(c).toString(16).padStart(2, "0")).join("");
}
function colorDistance(a, b) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}
function isBoringColor(r, g, b) {
    const avg = (r + g + b) / 3;
    return avg < MIN_LIGHTNESS || avg > MAX_LIGHTNESS;
}
function quantizePixels(pixels, count) {
    // Step 1: Build frequency buckets by rounding to nearest 8 (reduces noise)
    const buckets = new Map();
    for(let i = 0; i < pixels.length; i += 4){
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        // Skip transparent pixels
        if (a < 128) continue;
        // Skip boring colors
        if (isBoringColor(r, g, b)) continue;
        // Round to reduce noise and group similar colors
        const kr = Math.round(r / 8) * 8;
        const kg = Math.round(g / 8) * 8;
        const kb = Math.round(b / 8) * 8;
        const key = `${kr},${kg},${kb}`;
        const existing = buckets.get(key);
        if (existing) {
            existing.sum[0] += r;
            existing.sum[1] += g;
            existing.sum[2] += b;
            existing.count += 1;
        } else {
            buckets.set(key, {
                sum: [
                    r,
                    g,
                    b
                ],
                count: 1
            });
        }
    }
    // Step 2: Sort buckets by frequency (most common first)
    const sorted = Array.from(buckets.values()).sort((a, b)=>b.count - a.count);
    // Step 3: Pick top colors that are distinct from each other
    const result = [];
    for (const bucket of sorted){
        if (result.length >= count) break;
        const avg = [
            Math.round(bucket.sum[0] / bucket.count),
            Math.round(bucket.sum[1] / bucket.count),
            Math.round(bucket.sum[2] / bucket.count)
        ];
        // Ensure this color is distinct from all already-selected colors
        const tooSimilar = result.some((existing)=>colorDistance(existing, avg) < MIN_COLOR_DISTANCE);
        if (!tooSimilar) {
            result.push(avg);
        }
    }
    return result;
}
async function extractPalette(imageUrl, count = TARGET_COLORS) {
    return new Promise((resolve, reject)=>{
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = ()=>{
            try {
                const canvas = document.createElement("canvas");
                canvas.width = SAMPLE_SIZE;
                canvas.height = SAMPLE_SIZE;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve([]);
                    return;
                }
                ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
                const imageData = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
                const colors = quantizePixels(imageData.data, count);
                resolve(colors.map(([r, g, b])=>rgbToHex(r, g, b)));
            } catch (err) {
                console.error("[extract-palette] Failed to extract colors:", err);
                resolve([]);
            }
        };
        img.onerror = ()=>{
            console.error("[extract-palette] Failed to load image:", imageUrl);
            resolve([]);
        };
        img.src = imageUrl;
    });
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/board-cover-presets.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Preset data for the board cover (banner) picker.
 * Includes solid colors, gradients, and categorized photo covers.
 *
 * @see src/components/home/BoardCover.tsx
 */ /** Solid color presets. */ __turbopack_context__.s([
    "GRADIENT_COVERS",
    ()=>GRADIENT_COVERS,
    "PHOTO_COVERS",
    ()=>PHOTO_COVERS,
    "PHOTO_COVER_CATEGORIES",
    ()=>PHOTO_COVER_CATEGORIES,
    "SOLID_COVERS",
    ()=>SOLID_COVERS,
    "isPreset",
    ()=>isPreset,
    "resolvePreset",
    ()=>resolvePreset
]);
const SOLID_COVERS = [
    {
        id: "s1",
        label: "White",
        color: "#ffffff"
    },
    {
        id: "s2",
        label: "Warm Gray",
        color: "#d6d3d1"
    },
    {
        id: "s3",
        label: "Cool Gray",
        color: "#9ca3af"
    },
    {
        id: "s4",
        label: "Slate",
        color: "#475569"
    },
    {
        id: "s5",
        label: "Charcoal",
        color: "#1e293b"
    },
    {
        id: "s6",
        label: "Sky",
        color: "#7dd3fc"
    },
    {
        id: "s7",
        label: "Blue",
        color: "#3b82f6"
    },
    {
        id: "s8",
        label: "Indigo",
        color: "#6366f1"
    },
    {
        id: "s9",
        label: "Violet",
        color: "#8b5cf6"
    },
    {
        id: "s10",
        label: "Rose",
        color: "#fb7185"
    },
    {
        id: "s11",
        label: "Amber",
        color: "#fbbf24"
    },
    {
        id: "s12",
        label: "Emerald",
        color: "#34d399"
    },
    {
        id: "s13",
        label: "Teal",
        color: "#2dd4bf"
    },
    {
        id: "s14",
        label: "Sand",
        color: "#e7e5e4"
    },
    {
        id: "s15",
        label: "Peach",
        color: "#fdba74"
    }
];
const GRADIENT_COVERS = [
    {
        id: "g1",
        label: "Ocean",
        style: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
        id: "g2",
        label: "Sunset",
        style: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
        id: "g3",
        label: "Forest",
        style: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
        id: "g4",
        label: "Dusk",
        style: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
    },
    {
        id: "g5",
        label: "Midnight",
        style: "linear-gradient(135deg, #0c3547 0%, #1a1a2e 100%)"
    },
    {
        id: "g6",
        label: "Peach",
        style: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
    },
    {
        id: "g7",
        label: "Aurora",
        style: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)"
    },
    {
        id: "g8",
        label: "Berry",
        style: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)"
    },
    {
        id: "g9",
        label: "Emerald",
        style: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
    },
    {
        id: "g10",
        label: "Slate",
        style: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)"
    },
    {
        id: "g11",
        label: "Coral",
        style: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
    },
    {
        id: "g12",
        label: "Lavender",
        style: "linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)"
    },
    {
        id: "g13",
        label: "Volcano",
        style: "linear-gradient(135deg, #ff5858 0%, #f09819 100%)"
    },
    {
        id: "g14",
        label: "Mint",
        style: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"
    },
    {
        id: "g15",
        label: "Flamingo",
        style: "linear-gradient(135deg, #feb47b 0%, #ff7e5f 100%)"
    }
];
const PHOTO_COVER_CATEGORIES = [
    {
        label: "Cal Berkeley",
        photos: [
            {
                id: "cal",
                label: "Cal Berkeley",
                url: "/cal-logo.webp",
                bgColor: "#012677"
            },
            {
                id: "campanile",
                label: "Campanile Panorama",
                url: "/campanile-panorama.jpg"
            },
            {
                id: "p60",
                label: "Sather Gate",
                url: "https://images.unsplash.com/photo-1588263823647-ce3546d325bc?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p61",
                label: "Memorial Glade",
                url: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Mountains",
        photos: [
            {
                id: "p1",
                label: "Mountains at Sunset",
                url: "https://images.unsplash.com/photo-1486520299386-6d106b22014b?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p2",
                label: "Mountain Landscape",
                url: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p3",
                label: "Aerial Mountain Peaks",
                url: "https://images.unsplash.com/photo-1533555855029-9341affa632a?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p4",
                label: "Glacier Forest",
                url: "https://images.unsplash.com/photo-1502382015675-003f660a9731?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p5",
                label: "Panoramic Range",
                url: "https://images.unsplash.com/photo-1522144937397-b921f9d046d7?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p6",
                label: "Cloudy Mountains",
                url: "https://images.unsplash.com/photo-1739369120898-c654cb64b14d?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p7",
                label: "Misty Panorama",
                url: "https://images.unsplash.com/photo-1702144721728-13f38c5f7f26?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p8",
                label: "Rainbow Mountains",
                url: "https://images.unsplash.com/photo-1747985323857-5c1c16b2ac47?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p9",
                label: "Snow Peak Sunset",
                url: "https://images.unsplash.com/photo-1499336315816-097655dcfbda?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p10",
                label: "Mountain Vista",
                url: "https://images.unsplash.com/photo-1734883720875-fb7c08d9774d?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Sunsets",
        photos: [
            {
                id: "p11",
                label: "Foggy Sunrise",
                url: "https://images.unsplash.com/photo-1743309411498-a0f4f4b96b65?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p12",
                label: "Golden Hour Mountains",
                url: "https://images.unsplash.com/photo-1464061884326-64f6ebd57f83?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p13",
                label: "Aerial Golden Hour",
                url: "https://images.unsplash.com/photo-1568321432707-b7bc30ce8517?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p14",
                label: "Desert Sunset",
                url: "https://images.unsplash.com/photo-1759244717529-75baad137526?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p15",
                label: "Italian Mountains",
                url: "https://images.unsplash.com/photo-1523518165665-2186fc960d38?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p16",
                label: "Silhouette Hills",
                url: "https://images.unsplash.com/photo-1480004902249-cdb28d6a01a4?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p17",
                label: "Bridge Golden Hour",
                url: "https://images.unsplash.com/photo-1553425493-942e54572443?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p18",
                label: "Athens Cityscape",
                url: "https://images.unsplash.com/photo-1557686583-560ae7baba2a?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Flowers & Fields",
        photos: [
            {
                id: "p19",
                label: "Lavender Field",
                url: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p20",
                label: "Tulip Field",
                url: "https://images.unsplash.com/photo-1685318182443-473579444645?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p21",
                label: "Lavender Rows",
                url: "https://images.unsplash.com/photo-1687878267753-cb6421710196?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p22",
                label: "Wildflower Meadow",
                url: "https://images.unsplash.com/photo-1716562765369-9a526b58fa80?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p23",
                label: "Pink Tulips",
                url: "https://images.unsplash.com/photo-1713791234524-101f51b9845d?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p24",
                label: "Red & Yellow Tulips",
                url: "https://images.unsplash.com/photo-1673707017129-cdedff0074e5?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p25",
                label: "Lavender Sunset",
                url: "https://images.unsplash.com/photo-1733690210785-8a48c7895083?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p26",
                label: "Purple Tulip Buds",
                url: "https://images.unsplash.com/photo-1759545160982-a28852c6c499?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p27",
                label: "Hyacinth Field",
                url: "https://images.unsplash.com/photo-1438927544140-ca5e72fcd6c2?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Cities",
        photos: [
            {
                id: "p28",
                label: "Brooklyn Bridge",
                url: "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p29",
                label: "City Skyline Bridge",
                url: "https://images.unsplash.com/photo-1679441241134-e0edba861927?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p30",
                label: "NYC Skyline Dusk",
                url: "https://images.unsplash.com/photo-1764782979306-1e489462d895?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p31",
                label: "Pittsburgh Skyline",
                url: "https://images.unsplash.com/photo-1761405378313-622deb755731?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p32",
                label: "City Bridge View",
                url: "https://images.unsplash.com/photo-1653866114444-4c8f42f0b60d?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p33",
                label: "Brooklyn & Manhattan",
                url: "https://images.unsplash.com/photo-1759022404068-db0d4dde2723?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p34",
                label: "City Night Bridge",
                url: "https://images.unsplash.com/photo-1715645942867-4c8649966352?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p35",
                label: "Sunset Skyline",
                url: "https://images.unsplash.com/photo-1731331344306-ad4f902691a3?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p36",
                label: "City Panorama",
                url: "https://images.unsplash.com/photo-1722019778730-751fdbae1541?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p37",
                label: "Night Bridge Skyline",
                url: "https://images.unsplash.com/photo-1718351174721-1f02f18b8a40?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Abstract & Space",
        photos: [
            {
                id: "p38",
                label: "Curved Gradient",
                url: "https://images.unsplash.com/photo-1741447096087-1171841c42dc?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p39",
                label: "Color Gradient",
                url: "https://images.unsplash.com/photo-1512567100135-223e140cd167?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p40",
                label: "Gradient Squares",
                url: "https://images.unsplash.com/photo-1766341055866-dc18c44eeb86?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p41",
                label: "Warm Gradient",
                url: "https://images.unsplash.com/photo-1762716514363-13d1fad2c854?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p42",
                label: "Blue Pink Waves",
                url: "https://images.unsplash.com/photo-1758843405103-41fcaaee080c?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p43",
                label: "Milky Way Mountains",
                url: "https://images.unsplash.com/photo-1765825365130-52e276bca060?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p44",
                label: "Milky Way Galaxy",
                url: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p45",
                label: "Starry Night Sky",
                url: "https://images.unsplash.com/photo-1742626157111-59f3f1019a8a?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p62",
                label: "Nebula Clouds",
                url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p63",
                label: "Aurora Borealis",
                url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Travel & Roads",
        photos: [
            {
                id: "p46",
                label: "Iceland Road",
                url: "https://images.unsplash.com/photo-1731925116590-c27d25490ea0?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p47",
                label: "Desert Road",
                url: "https://images.unsplash.com/photo-1470192581780-bf0a1cb67135?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p48",
                label: "Forest Road",
                url: "https://images.unsplash.com/photo-1767450327267-8075d82d4924?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p49",
                label: "Mountain Road",
                url: "https://images.unsplash.com/photo-1609542468909-3cb0ca173d2e?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p50",
                label: "Peaks Above Clouds",
                url: "https://images.unsplash.com/photo-1760705186270-b533668b60c2?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p51",
                label: "Mountain Dirt Road",
                url: "https://images.unsplash.com/photo-1733222376764-9ed9b1f6dc06?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p52",
                label: "Misty Winding Road",
                url: "https://images.unsplash.com/photo-1758799009701-be038ef40ee2?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Ocean & Beach",
        photos: [
            {
                id: "p53",
                label: "Aerial Coastline",
                url: "https://images.unsplash.com/photo-1451186859696-371d9477be93?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p54",
                label: "Coastal City",
                url: "https://images.unsplash.com/photo-1577625627933-913f95bdb320?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p55",
                label: "Aerial Waves",
                url: "https://images.unsplash.com/photo-1744648617182-519c4bf39e30?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p56",
                label: "Aerial Beach",
                url: "https://images.unsplash.com/photo-1739862836703-03eca4457f77?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p57",
                label: "Beach Shore Waves",
                url: "https://images.unsplash.com/photo-1710790095456-6b122a198033?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p58",
                label: "Ocean Waves",
                url: "https://images.unsplash.com/photo-1627302800387-8dbab13aefba?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p59",
                label: "Sandy Beach Aerial",
                url: "https://images.unsplash.com/photo-1736774635366-c2fa40e86409?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Macro & Texture",
        photos: [
            {
                id: "p64",
                label: "Water Drops",
                url: "https://images.unsplash.com/photo-1509803874385-db7c23652552?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p65",
                label: "Leaf Veins",
                url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p66",
                label: "Silk Fabric",
                url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p67",
                label: "Ice Crystals",
                url: "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p68",
                label: "Marble Texture",
                url: "https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p69",
                label: "Sand Ripples",
                url: "https://images.unsplash.com/photo-1509515837298-2c67a3933321?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Dark & Moody",
        photos: [
            {
                id: "p70",
                label: "Storm Clouds",
                url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p71",
                label: "Volcanic Glow",
                url: "https://images.unsplash.com/photo-1462651567147-aa679fd1cfaf?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p72",
                label: "Foggy Forest",
                url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p73",
                label: "Rain on Glass",
                url: "https://images.unsplash.com/photo-1428592953211-077101b2021b?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p74",
                label: "Dark Ocean",
                url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p75",
                label: "Lightning Strike",
                url: "https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Aerial & Geometric",
        photos: [
            {
                id: "p76",
                label: "Terraced Fields",
                url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p77",
                label: "Salt Flats",
                url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p78",
                label: "Coastline Patterns",
                url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p79",
                label: "Desert Dunes",
                url: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p80",
                label: "River Delta",
                url: "https://images.unsplash.com/photo-1433477155337-9aea4e790195?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p81",
                label: "Coral Reef Aerial",
                url: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    },
    {
        label: "Minimalist",
        photos: [
            {
                id: "p82",
                label: "Lone Tree in Snow",
                url: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p83",
                label: "Foggy Lake",
                url: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p84",
                label: "White Sand Dunes",
                url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p85",
                label: "Misty Horizon",
                url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p86",
                label: "Lone Sailboat",
                url: "https://images.unsplash.com/photo-1500930287596-c1ecaa210c84?w=3200&h=700&fit=crop&crop=center&q=90"
            },
            {
                id: "p87",
                label: "Empty Road",
                url: "https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?w=3200&h=700&fit=crop&crop=center&q=90"
            }
        ]
    }
];
const PHOTO_COVERS = PHOTO_COVER_CATEGORIES.flatMap((cat)=>cat.photos);
function isPreset(url) {
    return url.startsWith("preset:");
}
function resolvePreset(url) {
    const id = url.replace("preset:", "");
    const solid = SOLID_COVERS.find((p)=>p.id === id);
    if (solid) return {
        background: solid.color
    };
    const gradient = GRADIENT_COVERS.find((p)=>p.id === id);
    if (gradient) return {
        background: gradient.style
    };
    const photo = PHOTO_COVERS.find((p)=>p.id === id);
    if (photo) return {
        imageUrl: photo.url
    };
    return {
        background: GRADIENT_COVERS[0].style
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/board-layout-types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared types and constants for the board layout persistence system.
 * Used by board-layout-cache, board-layout-sync, and useWidgetLayout.
 *
 * @module board-layout-types
 */ __turbopack_context__.s([
    "DEFAULT_COVER_HEIGHT",
    ()=>DEFAULT_COVER_HEIGHT,
    "DEFAULT_COVER_POSITION_Y",
    ()=>DEFAULT_COVER_POSITION_Y,
    "NEW_LG_COLS",
    ()=>NEW_LG_COLS,
    "OLD_LG_COLS",
    ()=>OLD_LG_COLS,
    "SCHEMA_VERSION",
    ()=>SCHEMA_VERSION,
    "STORAGE_KEY",
    ()=>STORAGE_KEY
]);
const STORAGE_KEY = "home_widget_layout";
const SCHEMA_VERSION = 10;
const OLD_LG_COLS = 6;
const NEW_LG_COLS = 8;
const DEFAULT_COVER_HEIGHT = 220;
const DEFAULT_COVER_POSITION_Y = 50;
}),
"[project]/.claude/worktrees/claude-work/src/lib/board-templates.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Built-in board templates for the Home dashboard.
 * Each template defines a complete PersistedLayout that can be applied
 * to replace the user's current board.
 *
 * @module board-templates
 */ __turbopack_context__.s([
    "BOARD_TEMPLATES",
    ()=>BOARD_TEMPLATES,
    "TEMPLATE_CATEGORIES",
    ()=>TEMPLATE_CATEGORIES
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/board-layout-types.ts [app-ssr] (ecmascript)");
;
const TEMPLATE_CATEGORIES = [
    {
        id: "popular",
        label: "Popular"
    },
    {
        id: "productivity",
        label: "Productivity"
    },
    {
        id: "lifestyle",
        label: "Lifestyle"
    },
    {
        id: "starter",
        label: "Starter"
    }
];
/**
 * Creates a base PersistedLayout with sensible defaults.
 *
 * @param overrides - Partial layout to merge
 * @returns Complete PersistedLayout
 */ function base(overrides) {
    return {
        version: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCHEMA_VERSION"],
        widgets: [],
        layouts: {
            lg: [],
            md: [],
            sm: []
        },
        boardTitle: "My Board",
        boardDescription: "",
        coverImageUrl: "",
        boardEmoji: "\u{1F4D6}",
        iconSize: "md",
        titleFontFamily: "",
        titleTextColor: "",
        titleFontSize: "lg",
        coverHeight: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COVER_HEIGHT"],
        coverPositionY: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COVER_POSITION_Y"],
        updatedAt: Date.now(),
        ...overrides
    };
}
const BOARD_TEMPLATES = [
    // ── Popular ──
    {
        id: "productivity",
        name: "Productivity Hub",
        description: "Tasks, calendar, clock, weather, and focus timer — everything you need.",
        category: "popular",
        previewWidgets: [
            "tasks-today",
            "google-calendar",
            "clock",
            "weather",
            "pomodoro",
            "image"
        ],
        layout: base({
            boardTitle: "My Board",
            boardEmoji: "(..\u02C6\u02F0\u02C6..)",
            boardDescription: "Life is better when you smile.",
            coverImageUrl: "preset:p8",
            coverHeight: 200,
            coverPositionY: 30,
            widgets: [
                {
                    id: "t-tasks",
                    type: "tasks-today",
                    config: {}
                },
                {
                    id: "t-gcal",
                    type: "google-calendar",
                    config: {}
                },
                {
                    id: "t-image",
                    type: "image",
                    config: {}
                },
                {
                    id: "t-clock",
                    type: "clock",
                    config: {}
                },
                {
                    id: "t-pomodoro",
                    type: "pomodoro",
                    config: {}
                },
                {
                    id: "t-weather",
                    type: "weather",
                    config: {}
                }
            ],
            layouts: {
                lg: [
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-gcal",
                        x: 2,
                        y: 0,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-image",
                        x: 4,
                        y: 0,
                        w: 1,
                        h: 3
                    },
                    {
                        i: "t-clock",
                        x: 5,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-pomodoro",
                        x: 5,
                        y: 2,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 2
                    }
                ],
                md: [
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-gcal",
                        x: 2,
                        y: 0,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-image",
                        x: 4,
                        y: 0,
                        w: 1,
                        h: 3
                    },
                    {
                        i: "t-clock",
                        x: 5,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-pomodoro",
                        x: 5,
                        y: 2,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 2
                    }
                ],
                sm: [
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-gcal",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-clock",
                        x: 0,
                        y: 5,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 7,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-pomodoro",
                        x: 0,
                        y: 9,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-image",
                        x: 0,
                        y: 11,
                        w: 2,
                        h: 2
                    }
                ]
            }
        })
    },
    {
        id: "social",
        name: "Social Dashboard",
        description: "Cal Chat, quick links, and your schedule — stay connected.",
        category: "popular",
        previewWidgets: [
            "cal-chat",
            "google-calendar",
            "quick-links",
            "weather",
            "clock"
        ],
        layout: base({
            boardTitle: "My Dashboard",
            boardEmoji: "\u{1F680}",
            boardDescription: "",
            coverImageUrl: "preset:g1",
            coverHeight: 200,
            coverPositionY: 50,
            widgets: [
                {
                    id: "t-chat",
                    type: "cal-chat",
                    config: {}
                },
                {
                    id: "t-gcal",
                    type: "google-calendar",
                    config: {}
                },
                {
                    id: "t-links",
                    type: "quick-links",
                    config: {}
                },
                {
                    id: "t-weather",
                    type: "weather",
                    config: {}
                },
                {
                    id: "t-clock",
                    type: "clock",
                    config: {}
                }
            ],
            layouts: {
                lg: [
                    {
                        i: "t-chat",
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-gcal",
                        x: 3,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-links",
                        x: 6,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-weather",
                        x: 6,
                        y: 2,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-clock",
                        x: 0,
                        y: 3,
                        w: 2,
                        h: 2
                    }
                ],
                md: [
                    {
                        i: "t-chat",
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-gcal",
                        x: 3,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-links",
                        x: 0,
                        y: 3,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-weather",
                        x: 2,
                        y: 3,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-clock",
                        x: 4,
                        y: 3,
                        w: 2,
                        h: 2
                    }
                ],
                sm: [
                    {
                        i: "t-chat",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-gcal",
                        x: 0,
                        y: 3,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-links",
                        x: 0,
                        y: 6,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 8,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-clock",
                        x: 0,
                        y: 10,
                        w: 2,
                        h: 2
                    }
                ]
            }
        })
    },
    // ── Productivity ──
    {
        id: "study",
        name: "Study Mode",
        description: "Focus timer, class progress, tasks, and notes — built for studying.",
        category: "productivity",
        previewWidgets: [
            "pomodoro",
            "class-progress",
            "tasks-today",
            "notes",
            "countdown"
        ],
        layout: base({
            boardTitle: "Study Zone",
            boardEmoji: "\u{1F4DA}",
            boardDescription: "Stay focused, stay sharp.",
            coverImageUrl: "preset:g4",
            coverHeight: 180,
            coverPositionY: 50,
            widgets: [
                {
                    id: "t-pomodoro",
                    type: "pomodoro",
                    config: {}
                },
                {
                    id: "t-progress",
                    type: "class-progress",
                    config: {}
                },
                {
                    id: "t-tasks",
                    type: "tasks-today",
                    config: {}
                },
                {
                    id: "t-notes",
                    type: "notes",
                    config: {}
                },
                {
                    id: "t-countdown",
                    type: "countdown",
                    config: {}
                }
            ],
            layouts: {
                lg: [
                    {
                        i: "t-pomodoro",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-progress",
                        x: 2,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-tasks",
                        x: 4,
                        y: 0,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-notes",
                        x: 6,
                        y: 0,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-countdown",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 1
                    }
                ],
                md: [
                    {
                        i: "t-pomodoro",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-progress",
                        x: 2,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-tasks",
                        x: 4,
                        y: 0,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-notes",
                        x: 0,
                        y: 3,
                        w: 3,
                        h: 2
                    },
                    {
                        i: "t-countdown",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 1
                    }
                ],
                sm: [
                    {
                        i: "t-pomodoro",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-progress",
                        x: 0,
                        y: 4,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-notes",
                        x: 0,
                        y: 6,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-countdown",
                        x: 0,
                        y: 8,
                        w: 2,
                        h: 1
                    }
                ]
            }
        })
    },
    {
        id: "planner",
        name: "Daily Planner",
        description: "Tasks, calendar, countdown, and habits — plan your day.",
        category: "productivity",
        previewWidgets: [
            "tasks-today",
            "google-calendar",
            "countdown",
            "habit-tracker",
            "notes"
        ],
        layout: base({
            boardTitle: "Daily Planner",
            boardEmoji: "\u{1F5D3}\u{FE0F}",
            boardDescription: "Plan your day, own your time.",
            coverImageUrl: "preset:p14",
            coverHeight: 180,
            coverPositionY: 60,
            widgets: [
                {
                    id: "t-tasks",
                    type: "tasks-today",
                    config: {}
                },
                {
                    id: "t-gcal",
                    type: "google-calendar",
                    config: {}
                },
                {
                    id: "t-countdown",
                    type: "countdown",
                    config: {}
                },
                {
                    id: "t-habits",
                    type: "habit-tracker",
                    config: {}
                },
                {
                    id: "t-notes",
                    type: "notes",
                    config: {}
                }
            ],
            layouts: {
                lg: [
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-gcal",
                        x: 3,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-countdown",
                        x: 6,
                        y: 0,
                        w: 2,
                        h: 1
                    },
                    {
                        i: "t-habits",
                        x: 6,
                        y: 1,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-notes",
                        x: 0,
                        y: 3,
                        w: 3,
                        h: 2
                    }
                ],
                md: [
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-gcal",
                        x: 3,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-countdown",
                        x: 0,
                        y: 3,
                        w: 2,
                        h: 1
                    },
                    {
                        i: "t-habits",
                        x: 2,
                        y: 3,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-notes",
                        x: 4,
                        y: 3,
                        w: 2,
                        h: 2
                    }
                ],
                sm: [
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-gcal",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-countdown",
                        x: 0,
                        y: 5,
                        w: 2,
                        h: 1
                    },
                    {
                        i: "t-habits",
                        x: 0,
                        y: 6,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-notes",
                        x: 0,
                        y: 8,
                        w: 2,
                        h: 2
                    }
                ]
            }
        })
    },
    // ── Lifestyle ──
    {
        id: "vibes",
        name: "Aesthetic Vibes",
        description: "Clock, weather, image, quote, and spotify — set the mood.",
        category: "lifestyle",
        previewWidgets: [
            "clock",
            "weather",
            "image",
            "quote",
            "spotify"
        ],
        layout: base({
            boardTitle: "My Space",
            boardEmoji: "\u{1F338}",
            boardDescription: "",
            coverImageUrl: "preset:p19",
            coverHeight: 240,
            coverPositionY: 40,
            widgets: [
                {
                    id: "t-clock",
                    type: "clock",
                    config: {}
                },
                {
                    id: "t-weather",
                    type: "weather",
                    config: {}
                },
                {
                    id: "t-image",
                    type: "image",
                    config: {}
                },
                {
                    id: "t-quote",
                    type: "quote",
                    config: {}
                },
                {
                    id: "t-spotify",
                    type: "spotify",
                    config: {}
                }
            ],
            layouts: {
                lg: [
                    {
                        i: "t-clock",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-image",
                        x: 2,
                        y: 0,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-quote",
                        x: 4,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-spotify",
                        x: 6,
                        y: 0,
                        w: 2,
                        h: 2
                    }
                ],
                md: [
                    {
                        i: "t-clock",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-image",
                        x: 2,
                        y: 0,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-quote",
                        x: 4,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-spotify",
                        x: 4,
                        y: 2,
                        w: 2,
                        h: 2
                    }
                ],
                sm: [
                    {
                        i: "t-clock",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-image",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 4,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-quote",
                        x: 0,
                        y: 6,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-spotify",
                        x: 0,
                        y: 8,
                        w: 2,
                        h: 2
                    }
                ]
            }
        })
    },
    {
        id: "wellness",
        name: "Wellness Tracker",
        description: "Habits, weather, notes, and a quote — track your daily wellness.",
        category: "lifestyle",
        previewWidgets: [
            "habit-tracker",
            "weather",
            "notes",
            "quote",
            "clock"
        ],
        layout: base({
            boardTitle: "Wellness",
            boardEmoji: "\u{1F33F}",
            boardDescription: "Take care of yourself.",
            coverImageUrl: "preset:g12",
            coverHeight: 160,
            coverPositionY: 50,
            widgets: [
                {
                    id: "t-habits",
                    type: "habit-tracker",
                    config: {}
                },
                {
                    id: "t-weather",
                    type: "weather",
                    config: {}
                },
                {
                    id: "t-notes",
                    type: "notes",
                    config: {}
                },
                {
                    id: "t-quote",
                    type: "quote",
                    config: {}
                },
                {
                    id: "t-clock",
                    type: "clock",
                    config: {}
                }
            ],
            layouts: {
                lg: [
                    {
                        i: "t-habits",
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-weather",
                        x: 3,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-clock",
                        x: 5,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-notes",
                        x: 3,
                        y: 2,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-quote",
                        x: 5,
                        y: 2,
                        w: 2,
                        h: 2
                    }
                ],
                md: [
                    {
                        i: "t-habits",
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-weather",
                        x: 3,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-clock",
                        x: 5,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-notes",
                        x: 0,
                        y: 3,
                        w: 3,
                        h: 2
                    },
                    {
                        i: "t-quote",
                        x: 3,
                        y: 3,
                        w: 3,
                        h: 2
                    }
                ],
                sm: [
                    {
                        i: "t-habits",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 3,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-clock",
                        x: 0,
                        y: 5,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-notes",
                        x: 0,
                        y: 7,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-quote",
                        x: 0,
                        y: 9,
                        w: 2,
                        h: 2
                    }
                ]
            }
        })
    },
    // ── Starter ──
    {
        id: "minimal",
        name: "Minimal",
        description: "Clean and simple — just tasks and calendar.",
        category: "starter",
        previewWidgets: [
            "tasks-today",
            "google-calendar",
            "weather"
        ],
        layout: base({
            boardTitle: "My Board",
            boardEmoji: "\u{1F4CB}",
            boardDescription: "",
            coverImageUrl: "preset:s1",
            coverHeight: 120,
            coverPositionY: 50,
            widgets: [
                {
                    id: "t-tasks",
                    type: "tasks-today",
                    config: {}
                },
                {
                    id: "t-gcal",
                    type: "google-calendar",
                    config: {}
                },
                {
                    id: "t-weather",
                    type: "weather",
                    config: {}
                }
            ],
            layouts: {
                lg: [
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-gcal",
                        x: 3,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-weather",
                        x: 6,
                        y: 0,
                        w: 2,
                        h: 2
                    }
                ],
                md: [
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-gcal",
                        x: 3,
                        y: 0,
                        w: 3,
                        h: 3
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 3,
                        w: 2,
                        h: 2
                    }
                ],
                sm: [
                    {
                        i: "t-tasks",
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2
                    },
                    {
                        i: "t-gcal",
                        x: 0,
                        y: 2,
                        w: 2,
                        h: 3
                    },
                    {
                        i: "t-weather",
                        x: 0,
                        y: 5,
                        w: 2,
                        h: 2
                    }
                ]
            }
        })
    },
    {
        id: "blank",
        name: "Blank Canvas",
        description: "Start fresh with an empty board.",
        category: "starter",
        previewWidgets: [],
        layout: base({
            boardTitle: "My Board",
            boardEmoji: "\u{2728}",
            boardDescription: "Tap edit to start building your board.",
            coverImageUrl: "",
            coverHeight: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COVER_HEIGHT"]
        })
    }
];
}),
"[project]/.claude/worktrees/claude-work/src/lib/board-layout-sync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Server sync helpers for board layout persistence.
 * Handles fetching and saving board layout to the Supabase API,
 * with debounced writes, retry logic, and error notification.
 * Includes beforeunload/visibilitychange flush to prevent data loss
 * when users close the tab before the debounce fires.
 *
 * @module board-layout-sync
 */ /** Shape of the server response from GET /api/board-layout. */ __turbopack_context__.s([
    "debouncedServerSave",
    ()=>debouncedServerSave,
    "fetchServerLayout",
    ()=>fetchServerLayout,
    "registerSaveErrorHandler",
    ()=>registerSaveErrorHandler,
    "saveServerLayout",
    ()=>saveServerLayout,
    "saveWithRetry",
    ()=>saveWithRetry
]);
/** Delay in ms before retrying a failed save. */ const RETRY_DELAY_MS = 2000;
async function fetchServerLayout() {
    try {
        const res = await fetch("/api/board-layout");
        if (!res.ok) {
            console.warn("[board-layout-sync] fetchServerLayout failed:", res.status);
            return {
                layout: null,
                updatedAt: null
            };
        }
        return await res.json();
    } catch (err) {
        console.warn("[board-layout-sync] fetchServerLayout error:", err);
        return {
            layout: null,
            updatedAt: null
        };
    }
}
async function saveServerLayout(data) {
    try {
        const res = await fetch("/api/board-layout", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const msg = `HTTP ${res.status}`;
            console.warn("[board-layout-sync] saveServerLayout failed:", msg);
            return {
                ok: false,
                error: msg
            };
        }
        return {
            ok: true
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        console.warn("[board-layout-sync] saveServerLayout error:", msg);
        return {
            ok: false,
            error: msg
        };
    }
}
/**
 * Module-level error callback for bridging save failures to React (toast).
 * Registered by the hook on mount, cleared on unmount.
 */ let saveErrorHandler = null;
function registerSaveErrorHandler(cb) {
    saveErrorHandler = cb;
}
async function saveWithRetry(data) {
    const first = await saveServerLayout(data);
    if (first.ok) return;
    // Wait and retry once
    await new Promise((resolve)=>setTimeout(resolve, RETRY_DELAY_MS));
    const second = await saveServerLayout(data);
    if (second.ok) return;
    // Both attempts failed — notify via registered handler
    if (saveErrorHandler) {
        saveErrorHandler(second.error ?? "Save failed");
    }
}
/** Timer ID for the debounced save. */ let debounceTimer = null;
/** Pending data waiting to be flushed to the server. Null when no save is pending. */ let pendingData = null;
/**
 * Immediately flushes any pending debounced save using sendBeacon (for tab close)
 * or a regular fetch (for visibility change). Called by beforeunload/visibilitychange.
 * sendBeacon cannot retry — this is best-effort on tab close.
 */ function flushPendingSync() {
    if (!pendingData) return;
    const data = pendingData;
    pendingData = null;
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    // Use fetch with keepalive for reliable delivery during page unload.
    // sendBeacon Blob Content-Type may be stripped by some browsers; fetch preserves headers.
    fetch("/api/board-layout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        keepalive: true
    }).catch(()=>{
    // Best-effort on tab close — nothing to retry
    });
}
/** Register flush listeners once (module-level singleton). */ let listenersRegistered = false;
function registerFlushListeners() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function debouncedServerSave(data) {
    registerFlushListeners();
    pendingData = data;
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(()=>{
        debounceTimer = null;
        pendingData = null;
        saveWithRetry(data);
    }, 500);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/board-layout-cache.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * localStorage read/write helpers for board layout.
 * localStorage serves as a passive read cache (stale-while-revalidate).
 * The server is the source of truth — this module only caches locally.
 *
 * @module board-layout-cache
 */ __turbopack_context__.s([
    "readPersistedLayout",
    ()=>readPersistedLayout,
    "writeLayoutCache",
    ()=>writeLayoutCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/widget-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/board-layout-types.ts [app-ssr] (ecmascript)");
;
;
/** Set of currently supported widget type strings. */ const SUPPORTED_TYPES = new Set(Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WIDGET_REGISTRY"]));
function readPersistedLayout() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function writeLayoutCache(data) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useCompactMode.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCompactMode",
    ()=>useCompactMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function useCompactMode(heightThreshold = 160) {
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [compact, setCompact] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries)=>{
            for (const entry of entries){
                setCompact(entry.contentRect.height < heightThreshold);
            }
        });
        observer.observe(el);
        return ()=>observer.disconnect();
    }, [
        heightThreshold
    ]);
    return {
        containerRef,
        compact
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useDiscussionBoards.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDiscussionBoards",
    ()=>useDiscussionBoards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
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
    // Always start with loading=true to match server render (no sessionStorage on server)
    const [boards, setBoards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchBoards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setError(null);
        try {
            const res = await fetch("/api/discussions/boards");
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                throw new Error(data.error || `Failed to fetch boards (${res.status})`);
            }
            const data = await res.json();
            // Sort system courses (CalTodo Fam) first, preserve order for the rest
            data.sort((a, b)=>{
                const aSystem = a.course.source === "system" ? 0 : 1;
                const bSystem = b.course.source === "system" ? 0 : 1;
                return aSystem - bSystem;
            });
            setBoards(data);
            writeCache(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        } finally{
            setLoading(false);
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Show cached data instantly, then revalidate
        const cached = readCache();
        if (cached) {
            setBoards(cached);
            setLoading(false);
        }
        fetchBoards();
    }, [
        fetchBoards
    ]);
    // Refetch when courses are added/removed in settings
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleCoursesChanged() {
            try {
                sessionStorage.removeItem(CACHE_KEY);
            } catch  {}
            fetchBoards();
        }
        window.addEventListener("caltodo-courses-changed", handleCoursesChanged);
        return ()=>window.removeEventListener("caltodo-courses-changed", handleCoursesChanged);
    }, [
        fetchBoards
    ]);
    return {
        boards,
        loading,
        error,
        refetch: fetchBoards
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useWidgetLayout.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/widget-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/board-layout-sync.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/board-layout-cache.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/board-layout-types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/realtime-auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-ssr] (ecmascript)");
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
    const defaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDefaultLayout"])();
    const [widgets, setWidgets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaults.widgets);
    const [layouts, setLayoutsState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaults.layouts);
    const [boardTitle, setBoardTitleState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("My Board");
    const [boardDescription, setBoardDescriptionState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Tap the edit button to start customizing your board.");
    const [coverImageUrl, setCoverImageUrlState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [boardEmoji, setBoardEmojiState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("\u{1F4D6}");
    const [iconSize, setIconSizeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("md");
    const [titleFontFamily, setTitleFontFamilyState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [titleTextColor, setTitleTextColorState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [titleFontSize, setTitleFontSizeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("lg");
    const [coverHeight, setCoverHeightState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COVER_HEIGHT"]);
    const [coverPositionY, setCoverPositionYState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COVER_POSITION_Y"]);
    const [dividerColor, setDividerColorState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [dividerThickness, setDividerThicknessState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [dividerText, setDividerTextState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [dividerVisible, setDividerVisibleState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [savedImages, setSavedImagesState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Refs for board metadata so callbacks read current values without re-creating
    const boardTitleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(boardTitle);
    const boardDescriptionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(boardDescription);
    const coverImageUrlRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(coverImageUrl);
    const boardEmojiRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(boardEmoji);
    const iconSizeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(iconSize);
    const titleFontFamilyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(titleFontFamily);
    const titleTextColorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(titleTextColor);
    const titleFontSizeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(titleFontSize);
    const coverHeightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(coverHeight);
    const coverPositionYRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(coverPositionY);
    const dividerColorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(dividerColor);
    const dividerThicknessRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(dividerThickness);
    const dividerTextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(dividerText);
    const dividerVisibleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(dividerVisible);
    const savedImagesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(savedImages);
    /** Instance-level gate: prevents server saves before initial fetch completes. */ const hydrationCompleteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Register toast error handler for save failures
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["registerSaveErrorHandler"])(()=>{
            showToast("Board changes couldn't be saved. They're saved locally.");
        });
        return ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["registerSaveErrorHandler"])(null);
    }, [
        showToast
    ]);
    /**
   * Applies a PersistedLayout to all state + refs.
   * Extracted to avoid duplication between localStorage and server hydration.
   */ const applyLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((p)=>{
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
        const cHeight = p.coverHeight ?? __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COVER_HEIGHT"];
        const cPosY = p.coverPositionY ?? __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COVER_POSITION_Y"];
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
    }, []);
    /**
   * Builds a PersistedLayout from widgets + layouts + optional overrides,
   * writes to localStorage cache, and triggers debounced server save.
   * Overrides win over current ref values — callers pass only changed fields.
   *
   * @param w - Current widget instances
   * @param l - Current grid layouts per breakpoint
   * @param overrides - Partial fields to override (e.g. { boardTitle: "New" })
   */ const persistLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((w, l, overrides = {})=>{
        const data = {
            version: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCHEMA_VERSION"],
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeLayoutCache"])(data);
        if (hydrationCompleteRef.current) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["debouncedServerSave"])(data);
        }
    }, []);
    // Server-authoritative hydration: localStorage is a read-only cache for
    // instant initial paint. The server is the single source of truth.
    // localStorage never drives saves — only user actions do.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        hydrationCompleteRef.current = false;
        // Apply cached layout instantly for fast paint while server fetches
        const localLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readPersistedLayout"])();
        if (localLayout) {
            applyLayout(localLayout);
            setHydrated(true);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$sync$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchServerLayout"])().then(({ layout: serverData, updatedAt: serverUpdatedAt })=>{
            if (serverData) {
                // Server has data — always apply it (server wins)
                const serverLayout = serverData;
                serverLayout.version = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCHEMA_VERSION"];
                serverLayout.updatedAt = serverUpdatedAt ? new Date(serverUpdatedAt).getTime() : 0;
                applyLayout(serverLayout);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeLayoutCache"])(serverLayout);
            }
            // If server has no data, keep defaults in state but do NOT save
            // them to the server. Only explicit user actions trigger saves.
            setHydrated(true);
            hydrationCompleteRef.current = true;
        }).catch(()=>{
            // Show UI even on failure
            setHydrated(true);
            hydrationCompleteRef.current = true;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Realtime subscription — sync layout changes from other devices
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
        let channel = null;
        async function subscribe() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ensureRealtimeAuth"])(supabase);
            channel = supabase.channel("board-layout-sync").on("postgres_changes", {
                event: "UPDATE",
                schema: "public",
                table: "board_layouts",
                filter: `user_id=eq.${user.id}`
            }, (payload)=>{
                if (!hydrationCompleteRef.current) return;
                const incoming = payload.new;
                if (!incoming.layout) return;
                const incomingLayout = incoming.layout;
                const incomingTs = incomingLayout.updatedAt ?? 0;
                // Echo suppression: skip if this is our own save echoing back
                const currentLocal = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readPersistedLayout"])();
                const currentLocalTs = currentLocal?.updatedAt ?? 0;
                if (incomingTs <= currentLocalTs) return;
                // Incoming layout is newer (from another device) — apply it
                incomingLayout.version = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCHEMA_VERSION"];
                applyLayout(incomingLayout);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeLayoutCache"])(incomingLayout);
            }).subscribe();
        }
        subscribe();
        return ()=>{
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const setLayouts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((_currentLayout, allLayouts)=>{
        setLayoutsState((prev)=>{
            if (prev === allLayouts) return prev;
            setWidgets((prevWidgets)=>{
                persistLayout(prevWidgets, allLayouts);
                return prevWidgets;
            });
            return allLayouts;
        });
    }, [
        persistLayout
    ]);
    const addWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((type, config = {}, position)=>{
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateWidgetId"])();
        const reg = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WIDGET_REGISTRY"][type];
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
        setWidgets((prev)=>{
            const updated = [
                ...prev,
                newWidget
            ];
            setLayoutsState((prevLayouts)=>{
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
            });
            return updated;
        });
        return id;
    }, [
        persistLayout
    ]);
    const removeWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setWidgets((prev)=>{
            const updated = prev.filter((w)=>w.id !== id);
            setLayoutsState((prevLayouts)=>{
                const updatedLayouts = {};
                for (const bp of Object.keys(prevLayouts)){
                    updatedLayouts[bp] = (prevLayouts[bp] || []).filter((l)=>l.i !== id);
                }
                persistLayout(updated, updatedLayouts);
                return updatedLayouts;
            });
            return updated;
        });
    }, [
        persistLayout
    ]);
    const updateWidgetConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, config)=>{
        setWidgets((prev)=>{
            const updated = prev.map((w)=>w.id === id ? {
                    ...w,
                    config: {
                        ...w.config,
                        ...config
                    }
                } : w);
            setLayoutsState((prevLayouts)=>{
                persistLayout(updated, prevLayouts);
                return prevLayouts;
            });
            return updated;
        });
    }, [
        persistLayout
    ]);
    const updateAllWidgetConfigs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((config)=>{
        setWidgets((prev)=>{
            const updated = prev.map((w)=>({
                    ...w,
                    config: {
                        ...w.config,
                        ...config
                    }
                }));
            setLayoutsState((prevLayouts)=>{
                persistLayout(updated, prevLayouts);
                return prevLayouts;
            });
            return updated;
        });
    }, [
        persistLayout
    ]);
    const setBoardTitle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((title)=>{
        const trimmed = title.slice(0, 50);
        setBoardTitleState(trimmed);
        boardTitleRef.current = trimmed;
        setWidgets((prev)=>{
            setLayoutsState((prevLayouts)=>{
                persistLayout(prev, prevLayouts, {
                    boardTitle: trimmed
                });
                return prevLayouts;
            });
            return prev;
        });
    }, [
        persistLayout
    ]);
    const setBoardDescription = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((desc)=>{
        const trimmed = desc.slice(0, 200);
        setBoardDescriptionState(trimmed);
        boardDescriptionRef.current = trimmed;
        setWidgets((prev)=>{
            setLayoutsState((prevLayouts)=>{
                persistLayout(prev, prevLayouts, {
                    boardDescription: trimmed
                });
                return prevLayouts;
            });
            return prev;
        });
    }, [
        persistLayout
    ]);
    const setCoverImageUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((url)=>{
        setCoverImageUrlState(url);
        coverImageUrlRef.current = url;
        setWidgets((prev)=>{
            setLayoutsState((prevLayouts)=>{
                persistLayout(prev, prevLayouts, {
                    coverImageUrl: url
                });
                return prevLayouts;
            });
            return prev;
        });
    }, [
        persistLayout
    ]);
    const setBoardEmoji = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((emoji)=>{
        setBoardEmojiState(emoji);
        boardEmojiRef.current = emoji;
        setWidgets((prev)=>{
            setLayoutsState((prevLayouts)=>{
                persistLayout(prev, prevLayouts, {
                    boardEmoji: emoji
                });
                return prevLayouts;
            });
            return prev;
        });
    }, [
        persistLayout
    ]);
    const setIconSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((size)=>{
        setIconSizeState(size);
        iconSizeRef.current = size;
        setWidgets((prev)=>{
            setLayoutsState((prevLayouts)=>{
                persistLayout(prev, prevLayouts, {
                    iconSize: size
                });
                return prevLayouts;
            });
            return prev;
        });
    }, [
        persistLayout
    ]);
    const setCoverConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((height, positionY)=>{
        setCoverHeightState(height);
        setCoverPositionYState(positionY);
        coverHeightRef.current = height;
        coverPositionYRef.current = positionY;
        setWidgets((prev)=>{
            setLayoutsState((prevLayouts)=>{
                persistLayout(prev, prevLayouts, {
                    coverHeight: height,
                    coverPositionY: positionY
                });
                return prevLayouts;
            });
            return prev;
        });
    }, [
        persistLayout
    ]);
    const setTitleConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((fontFamily, textColor, fontSize = "lg")=>{
        setTitleFontFamilyState(fontFamily);
        setTitleTextColorState(textColor);
        setTitleFontSizeState(fontSize);
        titleFontFamilyRef.current = fontFamily;
        titleTextColorRef.current = textColor;
        titleFontSizeRef.current = fontSize;
        setWidgets((prev)=>{
            setLayoutsState((prevLayouts)=>{
                persistLayout(prev, prevLayouts, {
                    titleFontFamily: fontFamily,
                    titleTextColor: textColor,
                    titleFontSize: fontSize
                });
                return prevLayouts;
            });
            return prev;
        });
    }, [
        persistLayout
    ]);
    /**
   * Updates the divider color and thickness, persisting to storage.
   *
   * @param color - CSS color string (empty = default theme color)
   * @param thickness - Pixel thickness (1-6)
   */ const setDividerConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((color, thickness, text, visible)=>{
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
        setWidgets((prev)=>{
            setLayoutsState((prevLayouts)=>{
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
            });
            return prev;
        });
    }, [
        persistLayout
    ]);
    const addSavedImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((url)=>{
        setSavedImagesState((prev)=>{
            const deduped = prev.filter((u)=>u !== url);
            const updated = [
                url,
                ...deduped
            ].slice(0, 20);
            savedImagesRef.current = updated;
            setWidgets((prevWidgets)=>{
                setLayoutsState((prevLayouts)=>{
                    persistLayout(prevWidgets, prevLayouts, {
                        savedImages: updated
                    });
                    return prevLayouts;
                });
                return prevWidgets;
            });
            return updated;
        });
    }, [
        persistLayout
    ]);
    /**
   * Applies a full PersistedLayout (e.g. from a template) and persists it.
   * Generates fresh widget IDs so templates don't collide with existing data.
   *
   * @param template - The full layout to apply
   */ const applyTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((template)=>{
        // Generate fresh widget IDs
        const idMap = new Map();
        const freshWidgets = template.widgets.map((w)=>{
            const newId = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$widget$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateWidgetId"])();
            idMap.set(w.id, newId);
            return {
                ...w,
                id: newId
            };
        });
        // Remap layout item IDs
        const freshLayouts = {};
        for (const [bp, items] of Object.entries(template.layouts)){
            freshLayouts[bp] = items.map((item)=>({
                    ...item,
                    i: idMap.get(item.i) || item.i
                }));
        }
        const fresh = {
            ...template,
            widgets: freshWidgets,
            layouts: freshLayouts,
            version: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$board$2d$layout$2d$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCHEMA_VERSION"],
            updatedAt: Date.now()
        };
        applyLayout(fresh);
        persistLayout(freshWidgets, freshLayouts, fresh);
    }, [
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
}),
"[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Home dashboard page — "Your Board" personal dashboard.
 * Notion-style layout: cover banner → emoji icon → editable title → widget grid.
 * Edit mode toggle: pencil icon (view) / "Done" pill (edit).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$template$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutTemplate$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-template.js [app-ssr] (ecmascript) <export default as LayoutTemplate>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/PageTransition.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$EditToggleButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/EditToggleButton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/WidgetGrid.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetGalleryModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/WidgetGalleryModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/WidgetEditorPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardCover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardCover.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardTitle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardTitle.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardDescription$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardDescription.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardDivider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardDivider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$EmojiPicker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/emoji-picker-data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardTemplatesModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/BoardTemplatesModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useWidgetLayout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useWidgetLayout.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-ssr] (ecmascript)");
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
;
function HomePage() {
    const { widgets, layouts, hydrated, boardTitle, boardDescription, coverImageUrl, boardEmoji, iconSize, setLayouts, addWidget, removeWidget, updateWidgetConfig, updateAllWidgetConfigs, setBoardTitle, setBoardDescription, setCoverImageUrl, setBoardEmoji, setIconSize, titleFontFamily, titleTextColor, titleFontSize, coverHeight, coverPositionY, setTitleConfig, setCoverConfig, dividerColor, dividerThickness, dividerText, dividerVisible, setDividerConfig, savedImages, addSavedImage, applyTemplate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useWidgetLayout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWidgetLayout"])();
    const { colorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    const [editMode, setEditMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [galleryOpen, setGalleryOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [templatesOpen, setTemplatesOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [settingsWidget, setSettingsWidget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [settingsWidgetRect, setSettingsWidgetRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [emojiPickerOpen, setEmojiPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    /** Widget type being dragged from gallery (null when not drag-to-placing). */ const [draggingType, setDraggingType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Live widget rect for the spotlight overlay (updates on scroll/resize). */ const [spotlightRect, setSpotlightRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const spotlightRafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    // When a color theme is activated, permanently clear custom widget/title/divider colors
    const prevThemeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(colorTheme);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
    }, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleTourEditMode(e) {
            const enabled = e.detail === true;
            setEditMode(enabled);
        }
        window.addEventListener("tour-set-edit-mode", handleTourEditMode);
        return ()=>window.removeEventListener("tour-set-edit-mode", handleTourEditMode);
    }, []);
    // Track selected widget position for spotlight overlay.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        return ()=>cancelAnimationFrame(spotlightRafRef.current);
    }, [
        settingsWidget
    ]);
    /** Handles adding a widget from the gallery. */ const handleAddWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((type)=>{
        addWidget(type);
        showToast("Widget added");
    }, [
        addWidget,
        showToast
    ]);
    /** Ref to prevent double-add from both onDrop and dragend firing. */ const dropHandledRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    /** Called when user starts dragging a widget card from the gallery. */ const handleGalleryDragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((type)=>{
        dropHandledRef.current = false;
        setDraggingType(type);
        // Hide modal visually but keep it mounted so the drag source element
        // stays in the DOM — removing it cancels the browser drag operation.
        setGalleryOpen(false);
    }, []);
    /** Called when user drops an external item onto the grid. */ const handleExternalDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((item)=>{
        if (dropHandledRef.current) return;
        dropHandledRef.current = true;
        setDraggingType((prev)=>{
            if (prev) {
                addWidget(prev, {}, {
                    x: item.x,
                    y: item.y
                });
                showToast("Widget added");
            }
            return null;
        });
    }, [
        addWidget,
        showToast
    ]);
    // Fallback: if drag ends outside the grid, still add the widget at bottom
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!draggingType) return;
        function handleDragEnd() {
            if (dropHandledRef.current) {
                // Already handled by onDrop — just clean up
                setDraggingType(null);
                return;
            }
            dropHandledRef.current = true;
            setDraggingType((prev)=>{
                if (prev) {
                    addWidget(prev);
                    showToast("Widget added");
                }
                return null;
            });
        }
        window.addEventListener("dragend", handleDragEnd);
        return ()=>window.removeEventListener("dragend", handleDragEnd);
    }, [
        draggingType,
        addWidget,
        showToast
    ]);
    /** Opens editor panel for a specific widget with its bounding rect. */ const handleWidgetSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, rect)=>{
        const widget = widgets.find((w)=>w.id === id) || null;
        setSettingsWidget(widget);
        setSettingsWidgetRect(rect);
    }, [
        widgets
    ]);
    /** Applies a font to all widgets and the board title. */ const handleApplyFontToAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((font)=>{
        updateAllWidgetConfigs({
            fontFamily: font
        });
        setTitleConfig(font, titleTextColor, titleFontSize);
        showToast("Font applied to all widgets");
    }, [
        updateAllWidgetConfigs,
        setTitleConfig,
        titleTextColor,
        titleFontSize,
        showToast
    ]);
    // Don't render grid until localStorage is hydrated (avoids layout flash)
    if (!hydrated) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                            lineNumber: 204,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full overflow-hidden -mx-4 md:-mx-10 -mt-4 md:-mt-10 -mb-4 md:-mb-10",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `h-full flex flex-col ${isDragging ? "overflow-hidden" : "overflow-y-auto"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardCover$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 md:px-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative mb-2.5",
                                style: {
                                    marginTop: -((__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ICON_SIZES"].find((s)=>s.value === iconSize)?.px ?? 64) / 2)
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (editMode) setEmojiPickerOpen((p)=>!p);
                                        },
                                        className: `leading-none ${editMode ? "cursor-pointer hover:opacity-80 transition-opacity animate-edit-hint" : "cursor-default"}`,
                                        "aria-label": "Board icon",
                                        children: (()=>{
                                            const sizePx = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ICON_SIZES"].find((s)=>s.value === iconSize)?.px ?? 64;
                                            if (boardEmoji.startsWith("lucide:")) {
                                                const iconName = boardEmoji.slice(7);
                                                const LucideIcon = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LUCIDE_ICON_MAP"][iconName];
                                                if (LucideIcon) {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LucideIcon, {
                                                        size: sizePx,
                                                        strokeWidth: 1.5,
                                                        fill: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isFilledIcon"])(iconName) ? "currentColor" : "none",
                                                        className: "text-foreground"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                                        lineNumber: 245,
                                                        columnNumber: 28
                                                    }, this);
                                                }
                                            }
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$EmojiPicker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"], {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardTitle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2.5 shrink-0",
                                        children: [
                                            editMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setTemplatesOpen(true),
                                                        className: "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-border bg-white dark:bg-gray-800 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all active:scale-[0.97]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$template$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutTemplate$3e$__["LayoutTemplate"], {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        id: "add-widget-btn",
                                                        onClick: ()=>setGalleryOpen(true),
                                                        className: "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-border bg-white dark:bg-gray-800 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all active:scale-[0.97]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$EditToggleButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardDescription$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        description: boardDescription,
                        editMode: editMode,
                        onDescriptionChange: setBoardDescription
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                        lineNumber: 299,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardDivider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "widget-grid",
                        className: "flex-1 min-h-0 pb-20 md:pb-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                    widgets.length === 0 && !editMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col items-center justify-center text-center py-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground mb-3",
                                children: "Your dashboard is empty"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                lineNumber: 336,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setEditMode(true);
                                    setGalleryOpen(true);
                                },
                                className: "flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: draggingType && !galleryOpen ? "invisible fixed inset-0 pointer-events-none" : "",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetGalleryModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$BoardTemplatesModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                    settingsWidget && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fixed inset-0 z-[39]",
                                onClick: ()=>setSettingsWidget(null)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/home/page.tsx",
                                lineNumber: 378,
                                columnNumber: 13
                            }, this),
                            spotlightRect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    settingsWidget && settingsWidgetRect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$WidgetEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
}),
];

//# sourceMappingURL=_claude_worktrees_claude-work_src_c68a46a5._.js.map