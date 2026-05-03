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
"[project]/.claude/worktrees/claude-work/src/app/api/credentials/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PUT",
    ()=>PUT
]);
/**
 * API route for reading and saving integration credentials.
 * GET: Returns credentials (password masked as boolean).
 * PUT: Creates or updates credentials (encrypts Gradescope password).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/crypto.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/rate-limit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$url$2d$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/canvas-url-validation.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
/** Base columns selected from integration_credentials (excludes additional_canvas_accounts for fallback). */ const BASE_SELECT = "canvas_token, canvas_base_url, canvas_ical_url, gradescope_email, gradescope_password_encrypted, last_synced_at, selected_canvas_courses, selected_gradescope_courses, selected_pensieve_courses, google_access_token_encrypted, google_calendar_id, google_email, google_photo_url, canvas_token_created_at, is_founding_member, pensieve_calendar_url, brightspace_calendar_url, gradescope_auth_failed, email_digest_enabled, email_digest_hour, email_digest_address, dismissed_canvas_course_ids, dismissed_modals";
async function GET() {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    const { allowed } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])(`credentials:${user.id}`, 30, 60_000);
    if (!allowed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Too many requests"
        }, {
            status: 429
        });
    }
    let { data, error } = await supabase.from("integration_credentials").select(`${BASE_SELECT}, additional_canvas_accounts`).eq("user_id", user.id).single();
    // If the additional_canvas_accounts column doesn't exist yet, retry without it
    if (error && error.code !== "PGRST116" && error.message?.includes("additional_canvas_accounts")) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("GET /api/credentials — additional_canvas_accounts column missing, retrying without it", {
            userId: user.id
        });
        ({ data, error } = await supabase.from("integration_credentials").select(BASE_SELECT).eq("user_id", user.id).single());
    }
    if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found, which is fine for new users
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("GET /api/credentials failed", {
            userId: user.id,
            error: error.message
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch credentials"
        }, {
            status: 500
        });
    }
    // Check if Canvas token has expired (120-day lifetime)
    let canvasTokenExpired = false;
    if (data?.canvas_token && data?.canvas_token_created_at) {
        const createdAt = new Date(data.canvas_token_created_at).getTime();
        const now = Date.now();
        const days120 = 120 * 24 * 60 * 60 * 1000;
        canvasTokenExpired = now - createdAt > days120;
    }
    const hasCompletedOnboarding = !!(data?.canvas_token || data?.canvas_ical_url || data?.gradescope_password_encrypted || data?.pensieve_calendar_url || data?.brightspace_calendar_url || data?.last_synced_at || data?.google_access_token_encrypted);
    const credentials = {
        canvas_token: data?.canvas_token ?? null,
        canvas_base_url: data?.canvas_base_url ?? "https://bcourses.berkeley.edu",
        canvas_ical_url: data?.canvas_ical_url ?? null,
        canvas_token_expired: canvasTokenExpired,
        gradescope_email: data?.gradescope_email ?? null,
        has_gradescope_password: !!data?.gradescope_password_encrypted,
        gradescope_auth_failed: data?.gradescope_auth_failed ?? false,
        last_synced_at: data?.last_synced_at ?? null,
        selected_canvas_courses: data?.selected_canvas_courses ?? null,
        selected_gradescope_courses: data?.selected_gradescope_courses ?? null,
        selected_pensieve_courses: data?.selected_pensieve_courses ?? null,
        dismissed_canvas_course_ids: data?.dismissed_canvas_course_ids ?? [],
        has_google_calendar: !!data?.google_access_token_encrypted,
        google_calendar_id: data?.google_calendar_id ?? null,
        google_email: data?.google_email ?? null,
        google_photo_url: data?.google_photo_url ?? null,
        canvas_token_created_at: data?.canvas_token_created_at ?? null,
        is_founding_member: data?.is_founding_member ?? false,
        pensieve_calendar_url: data?.pensieve_calendar_url ?? null,
        brightspace_calendar_url: data?.brightspace_calendar_url ?? null,
        additional_canvas_accounts: data?.additional_canvas_accounts ?? [],
        has_completed_onboarding: hasCompletedOnboarding,
        email_digest_enabled: data?.email_digest_enabled ?? true,
        email_digest_hour: data?.email_digest_hour ?? 15,
        email_digest_address: data?.email_digest_address ?? null,
        dismissed_modals: data?.dismissed_modals ?? {}
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(credentials);
}
async function PUT(request) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    const { allowed } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])(`credentials:${user.id}`, 30, 60_000);
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
    // Build the update object
    const updateData = {
        user_id: user.id
    };
    if (body.canvas_token !== undefined) {
        updateData.canvas_token = body.canvas_token;
        // Track when the canvas token was set for 120-day expiration
        updateData.canvas_token_created_at = body.canvas_token ? new Date().toISOString() : null;
    }
    if (body.canvas_base_url !== undefined) {
        updateData.canvas_base_url = body.canvas_base_url;
    }
    if (body.canvas_ical_url !== undefined) {
        updateData.canvas_ical_url = body.canvas_ical_url;
    }
    if (body.gradescope_email !== undefined) {
        updateData.gradescope_email = body.gradescope_email;
    }
    if (body.selected_canvas_courses !== undefined) {
        updateData.selected_canvas_courses = body.selected_canvas_courses;
    }
    if (body.dismissed_canvas_course_ids !== undefined) {
        updateData.dismissed_canvas_course_ids = body.dismissed_canvas_course_ids;
    }
    if (body.selected_gradescope_courses !== undefined) {
        updateData.selected_gradescope_courses = body.selected_gradescope_courses;
    }
    if (body.selected_pensieve_courses !== undefined) {
        updateData.selected_pensieve_courses = body.selected_pensieve_courses;
    }
    if (body.pensieve_calendar_url !== undefined) {
        if (body.pensieve_calendar_url) {
            // Validate Pensieve URL against SSRF: must be HTTPS, not internal
            try {
                const pUrl = new URL(body.pensieve_calendar_url);
                if (pUrl.protocol !== "https:") {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "Pensieve calendar URL must use HTTPS"
                    }, {
                        status: 400
                    });
                }
                const hostname = pUrl.hostname.toLowerCase();
                if (hostname === "localhost" || hostname.startsWith("127.") || hostname.startsWith("10.") || hostname.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) || hostname === "0.0.0.0" || hostname === "[::1]") {
                    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("PUT /api/credentials: rejected internal Pensieve URL", {
                        userId: user.id,
                        url: body.pensieve_calendar_url
                    });
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "Internal URLs are not allowed"
                    }, {
                        status: 400
                    });
                }
            } catch  {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Invalid Pensieve calendar URL"
                }, {
                    status: 400
                });
            }
        }
        updateData.pensieve_calendar_url = body.pensieve_calendar_url;
    }
    if (body.brightspace_calendar_url !== undefined) {
        if (body.brightspace_calendar_url) {
            try {
                const bUrl = new URL(body.brightspace_calendar_url);
                if (bUrl.protocol !== "https:") {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "Brightspace URL must use HTTPS"
                    }, {
                        status: 400
                    });
                }
            } catch  {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Invalid Brightspace URL"
                }, {
                    status: 400
                });
            }
        }
        updateData.brightspace_calendar_url = body.brightspace_calendar_url;
        if (body.brightspace_calendar_url) {
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("Brightspace connected", {
                userId: user.id,
                email: user.email,
                url: body.brightspace_calendar_url.slice(0, 60)
            });
        }
    }
    if (body.additional_canvas_accounts !== undefined) {
        // Validate each additional Canvas account URL against allowlist
        const accounts = body.additional_canvas_accounts;
        if (accounts && accounts.length > 10) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Maximum 10 additional Canvas accounts allowed"
            }, {
                status: 400
            });
        }
        if (accounts && accounts.length > 0) {
            for (const account of accounts){
                if (account.base_url && !(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$canvas$2d$url$2d$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAllowedCanvasUrl"])(account.base_url)) {
                    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("PUT /api/credentials: rejected disallowed additional Canvas URL", {
                        userId: user.id,
                        baseUrl: account.base_url
                    });
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: `Invalid Canvas base URL: ${account.base_url}. Please use an HTTPS URL.`
                    }, {
                        status: 400
                    });
                }
            }
        }
        updateData.additional_canvas_accounts = body.additional_canvas_accounts;
    }
    if (body.email_digest_enabled !== undefined) {
        updateData.email_digest_enabled = body.email_digest_enabled;
    }
    if (body.email_digest_hour !== undefined) {
        updateData.email_digest_hour = body.email_digest_hour;
    }
    if (body.email_digest_address !== undefined) {
        updateData.email_digest_address = body.email_digest_address;
    }
    if (body.dismissed_modals !== undefined) {
        updateData.dismissed_modals = body.dismissed_modals;
    }
    // Only update password if explicitly provided (not null/undefined means "keep existing")
    if (body.gradescope_password !== undefined && body.gradescope_password !== null) {
        updateData.gradescope_password_encrypted = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encrypt"])(body.gradescope_password);
        // Clear auth failure flag so auto-sync retries with new password
        updateData.gradescope_auth_failed = false;
    } else if (body.gradescope_password === null) {
        // Explicitly clear the password
        updateData.gradescope_password_encrypted = null;
        updateData.gradescope_auth_failed = false;
    }
    // Check if this is a new row (no existing credentials) — if so, mark as founding member
    const { data: existing } = await supabase.from("integration_credentials").select("id").eq("user_id", user.id).single();
    if (!existing) {
        // New user — check if we're still under 500 total users (founding member spots)
        const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
        const { data: authData } = await admin.auth.admin.listUsers({
            perPage: 1,
            page: 1
        });
        const totalUsers = (authData && "total" in authData ? authData.total : authData?.users.length) ?? 0;
        updateData.is_founding_member = totalUsers <= 500;
    }
    const { error } = await supabase.from("integration_credentials").upsert(updateData, {
        onConflict: "user_id"
    });
    if (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("PUT /api/credentials failed", {
            userId: user.id,
            error: error.message
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to save credentials"
        }, {
            status: 500
        });
    }
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("PUT /api/credentials success", {
        userId: user.id
    });
    // Return updated credentials
    let { data: updated, error: readError } = await supabase.from("integration_credentials").select(`${BASE_SELECT}, additional_canvas_accounts`).eq("user_id", user.id).single();
    // Retry without additional_canvas_accounts if column doesn't exist yet
    if (readError && readError.message?.includes("additional_canvas_accounts")) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("PUT /api/credentials — additional_canvas_accounts column missing, retrying without it", {
            userId: user.id
        });
        ({ data: updated, error: readError } = await supabase.from("integration_credentials").select(BASE_SELECT).eq("user_id", user.id).single());
    }
    if (readError || !updated) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("PUT /api/credentials — re-read failed after upsert", {
            userId: user.id,
            error: readError?.message
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Credentials saved but failed to read back"
        }, {
            status: 500
        });
    }
    // Check Canvas token expiration for the response
    let putCanvasTokenExpired = false;
    if (updated?.canvas_token && updated?.canvas_token_created_at) {
        const createdAt = new Date(updated.canvas_token_created_at).getTime();
        const days120 = 120 * 24 * 60 * 60 * 1000;
        putCanvasTokenExpired = Date.now() - createdAt > days120;
    }
    const putHasCompletedOnboarding = !!(updated?.canvas_token || updated?.canvas_ical_url || updated?.gradescope_password_encrypted || updated?.pensieve_calendar_url || updated?.brightspace_calendar_url || updated?.last_synced_at || updated?.google_access_token_encrypted);
    const credentials = {
        canvas_token: updated?.canvas_token ?? null,
        canvas_base_url: updated?.canvas_base_url ?? "https://bcourses.berkeley.edu",
        canvas_ical_url: updated?.canvas_ical_url ?? null,
        canvas_token_expired: putCanvasTokenExpired,
        gradescope_email: updated?.gradescope_email ?? null,
        has_gradescope_password: !!updated?.gradescope_password_encrypted,
        gradescope_auth_failed: updated?.gradescope_auth_failed ?? false,
        last_synced_at: updated?.last_synced_at ?? null,
        selected_canvas_courses: updated?.selected_canvas_courses ?? null,
        dismissed_canvas_course_ids: updated?.dismissed_canvas_course_ids ?? [],
        selected_gradescope_courses: updated?.selected_gradescope_courses ?? null,
        selected_pensieve_courses: updated?.selected_pensieve_courses ?? null,
        has_google_calendar: !!updated?.google_access_token_encrypted,
        google_calendar_id: updated?.google_calendar_id ?? null,
        google_email: updated?.google_email ?? null,
        google_photo_url: updated?.google_photo_url ?? null,
        canvas_token_created_at: updated?.canvas_token_created_at ?? null,
        is_founding_member: updated?.is_founding_member ?? false,
        pensieve_calendar_url: updated?.pensieve_calendar_url ?? null,
        brightspace_calendar_url: updated?.brightspace_calendar_url ?? null,
        additional_canvas_accounts: updated?.additional_canvas_accounts ?? [],
        has_completed_onboarding: putHasCompletedOnboarding,
        email_digest_enabled: updated?.email_digest_enabled ?? true,
        email_digest_hour: updated?.email_digest_hour ?? 15,
        email_digest_address: updated?.email_digest_address ?? null,
        dismissed_modals: updated?.dismissed_modals ?? {}
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(credentials);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__18d67145._.js.map