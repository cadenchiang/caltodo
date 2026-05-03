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
"[project]/.claude/worktrees/claude-work/src/lib/content-moderation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "containsBlockedContent",
    ()=>containsBlockedContent,
    "normalizeText",
    ()=>normalizeText
]);
/**
 * Content moderation module for chat messages.
 * Blocks slurs and common evasion variants (leet speak,
 * repeated characters, spaced-out letters, zero-width chars).
 *
 * @module content-moderation
 */ /**
 * Blocked slurs: n-word variants and "faggot".
 */ const BLOCKED_WORDS = [
    "nigger",
    "nigga",
    "faggot"
];
/**
 * Leet speak character class map for letters used in blocked words.
 * Maps each letter to a regex character class matching common substitutes.
 */ const LEET_CLASSES = {
    a: "[a@4]",
    e: "[e3]",
    f: "[f]",
    g: "[g9]",
    i: "[i1!]",
    n: "[n]",
    o: "[o0]",
    r: "[r]",
    t: "[t7]"
};
/**
 * Groups consecutive identical characters in a word.
 * E.g. "nigger" → [{ ch: "n", count: 1 }, { ch: "i", count: 1 }, { ch: "g", count: 2 }, ...]
 *
 * @param word - The word to group
 * @returns Array of character groups with their run lengths
 */ function groupChars(word) {
    const groups = [];
    for (const ch of word){
        const last = groups[groups.length - 1];
        if (last && last.ch === ch) {
            last.count++;
        } else {
            groups.push({
                ch,
                count: 1
            });
        }
    }
    return groups;
}
/**
 * Builds a regex pattern for a blocked word that matches:
 * - Leet speak substitutions (e.g. `1` for `i`, `@` for `a`)
 * - Repeated characters (e.g. "niggger")
 * - Consecutive identical chars merged (e.g. "gg" → `[g9]{2,}`)
 * - Optional separators between characters (spaces, dots, dashes, underscores)
 *
 * @param word - The blocked word to build a pattern for
 * @returns Compiled regex with boundary matching
 */ function buildPattern(word) {
    const sep = "[\\s.\\-_]*";
    const groups = groupChars(word);
    const parts = groups.map(({ ch, count })=>{
        const cls = LEET_CLASSES[ch] ?? ch;
        if (count === 1) {
            return `${cls}+`;
        }
        // For consecutive identical chars (e.g. "gg"), allow separators between each.
        // "gg" → [g9]+[\s.\-_]*[g9]+ (at least 2, with optional separators between)
        const single = `${cls}+`;
        const repeated = Array.from({
            length: count
        }, ()=>single).join(sep);
        return repeated;
    });
    const pattern = parts.join(sep);
    // Use lookahead/lookbehind instead of \b because leet substitutes
    // like @ are not word characters, breaking standard word boundaries.
    return new RegExp(`(?<![\\w])${pattern}(?![\\w])`, "i");
}
/** Pre-compiled regex patterns for each blocked word. */ const BLOCKED_PATTERNS = BLOCKED_WORDS.map(buildPattern);
function normalizeText(text) {
    let normalized = text.toLowerCase();
    // Decompose Unicode to strip combining characters (accent marks, diacritics)
    // that can bypass word filters (e.g. n̄igger → nigger)
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Strip zero-width characters (U+200B, U+200C, U+200D, U+FEFF)
    normalized = normalized.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
    return normalized;
}
function containsBlockedContent(text) {
    const normalized = normalizeText(text);
    for (const pattern of BLOCKED_PATTERNS){
        if (pattern.test(normalized)) {
            return true;
        }
    }
    return false;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/spam-detection.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkDuplicate",
    ()=>checkDuplicate,
    "checkSpam",
    ()=>checkSpam,
    "resetSpamState",
    ()=>resetSpamState
]);
/**
 * Burst spam detection with escalating timeouts for chat messages.
 * Tracks per-user message timestamps in a sliding window and applies
 * escalating cooldowns when burst thresholds are exceeded.
 *
 * Separate from rate-limit.ts: rate limiting guards against API abuse,
 * while spam detection handles rapid-fire chat UX.
 *
 * @module spam-detection
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
/** Maximum messages allowed within the burst window before triggering a timeout. */ const BURST_THRESHOLD = 5;
/** Burst detection window in milliseconds (10 seconds). */ const BURST_WINDOW_MS = 10_000;
/** Timeout durations per strike level in milliseconds. */ const TIMEOUT_DURATIONS_MS = {
    1: 30_000,
    2: 2 * 60_000,
    3: 10 * 60_000
};
/** Time after which strikes reset if no new violations occur (30 minutes). */ const STRIKE_RESET_MS = 30 * 60_000;
/** Cleanup interval for expired entries (60 seconds). */ const CLEANUP_INTERVAL_MS = 60_000;
/** In-memory store of spam tracking entries keyed by user ID. */ const store = new Map();
/** Maximum identical messages allowed within the duplicate window before blocking. */ const DUPLICATE_THRESHOLD = 3;
/** Time window for duplicate detection in milliseconds (30 seconds). */ const DUPLICATE_WINDOW_MS = 30_000;
/** Maximum recent messages tracked per user for duplicate detection. */ const DUPLICATE_HISTORY_SIZE = 10;
/** In-memory store of recent message bodies keyed by user ID. */ const duplicateStore = new Map();
/** Periodically removes expired entries from both stores. */ const cleanupInterval = setInterval(()=>{
    const now = Date.now();
    for (const [key, entry] of store){
        const isTimedOut = now < entry.timeoutUntil;
        const hasRecentTimestamps = entry.timestamps.some((ts)=>now - ts < BURST_WINDOW_MS);
        if (!isTimedOut && !hasRecentTimestamps) {
            store.delete(key);
        }
    }
    for (const [key, entries] of duplicateStore){
        const fresh = entries.filter((e)=>now - e.sentAt < DUPLICATE_WINDOW_MS);
        if (fresh.length === 0) {
            duplicateStore.delete(key);
        } else {
            duplicateStore.set(key, fresh);
        }
    }
}, CLEANUP_INTERVAL_MS);
// Allow Node.js to exit without waiting for the cleanup timer.
if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
}
function checkSpam(userId) {
    const now = Date.now();
    let entry = store.get(userId);
    if (!entry) {
        entry = {
            timestamps: [],
            timeoutUntil: 0,
            strikes: 0,
            lastViolation: 0
        };
        store.set(userId, entry);
    }
    // Reset strikes if no violations in the last 30 minutes
    if (entry.strikes > 0 && entry.lastViolation > 0 && now - entry.lastViolation >= STRIKE_RESET_MS) {
        entry.strikes = 0;
        entry.lastViolation = 0;
    }
    // Check if user is currently timed out
    if (now < entry.timeoutUntil) {
        const retryAfter = Math.ceil((entry.timeoutUntil - now) / 1000);
        return {
            allowed: false,
            retryAfter
        };
    }
    // Prune timestamps older than the burst window
    entry.timestamps = entry.timestamps.filter((ts)=>now - ts < BURST_WINDOW_MS);
    // Record current message timestamp
    entry.timestamps.push(now);
    // Check if burst threshold exceeded
    if (entry.timestamps.length >= BURST_THRESHOLD) {
        entry.strikes += 1;
        entry.lastViolation = now;
        const timeoutMs = TIMEOUT_DURATIONS_MS[Math.min(entry.strikes, 3)] ?? TIMEOUT_DURATIONS_MS[3];
        entry.timeoutUntil = now + timeoutMs;
        // Clear timestamps so they don't carry over after timeout
        entry.timestamps = [];
        const retryAfter = Math.ceil(timeoutMs / 1000);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("Spam detection: user timed out", {
            userId,
            strikes: entry.strikes,
            timeoutSeconds: retryAfter
        });
        return {
            allowed: false,
            retryAfter
        };
    }
    return {
        allowed: true
    };
}
/**
 * Normalizes a message body for duplicate comparison.
 * Lowercases and collapses consecutive whitespace into a single space.
 *
 * @param body - The raw message body
 * @returns Normalized string for comparison
 */ function normalizeBody(body) {
    return body.toLowerCase().replace(/\s+/g, " ").trim();
}
function checkDuplicate(userId, body) {
    const now = Date.now();
    const normalized = normalizeBody(body);
    let entries = duplicateStore.get(userId) ?? [];
    // Prune entries outside the duplicate window
    entries = entries.filter((e)=>now - e.sentAt < DUPLICATE_WINDOW_MS);
    // Count how many times this exact normalized body appears in the window
    const dupeCount = entries.filter((e)=>e.body === normalized).length;
    if (dupeCount >= DUPLICATE_THRESHOLD) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("Duplicate detection: message blocked", {
            userId,
            duplicateCount: dupeCount,
            windowSeconds: DUPLICATE_WINDOW_MS / 1000
        });
        return {
            allowed: false,
            error: "Duplicate message — please don't repeat yourself"
        };
    }
    // Record this message and cap history size
    entries.push({
        body: normalized,
        sentAt: now
    });
    if (entries.length > DUPLICATE_HISTORY_SIZE) {
        entries = entries.slice(-DUPLICATE_HISTORY_SIZE);
    }
    duplicateStore.set(userId, entries);
    return {
        allowed: true
    };
}
function resetSpamState(userId) {
    if (userId) {
        store.delete(userId);
        duplicateStore.delete(userId);
    } else {
        store.clear();
        duplicateStore.clear();
    }
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMIN_EMAIL",
    ()=>ADMIN_EMAIL,
    "isAdmin",
    ()=>isAdmin
]);
/**
 * Admin access control helpers.
 * Centralizes admin email check for API routes and server components.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
function isAdmin(email) {
    if (!email) return false;
    const result = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (result) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("Admin access granted", {
            email
        });
    }
    return result;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/author-obfuscate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "obfuscateAuthorId",
    ()=>obfuscateAuthorId
]);
/**
 * Deterministic obfuscation for anonymous message author IDs.
 * Replaces real UUIDs with opaque hashes so clients cannot call
 * /api/discussions/profile?userId=X to deanonymize senders.
 *
 * Same (authorId, courseId) always produces the same output,
 * preserving anonymous numbering and message grouping in the UI.
 */ /**
 * FNV-1a hash of a string, returning a 32-bit unsigned integer.
 *
 * @param str - Input string to hash
 * @returns 32-bit unsigned FNV-1a hash
 */ function fnv1a(str) {
    let hash = 0x811c9dc5; // FNV offset basis
    for(let i = 0; i < str.length; i++){
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193); // FNV prime
    }
    return hash >>> 0; // ensure unsigned
}
function obfuscateAuthorId(authorId, courseId) {
    const input = `${authorId}:${courseId}`;
    const hi = fnv1a(input);
    const lo = fnv1a(input + ":salt");
    return `anon_${hi.toString(16).padStart(8, "0")}${lo.toString(16).padStart(8, "0")}`;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/check-onboarding.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Server-side helper to check whether a user has completed onboarding.
 * A user is considered onboarded if they have at least one integration
 * credential (Canvas token, Gradescope password, or Pensieve URL).
 *
 * @module check-onboarding
 */ __turbopack_context__.s([
    "hasCompletedOnboarding",
    ()=>hasCompletedOnboarding
]);
async function hasCompletedOnboarding(supabase, userId) {
    const { data } = await supabase.from("integration_credentials").select("canvas_token, gradescope_password_encrypted, pensieve_calendar_url, last_synced_at, google_access_token_encrypted").eq("user_id", userId).single();
    if (!data) return false;
    return !!(data.canvas_token || data.gradescope_password_encrypted || data.pensieve_calendar_url || data.last_synced_at || data.google_access_token_encrypted);
}
}),
"[project]/.claude/worktrees/claude-work/src/app/api/discussions/messages/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
/**
 * API route for chat messages in a course group chat.
 * GET: Paginated message history.
 * POST: Send a new message with denormalized author info.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/rate-limit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$content$2d$moderation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/content-moderation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$spam$2d$detection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/spam-detection.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$author$2d$obfuscate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/author-obfuscate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$check$2d$onboarding$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/check-onboarding.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
async function GET(request) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    // Block access if user hasn't completed onboarding (synced at least one class)
    const onboarded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$check$2d$onboarding$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasCompletedOnboarding"])(supabase, user.id);
    if (!onboarded) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Complete onboarding to access CalChat"
        }, {
            status: 403
        });
    }
    const { allowed } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])(`chat-messages:${user.id}`, 60, 60_000);
    if (!allowed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Too many requests"
        }, {
            status: 429
        });
    }
    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");
    const limitParam = url.searchParams.get("limit");
    const before = url.searchParams.get("before");
    if (!courseId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "courseId query parameter required"
        }, {
            status: 400
        });
    }
    const limit = Math.min(Math.max(parseInt(limitParam || "50", 10) || 50, 1), 100);
    try {
        // Verify enrollment
        const { data: membership } = await supabase.from("course_memberships").select("id").eq("user_id", user.id).eq("course_id", courseId).single();
        if (!membership) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Not enrolled in this course"
            }, {
                status: 403
            });
        }
        let query = supabase.from("chat_messages").select("*").eq("course_id", courseId).order("created_at", {
            ascending: false
        }).limit(limit);
        if (before) {
            query = query.lt("created_at", before);
        }
        const { data: messages, error: fetchError } = await query;
        if (fetchError) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("GET /api/discussions/messages: fetch failed", {
                userId: user.id,
                courseId,
                error: fetchError.message
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to fetch messages"
            }, {
                status: 500
            });
        }
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("GET /api/discussions/messages", {
            userId: user.id,
            courseId,
            count: messages?.length ?? 0
        });
        // Obfuscate author_id for anonymous messages from other users (non-admin).
        // Own messages keep real author_id (needed for isOwn check on client).
        // Admin gets all real author_ids (needed for reveal feature).
        const userIsAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"])(user.email);
        const sanitized = (messages ?? []).map((msg)=>{
            if (userIsAdmin) return msg;
            if (msg.author_id === user.id) return msg;
            if (msg.author_name) return msg; // named messages — not anonymous
            return {
                ...msg,
                author_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$author$2d$obfuscate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["obfuscateAuthorId"])(msg.author_id, courseId)
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(sanitized);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("GET /api/discussions/messages: unexpected error", {
            userId: user.id,
            courseId,
            error: message
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
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
    // Block access if user hasn't completed onboarding
    const onboarded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$check$2d$onboarding$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasCompletedOnboarding"])(supabase, user.id);
    if (!onboarded) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Complete onboarding to access CalChat"
        }, {
            status: 403
        });
    }
    // Burst spam detection (escalating timeouts for rapid-fire messages)
    const spam = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$spam$2d$detection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkSpam"])(user.id);
    if (!spam.allowed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Slow down — try again shortly",
            retryAfter: spam.retryAfter
        }, {
            status: 429
        });
    }
    const { allowed } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])(`chat-message-send:${user.id}`, 30, 60_000);
    if (!allowed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Too many requests"
        }, {
            status: 429
        });
    }
    let reqBody;
    try {
        reqBody = await request.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid JSON body"
        }, {
            status: 400
        });
    }
    const courseId = reqBody.courseId;
    const body = reqBody.body?.trim();
    const anonymous = reqBody.anonymous === true;
    const replyToId = reqBody.replyToId || null;
    if (!courseId || !body) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "courseId and body are required"
        }, {
            status: 400
        });
    }
    if (body.length > 5000) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Message must be 5000 characters or fewer"
        }, {
            status: 400
        });
    }
    // Content moderation
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$content$2d$moderation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["containsBlockedContent"])(body)) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("POST /api/discussions/messages: blocked content", {
            userId: user.id,
            courseId
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Message contains inappropriate content"
        }, {
            status: 422
        });
    }
    // Duplicate message detection
    const dupe = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$spam$2d$detection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkDuplicate"])(user.id, body);
    if (!dupe.allowed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: dupe.error
        }, {
            status: 429
        });
    }
    try {
        // Verify enrollment
        const { data: membership } = await supabase.from("course_memberships").select("id").eq("user_id", user.id).eq("course_id", courseId).single();
        if (!membership) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Not enrolled in this course"
            }, {
                status: 403
            });
        }
        // When anonymous, omit author identity; otherwise denormalize from metadata
        const authorName = anonymous ? null : user.user_metadata?.full_name ?? null;
        const authorAvatar = anonymous ? null : user.user_metadata?.avatar_url ?? null;
        const { data: message, error: insertError } = await supabase.from("chat_messages").insert({
            course_id: courseId,
            author_id: user.id,
            author_name: authorName,
            author_avatar: authorAvatar,
            body,
            reply_to_id: replyToId
        }).select().single();
        if (insertError) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("POST /api/discussions/messages: insert failed", {
                userId: user.id,
                courseId,
                error: insertError.message
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to send message"
            }, {
                status: 500
            });
        }
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("POST /api/discussions/messages: sent", {
            userId: user.id,
            courseId,
            messageId: message.id
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(message, {
            status: 201
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("POST /api/discussions/messages: unexpected error", {
            userId: user.id,
            error: message
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    const { allowed } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])(`chat-message-delete:${user.id}`, 30, 60_000);
    if (!allowed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Too many requests"
        }, {
            status: 429
        });
    }
    let reqBody;
    try {
        reqBody = await request.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid JSON body"
        }, {
            status: 400
        });
    }
    const messageId = reqBody.messageId;
    if (!messageId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "messageId is required"
        }, {
            status: 400
        });
    }
    try {
        // Fetch the message to verify ownership
        const { data: msg, error: fetchError } = await supabase.from("chat_messages").select("id, author_id, course_id").eq("id", messageId).single();
        if (fetchError || !msg) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Message not found"
            }, {
                status: 404
            });
        }
        if (msg.author_id !== user.id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "You can only delete your own messages"
            }, {
                status: 403
            });
        }
        const { error: deleteError } = await supabase.from("chat_messages").delete().eq("id", messageId);
        if (deleteError) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("DELETE /api/discussions/messages: delete failed", {
                userId: user.id,
                messageId,
                error: deleteError.message
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to delete message"
            }, {
                status: 500
            });
        }
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("DELETE /api/discussions/messages: deleted", {
            userId: user.id,
            messageId,
            courseId: msg.course_id
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("DELETE /api/discussions/messages: unexpected error", {
            userId: user.id,
            messageId,
            error: errMsg
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__26dabfd6._.js.map