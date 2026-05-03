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
"[project]/.claude/worktrees/claude-work/src/lib/gcal/token-manager.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCalendarId",
    ()=>getCalendarId,
    "getValidAccessToken",
    ()=>getValidAccessToken,
    "isGoogleCalendarConnected",
    ()=>isGoogleCalendarConnected,
    "refreshAccessToken",
    ()=>refreshAccessToken
]);
/**
 * Manages Google Calendar OAuth tokens: retrieval, refresh, and validation.
 * Tokens are stored encrypted in the integration_credentials table.
 * Auto-refreshes expired tokens with a 5-minute buffer.
 *
 * @module gcal/token-manager
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/crypto.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
;
/** Buffer before token expiry to trigger preemptive refresh (5 minutes). */ const EXPIRY_BUFFER_MS = 5 * 60 * 1000;
/** Per-user mutex map to prevent concurrent token refreshes for the same user. */ const refreshPromises = new Map();
/** Google OAuth2 token endpoint. */ const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
async function refreshAccessToken(refreshToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("refreshAccessToken: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
        return null;
    }
    const res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token"
        })
    });
    if (!res.ok) {
        const body = await res.text();
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("refreshAccessToken: Google token refresh failed", {
            status: res.status,
            body
        });
        return null;
    }
    const data = await res.json();
    return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        ...data.refresh_token ? {
            refreshToken: data.refresh_token
        } : {}
    };
}
async function getValidAccessToken(supabase, userId) {
    const { data, error } = await supabase.from("integration_credentials").select("google_access_token_encrypted, google_refresh_token_encrypted, google_token_expires_at").eq("user_id", userId).single();
    if (error || !data?.google_access_token_encrypted || !data?.google_refresh_token_encrypted) {
        return null;
    }
    const expiresAt = data.google_token_expires_at ? new Date(data.google_token_expires_at).getTime() : 0;
    const now = Date.now();
    // Token is still valid (with buffer)
    if (expiresAt - now > EXPIRY_BUFFER_MS) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decrypt"])(data.google_access_token_encrypted);
    }
    // Token expired or near expiry — refresh it (with mutex to prevent concurrent refreshes)
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("getValidAccessToken: refreshing expired token", {
        userId
    });
    const refreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decrypt"])(data.google_refresh_token_encrypted);
    if (!refreshPromises.has(userId)) {
        refreshPromises.set(userId, refreshAccessToken(refreshToken).finally(()=>{
            refreshPromises.delete(userId);
        }));
    }
    const refreshed = await refreshPromises.get(userId);
    if (!refreshed) {
        // Refresh failed — user likely revoked access. Clear tokens.
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("getValidAccessToken: refresh failed, clearing tokens", {
            userId
        });
        await supabase.from("integration_credentials").update({
            google_access_token_encrypted: null,
            google_refresh_token_encrypted: null,
            google_token_expires_at: null
        }).eq("user_id", userId);
        return null;
    }
    // Save refreshed token (and new refresh token if Google rotated it)
    const newExpiresAt = new Date(now + refreshed.expiresIn * 1000).toISOString();
    const updatePayload = {
        google_access_token_encrypted: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encrypt"])(refreshed.accessToken),
        google_token_expires_at: newExpiresAt
    };
    if (refreshed.refreshToken) {
        updatePayload.google_refresh_token_encrypted = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encrypt"])(refreshed.refreshToken);
    }
    await supabase.from("integration_credentials").update(updatePayload).eq("user_id", userId);
    return refreshed.accessToken;
}
async function isGoogleCalendarConnected(supabase, userId) {
    const { data, error } = await supabase.from("integration_credentials").select("google_access_token_encrypted").eq("user_id", userId).single();
    if (error || !data) return false;
    return !!data.google_access_token_encrypted;
}
async function getCalendarId(supabase, userId) {
    const { data, error } = await supabase.from("integration_credentials").select("google_calendar_id").eq("user_id", userId).single();
    if (error || !data?.google_calendar_id) {
        return null;
    }
    return data.google_calendar_id;
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/gcal/calendar-list.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "listAllCalendars",
    ()=>listAllCalendars
]);
/**
 * Lists ALL Google Calendars for the authenticated user (not just writable).
 * Used by the widget calendar picker to let users choose which calendars' events to display.
 *
 * @module gcal/calendar-list
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
/** Base URL for the Google Calendar API v3. */ const GCAL_API_BASE = "https://www.googleapis.com/calendar/v3";
async function listAllCalendars(accessToken) {
    const res = await fetch(`${GCAL_API_BASE}/users/me/calendarList`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    if (!res.ok) {
        const body = await res.text();
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("listAllCalendars: failed to fetch calendar list", {
            status: res.status,
            body
        });
        return null;
    }
    const data = await res.json();
    const items = data.items ?? [];
    const calendars = items.map((cal)=>({
            id: cal.id,
            summary: cal.summary ?? "(No name)",
            primary: !!cal.primary,
            backgroundColor: cal.backgroundColor ?? "#4285f4",
            accessRole: cal.accessRole
        }));
    // Sort: primary first, then alphabetical by summary
    calendars.sort((a, b)=>{
        if (a.primary && !b.primary) return -1;
        if (!a.primary && b.primary) return 1;
        return a.summary.localeCompare(b.summary);
    });
    __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("listAllCalendars: fetched calendars", {
        total: calendars.length
    });
    return calendars;
}
}),
"[project]/.claude/worktrees/claude-work/src/app/api/gcal/events/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
/**
 * GET /api/gcal/events - Fetches upcoming Google Calendar events.
 *
 * Query params:
 *   timeMin     - ISO start of time range (defaults to now)
 *   timeMax     - ISO end of time range (defaults to 7 days from now)
 *   calendarId  - Single Google Calendar ID (backward compat, defaults to "primary")
 *   calendarIds - Comma-separated calendar IDs for multi-calendar fetch (max 10)
 *
 * @returns { events: GCalEvent[] } sorted by start time, deduplicated by event ID
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2f$token$2d$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/gcal/token-manager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2f$calendar$2d$list$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/gcal/calendar-list.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-route] (ecmascript)");
;
;
;
;
;
/** Google Calendar events.list endpoint base. */ const GCAL_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars";
/** Maximum number of calendars that can be fetched in a single request. */ const MAX_CALENDARS = 10;
/**
 * Fetches events from a single Google Calendar.
 *
 * @param accessToken - Valid Google OAuth2 access token
 * @param calendarId - The calendar to fetch from
 * @param timeMin - ISO start of time range
 * @param timeMax - ISO end of time range
 * @returns Array of GCalEvent tagged with calendarId, or null on failure
 */ async function fetchCalendarEvents(accessToken, calendarId, timeMin, timeMax) {
    const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
        conferenceDataVersion: "1"
    });
    const url = `${GCAL_EVENTS_URL}/${encodeURIComponent(calendarId)}/events?${params}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    if (!res.ok) {
        const body = await res.text();
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("gcal/events: calendar fetch failed", {
            calendarId,
            status: res.status,
            body: body.slice(0, 500)
        });
        return null;
    }
    const data = await res.json();
    const items = data.items || [];
    return items.map((item)=>{
        const selfAttendee = item.attendees?.find((a)=>a.self);
        return {
            id: item.id,
            summary: item.summary || "(No title)",
            description: item.description || null,
            start: item.start?.dateTime || item.start?.date || "",
            end: item.end?.dateTime || item.end?.date || "",
            colorId: item.colorId || null,
            location: item.location || null,
            htmlLink: item.htmlLink || "",
            allDay: !item.start?.dateTime,
            calendarId,
            responseStatus: selfAttendee?.responseStatus || null,
            attendeeCount: (item.attendees ?? []).filter((a)=>!a.self).length,
            attendees: (item.attendees ?? []).filter((a)=>!a.self).map((a)=>({
                    email: a.email || "",
                    displayName: a.displayName || a.email || "",
                    responseStatus: a.responseStatus || null
                })),
            meetLink: item.hangoutLink || item.conferenceData?.entryPoints?.find((e)=>e.entryPointType === "video")?.uri || null
        };
    });
}
async function GET(request) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    const accessToken = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2f$token$2d$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getValidAccessToken"])(supabase, user.id);
    if (!accessToken) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            events: [],
            connected: false
        });
    }
    const { searchParams } = request.nextUrl;
    const now = new Date();
    const timeMin = searchParams.get("timeMin") || now.toISOString();
    const timeMax = searchParams.get("timeMax") || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    // Resolve calendar IDs: query param > DB selection > "primary"
    const calendarIdsParam = searchParams.get("calendarIds");
    const calendarIdParam = searchParams.get("calendarId");
    let calendarIds;
    if (calendarIdsParam) {
        calendarIds = calendarIdsParam.split(",").map((id)=>id.trim()).filter(Boolean).slice(0, MAX_CALENDARS);
    } else if (calendarIdParam) {
        calendarIds = [
            calendarIdParam
        ];
    } else {
        // Load saved calendar selection from DB
        const { data: creds } = await supabase.from("integration_credentials").select("google_calendar_id").eq("user_id", user.id).single();
        const stored = creds?.google_calendar_id;
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                calendarIds = Array.isArray(parsed) ? parsed.slice(0, MAX_CALENDARS) : [
                    stored
                ];
            } catch  {
                calendarIds = [
                    stored
                ];
            }
        } else {
            calendarIds = [
                "primary"
            ];
        }
    }
    try {
        // Fetch events and calendar list in parallel
        const [results, calendarList] = await Promise.all([
            Promise.all(calendarIds.map((id)=>fetchCalendarEvents(accessToken, id, timeMin, timeMax))),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2f$calendar$2d$list$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listAllCalendars"])(accessToken)
        ]);
        // Build calendarId -> display name and color maps
        const calNameMap = new Map();
        const calColorMap = {};
        if (calendarList) {
            for (const cal of calendarList){
                calNameMap.set(cal.id, cal.summary);
                if (cal.backgroundColor) {
                    calColorMap[cal.id] = cal.backgroundColor;
                }
            }
        }
        // Merge all events, skip failed calendars, tag with calendar name
        const allEvents = [];
        const seen = new Set();
        for (const calEvents of results){
            if (!calEvents) continue;
            for (const event of calEvents){
                if (!seen.has(event.id)) {
                    seen.add(event.id);
                    event.calendarSummary = calNameMap.get(event.calendarId ?? "") ?? undefined;
                    allEvents.push(event);
                }
            }
        }
        // Sort by start time
        allEvents.sort((a, b)=>new Date(a.start).getTime() - new Date(b.start).getTime());
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("gcal/events: fetched events", {
            userId: user.id,
            calendarCount: calendarIds.length,
            eventCount: allEvents.length
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            events: allEvents,
            calendarColors: calColorMap,
            connected: true
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error("gcal/events: fetch failed", {
            userId: user.id,
            error: message
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch events"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1e2a0a34._.js.map