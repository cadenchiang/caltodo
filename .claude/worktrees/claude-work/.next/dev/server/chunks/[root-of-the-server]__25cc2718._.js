module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/.claude/worktrees/claude-work/src/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const headerStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])();
    const authHeader = headerStore.get("authorization");
    // If a Bearer token is provided (mobile), inject it as the Supabase auth cookie
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://dcoowflhqsfggtmnzxfn.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb293ZmxocXNmZ2d0bW56eGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDIxOTgsImV4cCI6MjA4NjU3ODE5OH0.SV3ckwxHJUKP1Yr6VFtkg0GFdkYwEkXQwD6jgqC26V0"), {
        cookies: {
            getAll () {
                if (bearerToken) {
                    // Return the Bearer token as the Supabase auth cookie so
                    // supabase.auth.getUser() resolves the mobile user's session.
                    return [
                        {
                            name: "sb-access-token",
                            value: bearerToken
                        }
                    ];
                }
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                // Skip cookie writes for Bearer-token requests (mobile)
                if (bearerToken) return;
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method is called from a Server Component where
                // cookies cannot be set. This can be safely ignored if middleware
                // is refreshing user sessions.
                }
            }
        },
        ...bearerToken ? {
            global: {
                headers: {
                    Authorization: `Bearer ${bearerToken}`
                }
            }
        } : {}
    });
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/.claude/worktrees/claude-work/src/lib/canvas-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchAllCanvasAssignments",
    ()=>fetchAllCanvasAssignments,
    "fetchCanvasAssignments",
    ()=>fetchCanvasAssignments,
    "fetchCanvasAssignmentsForCourses",
    ()=>fetchCanvasAssignmentsForCourses,
    "fetchCanvasCourses",
    ()=>fetchCanvasCourses
]);
/**
 * Canvas LMS REST API client for fetching courses and assignments.
 * Server-side only — do not import in client components.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
/** Timeout in milliseconds for external Canvas API calls. */ const FETCH_TIMEOUT_MS = 30_000;
/**
 * Extracts plain text and file links from Canvas HTML description.
 * Strips HTML tags, preserves link URLs inline, and lists attached file links.
 *
 * @param html - Raw HTML description from Canvas API (may be null)
 * @returns Plain text with file links appended, or empty string if null
 */ function extractDescriptionAndFiles(html) {
    if (!html) return "";
    // Extract file links (href ending in /download or common file extensions)
    const fileLinks = [];
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi;
    let match;
    while((match = linkRegex.exec(html)) !== null){
        const href = match[1];
        const text = match[2].trim();
        if (href.includes("/download") || /\.(pdf|docx?|xlsx?|pptx?|zip|csv|txt)(\?|$)/i.test(href)) {
            fileLinks.push(`${text || "File"}: ${href}`);
        }
    }
    // Strip HTML tags to get plain text
    let text = html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<\/li>/gi, "\n").replace(/<li[^>]*>/gi, "- ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
    // Append file links if found
    if (fileLinks.length > 0) {
        text += (text ? "\n\n" : "") + "Attached files:\n" + fileLinks.join("\n");
    }
    return text;
}
async function fetchCanvasCourses(token, baseUrl) {
    const resolvedBaseUrl = baseUrl || "https://bcourses.berkeley.edu";
    const courses = [];
    let url = `${resolvedBaseUrl}/api/v1/courses?enrollment_state=active&per_page=50`;
    while(url){
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
        });
        if (response.status === 401) {
            throw new Error("Canvas token is invalid or expired. Please update it in Settings.");
        }
        if (response.status === 403) {
            throw new Error("Canvas rate limit exceeded. Please try again later.");
        }
        if (!response.ok) {
            throw new Error(`Canvas API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        courses.push(...data);
        url = parseNextLink(response.headers.get("link"));
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchCanvasCourses", {
        count: courses.length
    });
    return courses;
}
async function fetchCanvasAssignments(token, baseUrl, courseId) {
    const resolvedBaseUrl = baseUrl || "https://bcourses.berkeley.edu";
    const assignments = [];
    let url = `${resolvedBaseUrl}/api/v1/courses/${courseId}/assignments?per_page=50&order_by=due_at&include[]=submission`;
    while(url){
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
        });
        if (!response.ok) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("fetchCanvasAssignments failed for course", {
                courseId,
                status: response.status
            });
            throw new Error(`Canvas returned ${response.status} for course ${courseId}`);
        }
        const data = await response.json();
        assignments.push(...data);
        url = parseNextLink(response.headers.get("link"));
    }
    return assignments;
}
async function fetchAllCanvasAssignments(token, baseUrl) {
    const courses = await fetchCanvasCourses(token, baseUrl);
    const results = [];
    for (const course of courses){
        try {
            const assignments = await fetchCanvasAssignments(token, baseUrl, course.id);
            for (const a of assignments){
                const ws = a.submission?.workflow_state;
                results.push({
                    external_id: String(a.id),
                    course_name: course.name,
                    course_id: String(course.id),
                    title: a.name,
                    due_date: a.due_at,
                    source_url: a.html_url,
                    points_possible: a.points_possible,
                    is_submitted: ws === "submitted" || ws === "graded",
                    description: extractDescriptionAndFiles(a.description)
                });
            }
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("Failed to fetch assignments for course", {
                courseId: course.id,
                courseName: course.name,
                error: err instanceof Error ? err.message : String(err)
            });
        }
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchAllCanvasAssignments", {
        totalAssignments: results.length
    });
    return results;
}
async function fetchCanvasAssignmentsForCourses(token, baseUrl, courses) {
    const results = [];
    for (const course of courses){
        try {
            const assignments = await fetchCanvasAssignments(token, baseUrl, course.id);
            for (const a of assignments){
                const ws = a.submission?.workflow_state;
                results.push({
                    external_id: String(a.id),
                    course_name: course.name,
                    course_id: String(course.id),
                    title: a.name,
                    due_date: a.due_at,
                    source_url: a.html_url,
                    points_possible: a.points_possible,
                    is_submitted: ws === "submitted" || ws === "graded",
                    description: extractDescriptionAndFiles(a.description)
                });
            }
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("Failed to fetch assignments for selected course", {
                courseId: course.id,
                courseName: course.name,
                error: err instanceof Error ? err.message : String(err)
            });
        }
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchCanvasAssignmentsForCourses", {
        courseCount: courses.length,
        totalAssignments: results.length
    });
    return results;
}
/**
 * Parses the Link header to extract the "next" page URL for pagination.
 *
 * @param linkHeader - Raw Link header value from the response
 * @returns URL string for the next page, or null if no next page
 */ function parseNextLink(linkHeader) {
    if (!linkHeader) return null;
    const links = linkHeader.split(",");
    for (const link of links){
        const match = link.match(/<([^>]+)>;\s*rel="next"/);
        if (match) return match[1];
    }
    return null;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/ical-date-utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractPropertyWithTzid",
    ()=>extractPropertyWithTzid,
    "parseDueDateWithTzid",
    ()=>parseDueDateWithTzid
]);
/**
 * Shared iCal date/time parsing utilities.
 * Handles TZID-qualified datetimes by converting local times to UTC.
 * Used by canvas-ical-client.ts and pensieve-client.ts.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
function extractPropertyWithTzid(block, property) {
    const regex = new RegExp(`^${property}((?:;[^:]*)?):(.*)$`, "m");
    const match = block.match(regex);
    if (!match) return null;
    const params = match[1];
    const value = match[2].trim();
    const tzidMatch = params.match(/;TZID=([^;:]+)/i);
    const tzid = tzidMatch ? tzidMatch[1] : null;
    return {
        value,
        tzid
    };
}
function parseDueDateWithTzid(raw, tzid) {
    if (!raw) return null;
    // DATE format: YYYYMMDD (all-day event, no timezone conversion needed)
    if (/^\d{8}$/.test(raw)) {
        const y = raw.slice(0, 4);
        const m = raw.slice(4, 6);
        const d = raw.slice(6, 8);
        return `${y}-${m}-${d}T00:00:00Z`;
    }
    // DATETIME format: YYYYMMDDTHHmmss with optional Z suffix
    const dtMatch = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
    if (!dtMatch) return null;
    const [, y, mo, d, h, mi, s, zSuffix] = dtMatch;
    // If already UTC (has Z suffix) or no TZID, treat as UTC
    if (zSuffix === "Z" || !tzid) {
        return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
    }
    // TZID present: convert local time in that timezone to UTC
    return localToUtc(Number(y), Number(mo), Number(d), Number(h), Number(mi), Number(s), tzid);
}
/**
 * Converts a local datetime in a given IANA timezone to a UTC ISO 8601 string.
 * Uses Intl.DateTimeFormat to determine the correct UTC offset (handles DST).
 *
 * @param y - Year
 * @param mo - Month (1-12)
 * @param d - Day
 * @param h - Hour (0-23)
 * @param mi - Minute
 * @param s - Second
 * @param tzid - IANA timezone identifier (e.g. "America/Los_Angeles")
 * @returns ISO 8601 UTC string, or null if the timezone is invalid
 */ function localToUtc(y, mo, d, h, mi, s, tzid) {
    try {
        // Build a UTC Date from the local components as an initial guess
        const guessUtc = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
        // Determine what local time that UTC instant maps to in the given timezone
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: tzid,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
        const parts = formatter.formatToParts(guessUtc);
        const get = (type)=>Number(parts.find((p)=>p.type === type)?.value ?? "0");
        const localH = get("hour");
        const localMi = get("minute");
        const localS = get("second");
        const localD = get("day");
        const localMo = get("month");
        const localY = get("year");
        // Compute offset: difference between the local components we want and what
        // the guess mapped to. Adjust the guess by that delta.
        const wantMs = Date.UTC(y, mo - 1, d, h, mi, s);
        const gotLocalMs = Date.UTC(localY, localMo - 1, localD, localH, localMi, localS);
        const offsetMs = gotLocalMs - guessUtc.getTime();
        // The correct UTC time is: wanted_local - offset
        const correctUtc = new Date(wantMs - offsetMs);
        return correctUtc.toISOString().replace(/\.\d{3}Z$/, "Z");
    } catch (err) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("localToUtc: invalid timezone, falling back to UTC", {
            tzid,
            error: err instanceof Error ? err.message : String(err)
        });
        return `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}:${String(s).padStart(2, "0")}Z`;
    }
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/canvas-ical-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchCanvasICalAssignments",
    ()=>fetchCanvasICalAssignments,
    "parseCanvasICalEvents",
    ()=>parseCanvasICalEvents
]);
/**
 * Canvas iCal client — fetches a bCourses/Canvas calendar feed URL and
 * parses VEVENT entries into NormalizedAssignment objects for the sync engine.
 * Reuses iCal parsing patterns from pensieve-client.ts adapted for Canvas format.
 *
 * Canvas iCal SUMMARY format: "Title [CourseName]"
 * Canvas iCal UID format: "event-assignment-XXXXXXX"
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/ical-date-utils.ts [app-route] (ecmascript)");
;
;
/** Timeout in milliseconds for fetching the Canvas iCal feed. */ const FETCH_TIMEOUT_MS = 15_000;
async function fetchCanvasICalAssignments(calendarUrl) {
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchCanvasICalAssignments: fetching iCal feed", {
        url: calendarUrl.slice(0, 60)
    });
    const res = await fetch(calendarUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!res.ok) {
        throw new Error(`Canvas iCal fetch failed: ${res.status}`);
    }
    const icsText = await res.text();
    const assignments = parseCanvasICalEvents(icsText);
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchCanvasICalAssignments: parsed events", {
        count: assignments.length
    });
    return assignments;
}
function parseCanvasICalEvents(icsText) {
    const assignments = [];
    const eventBlocks = icsText.split("BEGIN:VEVENT");
    for(let i = 1; i < eventBlocks.length; i++){
        const block = eventBlocks[i].split("END:VEVENT")[0];
        if (!block) continue;
        // Unfold continuation lines (RFC 5545 Section 3.1)
        const unfolded = block.replace(/\r?\n[ \t]/g, "");
        const uid = extractProperty(unfolded, "UID");
        const summary = extractProperty(unfolded, "SUMMARY");
        const dtstart = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPropertyWithTzid"])(unfolded, "DTSTART");
        const dtend = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPropertyWithTzid"])(unfolded, "DTEND");
        const description = extractProperty(unfolded, "DESCRIPTION");
        const url = extractProperty(unfolded, "URL");
        if (!uid || !summary) continue;
        const endOrStart = dtend ?? dtstart;
        const dueDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDueDateWithTzid"])(endOrStart?.value ?? null, endOrStart?.tzid ?? null);
        const { title, courseName } = parseCanvasSummary(summary);
        // Extract external_id from UID (e.g. "event-assignment-8999055" → "8999055")
        const idMatch = uid.match(/event-assignment-(?:override-)?(\d+)/);
        const externalId = idMatch ? idMatch[1] : uid;
        assignments.push({
            external_id: externalId,
            course_name: courseName,
            course_id: "canvas-ical",
            title: unescapeICalText(title),
            due_date: dueDate,
            source_url: url || null,
            points_possible: null,
            is_submitted: false,
            description: description ? unescapeICalText(description).trim() || null : null
        });
    }
    return assignments;
}
/**
 * Parses a Canvas iCal SUMMARY into title and course name.
 * Canvas format: "Assignment Title [Course Name]"
 *
 * @param summary - Raw SUMMARY value
 * @returns Object with title and courseName
 */ function parseCanvasSummary(summary) {
    const match = summary.match(/^(.+?)\s*\[(.+)\]\s*$/);
    if (match) {
        return {
            title: match[1].trim(),
            courseName: match[2].trim()
        };
    }
    return {
        title: summary,
        courseName: "Canvas"
    };
}
/**
 * Extracts a single property value from an unfolded iCal VEVENT block.
 *
 * @param block - Unfolded iCal text block
 * @param property - Property name to extract
 * @returns The property value, or null if not found
 */ function extractProperty(block, property) {
    const regex = new RegExp(`^${property}(?:;[^:]*)?:(.*)$`, "m");
    const match = block.match(regex);
    return match ? match[1].trim() : null;
}
/**
 * Unescapes iCal text per RFC 5545 Section 3.3.11.
 *
 * @param text - Escaped iCal text
 * @returns Unescaped plain text
 */ function unescapeICalText(text) {
    return text.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/node:assert [external] (node:assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:assert", () => require("node:assert"));

module.exports = mod;
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:querystring [external] (node:querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:querystring", () => require("node:querystring"));

module.exports = mod;
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:tls [external] (node:tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:tls", () => require("node:tls"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}),
"[externals]/node:util/types [external] (node:util/types, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util/types", () => require("node:util/types"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:worker_threads [external] (node:worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:worker_threads", () => require("node:worker_threads"));

module.exports = mod;
}),
"[externals]/node:http2 [external] (node:http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http2", () => require("node:http2"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:console [external] (node:console, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:console", () => require("node:console"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:timers [external] (node:timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:timers", () => require("node:timers"));

module.exports = mod;
}),
"[externals]/node:dns [external] (node:dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:dns", () => require("node:dns"));

module.exports = mod;
}),
"[project]/.claude/worktrees/claude-work/src/lib/gradescope-parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseAssignmentsFromHtml",
    ()=>parseAssignmentsFromHtml,
    "parseAssignmentsFromReactProps",
    ()=>parseAssignmentsFromReactProps,
    "parseGradescopeDate",
    ()=>parseGradescopeDate
]);
/**
 * Gradescope parsing utilities — React props JSON (instructor) + HTML scraping (student).
 * @module gradescope-parser
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/cheerio/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cheerio/dist/esm/load-parse.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
;
const GRADESCOPE_BASE = "https://www.gradescope.com";
function parseGradescopeDate(raw) {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const gsMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([+-]\d{4})$/);
    if (gsMatch) {
        const parsed = new Date(`${gsMatch[1]}T${gsMatch[2]}${gsMatch[3]}`);
        if (!isNaN(parsed.getTime())) return parsed.toISOString();
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d.toISOString();
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("parseGradescopeDate: could not parse", {
        raw
    });
    return null;
}
function parseAssignmentsFromReactProps(html, courseId, courseName) {
    const $ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["load"](html);
    const reactDiv = $('div[data-react-class="AssignmentsTable"]');
    if (!reactDiv.length) return null;
    const propsStr = reactDiv.attr("data-react-props");
    if (!propsStr) return null;
    let props;
    try {
        props = JSON.parse(propsStr);
    } catch  {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("parseAssignmentsFromReactProps: malformed JSON", {
            courseId
        });
        return null;
    }
    if (!Array.isArray(props.table_data)) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("parseAssignmentsFromReactProps: missing table_data", {
            courseId
        });
        return null;
    }
    const resolvedName = $(".courseHeader--title").text().trim() || courseName;
    const assignments = [];
    const seenIds = new Set();
    for (const item of props.table_data){
        if (!item.title || !item.id) continue;
        const externalId = String(item.id);
        if (seenIds.has(externalId)) continue;
        seenIds.add(externalId);
        const sourceUrl = item.url ? `${GRADESCOPE_BASE}${item.url}` : `${GRADESCOPE_BASE}/courses/${courseId}/assignments/${externalId}`;
        const dueDate = parseGradescopeDate(item.submission_window?.due_date ?? null);
        const lateDueDate = parseGradescopeDate(item.submission_window?.hard_due_date ?? null);
        let pointsPossible = null;
        if (item.total_points != null) {
            const p = parseFloat(String(item.total_points));
            if (!isNaN(p)) pointsPossible = p;
        }
        assignments.push({
            external_id: externalId,
            course_name: resolvedName,
            course_id: courseId,
            title: item.title,
            due_date: dueDate,
            late_due_date: lateDueDate,
            source_url: sourceUrl,
            points_possible: pointsPossible,
            is_submitted: false
        });
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("parseAssignmentsFromReactProps", {
        courseId,
        count: assignments.length
    });
    return assignments;
}
/** Extracts title and href from a table row. Tries: .table--primaryLink, <th>, first <a>. */ function extractTitleAndHref($row, $) {
    const primaryLink = $row.find(".table--primaryLink");
    if (primaryLink.length) {
        const title = primaryLink.text().trim();
        const href = primaryLink.find("a").first().attr("href") || "";
        if (title) return {
            title,
            href
        };
    }
    const thCell = $row.find("th").first();
    if (thCell.length) {
        const anchor = thCell.find("a").first();
        const title = anchor.length ? anchor.text().trim() : thCell.text().trim();
        const href = anchor.attr("href") || "";
        if (title) return {
            title,
            href
        };
    }
    const anchor = $row.find("a").first();
    if (anchor.length) {
        const title = anchor.text().trim();
        const href = anchor.attr("href") || "";
        if (title) return {
            title,
            href
        };
    }
    return null;
}
/** Extracts assignment ID from row. Tries: href, button data-attr, data-url, row id. */ function extractAssignmentId($row, href) {
    const idMatch = href.match(/\/assignments\/(\d+)/);
    if (idMatch) return {
        assignmentId: idMatch[1],
        href
    };
    const submitBtn = $row.find("button.js-submitAssignment, button[data-assignment-id]");
    if (submitBtn.length) {
        const id = submitBtn.attr("data-assignment-id") || "";
        if (id) return {
            assignmentId: id,
            href
        };
    }
    const dataUrl = $row.attr("data-url") || "";
    const dataIdMatch = dataUrl.match(/\/assignments\/(\d+)/);
    if (dataIdMatch) return {
        assignmentId: dataIdMatch[1],
        href: href || dataUrl
    };
    const rowId = $row.attr("id") || "";
    const rowIdMatch = rowId.match(/assignment[_-]?(\d+)/);
    if (rowIdMatch) return {
        assignmentId: rowIdMatch[1],
        href
    };
    return {
        assignmentId: "",
        href
    };
}
/** Detects submission status from score badges, status text, row classes, and grade cells. */ function detectSubmissionStatus($row) {
    if ($row.find(".submissionStatus--score").length > 0) return true;
    const statusText = $row.find(".submissionStatus--text").text().toLowerCase();
    if (statusText.includes("submitted") || statusText.includes("graded")) return true;
    if (($row.attr("class") || "").includes("submitted")) return true;
    let hasGrade = false;
    $row.find("td").each((_, cell)=>{
        const text = $row.find(cell).text().trim();
        if (/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(text)) hasGrade = true;
    });
    return hasGrade;
}
function parseAssignmentsFromHtml(html, courseId, courseName) {
    const $ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["load"](html);
    const assignments = [];
    const seenIds = new Set();
    const resolvedName = $(".courseHeader--title").text().trim() || courseName;
    const rows = $('tr[role="row"], tbody > tr');
    rows.each((_, row)=>{
        const $row = $(row);
        // Skip header rows
        if ($row.find("th").length > 0 && $row.closest("thead").length > 0) return;
        if ($row.children("th").length === $row.children().length) {
            const hasDatetime = $row.find("[datetime]").length > 0;
            const hasLink = $row.find("a[href*='/assignments/']").length > 0;
            if (!hasDatetime && !hasLink) return;
        }
        const extracted = extractTitleAndHref($row, $);
        if (!extracted) return;
        const { title } = extracted;
        let { href } = extracted;
        const { assignmentId, href: updatedHref } = extractAssignmentId($row, href);
        href = updatedHref;
        const externalId = assignmentId ? assignmentId : `gs-${courseId}-${title.replace(/\s+/g, "-")}`;
        if (seenIds.has(externalId)) return;
        seenIds.add(externalId);
        let sourceUrl = null;
        if (href) {
            sourceUrl = href.startsWith("http") ? href : `${GRADESCOPE_BASE}${href}`;
        } else if (assignmentId) {
            sourceUrl = `${GRADESCOPE_BASE}/courses/${courseId}/assignments/${assignmentId}/submissions`;
        }
        const isSubmitted = detectSubmissionStatus($row);
        const dueDateEls = $row.find(".submissionTimeChart--dueDate");
        let rawDate = dueDateEls.length >= 1 ? dueDateEls.eq(0).attr("datetime") || null : null;
        let rawLateDueDate = dueDateEls.length >= 2 ? dueDateEls.eq(1).attr("datetime") || null : null;
        if (!rawDate) {
            const datetimeEls = $row.find("[datetime]").filter((_, el)=>{
                const cls = ($(el).attr("class") || "").toLowerCase();
                const parentCls = ($(el).parent().attr("class") || "").toLowerCase();
                return !cls.includes("release") && !parentCls.includes("release") && !cls.includes("open") && !parentCls.includes("open");
            });
            if (datetimeEls.length >= 2) {
                rawDate = datetimeEls.eq(1).attr("datetime") || null;
                if (datetimeEls.length >= 3) {
                    rawLateDueDate = datetimeEls.eq(2).attr("datetime") || null;
                }
            }
        }
        const dueDate = parseGradescopeDate(rawDate);
        const lateDueDate = parseGradescopeDate(rawLateDueDate);
        let pointsPossible = null;
        const scoreBadge = $row.find(".submissionStatus--score, .points-column").text().trim();
        const gradeMatch = scoreBadge.match(/([\d.]+)\s*\/\s*([\d.]+)/);
        if (gradeMatch) {
            const parsed = parseFloat(gradeMatch[2]);
            pointsPossible = isNaN(parsed) ? null : parsed;
        } else if (scoreBadge) {
            const simpleMatch = scoreBadge.match(/([\d.]+)/);
            if (simpleMatch) {
                const parsed = parseFloat(simpleMatch[1]);
                pointsPossible = isNaN(parsed) ? null : parsed;
            }
        }
        if (pointsPossible === null) {
            $row.find("td").each((_, cell)=>{
                if (pointsPossible !== null) return;
                const text = $(cell).text().trim();
                const cellGrade = text.match(/^([\d.]+)\s*\/\s*([\d.]+)$/);
                if (cellGrade) {
                    const parsed = parseFloat(cellGrade[2]);
                    if (!isNaN(parsed)) pointsPossible = parsed;
                }
            });
        }
        assignments.push({
            external_id: externalId,
            course_name: resolvedName,
            course_id: courseId,
            title,
            due_date: dueDate,
            late_due_date: lateDueDate,
            source_url: sourceUrl,
            points_possible: pointsPossible,
            is_submitted: isSubmitted
        });
    });
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("parseAssignmentsFromHtml", {
        courseId,
        count: assignments.length
    });
    return assignments;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/gradescope-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchAllGradescopeAssignments",
    ()=>fetchAllGradescopeAssignments,
    "fetchGradescopeAssignments",
    ()=>fetchGradescopeAssignments,
    "fetchGradescopeAssignmentsForCourses",
    ()=>fetchGradescopeAssignmentsForCourses,
    "fetchGradescopeCourses",
    ()=>fetchGradescopeCourses,
    "gradescopeLogin",
    ()=>gradescopeLogin
]);
/**
 * Gradescope HTTP client for fetching courses and assignments.
 * Uses cookie-based session auth — no official API exists.
 * Server-side only — do not import in client components.
 *
 * Parsing logic is delegated to gradescope-parser.ts:
 *   - React props JSON (instructor view) — structured, reliable
 *   - HTML table scraping (student view) — CSS-selector-based fallback
 *
 * @module gradescope-client
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/cheerio/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cheerio/dist/esm/load-parse.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tough$2d$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tough-cookie/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fetch$2d$cookie$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/fetch-cookie/esm/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gradescope$2d$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/gradescope-parser.ts [app-route] (ecmascript)");
;
;
;
;
;
const GRADESCOPE_BASE = "https://www.gradescope.com";
/**
 * Strips HTML tags, trims whitespace, and caps length for extracted text.
 * Prevents injection via course/assignment names scraped from Gradescope HTML.
 *
 * @param raw - Raw text extracted from HTML elements
 * @param maxLength - Maximum character length (default 200)
 * @returns Sanitized text
 */ function sanitizeExtractedText(raw, maxLength = 200) {
    return raw.replace(/<[^>]*>/g, "").trim().slice(0, maxLength);
}
/** Timeout in milliseconds for external Gradescope HTTP calls. */ const FETCH_TIMEOUT_MS = 30_000;
async function gradescopeLogin(email, password) {
    const jar = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tough$2d$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CookieJar"]();
    const fetchWithCookies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fetch$2d$cookie$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(fetch, jar);
    const loginPageRes = await fetchWithCookies(`${GRADESCOPE_BASE}/login`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!loginPageRes.ok) {
        throw new Error(`Gradescope login page returned ${loginPageRes.status}`);
    }
    const loginPageHtml = await loginPageRes.text();
    const $ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["load"](loginPageHtml);
    const csrfToken = $('meta[name="csrf-token"]').attr("content") || $('input[name="authenticity_token"]').attr("value");
    if (!csrfToken) {
        throw new Error("Could not extract CSRF token from Gradescope. The page structure may have changed.");
    }
    const loginRes = await fetchWithCookies(`${GRADESCOPE_BASE}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRF-Token": csrfToken
        },
        body: new URLSearchParams({
            "session[email]": email,
            "session[password]": password,
            "session[remember_me]": "1",
            authenticity_token: csrfToken
        }).toString(),
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (loginRes.status !== 302) {
        throw new Error("Gradescope login failed. Check your email and password. " + "If you sign in with Google or SSO, you'll need to reset your Gradescope password first.");
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("gradescopeLogin", {
        email,
        success: true
    });
    return jar;
}
async function fetchGradescopeCourses(jar) {
    const fetchWithCookies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fetch$2d$cookie$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(fetch, jar);
    const dashboardRes = await fetchWithCookies(GRADESCOPE_BASE, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!dashboardRes.ok) {
        throw new Error(`Gradescope dashboard returned ${dashboardRes.status}`);
    }
    const html = await dashboardRes.text();
    if (html.length > 10_000_000) {
        throw new Error("Gradescope dashboard HTML response too large (>10MB)");
    }
    const $ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["load"](html);
    const courses = [];
    const seen = new Set();
    const courseLists = $(".courseList--coursesForTerm");
    let courseBoxes = $(".courseBox");
    if (courseLists.length > 1) {
        const accountText = $("#account-show").text();
        if (accountText.includes("Instructor Courses")) {
            courseBoxes = courseLists.eq(1).find(".courseBox");
        } else {
            courseBoxes = courseLists.first().find(".courseBox");
        }
    } else if (courseLists.length === 1) {
        courseBoxes = courseLists.first().find(".courseBox");
    }
    if (courseBoxes.length > 0) {
        courseBoxes.each((_, el)=>{
            const href = $(el).attr("href") || $(el).find("a").attr("href") || "";
            const match = href.match(/\/courses\/(\d+)/);
            if (!match) return;
            const id = match[1];
            if (seen.has(id)) return;
            seen.add(id);
            const shortName = sanitizeExtractedText($(el).find(".courseBox--shortname").text());
            const name = sanitizeExtractedText($(el).find(".courseBox--name").text() || $(el).text());
            courses.push({
                id,
                name: name || shortName || `Course ${id}`,
                shortName
            });
        });
    } else {
        $('a[href^="/courses/"]').each((_, el)=>{
            const href = $(el).attr("href") || "";
            const match = href.match(/^\/courses\/(\d+)/);
            if (!match) return;
            const id = match[1];
            if (seen.has(id)) return;
            seen.add(id);
            const shortName = sanitizeExtractedText($(el).find(".courseBox--shortname").text());
            const name = sanitizeExtractedText($(el).find(".courseBox--name").text() || $(el).text());
            courses.push({
                id,
                name: name || shortName || `Course ${id}`,
                shortName
            });
        });
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchGradescopeCourses", {
        count: courses.length
    });
    return courses;
}
async function fetchGradescopeAssignments(jar, courseId, courseName) {
    const fetchWithCookies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fetch$2d$cookie$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(fetch, jar);
    const pageRes = await fetchWithCookies(`${GRADESCOPE_BASE}/courses/${courseId}`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!pageRes.ok) {
        throw new Error(`Gradescope course page ${courseId} returned ${pageRes.status}`);
    }
    const html = await pageRes.text();
    if (html.length > 10_000_000) {
        throw new Error(`Gradescope course page ${courseId} HTML response too large (>10MB)`);
    }
    // Strategy 1: React props JSON (instructor/TA view — structured, reliable)
    const reactResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gradescope$2d$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAssignmentsFromReactProps"])(html, courseId, courseName);
    if (reactResults !== null) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchGradescopeAssignments", {
            courseId,
            strategy: "react-props",
            count: reactResults.length
        });
        return reactResults;
    }
    // Strategy 2: HTML table scraping (student view — CSS-selector-based)
    const htmlResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gradescope$2d$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAssignmentsFromHtml"])(html, courseId, courseName);
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchGradescopeAssignments", {
        courseId,
        strategy: "html-scraping",
        count: htmlResults.length
    });
    return htmlResults;
}
async function fetchAllGradescopeAssignments(email, password) {
    const jar = await gradescopeLogin(email, password);
    const courses = await fetchGradescopeCourses(jar);
    const results = [];
    for (const course of courses){
        try {
            const assignments = await fetchGradescopeAssignments(jar, course.id, course.name);
            results.push(...assignments);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("Failed to fetch Gradescope assignments for course", {
                courseId: course.id,
                courseName: course.name,
                error: err instanceof Error ? err.message : String(err)
            });
        }
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchAllGradescopeAssignments", {
        totalAssignments: results.length
    });
    return results;
}
async function fetchGradescopeAssignmentsForCourses(email, password, selectedCourses) {
    const jar = await gradescopeLogin(email, password);
    const results = [];
    for (const course of selectedCourses){
        try {
            const assignments = await fetchGradescopeAssignments(jar, course.id, course.name);
            results.push(...assignments);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("Failed to fetch Gradescope assignments for selected course", {
                courseId: course.id,
                courseName: course.name,
                error: err instanceof Error ? err.message : String(err)
            });
        }
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchGradescopeAssignmentsForCourses", {
        courseCount: selectedCourses.length,
        totalAssignments: results.length
    });
    return results;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/pensieve-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PENSIEVE_COLOR",
    ()=>PENSIEVE_COLOR,
    "fetchPensieveAssignments",
    ()=>fetchPensieveAssignments,
    "parseICalEvents",
    ()=>parseICalEvents
]);
/**
 * Pensieve iCal client — fetches a Pensieve .ics calendar URL and parses
 * VEVENT entries into NormalizedAssignment objects for the sync engine.
 * Server-side only — called from sync-engine.ts.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/ical-date-utils.ts [app-route] (ecmascript)");
;
;
/** Timeout in milliseconds for fetching the Pensieve iCal feed. */ const FETCH_TIMEOUT_MS = 15_000;
const PENSIEVE_COLOR = "#8B5CF6";
async function fetchPensieveAssignments(calendarUrl) {
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchPensieveAssignments: fetching iCal feed", {
        url: calendarUrl.slice(0, 60)
    });
    const res = await fetch(calendarUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!res.ok) {
        throw new Error(`Pensieve calendar fetch failed: ${res.status}`);
    }
    const icsText = await res.text();
    const assignments = parseICalEvents(icsText);
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchPensieveAssignments: parsed events", {
        count: assignments.length
    });
    return assignments;
}
function parseICalEvents(icsText) {
    const assignments = [];
    // Split into VEVENT blocks
    const eventBlocks = icsText.split("BEGIN:VEVENT");
    for(let i = 1; i < eventBlocks.length; i++){
        const block = eventBlocks[i].split("END:VEVENT")[0];
        if (!block) continue;
        // Unfold continuation lines (RFC 5545 Section 3.1)
        const unfolded = block.replace(/\r?\n[ \t]/g, "");
        const uid = extractProperty(unfolded, "UID");
        const summary = extractProperty(unfolded, "SUMMARY");
        const dtstart = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPropertyWithTzid"])(unfolded, "DTSTART");
        const dtend = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPropertyWithTzid"])(unfolded, "DTEND");
        const description = extractProperty(unfolded, "DESCRIPTION");
        const url = extractProperty(unfolded, "URL");
        const status = extractProperty(unfolded, "STATUS");
        if (!uid || !summary) continue;
        const isSubmitted = detectSubmitted(status, description);
        // Log raw iCal fields for debugging submission detection
        if (status || description) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("parseICalEvents: VEVENT fields", {
                uid: uid?.slice(0, 30),
                summary: summary?.slice(0, 50),
                status,
                descriptionSnippet: description?.slice(0, 100),
                isSubmitted
            });
        }
        // Parse the due date from DTSTART or DTEND
        const endOrStart = dtend ?? dtstart;
        const dueDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDueDateWithTzid"])(endOrStart?.value ?? null, endOrStart?.tzid ?? null);
        // Extract late_due_date from description before cleaning
        let lateDueDate = null;
        if (description) {
            const lateDueMatch = description.match(/late\s*due[:\s]+(\S+)/i);
            if (lateDueMatch) {
                const candidate = lateDueMatch[1];
                // Validate it looks like a date (ISO format or iCal YYYYMMDD/YYYYMMDDTHHmmss)
                const isValidDate = /^\d{4}-\d{2}-\d{2}/.test(candidate) || /^\d{8}(T\d{6}Z?)?$/.test(candidate);
                lateDueDate = isValidDate ? candidate : null;
            }
        }
        // Strip redundant Class/Late due lines from description
        let cleanDescription = null;
        if (description) {
            cleanDescription = unescapeICalText(description).replace(/^class:\s*.+$/gim, "").replace(/^late\s*due[:\s]+\S+$/gim, "").trim() || null;
        }
        const courseName = extractCourseName(summary, description);
        // Strip course name suffix from title (e.g. "Assignment 1 - test_testcourse" → "Assignment 1")
        let cleanTitle = unescapeICalText(summary);
        if (courseName && courseName !== "Pensive") {
            cleanTitle = cleanTitle.replace(new RegExp(`\\s*[-–—]\\s*${escapeRegExp(courseName)}\\s*$`, "i"), "").trim();
        }
        assignments.push({
            external_id: `pensieve-${uid}`,
            course_name: courseName,
            course_id: "pensieve",
            title: cleanTitle,
            due_date: dueDate,
            late_due_date: lateDueDate,
            source_url: url || null,
            points_possible: null,
            is_submitted: isSubmitted,
            description: cleanDescription
        });
    }
    return assignments;
}
/**
 * Detects whether a Pensieve assignment has been submitted.
 * Checks the iCal STATUS property and description for submission indicators.
 *
 * @param status - The VEVENT STATUS property value (e.g. "COMPLETED", "CONFIRMED")
 * @param description - The VEVENT DESCRIPTION value (may contain "submitted", "graded")
 * @returns true if the assignment appears to have been submitted
 */ function detectSubmitted(status, description) {
    if (status) {
        const s = status.toUpperCase();
        if (s === "COMPLETED" || s === "CANCELLED") return true;
    }
    if (description) {
        // Unescape iCal text so \n becomes real newline for accurate word boundary matching
        const text = unescapeICalText(description);
        if (/\b(submitted|graded|completed)\b/i.test(text)) return true;
    }
    return false;
}
/**
 * Extracts a single property value from an unfolded iCal VEVENT block.
 * Handles properties with parameters (e.g. DTSTART;VALUE=DATE:20260215).
 *
 * @param block - Unfolded iCal text block
 * @param property - Property name to extract (e.g. "SUMMARY", "DTSTART")
 * @returns The property value, or null if not found
 */ function extractProperty(block, property) {
    // Match PROPERTY:value or PROPERTY;params:value
    const regex = new RegExp(`^${property}(?:;[^:]*)?:(.*)$`, "m");
    const match = block.match(regex);
    return match ? match[1].trim() : null;
}
/**
 * Attempts to extract a course name from the event summary or description.
 * Pensieve events often have format "Course Name: Assignment Title" or similar.
 *
 * @param summary - VEVENT SUMMARY value
 * @param description - VEVENT DESCRIPTION value (optional)
 * @returns Extracted course name, or "Pensive" as fallback
 */ function extractCourseName(summary, description) {
    // Try "Course: Assignment" pattern in summary
    const colonIdx = summary.indexOf(":");
    if (colonIdx > 0 && colonIdx < summary.length - 1) {
        const prefix = summary.slice(0, colonIdx).trim();
        // Only use as course name if it looks like a course code (contains a number
        // or matches common patterns like "CS 61A", "MATH 54", "EECS 16B").
        // This prevents greedy extraction where "Homework: Part 1" yields "Homework".
        const looksLikeCourseCode = /\d/.test(prefix) || /^[A-Z]{2,6}\s+\d/i.test(prefix);
        if (looksLikeCourseCode && prefix.length > 0 && prefix.length < 40 && !prefix.includes("//")) {
            return unescapeICalText(prefix);
        }
    }
    // Try extracting from description (stop at iCal \n escape to avoid capturing extra lines)
    if (description) {
        const courseMatch = description.match(/(?:course|class):\s*(.+?)(?:\\n|$)/i);
        if (courseMatch) {
            return unescapeICalText(courseMatch[1].trim());
        }
    }
    // Try "Title - CourseName" suffix pattern in summary
    const dashMatch = summary.match(/\s+[-–—]\s+(.+)$/);
    if (dashMatch) {
        return unescapeICalText(dashMatch[1].trim());
    }
    return "Pensive";
}
/**
 * Escapes special regex characters in a string for safe use in RegExp constructor.
 *
 * @param str - Raw string to escape
 * @returns Escaped string safe for RegExp
 */ function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
 * Unescapes iCal text per RFC 5545 Section 3.3.11.
 *
 * @param text - Escaped iCal text
 * @returns Unescaped plain text
 */ function unescapeICalText(text) {
    return text.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/brightspace-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchBrightspaceAssignments",
    ()=>fetchBrightspaceAssignments,
    "parseBrightspaceEvents",
    ()=>parseBrightspaceEvents
]);
/**
 * Brightspace (D2L) iCal client — fetches a Brightspace calendar feed URL and
 * parses VEVENT entries into NormalizedAssignment objects for the sync engine.
 *
 * Brightspace iCal feeds follow standard iCal format. SUMMARY may use:
 *   - "Title - CourseName"
 *   - "Title [CourseName]"
 *   - Just "Title"
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/ical-date-utils.ts [app-route] (ecmascript)");
;
;
const FETCH_TIMEOUT_MS = 15_000;
async function fetchBrightspaceAssignments(calendarUrl) {
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchBrightspaceAssignments: fetching iCal feed", {
        url: calendarUrl.slice(0, 60)
    });
    const res = await fetch(calendarUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!res.ok) {
        throw new Error(`Brightspace iCal fetch failed: ${res.status}`);
    }
    const icsText = await res.text();
    const assignments = parseBrightspaceEvents(icsText);
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("fetchBrightspaceAssignments: parsed events", {
        count: assignments.length
    });
    return assignments;
}
function parseBrightspaceEvents(icsText) {
    const assignments = [];
    const eventBlocks = icsText.split("BEGIN:VEVENT");
    for(let i = 1; i < eventBlocks.length; i++){
        const block = eventBlocks[i].split("END:VEVENT")[0];
        if (!block) continue;
        // Unfold continuation lines (RFC 5545 Section 3.1)
        const unfolded = block.replace(/\r?\n[ \t]/g, "");
        const uid = extractProperty(unfolded, "UID");
        const summary = extractProperty(unfolded, "SUMMARY");
        const dtstart = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPropertyWithTzid"])(unfolded, "DTSTART");
        const dtend = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPropertyWithTzid"])(unfolded, "DTEND");
        const description = extractProperty(unfolded, "DESCRIPTION");
        const url = extractProperty(unfolded, "URL");
        const categories = extractProperty(unfolded, "CATEGORIES");
        if (!uid || !summary) continue;
        const endOrStart = dtend ?? dtstart;
        const dueDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$ical$2d$date$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDueDateWithTzid"])(endOrStart?.value ?? null, endOrStart?.tzid ?? null);
        const { title, courseName } = parseBrightspaceSummary(summary, categories);
        // Use UID as external_id, strip any common prefixes
        const externalId = uid.replace(/^.*?(\d+).*$/, "$1") || uid;
        assignments.push({
            external_id: `bs-${externalId}`,
            course_name: courseName,
            course_id: "brightspace",
            title: unescapeICalText(title),
            due_date: dueDate,
            source_url: url || null,
            points_possible: null,
            is_submitted: false,
            description: description ? unescapeICalText(description).trim() || null : null
        });
    }
    return assignments;
}
/**
 * Parses a Brightspace SUMMARY into title and course name.
 * Tries multiple formats:
 *   - "Title [CourseName]" (Canvas-like)
 *   - "Title - CourseName" (Brightspace common)
 *   - Falls back to CATEGORIES for course name
 *
 * @param summary - Raw SUMMARY value
 * @param categories - Optional CATEGORIES value (often contains course name)
 * @returns Object with title and courseName
 */ function parseBrightspaceSummary(summary, categories) {
    // Try [CourseName] format first
    const bracketMatch = summary.match(/^(.+?)\s*\[(.+)\]\s*$/);
    if (bracketMatch) {
        return {
            title: bracketMatch[1].trim(),
            courseName: bracketMatch[2].trim()
        };
    }
    // Try "Title - CourseName" format (only if dash has spaces around it)
    const dashMatch = summary.match(/^(.+?)\s+-\s+(.+)$/);
    if (dashMatch) {
        return {
            title: dashMatch[1].trim(),
            courseName: dashMatch[2].trim()
        };
    }
    // Fall back to CATEGORIES if available
    if (categories) {
        return {
            title: summary,
            courseName: categories.trim()
        };
    }
    return {
        title: summary,
        courseName: "Brightspace"
    };
}
/**
 * Extracts a single property value from an unfolded iCal VEVENT block.
 */ function extractProperty(block, property) {
    const regex = new RegExp(`^${property}(?:;[^:]*)?:(.*)$`, "m");
    const match = block.match(regex);
    return match ? match[1].trim() : null;
}
/**
 * Unescapes iCal text values (e.g. \\n → newline, \\, → comma).
 */ function unescapeICalText(text) {
    return text.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\\\/g, "\\").replace(/\\;/g, ";");
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/.claude/worktrees/claude-work/src/lib/crypto.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decrypt",
    ()=>decrypt,
    "encrypt",
    ()=>encrypt
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
/**
 * Returns the 32-byte encryption key from the environment variable.
 * Throws if the key is missing or invalid length.
 *
 * @returns Buffer containing the encryption key
 * @throws Error if CREDENTIALS_ENCRYPTION_KEY is not set or invalid
 */ function getKey() {
    const hex = process.env.CREDENTIALS_ENCRYPTION_KEY;
    if (!hex) {
        throw new Error("CREDENTIALS_ENCRYPTION_KEY environment variable is not set");
    }
    const key = Buffer.from(hex, "hex");
    if (key.length !== 32) {
        throw new Error("CREDENTIALS_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)");
    }
    return key;
}
function encrypt(plaintext) {
    const key = getKey();
    const iv = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomBytes"])(IV_LENGTH);
    const cipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createCipheriv"])(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    // Format: base64(iv) + ":" + base64(authTag) + ":" + base64(ciphertext)
    return [
        iv.toString("base64"),
        authTag.toString("base64"),
        encrypted.toString("base64")
    ].join(":");
}
function decrypt(encryptedStr) {
    const key = getKey();
    const parts = encryptedStr.split(":");
    if (parts.length !== 3) {
        throw new Error("Failed to decrypt credentials. Please re-authenticate.");
    }
    const iv = Buffer.from(parts[0], "base64");
    const authTag = Buffer.from(parts[1], "base64");
    const ciphertext = Buffer.from(parts[2], "base64");
    const decipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createDecipheriv"])(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);
    return decrypted.toString("utf8");
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/canvas-url-validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isAllowedCanvasUrl",
    ()=>isAllowedCanvasUrl
]);
/**
 * Canvas URL validation for SSRF prevention.
 * Allows any HTTPS URL that isn't a known internal/private address.
 * If the URL isn't actually a Canvas instance, the sync will simply fail.
 */ /** Hostnames that must never be contacted (SSRF prevention). */ const BLOCKED_HOSTNAMES = new Set([
    "localhost",
    "0.0.0.0",
    "[::1]"
]);
function isAllowedCanvasUrl(url) {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") return false;
        const hostname = parsed.hostname.toLowerCase();
        // Block known internal hostnames
        if (BLOCKED_HOSTNAMES.has(hostname)) return false;
        // Block private/internal IP ranges
        if (hostname.startsWith("127.") || hostname.startsWith("10.") || hostname.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) {
            return false;
        }
        return true;
    } catch  {
        return false;
    }
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/supabase/admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAdminClient",
    ()=>createAdminClient
]);
/**
 * Creates a Supabase client with the service role key to bypass RLS.
 * Only used by the calendar feed endpoint where no user session is available.
 *
 * @returns Supabase admin client instance
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not set
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
function createAdminClient() {
    const url = ("TURBOPACK compile-time value", "https://dcoowflhqsfggtmnzxfn.supabase.co");
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/course-enrollment.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Auto-enrolls users into normalized course records during sync.
 * Courses are deduped by (source, external_id) — the platform's stable course ID —
 * so display-name changes never split users into different boards.
 *
 * Uses the admin client to bypass RLS for upserts (courses table is read-only
 * for regular users).
 *
 * @module course-enrollment
 */ __turbopack_context__.s([
    "gatherEnrollableCourses",
    ()=>gatherEnrollableCourses,
    "syncCourseEnrollments",
    ()=>syncCourseEnrollments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
async function syncCourseEnrollments(adminClient, userId, courses) {
    if (courses.length === 0) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncCourseEnrollments: no courses to enroll", {
            userId
        });
        return 0;
    }
    // Deduplicate input by (source, external_id) — take last occurrence (most recent name)
    const deduped = new Map();
    for (const c of courses){
        deduped.set(`${c.source}:${c.external_id}`, c);
    }
    const uniqueCourses = Array.from(deduped.values());
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncCourseEnrollments: upserting courses", {
        userId,
        courseCount: uniqueCourses.length
    });
    // Upsert courses — update name on conflict so display stays current
    const courseRows = uniqueCourses.map((c)=>({
            source: c.source,
            external_id: c.external_id,
            name: c.name
        }));
    const { error: courseError } = await adminClient.from("courses").upsert(courseRows, {
        onConflict: "source,external_id"
    });
    if (courseError) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("syncCourseEnrollments: course upsert failed", {
            userId,
            error: courseError.message
        });
        return 0;
    }
    // Fetch the course IDs for the upserted courses
    const courseIds = [];
    for (const c of uniqueCourses){
        const { data, error } = await adminClient.from("courses").select("id").eq("source", c.source).eq("external_id", c.external_id).single();
        if (error || !data) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("syncCourseEnrollments: could not find course after upsert", {
                userId,
                source: c.source,
                external_id: c.external_id,
                error: error?.message
            });
            continue;
        }
        courseIds.push(data.id);
    }
    if (courseIds.length === 0) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("syncCourseEnrollments: no course IDs resolved", {
            userId
        });
        return 0;
    }
    // Upsert memberships — clear deleted_at on conflict so previously
    // soft-deleted memberships are restored when the user re-syncs a course.
    const membershipRows = courseIds.map((courseId)=>({
            user_id: userId,
            course_id: courseId,
            deleted_at: null
        }));
    const { error: membershipError } = await adminClient.from("course_memberships").upsert(membershipRows, {
        onConflict: "user_id,course_id"
    });
    if (membershipError) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("syncCourseEnrollments: membership upsert failed", {
            userId,
            error: membershipError.message
        });
        return 0;
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncCourseEnrollments: complete", {
        userId,
        coursesUpserted: uniqueCourses.length,
        membershipsCreated: courseIds.length
    });
    return courseIds.length;
}
function gatherEnrollableCourses(credentials) {
    const courses = [];
    const isIcal = !!credentials.canvas_ical_url;
    // Canvas primary account courses
    if (credentials.selected_canvas_courses) {
        for (const c of credentials.selected_canvas_courses){
            // iCal courses store id: 0 (no Canvas numeric ID available).
            // Use a stable hash of the name so each course gets a unique external_id.
            const externalId = isIcal || c.id === 0 ? `ical-${stableIdFromName(c.name)}` : String(c.id);
            courses.push({
                source: "canvas",
                external_id: externalId,
                name: c.name
            });
        }
    }
    // Gradescope courses
    if (credentials.selected_gradescope_courses) {
        for (const c of credentials.selected_gradescope_courses){
            courses.push({
                source: "gradescope",
                external_id: c.id,
                name: c.name
            });
        }
    }
    // Pensieve courses
    if (credentials.selected_pensieve_courses) {
        for (const c of credentials.selected_pensieve_courses){
            courses.push({
                source: "pensieve",
                external_id: c.id,
                name: c.name
            });
        }
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("gatherEnrollableCourses: collected platform courses", {
        canvas: credentials.selected_canvas_courses?.length ?? 0,
        gradescope: credentials.selected_gradescope_courses?.length ?? 0,
        pensieve: credentials.selected_pensieve_courses?.length ?? 0,
        isIcal,
        totalSoFar: courses.length
    });
    // Additional Canvas accounts — namespace external_id with account ID
    if (credentials.additional_canvas_accounts) {
        for (const account of credentials.additional_canvas_accounts){
            if (account.selected_courses) {
                const accountIsIcal = !!account.ical_url;
                for (const c of account.selected_courses){
                    const externalId = accountIsIcal || c.id === 0 ? `${account.id}:ical-${stableIdFromName(c.name)}` : `${account.id}:${String(c.id)}`;
                    courses.push({
                        source: "canvas",
                        external_id: externalId,
                        name: c.name
                    });
                }
            }
        }
    }
    return courses;
}
/**
 * Generates a stable positive numeric ID from a course name string.
 * Used for iCal courses which don't have a Canvas numeric course ID.
 * Uses djb2 hash to produce a unique, deterministic number.
 *
 * @param name - Course name string
 * @returns Positive 32-bit integer derived from the name
 */ function stableIdFromName(name) {
    let hash = 5381;
    for(let i = 0; i < name.length; i++){
        hash = (hash << 5) + hash + name.charCodeAt(i) | 0;
    }
    return Math.abs(hash);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/course-name-merge.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
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
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("course-name-merge: mapping course name", {
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
"[project]/.claude/worktrees/claude-work/src/lib/sync-engine.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Sync engine that orchestrates fetching assignments from Canvas and Gradescope,
 * then upserts them into the Supabase tasks table (unified with manual tasks).
 * Server-side only — called from API routes.
 */ __turbopack_context__.s([
    "runSync",
    ()=>runSync,
    "toLocalDateString",
    ()=>toLocalDateString,
    "toLocalTimeString",
    ()=>toLocalTimeString
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/canvas-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$ical$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/canvas-ical-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gradescope$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/gradescope-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$pensieve$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/pensieve-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$brightspace$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/brightspace-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/crypto.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$url$2d$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/canvas-url-validation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$enrollment$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/course-enrollment.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/course-name-merge.ts [app-route] (ecmascript)");
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
const UPSERT_BATCH_SIZE = 50;
/** Default color for Canvas assignments (blue). */ const CANVAS_COLOR = "#3B82F6";
/** Default color for Gradescope assignments (green). */ const GRADESCOPE_COLOR = "#10B981";
async function runSync(supabase, userId, timezone = "America/Los_Angeles", courseOverrides, forceGradescope = false, platforms) {
    // Fetch credentials
    const { data: creds, error: credsError } = await supabase.from("integration_credentials").select("canvas_token, canvas_token_created_at, canvas_base_url, canvas_ical_url, gradescope_email, gradescope_password_encrypted, gradescope_auth_failed, last_gradescope_synced_at, selected_canvas_courses, selected_gradescope_courses, selected_pensieve_courses, pensieve_calendar_url, brightspace_calendar_url, additional_canvas_accounts").eq("user_id", userId).single();
    if (credsError || !creds) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("runSync: no credentials found", {
            userId
        });
        return {
            canvas: {
                synced: 0,
                errors: [
                    "No integration credentials configured. Go to Settings to add them."
                ]
            },
            gradescope: {
                synced: 0,
                errors: []
            },
            pensieve: {
                synced: 0,
                errors: []
            },
            brightspace: {
                synced: 0,
                errors: []
            },
            last_synced_at: new Date().toISOString()
        };
    }
    const credentials = creds;
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("runSync: credentials loaded", {
        userId,
        hasCanvasToken: !!credentials.canvas_token,
        hasCanvasIcal: !!credentials.canvas_ical_url,
        hasGradescopeEmail: !!credentials.gradescope_email,
        hasPensieveUrl: !!credentials.pensieve_calendar_url,
        platforms: platforms ?? "all"
    });
    // Apply course overrides if provided
    if (courseOverrides?.canvas_courses) {
        credentials.selected_canvas_courses = courseOverrides.canvas_courses;
    }
    if (courseOverrides?.gradescope_courses) {
        credentials.selected_gradescope_courses = courseOverrides.gradescope_courses;
    }
    // Build cross-platform course name map so duplicate courses (e.g. "UGBA 101A"
    // on both Canvas and Gradescope) get the same canonical course_name on tasks.
    const enrollable = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$enrollment$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gatherEnrollableCourses"])(credentials);
    const courseNameMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCourseNameMap"])(enrollable);
    // Run syncs independently — only for requested platforms (default: all)
    const syncAll = !platforms || platforms.length === 0;
    const [canvasResult, gradescopeResult, pensieveResult, brightspaceResult] = await Promise.all([
        syncAll || platforms.includes("canvas") ? syncCanvas(supabase, userId, credentials, timezone, courseNameMap) : {
            synced: 0,
            errors: []
        },
        syncAll || platforms.includes("gradescope") ? syncGradescope(supabase, userId, credentials, timezone, forceGradescope, courseNameMap) : {
            synced: 0,
            errors: []
        },
        syncAll || platforms.includes("pensieve") ? syncPensieve(supabase, userId, credentials, timezone, courseNameMap) : {
            synced: 0,
            errors: []
        },
        syncAll || platforms.includes("brightspace") ? syncBrightspace(supabase, userId, credentials, timezone, courseNameMap) : {
            synced: 0,
            errors: []
        }
    ]);
    // Sync additional Canvas accounts (all run under the "canvas" platform flag)
    if (syncAll || platforms?.includes("canvas")) {
        const additionalAccounts = credentials.additional_canvas_accounts ?? [];
        for (const account of additionalAccounts){
            const result = await syncAdditionalCanvas(supabase, userId, account, timezone, courseNameMap);
            canvasResult.synced += result.synced;
            canvasResult.errors.push(...result.errors);
        }
    }
    // Update last_synced_at
    const now = new Date().toISOString();
    await supabase.from("integration_credentials").update({
        last_synced_at: now
    }).eq("user_id", userId);
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("runSync complete", {
        userId,
        canvasSynced: canvasResult.synced,
        canvasErrors: canvasResult.errors.length,
        gradescopeSynced: gradescopeResult.synced,
        gradescopeErrors: gradescopeResult.errors.length,
        pensieveSynced: pensieveResult.synced,
        pensieveErrors: pensieveResult.errors.length,
        brightspaceSynced: brightspaceResult.synced,
        brightspaceErrors: brightspaceResult.errors.length
    });
    // Auto-enroll user into discussion boards for their synced courses.
    // Uses (source, external_id) as dedup key so name changes don't split boards.
    try {
        const adminClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
        // Apply canonical names to enrollable courses so cross-platform duplicates
        // share the same display name in the courses table.
        const mergedEnrollable = enrollable.map((c)=>({
                ...c,
                name: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCanonicalName"])(c.name, courseNameMap)
            }));
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$enrollment$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncCourseEnrollments"])(adminClient, userId, mergedEnrollable);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("runSync: course enrollment failed (non-blocking)", {
            userId,
            error: message
        });
    // Enrollment failure is non-blocking — sync results are still valid
    }
    // Detect new Canvas courses the user hasn't selected yet
    let newCanvasCourses;
    if (credentials.canvas_token && Array.isArray(credentials.selected_canvas_courses) && credentials.selected_canvas_courses.length > 0) {
        try {
            const allCourses = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchCanvasCourses"])(credentials.canvas_token, credentials.canvas_base_url);
            const selectedIds = new Set(credentials.selected_canvas_courses.map((c)=>c.id));
            // Only flag current-term courses (Spring 2026 patterns)
            const termPatterns = [
                "Spring 2026",
                "SP26",
                "Sp26",
                "S'26",
                "S26",
                "sp2026",
                "Sp2026"
            ];
            const unselected = allCourses.filter((c)=>!selectedIds.has(c.id) && c.name && termPatterns.some((p)=>c.name.includes(p)));
            if (unselected.length > 0) {
                newCanvasCourses = unselected.map((c)=>({
                        id: c.id,
                        name: c.name
                    }));
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("runSync: detected new unselected Canvas courses", {
                    userId,
                    courses: newCanvasCourses.map((c)=>c.name)
                });
            }
        } catch  {
        // Non-blocking — don't fail sync if course detection fails
        }
    }
    return {
        canvas: canvasResult,
        gradescope: gradescopeResult,
        pensieve: pensieveResult,
        brightspace: brightspaceResult,
        last_synced_at: now,
        ...newCanvasCourses?.length ? {
            new_canvas_courses: newCanvasCourses
        } : {}
    };
}
/**
 * Syncs assignments from Canvas. Returns sync result with count and errors.
 */ async function syncCanvas(supabase, userId, creds, timezone, courseNameMap = new Map()) {
    if (!creds.canvas_ical_url && !creds.canvas_token) {
        return {
            synced: 0,
            errors: []
        };
    }
    // Check if Canvas API token has expired (120-day lifespan)
    if (creds.canvas_token && creds.canvas_token_created_at) {
        const TOKEN_LIFESPAN_MS = 120 * 24 * 60 * 60 * 1000; // 120 days
        const createdAt = new Date(creds.canvas_token_created_at).getTime();
        if (createdAt + TOKEN_LIFESPAN_MS < Date.now()) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("syncCanvas: canvas token expired", {
                userId
            });
            return {
                synced: 0,
                errors: [
                    "bCourses token expired. Reconnect in Settings."
                ]
            };
        }
    }
    try {
        let assignments;
        if (creds.canvas_ical_url) {
            // iCal feed path — filter by selected courses if set
            const selectedCourses = creds.selected_canvas_courses;
            if (Array.isArray(selectedCourses) && selectedCourses.length === 0) {
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncCanvas skipped: no courses selected (iCal)", {
                    userId
                });
                return {
                    synced: 0,
                    errors: []
                };
            }
            const allIcalAssignments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$ical$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchCanvasICalAssignments"])(creds.canvas_ical_url);
            if (selectedCourses && selectedCourses.length > 0) {
                const selectedNames = new Set(selectedCourses.map((c)=>c.name));
                assignments = allIcalAssignments.filter((a)=>selectedNames.has(a.course_name));
            } else {
                assignments = allIcalAssignments;
            }
        } else if (creds.canvas_token) {
            // API token path
            const selectedCourses = creds.selected_canvas_courses;
            // [] = user explicitly deselected all courses, sync nothing
            if (Array.isArray(selectedCourses) && selectedCourses.length === 0) {
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncCanvas skipped: no courses selected", {
                    userId
                });
                return {
                    synced: 0,
                    errors: []
                };
            }
            // null = no selection made yet, sync ALL courses
            // array with items = sync only selected courses
            assignments = selectedCourses && selectedCourses.length > 0 ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchCanvasAssignmentsForCourses"])(creds.canvas_token, creds.canvas_base_url, selectedCourses) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchAllCanvasAssignments"])(creds.canvas_token, creds.canvas_base_url);
        } else {
            return {
                synced: 0,
                errors: []
            };
        }
        // Apply canonical course names so cross-platform duplicates merge
        const merged = assignments.map((a)=>({
                ...a,
                course_name: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCanonicalName"])(a.course_name, courseNameMap)
            }));
        const result = await upsertAssignments(supabase, userId, "canvas", merged, timezone);
        return {
            synced: result.synced,
            errors: result.errors
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("syncCanvas failed", {
            userId,
            error: message
        });
        return {
            synced: 0,
            errors: [
                message
            ]
        };
    }
}
/**
 * Syncs assignments from an additional Canvas account.
 * Namespaces external_id as "<account_id>:<assignment_id>" to prevent
 * collisions with the primary bCourses integration and other accounts.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param account - The additional Canvas account to sync
 * @param timezone - IANA timezone for date/time conversion
 * @returns Sync result with count and errors
 */ async function syncAdditionalCanvas(supabase, userId, account, timezone, courseNameMap = new Map()) {
    if (!account.token && !account.ical_url) {
        return {
            synced: 0,
            errors: []
        };
    }
    try {
        let assignments;
        if (account.ical_url) {
            // iCal feed path
            assignments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$ical$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchCanvasICalAssignments"])(account.ical_url);
        } else if (account.token) {
            // Defense-in-depth: validate URL before making any outbound request
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$url$2d$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAllowedCanvasUrl"])(account.base_url)) {
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("syncAdditionalCanvas: rejected disallowed base_url", {
                    userId,
                    accountId: account.id,
                    baseUrl: account.base_url
                });
                return {
                    synced: 0,
                    errors: [
                        `${account.label}: URL not allowed (${account.base_url})`
                    ]
                };
            }
            const selectedCourses = account.selected_courses;
            // [] = user explicitly deselected all courses, sync nothing
            if (Array.isArray(selectedCourses) && selectedCourses.length === 0) {
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncAdditionalCanvas skipped: no courses selected", {
                    userId,
                    accountId: account.id
                });
                return {
                    synced: 0,
                    errors: []
                };
            }
            assignments = selectedCourses && selectedCourses.length > 0 ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchCanvasAssignmentsForCourses"])(account.token, account.base_url, selectedCourses) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchAllCanvasAssignments"])(account.token, account.base_url);
        } else {
            return {
                synced: 0,
                errors: []
            };
        }
        // Namespace external_id to prevent collisions with primary bCourses
        // and apply canonical course names for cross-platform merging
        const namespacedAssignments = assignments.map((a)=>({
                ...a,
                external_id: `${account.id}:${a.external_id}`,
                course_name: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCanonicalName"])(a.course_name, courseNameMap)
            }));
        const result = await upsertAssignments(supabase, userId, "canvas", namespacedAssignments, timezone);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncAdditionalCanvas complete", {
            userId,
            accountId: account.id,
            label: account.label,
            synced: result.synced
        });
        return {
            synced: result.synced,
            errors: result.errors
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("syncAdditionalCanvas failed", {
            userId,
            accountId: account.id,
            error: message
        });
        return {
            synced: 0,
            errors: [
                `${account.label}: ${message}`
            ]
        };
    }
}
/**
 * Syncs assignments from Gradescope. Returns sync result with count and errors.
 * Enforces a 1-hour cooldown between login attempts to prevent Gradescope's
 * security system from sending password reset emails due to frequent logins.
 * Supports course filtering via selected_gradescope_courses.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param creds - User's integration credentials
 * @param timezone - IANA timezone for date/time conversion
 * @param force - If true, bypasses the 1-hour cooldown (for manual syncs)
 * @returns Sync result with count and errors
 */ async function syncGradescope(supabase, userId, creds, timezone, force = false, courseNameMap = new Map()) {
    if (!creds.gradescope_email || !creds.gradescope_password_encrypted) {
        return {
            synced: 0,
            errors: []
        };
    }
    // Skip sync if previous auth failed — prevents spamming Gradescope with bad credentials
    if (creds.gradescope_auth_failed) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncGradescope skipped: auth previously failed", {
            userId
        });
        return {
            synced: 0,
            errors: [
                "Gradescope login failed. Please update your password in Settings."
            ]
        };
    }
    try {
        const password = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decrypt"])(creds.gradescope_password_encrypted);
        const selectedCourses = creds.selected_gradescope_courses;
        // null = no selection made yet (first time), sync all courses
        // [] = user explicitly deselected all courses, sync nothing
        if (Array.isArray(selectedCourses) && selectedCourses.length === 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncGradescope skipped: no courses selected", {
                userId
            });
            return {
                synced: 0,
                errors: []
            };
        }
        const assignments = selectedCourses && selectedCourses.length > 0 ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gradescope$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchGradescopeAssignmentsForCourses"])(creds.gradescope_email, password, selectedCourses) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gradescope$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchAllGradescopeAssignments"])(creds.gradescope_email, password);
        // Login succeeded — clear any previous auth failure flag before processing
        await supabase.from("integration_credentials").update({
            gradescope_auth_failed: false
        }).eq("user_id", userId);
        // Apply canonical course names for cross-platform merging
        const merged = assignments.map((a)=>({
                ...a,
                course_name: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCanonicalName"])(a.course_name, courseNameMap)
            }));
        const result = await upsertAssignments(supabase, userId, "gradescope", merged, timezone);
        // Update last Gradescope sync timestamp on success and clear auth failure flag
        await supabase.from("integration_credentials").update({
            last_gradescope_synced_at: new Date().toISOString(),
            gradescope_auth_failed: false
        }).eq("user_id", userId);
        return {
            synced: result.synced,
            errors: result.errors
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("syncGradescope failed", {
            userId,
            error: message
        });
        // If login failed, set flag to stop retrying on future auto-syncs
        if (message.toLowerCase().includes("login failed")) {
            await supabase.from("integration_credentials").update({
                gradescope_auth_failed: true
            }).eq("user_id", userId);
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("syncGradescope: marked auth as failed, stopping retries", {
                userId
            });
        }
        return {
            synced: 0,
            errors: [
                message
            ]
        };
    }
}
/**
 * Syncs assignments from Pensieve iCal calendar feed.
 * Returns sync result with count and errors.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param creds - User's integration credentials
 * @param timezone - IANA timezone for date/time conversion
 * @returns Sync result with count and errors
 */ async function syncPensieve(supabase, userId, creds, timezone, courseNameMap = new Map()) {
    if (!creds.pensieve_calendar_url) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncPensieve skipped: no calendar URL configured", {
            userId
        });
        return {
            synced: 0,
            errors: []
        };
    }
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncPensieve: fetching assignments", {
            userId,
            url: creds.pensieve_calendar_url.slice(0, 60)
        });
        let assignments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$pensieve$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchPensieveAssignments"])(creds.pensieve_calendar_url);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncPensieve: parsed assignments", {
            userId,
            count: assignments.length
        });
        // null = no selection made yet (first time), sync all courses
        // [] = user explicitly deselected all courses, sync nothing
        if (Array.isArray(creds.selected_pensieve_courses) && creds.selected_pensieve_courses.length === 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncPensieve skipped: no courses selected", {
                userId
            });
            return {
                synced: 0,
                errors: []
            };
        }
        if (creds.selected_pensieve_courses && creds.selected_pensieve_courses.length > 0) {
            const allowedNames = new Set(creds.selected_pensieve_courses.map((c)=>c.name));
            assignments = assignments.filter((a)=>a.course_name && allowedNames.has(a.course_name));
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncPensieve: filtered by selected courses", {
                userId,
                allowed: creds.selected_pensieve_courses.length,
                afterFilter: assignments.length
            });
        }
        // Apply canonical course names for cross-platform merging
        const merged = assignments.map((a)=>({
                ...a,
                course_name: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCanonicalName"])(a.course_name, courseNameMap)
            }));
        const result = await upsertAssignments(supabase, userId, "pensieve", merged, timezone);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncPensieve: upserted", {
            userId,
            synced: result.synced
        });
        return {
            synced: result.synced,
            errors: result.errors
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("syncPensieve failed", {
            userId,
            error: message
        });
        return {
            synced: 0,
            errors: [
                message
            ]
        };
    }
}
/**
 * Syncs assignments from Brightspace iCal calendar feed.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param creds - User's integration credentials
 * @param timezone - IANA timezone for date/time conversion
 * @returns Sync result with count and errors
 */ async function syncBrightspace(supabase, userId, creds, timezone, courseNameMap = new Map()) {
    if (!creds.brightspace_calendar_url) {
        return {
            synced: 0,
            errors: []
        };
    }
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncBrightspace: fetching assignments", {
            userId
        });
        const assignments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$brightspace$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchBrightspaceAssignments"])(creds.brightspace_calendar_url);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("syncBrightspace: parsed assignments", {
            userId,
            count: assignments.length
        });
        const merged = assignments.map((a)=>({
                ...a,
                course_name: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$course$2d$name$2d$merge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCanonicalName"])(a.course_name, courseNameMap)
            }));
        const result = await upsertAssignments(supabase, userId, "brightspace", merged, timezone);
        return {
            synced: result.synced,
            errors: result.errors
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("syncBrightspace failed", {
            userId,
            error: message
        });
        return {
            synced: 0,
            errors: [
                message
            ]
        };
    }
}
function toLocalDateString(isoString, tz) {
    if (!isoString) return null;
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return null;
        return new Intl.DateTimeFormat("en-CA", {
            timeZone: tz
        }).format(d);
    } catch  {
        return null;
    }
}
function toLocalTimeString(isoString, tz) {
    if (!isoString) return null;
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return null;
        return new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(d);
    } catch  {
        return null;
    }
}
/**
 * Upserts normalized assignments into the tasks table in batches.
 * Uses timezone-aware date/time conversion to prevent off-by-one errors.
 * Clears dismissed_at on upsert so previously deleted tasks reappear on resync.
 * After upserting, auto-completes all submitted but uncompleted assignments.
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - The user's ID
 * @param source - Assignment source ("canvas" or "gradescope")
 * @param assignments - Normalized assignments to upsert
 * @param timezone - IANA timezone for date/time conversion
 * @returns Object with count of successfully upserted assignments and any errors
 */ async function upsertAssignments(supabase, userId, source, assignments, timezone) {
    let totalUpserted = 0;
    let failedBatches = 0;
    const BRIGHTSPACE_COLOR = "#E87040"; // D2L orange
    const colorMap = {
        canvas: CANVAS_COLOR,
        gradescope: GRADESCOPE_COLOR,
        pensieve: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$pensieve$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PENSIEVE_COLOR"],
        brightspace: BRIGHTSPACE_COLOR
    };
    const color = colorMap[source];
    const syncStartTime = new Date().toISOString();
    const upsertedExternalIds = [];
    // Query existing rows so we can:
    //   1. Skip overwriting user-customized colors on existing tasks
    //   2. Skip overwriting user-edited due_date / due_time
    // See migration 20260409000001 for the manual-edit tracking columns.
    const { data: existingTaskRows } = await supabase.from("tasks").select("external_id, due_date_manually_edited_at, due_time_manually_edited_at").eq("user_id", userId).eq("source", source);
    const existingIds = new Set(existingTaskRows?.map((r)=>r.external_id) ?? []);
    const dueDateLockedIds = new Set((existingTaskRows ?? []).filter((r)=>r.due_date_manually_edited_at != null).map((r)=>r.external_id));
    const dueTimeLockedIds = new Set((existingTaskRows ?? []).filter((r)=>r.due_time_manually_edited_at != null).map((r)=>r.external_id));
    for(let i = 0; i < assignments.length; i += UPSERT_BATCH_SIZE){
        const batch = assignments.slice(i, i + UPSERT_BATCH_SIZE);
        // Build shared fields for each assignment (everything except color)
        const baseRows = batch.map((a)=>({
                user_id: userId,
                source,
                external_id: a.external_id,
                course_name: (a.course_name || "Unknown Course").slice(0, 200),
                title: (a.title || "Untitled").slice(0, 255),
                due_date: toLocalDateString(a.due_date, timezone),
                due_time: toLocalTimeString(a.due_date, timezone),
                source_url: a.source_url,
                points_possible: a.points_possible != null && a.points_possible >= 0 ? a.points_possible : null,
                is_submitted: a.is_submitted ?? false,
                late_due_date: a.late_due_date ? toLocalDateString(a.late_due_date, timezone) : null,
                description: a.description || "",
                updated_at: new Date().toISOString(),
                // Clear dismissed_at so previously deleted tasks reappear on resync.
                // If the assignment exists on the source platform, it should show in caltodo.
                dismissed_at: null
            }));
        // Split into new (include color) vs existing (omit color to preserve user changes).
        // For existing rows, also strip due_date / due_time when the user has
        // manually edited them — sync must not clobber the user's own changes.
        const newRows = baseRows.filter((r)=>!existingIds.has(r.external_id)).map((r)=>({
                ...r,
                color
            }));
        const existingRows = baseRows.filter((r)=>existingIds.has(r.external_id)).map((r)=>{
            const dateLocked = dueDateLockedIds.has(r.external_id);
            const timeLocked = dueTimeLockedIds.has(r.external_id);
            if (!dateLocked && !timeLocked) return r;
            // Drop locked fields entirely so the upsert leaves them untouched.
            const { due_date, due_time, ...rest } = r;
            return {
                ...rest,
                ...dateLocked ? {} : {
                    due_date
                },
                ...timeLocked ? {} : {
                    due_time
                }
            };
        });
        let batchFailed = false;
        // Upsert new tasks (with default source color)
        if (newRows.length > 0) {
            const { error } = await supabase.from("tasks").upsert(newRows, {
                onConflict: "user_id,source,external_id"
            });
            if (error) {
                batchFailed = true;
                __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("upsertAssignments new-task batch failed", {
                    source,
                    batchStart: i,
                    error: error.message
                });
            }
        }
        // Upsert existing tasks (without color — preserves user customizations).
        // Group rows by their column shape so each upsert call has a uniform
        // payload (Supabase upsert requires all rows to share the same columns).
        if (existingRows.length > 0) {
            const groups = new Map();
            for (const row of existingRows){
                const key = Object.keys(row).sort().join(",");
                const group = groups.get(key) ?? [];
                group.push(row);
                groups.set(key, group);
            }
            for (const group of groups.values()){
                const { error } = await supabase.from("tasks").upsert(group, {
                    onConflict: "user_id,source,external_id"
                });
                if (error) {
                    batchFailed = true;
                    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("upsertAssignments existing-task batch failed", {
                        source,
                        batchStart: i,
                        groupSize: group.length,
                        error: error.message
                    });
                }
            }
        }
        if (batchFailed) {
            failedBatches++;
        } else {
            totalUpserted += batch.length;
            upsertedExternalIds.push(...batch.map((a)=>a.external_id));
        }
    }
    const errors = [];
    if (failedBatches > 0) {
        const totalBatches = Math.ceil(assignments.length / UPSERT_BATCH_SIZE);
        errors.push(`${failedBatches} of ${totalBatches} ${source} upsert batches failed`);
    }
    // Auto-complete submitted assignments that aren't yet marked complete.
    // Only targets tasks that were part of the current sync batch to avoid
    // affecting tasks from other syncs or manual entries.
    if (upsertedExternalIds.length > 0) {
        const { error: autoCompleteError } = await supabase.from("tasks").update({
            is_completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).eq("user_id", userId).eq("source", source).eq("is_submitted", true).eq("is_completed", false).in("external_id", upsertedExternalIds);
        if (autoCompleteError) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("upsertAssignments auto-complete failed", {
                source,
                error: autoCompleteError.message
            });
        }
    }
    return {
        synced: totalUpserted,
        errors
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/rate-limit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "rateLimit",
    ()=>rateLimit
]);
/**
 * In-memory rate limiter for API routes.
 *
 * Uses a Map to track request counts per key within sliding windows.
 * Automatically cleans up expired entries every 60 seconds.
 *
 * @module rate-limit
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
/** Store of rate limit entries keyed by identifier. */ const store = new Map();
/** Cleanup interval in milliseconds (60 seconds). */ const CLEANUP_INTERVAL_MS = 60_000;
/** Periodically removes expired entries from the store. */ const cleanupInterval = setInterval(()=>{
    const now = Date.now();
    for (const [key, entry] of store){
        if (now >= entry.resetAt) {
            store.delete(key);
        }
    }
}, CLEANUP_INTERVAL_MS);
// Allow Node.js to exit without waiting for the cleanup timer.
if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
}
function rateLimit(key, maxRequests, windowMs) {
    const now = Date.now();
    const entry = store.get(key);
    // Window expired or first request — start a new window
    if (!entry || now >= entry.resetAt) {
        store.set(key, {
            count: 1,
            resetAt: now + windowMs
        });
        return {
            allowed: true
        };
    }
    // Within window — increment and check
    entry.count += 1;
    if (entry.count > maxRequests) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("Rate limit exceeded", {
            key,
            count: entry.count,
            maxRequests
        });
        return {
            allowed: false
        };
    }
    return {
        allowed: true
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/app/api/assignments/sync/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
/**
 * API route to trigger assignment sync from Canvas and Gradescope.
 * POST: Runs the sync engine and returns results.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sync$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/sync-engine.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/rate-limit.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST(request) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    const { allowed } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])(`assignments-sync:${user.id}`, 30, 60_000);
    if (!allowed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Too many requests"
        }, {
            status: 429
        });
    }
    let body;
    try {
        body = await request.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid JSON body"
        }, {
            status: 400
        });
    }
    try {
        const rawTimezone = body.timezone || "America/Los_Angeles";
        // Validate timezone against IANA database to prevent injection of arbitrary strings
        const validTimezones = Intl.supportedValuesOf("timeZone");
        const timezone = validTimezones.includes(rawTimezone) ? rawTimezone : "America/Los_Angeles";
        // Build course overrides if provided by the client
        const courseOverrides = body.canvas_courses || body.gradescope_courses ? {
            canvas_courses: body.canvas_courses,
            gradescope_courses: body.gradescope_courses
        } : undefined;
        // Manual syncs (with overrides or explicit force flag) bypass the Gradescope 30-min cooldown
        const forceGradescope = !!courseOverrides || body.forceGradescope === true;
        // Optional platform filter — only sync specific platforms
        const VALID_PLATFORMS = new Set([
            "canvas",
            "gradescope",
            "pensieve"
        ]);
        const platforms = Array.isArray(body.platforms) ? body.platforms.filter((p)=>VALID_PLATFORMS.has(p)) : undefined;
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("POST /api/assignments/sync started", {
            userId: user.id,
            timezone,
            hasOverrides: !!courseOverrides,
            forceGradescope,
            platforms
        });
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sync$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runSync"])(supabase, user.id, timezone, courseOverrides, forceGradescope, platforms);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("POST /api/assignments/sync failed", {
            userId: user.id,
            error: message
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Sync failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__25cc2718._.js.map