module.exports = [
"[project]/.claude/worktrees/claude-work/src/hooks/chatSystemEvents.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Helpers for creating client-only system event messages
 * (delete notices, join/leave notifications) in the chat.
 */ __turbopack_context__.s([
    "createSystemEvent",
    ()=>createSystemEvent,
    "fetchUserName",
    ()=>fetchUserName
]);
function createSystemEvent(courseId, id, text) {
    const now = new Date().toISOString();
    return {
        id,
        course_id: courseId,
        author_id: "",
        author_name: null,
        author_avatar: null,
        body: "",
        created_at: now,
        updated_at: now,
        _systemText: text
    };
}
async function fetchUserName(userId) {
    try {
        const res = await fetch(`/api/discussions/profile?userId=${userId}`);
        if (res.ok) {
            const data = await res.json();
            return data.userName ?? "Someone";
        }
    } catch  {}
    return "Someone";
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/chatCache.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * SessionStorage cache helpers for chat messages.
 * Uses a TTL of 5 minutes. Max 200 messages cached per course.
 */ __turbopack_context__.s([
    "readCache",
    ()=>readCache,
    "writeCache",
    ()=>writeCache
]);
const CACHE_PREFIX = "chat_messages_cache_";
const CACHE_TTL = 5 * 60_000;
function readCache(courseId) {
    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + courseId);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() - entry.timestamp > CACHE_TTL) return null;
        return entry.messages;
    } catch  {
        return null;
    }
}
function writeCache(courseId, messages) {
    try {
        sessionStorage.setItem(CACHE_PREFIX + courseId, JSON.stringify({
            messages: messages.slice(0, 200),
            timestamp: Date.now()
        }));
    } catch  {}
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/author-obfuscate.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/.claude/worktrees/claude-work/src/lib/compress-image.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Client-side image compression using the browser Canvas API.
 * Compresses JPEG/PNG/WebP to JPEG at configurable quality,
 * capped at a max dimension to reduce storage costs.
 *
 * No external dependencies — uses only browser-native APIs.
 */ /** Configuration options for image compression. */ __turbopack_context__.s([
    "compressImage",
    ()=>compressImage
]);
const COMPRESSIBLE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);
async function compressImage(file, opts) {
    const maxDim = opts?.maxDimension ?? 1200;
    const quality = opts?.quality ?? 0.75;
    const skipBelow = opts?.skipBelowBytes ?? 153_600;
    // Pass through non-compressible types (GIF, PDF, non-images)
    if (!COMPRESSIBLE_TYPES.has(file.type)) {
        return file;
    }
    // Skip tiny files — re-encoding adds overhead with no benefit
    if (file.size <= skipBelow) {
        return file;
    }
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    // Calculate scaled dimensions preserving aspect ratio
    let targetW = width;
    let targetH = height;
    if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        targetW = Math.round(width * ratio);
        targetH = Math.round(height * ratio);
    }
    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        // Fallback: return original if canvas context unavailable
        bitmap.close();
        return file;
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();
    const blob = await canvas.convertToBlob({
        type: "image/jpeg",
        quality
    });
    // Derive new filename with .jpg extension
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([
        blob
    ], `${baseName}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now()
    });
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/chat-actions.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared chat action utilities for mute, unread, pin, and leave operations.
 * Centralizes localStorage management and event dispatch logic used by
 * ChatSidebar, ChatDetailsSidebar, and ChatContextMenu.
 */ /** localStorage key prefixes for chat state. */ __turbopack_context__.s([
    "MEM_CACHE_PREFIX",
    ()=>MEM_CACHE_PREFIX,
    "MSG_CACHE_PREFIX",
    ()=>MSG_CACHE_PREFIX,
    "MUTE_KEY_PREFIX",
    ()=>MUTE_KEY_PREFIX,
    "NAME_KEY_PREFIX",
    ()=>NAME_KEY_PREFIX,
    "PIN_KEY_PREFIX",
    ()=>PIN_KEY_PREFIX,
    "READ_AT_PREFIX",
    ()=>READ_AT_PREFIX,
    "isPinned",
    ()=>isPinned,
    "leaveGroup",
    ()=>leaveGroup,
    "markAsUnread",
    ()=>markAsUnread,
    "toggleMute",
    ()=>toggleMute,
    "togglePin",
    ()=>togglePin
]);
const MUTE_KEY_PREFIX = "calchat_muted_";
const READ_AT_PREFIX = "calchat_read_at_";
const PIN_KEY_PREFIX = "calchat_pinned_";
const NAME_KEY_PREFIX = "calchat_name_";
const MSG_CACHE_PREFIX = "chat_messages_cache_";
const MEM_CACHE_PREFIX = "chat_members_cache_";
function toggleMute(courseId, currentlyMuted) {
    const newMuted = !currentlyMuted;
    try {
        localStorage.setItem(MUTE_KEY_PREFIX + courseId, String(newMuted));
    } catch  {
    // localStorage unavailable
    }
    window.dispatchEvent(new CustomEvent("calchat-mute-changed", {
        detail: {
            courseId,
            muted: newMuted
        }
    }));
    return newMuted;
}
function markAsUnread(courseId) {
    try {
        localStorage.removeItem(READ_AT_PREFIX + courseId);
    } catch  {
    // localStorage unavailable
    }
    window.dispatchEvent(new CustomEvent("calchat-read-update", {
        detail: {
            courseId
        }
    }));
}
function togglePin(courseId, currentlyPinned) {
    const newPinned = !currentlyPinned;
    try {
        if (newPinned) {
            localStorage.setItem(PIN_KEY_PREFIX + courseId, "true");
        } else {
            localStorage.removeItem(PIN_KEY_PREFIX + courseId);
        }
    } catch  {
    // localStorage unavailable
    }
    window.dispatchEvent(new CustomEvent("calchat-pin-changed", {
        detail: {
            courseId,
            pinned: newPinned
        }
    }));
    return newPinned;
}
function isPinned(courseId) {
    try {
        return localStorage.getItem(PIN_KEY_PREFIX + courseId) === "true";
    } catch  {
        return false;
    }
}
async function leaveGroup(courseId) {
    try {
        const res = await fetch("/api/discussions/leave", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                courseId
            })
        });
        if (!res.ok) {
            const data = await res.json().catch(()=>({}));
            console.error("Failed to leave chat:", data.error ?? res.statusText);
            return false;
        }
        // Clear sessionStorage caches
        try {
            sessionStorage.removeItem(MSG_CACHE_PREFIX + courseId);
            sessionStorage.removeItem(MEM_CACHE_PREFIX + courseId);
        } catch  {
        // sessionStorage unavailable
        }
        // Clear localStorage overrides
        try {
            localStorage.removeItem(NAME_KEY_PREFIX + courseId);
            localStorage.removeItem(MUTE_KEY_PREFIX + courseId);
            localStorage.removeItem(PIN_KEY_PREFIX + courseId);
            localStorage.removeItem(READ_AT_PREFIX + courseId);
        } catch  {
        // localStorage unavailable
        }
        return true;
    } catch (err) {
        console.error("Leave chat error:", err);
        return false;
    }
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useCourseChat.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCourseChat",
    ()=>useCourseChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/realtime-auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatSystemEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/chatSystemEvents.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatCache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/chatCache.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$author$2d$obfuscate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/author-obfuscate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$compress$2d$image$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/compress-image.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$nsfw$2d$check$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/nsfw-check.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sounds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/sounds.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/chat-actions.ts [app-ssr] (ecmascript)");
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
const PAGE_SIZE = 50;
/**
 * Core hook for course group chat.
 * Fetches message history, subscribes to Realtime for live messages,
 * tracks Presence for online users, and provides sendMessage/loadMore.
 *
 * @param courseId - The course UUID to chat in
 * @returns Messages, online users, loading state, and action functions
 */ /** Interval for flushing batched join events in system courses. */ const JOIN_BATCH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
function useCourseChat(courseId, options) {
    const isSystemCourse = options?.isSystemCourse ?? false;
    const isAdminUser = options?.isAdmin ?? false;
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hasMore, setHasMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sending, setSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [spamCooldownEnd, setSpamCooldownEnd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [initialFetchDone, setInitialFetchDone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const channelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const cooldownTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const prevCourseIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(courseId);
    /** Accumulates join names for system courses to batch into one notification. */ const pendingJoinsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const joinTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Maps temporary optimistic IDs to server-assigned IDs for deduplication. */ const tempToServerIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    /** Always points to the current courseId so async callbacks can detect staleness. */ const activeCourseIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(courseId);
    activeCourseIdRef.current = courseId;
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    // Synchronously reset state when courseId changes (prevents stale frame)
    if (prevCourseIdRef.current !== courseId) {
        prevCourseIdRef.current = courseId;
        const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatCache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readCache"])(courseId);
        if (cached && cached.length > 0) {
            setMessages(cached);
            setLoading(false);
        } else {
            setMessages([]);
            setLoading(true);
        }
        setError(null);
        setHasMore(false);
        setInitialFetchDone(false);
    }
    /**
   * Fetches initial message history from the API.
   * Shows cached data first (stale-while-revalidate).
   * Guards against stale responses when courseId changes mid-flight.
   */ const fetchMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setError(null);
        // Show cached data first
        const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatCache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readCache"])(courseId);
        if (cached && cached.length > 0) {
            setMessages(cached);
            setLoading(false);
        }
        try {
            const res = await fetch(`/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=${PAGE_SIZE}`);
            // Stale guard: discard response if user switched chats during fetch
            if (activeCourseIdRef.current !== courseId) return;
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                throw new Error(data.error || `Failed to fetch messages (${res.status})`);
            }
            const data = await res.json();
            // Double-check after parsing JSON
            if (activeCourseIdRef.current !== courseId) return;
            // API returns newest first; reverse for display (oldest at top)
            const sorted = [
                ...data
            ].reverse();
            // Merge: preserve any in-flight optimistic messages (temp-ID) so they
            // don't vanish when the server fetch returns before the send completes.
            setMessages((prev)=>{
                const optimistic = prev.filter((m)=>m.id.startsWith("temp-"));
                if (optimistic.length === 0) return sorted;
                return [
                    ...sorted,
                    ...optimistic
                ];
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatCache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeCache"])(courseId, sorted);
            setHasMore(data.length >= PAGE_SIZE);
        } catch (err) {
            if (activeCourseIdRef.current !== courseId) return;
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
        } finally{
            if (activeCourseIdRef.current === courseId) {
                setLoading(false);
                setInitialFetchDone(true);
            }
        }
    }, [
        courseId
    ]);
    /**
   * Loads older messages before the earliest current message.
   * Prepends to existing messages array.
   */ const loadMore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!hasMore || messages.length === 0) return;
        const oldest = messages[0];
        try {
            const res = await fetch(`/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=${PAGE_SIZE}&before=${encodeURIComponent(oldest.created_at)}`);
            if (!res.ok || activeCourseIdRef.current !== courseId) return;
            const data = await res.json();
            if (activeCourseIdRef.current !== courseId) return;
            const sorted = [
                ...data
            ].reverse();
            setMessages((prev)=>{
                const updated = [
                    ...sorted,
                    ...prev
                ];
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatCache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeCache"])(courseId, updated);
                return updated;
            });
            setHasMore(data.length >= PAGE_SIZE);
        } catch  {
        // Silent failure for pagination
        }
    }, [
        courseId,
        hasMore,
        messages
    ]);
    /**
   * Uploads files to Supabase Storage and returns their public URLs.
   *
   * @param files - Array of File objects to upload
   * @returns Array of public URLs for the uploaded files
   */ const uploadFiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (files)=>{
        const urls = [];
        for (const file of files){
            const processedFile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$compress$2d$image$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["compressImage"])(file);
            // Classify image files for NSFW content before upload
            let isSensitive = false;
            if (processedFile.type.startsWith("image/")) {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$nsfw$2d$check$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["classifyImage"])(processedFile);
                isSensitive = result.isSensitive;
            }
            const ext = processedFile.name.split(".").pop() ?? "bin";
            const path = `${courseId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from("chat-attachments").upload(path, processedFile, {
                cacheControl: "3600",
                upsert: false
            });
            if (uploadError) {
                const isBucketMissing = uploadError.message?.includes("Bucket not found");
                throw new Error(isBucketMissing ? "File uploads are not configured yet. Please run 'supabase db push' to set up storage." : `Upload failed: ${uploadError.message}`);
            }
            const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(path);
            // Prefix sensitive image URLs with [sensitive] marker
            const publicUrl = isSensitive ? `[sensitive]${urlData.publicUrl}` : urlData.publicUrl;
            urls.push(publicUrl);
        }
        return urls;
    }, [
        courseId,
        supabase.storage
    ]);
    /**
   * Sends a new message via the API, optionally with file attachments.
   * Uses optimistic UI: message appears instantly with "sending" status,
   * then updates to "delivered" or "failed" based on API response.
   *
   * @param body - The message text
   * @param files - Optional array of files to attach
   * @param anonymous - Whether to send the message anonymously (no name/avatar stored)
   * @param replyToId - Optional ID of the message being replied to
   */ const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (body, files, anonymous, replyToId)=>{
        if (!body.trim() && (!files || files.length === 0) || sending) return;
        setSending(true);
        setError(null);
        // Generate a temporary ID for optimistic display
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        try {
            let finalBody = body.trim();
            // Upload attachments if any
            if (files && files.length > 0) {
                const urls = await uploadFiles(files);
                const attachmentText = urls.join("\n");
                finalBody = finalBody ? `${finalBody}\n${attachmentText}` : attachmentText;
            }
            // Get current user info for optimistic message
            const { data: { user } } = await supabase.auth.getUser();
            const now = new Date().toISOString();
            // Create optimistic message and append immediately
            const optimisticMsg = {
                id: tempId,
                course_id: courseId,
                author_id: user?.id ?? "",
                author_name: anonymous ? null : user?.user_metadata?.full_name ?? null,
                author_avatar: anonymous ? null : user?.user_metadata?.avatar_url ?? null,
                body: finalBody,
                created_at: now,
                updated_at: now,
                reply_to_id: replyToId ?? null,
                _status: "sending"
            };
            setMessages((prev)=>[
                    ...prev,
                    optimisticMsg
                ]);
            // Register pending sentinel so the Realtime handler can detect
            // that this tempId is awaiting a server ID, even if the INSERT
            // event fires before the API response arrives.
            tempToServerIdRef.current.set(tempId, "pending");
            const res = await fetch("/api/discussions/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    courseId,
                    body: finalBody,
                    anonymous: anonymous ?? false,
                    replyToId: replyToId ?? undefined
                })
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                // Handle spam detection 429 with retryAfter countdown
                if (res.status === 429 && data.retryAfter) {
                    const endTime = Date.now() + data.retryAfter * 1000;
                    setSpamCooldownEnd(endTime);
                    // Clear any existing countdown timer
                    if (cooldownTimerRef.current) {
                        clearInterval(cooldownTimerRef.current);
                    }
                    const updateCountdown = ()=>{
                        const remaining = Math.ceil((endTime - Date.now()) / 1000);
                        if (remaining <= 0) {
                            setError(null);
                            setSpamCooldownEnd(0);
                            if (cooldownTimerRef.current) {
                                clearInterval(cooldownTimerRef.current);
                                cooldownTimerRef.current = null;
                            }
                        } else {
                            setError(`Sending too fast. Try again in ${remaining}s.`);
                        }
                    };
                    updateCountdown();
                    cooldownTimerRef.current = setInterval(updateCountdown, 1000);
                    // Remove the optimistic message and clean up sentinel
                    tempToServerIdRef.current.delete(tempId);
                    setMessages((prev)=>prev.filter((m)=>m.id !== tempId));
                    setSending(false);
                    return;
                }
                throw new Error(data.error || "Failed to send message");
            }
            // API returns the created message with real ID
            const serverMsg = await res.json();
            // Update the mapping with the real server ID for Realtime dedup
            tempToServerIdRef.current.set(tempId, serverMsg.id);
            // Replace optimistic message with server version
            setMessages((prev)=>prev.map((m)=>m.id === tempId ? {
                        ...serverMsg,
                        _status: "delivered"
                    } : m));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sounds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playMessageSent"])();
            // Mark this course as recently sent — GlobalChatNotifier uses this as a
            // secondary filter to suppress self-notifications on quick navigation.
            try {
                localStorage.setItem(`calchat_last_sent_${courseId}`, String(Date.now()));
            } catch  {}
            // Update read_at so the user's own message doesn't trigger an unread badge
            try {
                localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["READ_AT_PREFIX"] + courseId, new Date().toISOString());
            } catch  {}
            window.dispatchEvent(new CustomEvent("calchat-read-update", {
                detail: {
                    courseId
                }
            }));
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
            // Clean up the pending sentinel on failure
            tempToServerIdRef.current.delete(tempId);
            // Mark optimistic message as failed
            setMessages((prev)=>prev.map((m)=>m.id === tempId ? {
                        ...m,
                        _status: "failed"
                    } : m));
        } finally{
            setSending(false);
        }
    }, [
        courseId,
        sending,
        uploadFiles,
        supabase.auth
    ]);
    /**
   * Unsends a message by ID via the API and removes it from local state.
   * Shows a system event: "Name unsent a message" or "Anonymous #N unsent a message".
   *
   * @param messageId - The ID of the message to unsend
   */ const deleteMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (messageId)=>{
        // Compute label before removing, then remove + add system event atomically
        setMessages((prev)=>{
            const msg = prev.find((m)=>m.id === messageId);
            if (!msg) return prev;
            let label;
            if (msg.author_name) {
                label = msg.author_name;
            } else {
                // Compute anonymous number from current message order
                const anonMap = new Map();
                let counter = 0;
                for (const m of prev){
                    if (!m.author_name && !m._systemText && !anonMap.has(m.author_id)) {
                        counter++;
                        anonMap.set(m.author_id, counter);
                    }
                }
                const num = anonMap.get(msg.author_id);
                label = `#${num ?? "?"}`;
            }
            const filtered = prev.filter((m)=>m.id !== messageId);
            return [
                ...filtered,
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatSystemEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSystemEvent"])(courseId, `sys-unsend-${messageId}`, `${label} unsent a message`)
            ];
        });
        try {
            const res = await fetch("/api/discussions/messages", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messageId
                })
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                console.error("Failed to unsend message:", data.error ?? res.statusText);
                fetchMessages();
            }
        } catch (err) {
            console.error("Unsend message error:", err);
            fetchMessages();
        }
    }, [
        courseId,
        fetchMessages
    ]);
    // Subscribe to Realtime for new messages and presence
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchMessages();
        const channel = supabase.channel(`chat:${courseId}`);
        // Listen for new messages via postgres_changes
        channel.on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `course_id=eq.${courseId}`
        }, (payload)=>{
            const newMsg = payload.new;
            setMessages((prev)=>{
                // Check if this server message matches an optimistic message
                const tempEntry = Array.from(tempToServerIdRef.current.entries()).find(([, serverId])=>serverId === newMsg.id);
                if (tempEntry) {
                    // Already replaced by optimistic flow — skip Realtime duplicate
                    tempToServerIdRef.current.delete(tempEntry[0]);
                    return prev;
                }
                // If any temp message is still "pending" (API hasn't responded yet)
                // and the author matches, this Realtime event is likely for our
                // in-flight send. Replace the optimistic message with the real one.
                const pendingEntry = Array.from(tempToServerIdRef.current.entries()).find(([, serverId])=>serverId === "pending");
                if (pendingEntry) {
                    const [pendingTempId] = pendingEntry;
                    const optimistic = prev.find((m)=>m.id === pendingTempId);
                    if (optimistic && optimistic.author_id === newMsg.author_id) {
                        tempToServerIdRef.current.set(pendingTempId, newMsg.id);
                        return prev.map((m)=>m.id === pendingTempId ? {
                                ...newMsg,
                                _status: "delivered"
                            } : m);
                    }
                }
                // Avoid duplicates from normal flow
                if (prev.some((m)=>m.id === newMsg.id)) return prev;
                // Obfuscate anonymous messages from other users (non-admin)
                const finalMsg = !isAdminUser && !newMsg.author_name ? {
                    ...newMsg,
                    author_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$author$2d$obfuscate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["obfuscateAuthorId"])(newMsg.author_id, courseId)
                } : newMsg;
                const updated = [
                    ...prev,
                    finalMsg
                ];
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatCache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeCache"])(courseId, updated);
                return updated;
            });
        });
        // Listen for deleted messages via postgres_changes
        channel.on("postgres_changes", {
            event: "DELETE",
            schema: "public",
            table: "chat_messages",
            filter: `course_id=eq.${courseId}`
        }, (payload)=>{
            const old = payload.old;
            if (!old?.id) return;
            setMessages((prev)=>{
                // Skip if this was our own unsend (system event already added locally)
                if (prev.some((m)=>m.id === `sys-unsend-${old.id}`)) {
                    return prev.filter((m)=>m.id !== old.id);
                }
                let label;
                if (old.author_name) {
                    label = old.author_name;
                } else {
                    // Compute anonymous number from current messages
                    const anonMap = new Map();
                    let counter = 0;
                    for (const m of prev){
                        if (!m.author_name && !m._systemText && !anonMap.has(m.author_id)) {
                            counter++;
                            anonMap.set(m.author_id, counter);
                        }
                    }
                    const num = old.author_id ? anonMap.get(old.author_id) : undefined;
                    label = `#${num ?? "?"}`;
                }
                const filtered = prev.filter((m)=>m.id !== old.id);
                return [
                    ...filtered,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatSystemEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSystemEvent"])(courseId, `sys-unsend-${old.id}`, `${label} unsent a message`)
                ];
            });
        });
        // Subscribe to membership changes for join/leave system events
        const memberChannel = supabase.channel(`members:${courseId}`);
        /** localStorage key for persisting pending join names across navigation. */ const JOIN_STORAGE_KEY = `calchat_pending_joins_${courseId}`;
        /** Reads persisted pending joins from localStorage. */ function loadPendingJoins() {
            try {
                const raw = localStorage.getItem(JOIN_STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch  {
                return [];
            }
        }
        /** Persists pending joins to localStorage. */ function savePendingJoins(names) {
            try {
                if (names.length === 0) {
                    localStorage.removeItem(JOIN_STORAGE_KEY);
                } else {
                    localStorage.setItem(JOIN_STORAGE_KEY, JSON.stringify(names));
                }
            } catch  {}
        }
        // Restore any pending joins from a previous session
        if (isSystemCourse) {
            const persisted = loadPendingJoins();
            if (persisted.length > 0) {
                pendingJoinsRef.current = persisted;
            }
        }
        /**
     * Flushes accumulated join names into a single batched system event.
     * Called on an interval for system courses (calfam).
     */ function flushJoinBatch() {
            const names = pendingJoinsRef.current.splice(0);
            savePendingJoins([]);
            if (names.length === 0) return;
            const text = names.length === 1 ? `${names[0]} joined the group` : `${names.length} new members joined the group`;
            setMessages((prev)=>[
                    ...prev,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatSystemEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSystemEvent"])(courseId, `sys-join-batch-${Date.now()}`, text)
                ]);
        }
        memberChannel.on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "course_memberships",
            filter: `course_id=eq.${courseId}`
        }, async (payload)=>{
            const newMember = payload.new;
            const name = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatSystemEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchUserName"])(newMember.user_id);
            // Notify member list hooks to refetch
            window.dispatchEvent(new CustomEvent("calchat-members-changed", {
                detail: {
                    courseId
                }
            }));
            if (isSystemCourse) {
                pendingJoinsRef.current.push(name);
                savePendingJoins(pendingJoinsRef.current);
            } else {
                setMessages((prev)=>[
                        ...prev,
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatSystemEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSystemEvent"])(courseId, `sys-join-${newMember.user_id}-${Date.now()}`, `${name} joined the group`)
                    ]);
            }
        });
        // For system courses, flush batched joins every hour
        if (isSystemCourse) {
            joinTimerRef.current = setInterval(flushJoinBatch, JOIN_BATCH_INTERVAL_MS);
        }
        memberChannel.on("postgres_changes", {
            event: "DELETE",
            schema: "public",
            table: "course_memberships",
            filter: `course_id=eq.${courseId}`
        }, async (payload)=>{
            const old = payload.old;
            if (!old.user_id) return;
            const name = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatSystemEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchUserName"])(old.user_id);
            // Notify member list hooks to refetch
            window.dispatchEvent(new CustomEvent("calchat-members-changed", {
                detail: {
                    courseId
                }
            }));
            setMessages((prev)=>[
                    ...prev,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatSystemEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSystemEvent"])(courseId, `sys-leave-${old.user_id}-${Date.now()}`, `${name} left the group`)
                ]);
        });
        // Set Realtime auth token BEFORE subscribing so RLS allows events
        let cancelled = false;
        (async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ensureRealtimeAuth"])(supabase);
            if (cancelled) return;
            channel.subscribe();
            channelRef.current = channel;
            memberChannel.subscribe();
        })();
        // Listen for local group name change events
        function handleNameChange(e) {
            const detail = e.detail;
            if (detail?.courseId !== courseId) return;
            setMessages((prev)=>[
                    ...prev,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$chatSystemEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSystemEvent"])(courseId, `sys-name-${Date.now()}`, `Group name changed to "${detail.newName}"`)
                ]);
        }
        window.addEventListener("calchat-name-changed", handleNameChange);
        return ()=>{
            cancelled = true;
            channel.unsubscribe();
            memberChannel.unsubscribe();
            window.removeEventListener("calchat-name-changed", handleNameChange);
            channelRef.current = null;
            if (joinTimerRef.current) {
                clearInterval(joinTimerRef.current);
                joinTimerRef.current = null;
            }
            // Persist any remaining pending joins so they survive navigation
            savePendingJoins(pendingJoinsRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        courseId
    ]);
    // Clean up cooldown timer on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            if (cooldownTimerRef.current) {
                clearInterval(cooldownTimerRef.current);
                cooldownTimerRef.current = null;
            }
        };
    }, []);
    return {
        messages,
        loading,
        error,
        hasMore,
        initialFetchDone,
        sending,
        /** Unix timestamp (ms) when the spam cooldown expires. 0 = no cooldown. */ spamCooldownEnd,
        sendMessage,
        deleteMessage,
        loadMore
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useMessageReactions.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMessageReactions",
    ()=>useMessageReactions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/realtime-auth.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function useMessageReactions(courseId) {
    const [reactionsMap, setReactionsMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Map());
    const supabaseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])());
    const prevCourseIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(courseId);
    // Reset when courseId changes
    if (prevCourseIdRef.current !== courseId) {
        prevCourseIdRef.current = courseId;
        setReactionsMap(new Map());
    }
    /**
   * Fetches all reactions for the current course and builds the map.
   */ const fetchReactions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const res = await fetch(`/api/discussions/reactions?courseId=${encodeURIComponent(courseId)}`);
            if (!res.ok) return;
            const data = await res.json();
            const map = new Map();
            for (const row of data){
                const groups = map.get(row.message_id) ?? [];
                const group = groups.find((g)=>g.emoji === row.emoji);
                if (group) {
                    group.userIds.push(row.user_id);
                } else {
                    groups.push({
                        emoji: row.emoji,
                        userIds: [
                            row.user_id
                        ]
                    });
                }
                map.set(row.message_id, groups);
            }
            setReactionsMap(map);
        } catch  {
        // Silent failure
        }
    }, [
        courseId
    ]);
    /**
   * Toggles a reaction on a message. Optimistically updates local state.
   *
   * @param messageId - The message UUID
   * @param emoji - The tapback emoji
   * @param userId - The current user's ID (for optimistic update)
   */ const toggleReaction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (messageId, emoji, userId)=>{
        // Optimistic update — one reaction per user per message
        setReactionsMap((prev)=>{
            const next = new Map(prev);
            let groups = [
                ...next.get(messageId) ?? []
            ];
            const existingGroup = groups.find((g)=>g.userIds.includes(userId));
            if (existingGroup && existingGroup.emoji === emoji) {
                // Same emoji → toggle off (remove)
                existingGroup.userIds = existingGroup.userIds.filter((id)=>id !== userId);
                if (existingGroup.userIds.length === 0) {
                    groups = groups.filter((g)=>g.emoji !== emoji);
                }
                next.set(messageId, groups);
                return next;
            }
            // Remove user from any existing reaction group first
            if (existingGroup) {
                existingGroup.userIds = existingGroup.userIds.filter((id)=>id !== userId);
                if (existingGroup.userIds.length === 0) {
                    groups = groups.filter((g)=>g.emoji !== existingGroup.emoji);
                }
            }
            // Add user to the new emoji group
            const targetGroup = groups.find((g)=>g.emoji === emoji);
            if (targetGroup) {
                targetGroup.userIds = [
                    ...targetGroup.userIds,
                    userId
                ];
            } else {
                groups.push({
                    emoji,
                    userIds: [
                        userId
                    ]
                });
            }
            next.set(messageId, groups);
            return next;
        });
        // Fire API call (toggle)
        try {
            await fetch("/api/discussions/reactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messageId,
                    emoji,
                    courseId
                })
            });
        } catch  {
            // Refetch on failure to correct state
            fetchReactions();
        }
    }, [
        courseId,
        fetchReactions
    ]);
    // Subscribe to Realtime for reaction changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchReactions();
        const supabase = supabaseRef.current;
        const channel = supabase.channel(`reactions:${courseId}`);
        channel.on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "message_reactions",
            filter: `course_id=eq.${courseId}`
        }, (payload)=>{
            const row = payload.new;
            setReactionsMap((prev)=>{
                const next = new Map(prev);
                const groups = [
                    ...next.get(row.message_id) ?? []
                ];
                const group = groups.find((g)=>g.emoji === row.emoji);
                if (group) {
                    if (!group.userIds.includes(row.user_id)) {
                        group.userIds = [
                            ...group.userIds,
                            row.user_id
                        ];
                    }
                } else {
                    groups.push({
                        emoji: row.emoji,
                        userIds: [
                            row.user_id
                        ]
                    });
                }
                next.set(row.message_id, groups);
                return next;
            });
        });
        channel.on("postgres_changes", {
            event: "DELETE",
            schema: "public",
            table: "message_reactions",
            filter: `course_id=eq.${courseId}`
        }, (payload)=>{
            const old = payload.old;
            setReactionsMap((prev)=>{
                const next = new Map(prev);
                const groups = [
                    ...next.get(old.message_id) ?? []
                ];
                const group = groups.find((g)=>g.emoji === old.emoji);
                if (group) {
                    group.userIds = group.userIds.filter((id)=>id !== old.user_id);
                    if (group.userIds.length === 0) {
                        next.set(old.message_id, groups.filter((g)=>g.emoji !== old.emoji));
                    } else {
                        next.set(old.message_id, groups);
                    }
                }
                return next;
            });
        });
        let cancelled = false;
        (async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ensureRealtimeAuth"])(supabase);
            if (cancelled) return;
            channel.subscribe();
        })();
        return ()=>{
            cancelled = true;
            channel.unsubscribe();
        };
    }, [
        courseId,
        fetchReactions
    ]);
    return {
        reactionsMap,
        fetchReactions,
        toggleReaction
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useTypingIndicator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTypingIndicator",
    ()=>useTypingIndicator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/realtime-auth.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
/** Auto-untrack delay in milliseconds after last keystroke. */ const IDLE_TIMEOUT_MS = 500;
/** Delay before broadcasting typing to others (avoids single-keystroke flicker). */ const START_DEBOUNCE_MS = 50;
function useTypingIndicator(courseId, currentUserId) {
    const [typingUsers, setTypingUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const channelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const idleTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const startDebounceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isTrackingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const supabaseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!courseId || !currentUserId) return;
        const supabase = supabaseRef.current;
        const channel = supabase.channel(`typing:${courseId}`, {
            config: {
                presence: {
                    key: "user_id"
                }
            }
        });
        channel.on("presence", {
            event: "sync"
        }, ()=>{
            const state = channel.presenceState();
            const users = [];
            for (const key of Object.keys(state)){
                const presences = state[key];
                if (presences && presences.length > 0) {
                    const p = presences[0];
                    if (p.user_id !== currentUserId) {
                        users.push({
                            userId: p.user_id,
                            userName: p.user_name
                        });
                    }
                }
            }
            setTypingUsers(users);
        });
        let cancelled = false;
        (async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$realtime$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ensureRealtimeAuth"])(supabase);
            if (cancelled) return;
            channel.subscribe();
            channelRef.current = channel;
        })();
        return ()=>{
            cancelled = true;
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (startDebounceRef.current) clearTimeout(startDebounceRef.current);
            channel.untrack();
            channel.unsubscribe();
            channelRef.current = null;
            isTrackingRef.current = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        courseId,
        currentUserId
    ]);
    /**
   * Signals that the local user started typing.
   * Debounces the first broadcast by START_DEBOUNCE_MS to avoid single-keystroke flicker.
   * Resets the idle timer on every keystroke.
   */ const startTyping = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const channel = channelRef.current;
        if (!channel || !currentUserId) return;
        // Reset idle timer on every keystroke
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(()=>{
            channel.untrack();
            isTrackingRef.current = false;
        }, IDLE_TIMEOUT_MS);
        if (!isTrackingRef.current) {
            // Debounce: wait START_DEBOUNCE_MS of sustained typing before broadcasting
            if (startDebounceRef.current) return; // already waiting
            startDebounceRef.current = setTimeout(async ()=>{
                startDebounceRef.current = null;
                // Only broadcast if user is still typing (idle timer hasn't fired)
                if (idleTimerRef.current) {
                    isTrackingRef.current = true;
                    const { data: { user } } = await supabaseRef.current.auth.getUser();
                    await channel.track({
                        user_id: currentUserId,
                        user_name: user?.user_metadata?.full_name ?? null
                    });
                }
            }, START_DEBOUNCE_MS);
        }
    }, [
        currentUserId
    ]);
    /**
   * Immediately signals that the local user stopped typing (e.g. on send).
   * Clears both the idle timer and any pending start debounce.
   */ const stopTyping = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (startDebounceRef.current) {
            clearTimeout(startDebounceRef.current);
            startDebounceRef.current = null;
        }
        channelRef.current?.untrack();
        isTrackingRef.current = false;
    }, []);
    return {
        typingUsers,
        startTyping,
        stopTyping
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/hooks/useChatMembers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useChatMembers",
    ()=>useChatMembers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const CACHE_PREFIX = "chat_members_cache_";
const CACHE_TTL = 5 * 60_000;
/**
 * Reads cached members from sessionStorage.
 *
 * @param courseId - The course UUID
 * @returns Cached members array or null if missing/expired
 */ function readCache(courseId) {
    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + courseId);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() - entry.timestamp > CACHE_TTL) return null;
        return entry.members;
    } catch  {
        return null;
    }
}
/**
 * Writes members to sessionStorage cache.
 *
 * @param courseId - The course UUID
 * @param members - Members to cache
 */ function writeCache(courseId, members) {
    try {
        sessionStorage.setItem(CACHE_PREFIX + courseId, JSON.stringify({
            members,
            timestamp: Date.now()
        }));
    } catch  {
    /* sessionStorage unavailable */ }
}
function useChatMembers(courseId) {
    const [members, setMembers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>readCache(courseId) ?? []);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>!readCache(courseId));
    const prevCourseIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(courseId);
    /** Ref to track the active courseId for stale-guard in async callbacks. */ const activeCourseIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(courseId);
    activeCourseIdRef.current = courseId;
    // Synchronously update state when courseId changes (no flash frame)
    if (prevCourseIdRef.current !== courseId) {
        prevCourseIdRef.current = courseId;
        const cached = readCache(courseId);
        if (cached) {
            setMembers(cached);
            setLoading(false);
        } else {
            setMembers([]);
            setLoading(true);
        }
    }
    /**
   * Fetches members from API and updates state + cache.
   * Keeps existing data on failure to prevent list from disappearing.
   */ const fetchMembers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        fetch(`/api/discussions/members?courseId=${encodeURIComponent(courseId)}`).then((res)=>{
            if (!res.ok) return null;
            return res.json();
        }).then((data)=>{
            if (activeCourseIdRef.current !== courseId || !data) return;
            setMembers(data);
            writeCache(courseId, data);
        }).catch(()=>{
        // Keep existing members on network error
        }).finally(()=>{
            if (activeCourseIdRef.current === courseId) setLoading(false);
        });
    }, [
        courseId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const cached = readCache(courseId);
        if (cached) {
            setMembers(cached);
            setLoading(false);
        }
        fetchMembers();
        // Listen for member change events (fired by useCourseChat on join/leave)
        function handleMemberChange(e) {
            const detail = e.detail;
            if (detail?.courseId === courseId) {
                fetchMembers();
            }
        }
        window.addEventListener("calchat-members-changed", handleMemberChange);
        return ()=>{
            window.removeEventListener("calchat-members-changed", handleMemberChange);
        };
    }, [
        courseId,
        fetchMembers
    ]);
    return {
        members,
        loading,
        refetch: fetchMembers
    };
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/ImageLightbox.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ImageLightbox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
"use client";
;
;
;
;
function ImageLightbox({ src, onClose }) {
    const backdropRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Close on Escape key. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleKey(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return ()=>document.removeEventListener("keydown", handleKey);
    }, [
        onClose
    ]);
    /** Close when clicking the backdrop (not the image). */ const handleBackdropClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.target === backdropRef.current) onClose();
    }, [
        onClose
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: backdropRef,
        onClick: handleBackdropClick,
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-[lightboxIn_200ms_ease-out] cursor-zoom-out",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onClose,
                className: "absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer z-10",
                "aria-label": "Close",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    size: 20
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ImageLightbox.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ImageLightbox.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: src,
                alt: "Enlarged attachment",
                className: "max-w-[90vw] max-h-[90vh] rounded-lg object-contain animate-[lightboxScale_250ms_cubic-bezier(0.16,1,0.3,1)]",
                draggable: false
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ImageLightbox.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ImageLightbox.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/SensitiveImageOverlay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SensitiveImageOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOff>");
"use client";
;
;
;
function SensitiveImageOverlay({ src, alt = "Sensitive content", className = "", onImageClick }) {
    const [revealed, setRevealed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Reset revealed state when src changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setRevealed(false);
    }, [
        src
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative overflow-hidden rounded-2xl cursor-pointer ${className}`,
        onClick: ()=>{
            if (revealed) {
                onImageClick?.();
            } else {
                setRevealed(true);
            }
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: src,
                alt: alt,
                className: `max-w-[240px] max-h-[320px] object-cover transition-all duration-300 ${revealed ? "" : "blur-[20px] scale-110"}`,
                loading: "lazy"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SensitiveImageOverlay.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            !revealed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex flex-col items-center justify-center bg-black/40 transition-opacity duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                        size: 24,
                        className: "text-white/80 mb-1.5"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SensitiveImageOverlay.tsx",
                        lineNumber: 67,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white/90 text-xs font-medium",
                        children: "Sensitive content"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SensitiveImageOverlay.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white/60 text-[10px] mt-0.5",
                        children: "Click to reveal"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SensitiveImageOverlay.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SensitiveImageOverlay.tsx",
                lineNumber: 66,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/SensitiveImageOverlay.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MessageBubble
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-ssr] (ecmascript) <export default as MoreVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/undo-2.js [app-ssr] (ecmascript) <export default as Undo2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/smile.js [app-ssr] (ecmascript) <export default as Smile>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$corner$2d$up$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CornerUpLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/corner-up-left.js [app-ssr] (ecmascript) <export default as CornerUpLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flag.js [app-ssr] (ecmascript) <export default as Flag>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ImageLightbox$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/ImageLightbox.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SensitiveImageOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/SensitiveImageOverlay.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/** Image file extensions to detect in URLs. */ const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
/** iMessage tapback emoji options. */ const TAPBACK_EMOJI = [
    "❤️",
    "👍",
    "👎",
    "😂",
    "‼️",
    "❓"
];
/**
 * Checks if a string is a URL pointing to an image file.
 * Strips [sensitive] prefix before URL validation.
 *
 * @param text - A single line of message text
 * @returns true if the line is an image URL (with or without [sensitive] prefix)
 */ function isImageUrl(text) {
    let trimmed = text.trim();
    if (trimmed.startsWith("[sensitive]")) trimmed = trimmed.slice("[sensitive]".length);
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
    try {
        const url = new URL(trimmed);
        return IMAGE_EXTENSIONS.test(url.pathname);
    } catch  {
        return false;
    }
}
/**
 * Parses an image line, extracting the URL and sensitivity flag.
 *
 * @param line - A single line of message text (may have [sensitive] prefix)
 * @returns Object with the clean URL and whether it's sensitive
 */ function parseImageLine(line) {
    const trimmed = line.trim();
    if (trimmed.startsWith("[sensitive]")) {
        return {
            url: trimmed.slice("[sensitive]".length),
            isSensitive: true
        };
    }
    return {
        url: trimmed,
        isSensitive: false
    };
}
/**
 * Checks if a message was sent anonymously.
 *
 * @param message - The chat message
 * @returns true if the message has no author identity
 */ function isAnonymous(message) {
    return !message.author_name;
}
function MessageBubble({ message, isOwn, showAuthor, isLastInGroup, isLastMessage, anonymousNumber, reactions, currentUserId, isAdmin, revealedIdentity, onRevealIdentity, replyTo, onDelete, onReport, onReply, onToggleReaction, onViewReactions, onScrollToMessage }) {
    const anonymous = isAnonymous(message);
    const isSending = message._status === "sending";
    const isFailed = message._status === "failed";
    const [showMenu, setShowMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showReactPicker, setShowReactPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [lightboxSrc, setLightboxSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Real name and avatar from lifted reveal state (shared across all messages from same user). */ const revealedName = revealedIdentity?.name ?? null;
    const revealedAvatar = revealedIdentity?.avatar ?? null;
    const [revealing, setRevealing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const menuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const reactPickerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close menu on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!showMenu) return;
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return ()=>document.removeEventListener("mousedown", handleClick);
    }, [
        showMenu
    ]);
    // Close reaction picker on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!showReactPicker) return;
        function handleClick(e) {
            if (reactPickerRef.current && !reactPickerRef.current.contains(e.target)) {
                setShowReactPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return ()=>document.removeEventListener("mousedown", handleClick);
    }, [
        showReactPicker
    ]);
    const showStatus = isOwn && (isSending || isFailed || isLastMessage && !isSending && !isFailed);
    const hasReactions = reactions && reactions.length > 0;
    /** Set of emojis the current user has reacted with (for picker highlighting). */ const myReactions = new Set(reactions?.filter((g)=>currentUserId && g.userIds.includes(currentUserId)).map((g)=>g.emoji) ?? []);
    /** Total number of reactions across all emojis. */ const totalReactionCount = reactions?.reduce((sum, g)=>sum + g.userIds.length, 0) ?? 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex gap-1.5 group/msg ${isOwn ? "flex-row-reverse" : "flex-row"} ${showAuthor ? "mt-3" : "mt-0.5"} ${isSending ? "animate-[fadeInUp_200ms_ease-out]" : "animate-[msgFadeIn_150ms_ease-out]"}`,
        children: [
            !isOwn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-6 shrink-0 flex flex-col justify-end",
                children: isLastInGroup && (anonymous && !revealedAvatar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                        size: 12,
                        className: "text-zinc-500 dark:text-zinc-400"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                        lineNumber: 163,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                    lineNumber: 162,
                    columnNumber: 13
                }, this) : revealedAvatar || message.author_avatar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: revealedAvatar ?? message.author_avatar ?? undefined,
                    alt: "",
                    loading: "lazy",
                    decoding: "async",
                    referrerPolicy: "no-referrer",
                    className: "w-6 h-6 rounded-full object-cover"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                    lineNumber: 166,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground",
                    children: (message.author_name ?? "?")[0]?.toUpperCase()
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                    lineNumber: 175,
                    columnNumber: 13
                }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                lineNumber: 159,
                columnNumber: 18
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`,
                children: [
                    !isOwn && showAuthor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-[11px] font-medium mb-0.5 ml-1 flex items-center gap-1 ${anonymous ? "text-zinc-400 dark:text-zinc-500 italic" : "text-muted-foreground"}`,
                        children: [
                            anonymous ? `#${anonymousNumber ?? "?"}` : message.author_name ?? "Unknown",
                            isAdmin && anonymous && !revealedName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: async ()=>{
                                    setRevealing(true);
                                    try {
                                        const res = await fetch(`/api/discussions/admin/reveal?userId=${message.author_id}`);
                                        if (res.ok) {
                                            const data = await res.json();
                                            const name = data.userName ?? "Unknown";
                                            const avatar = data.userAvatar ?? null;
                                            onRevealIdentity?.(message.author_id, name, avatar);
                                        }
                                    } catch  {}
                                    setRevealing(false);
                                },
                                disabled: revealing,
                                className: "text-[9px] text-blue-400 hover:text-blue-500 cursor-pointer opacity-0 group-hover/msg:opacity-100 transition-opacity",
                                children: revealing ? "…" : "reveal"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                lineNumber: 194,
                                columnNumber: 15
                            }, this),
                            isAdmin && revealedName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] text-blue-400 not-italic",
                                children: [
                                    "(",
                                    revealedName,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                lineNumber: 215,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                        lineNumber: 186,
                        columnNumber: 11
                    }, this),
                    replyTo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>onScrollToMessage?.(replyTo.id),
                        className: `flex items-center gap-1.5 mb-0.5 cursor-pointer hover:opacity-80 transition-opacity ${isOwn ? "mr-1" : "ml-1"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-0.5 h-full min-h-[20px] bg-muted-foreground/30 rounded-full shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                lineNumber: 227,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 text-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-medium text-muted-foreground/70",
                                        children: replyTo.author_name ?? "Anonymous"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                        lineNumber: 229,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-muted-foreground/50 truncate max-w-[200px]",
                                        children: replyTo.body.slice(0, 60)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                        lineNumber: 232,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                lineNumber: 228,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                        lineNumber: 222,
                        columnNumber: 11
                    }, this),
                    message.reply_to_id && !replyTo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-[10px] text-muted-foreground/40 italic mb-0.5 ${isOwn ? "mr-1" : "ml-1"}`,
                        children: "Replied to a deleted message"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"} ${hasReactions ? "mb-2" : ""}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `relative flex flex-col ${isOwn ? "items-end" : "items-start"} min-w-0`,
                                children: [
                                    (()=>{
                                        const lines = message.body.split("\n");
                                        const textLines = lines.filter((l)=>!isImageUrl(l));
                                        const imageEntries = lines.filter((l)=>isImageUrl(l)).map((l)=>parseImageLine(l));
                                        const imageUrls = imageEntries.map((e)=>e.url);
                                        const hasText = textLines.some((l)=>l.trim().length > 0);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                hasText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `px-3.5 py-2 text-[14.5px] leading-[1.35] break-words whitespace-pre-wrap ${isOwn ? `${anonymous ? "bg-[#1C1C1E] dark:bg-[#2C2C2E]" : "bg-[#007AFF]"} text-white ${isLastInGroup && imageUrls.length === 0 ? "rounded-[20px] rounded-br-[6px]" : "rounded-[20px]"}${isSending ? " opacity-70" : ""}` : `bg-[#E9E9EB] dark:bg-[#303030] text-black dark:text-white ${isLastInGroup && imageUrls.length === 0 ? "rounded-[20px] rounded-bl-[6px]" : "rounded-[20px]"}`}`,
                                                    children: textLines.join("\n")
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                    lineNumber: 258,
                                                    columnNumber: 21
                                                }, this),
                                                imageEntries.map((entry, i)=>entry.isSensitive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SensitiveImageOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        src: entry.url,
                                                        alt: "Attachment",
                                                        onImageClick: ()=>setLightboxSrc(entry.url),
                                                        className: `mt-1 ${isLastInGroup && i === imageEntries.length - 1 ? isOwn ? "rounded-br-[6px]" : "rounded-bl-[6px]" : ""}${isSending ? " opacity-70" : ""}`
                                                    }, i, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                        lineNumber: 279,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: entry.url,
                                                        alt: "Attachment",
                                                        onClick: ()=>setLightboxSrc(entry.url),
                                                        className: `max-w-[240px] max-h-[320px] object-cover rounded-2xl mt-1 cursor-zoom-in ${isLastInGroup && i === imageEntries.length - 1 ? isOwn ? "rounded-br-[6px]" : "rounded-bl-[6px]" : ""}${isSending ? " opacity-70" : ""}`,
                                                        loading: "lazy"
                                                    }, i, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                        lineNumber: 291,
                                                        columnNumber: 23
                                                    }, this)),
                                                !hasText && imageUrls.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `px-3.5 py-2 text-[14.5px] leading-[1.35] break-words whitespace-pre-wrap ${isOwn ? `${anonymous ? "bg-[#1C1C1E] dark:bg-[#2C2C2E]" : "bg-[#007AFF]"} text-white rounded-[20px] rounded-br-[6px]${isSending ? " opacity-70" : ""}` : "bg-[#E9E9EB] dark:bg-[#303030] text-black dark:text-white rounded-[20px] rounded-bl-[6px]"}`,
                                                    children: message.body
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                    lineNumber: 307,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true);
                                    })(),
                                    hasReactions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `absolute -bottom-2 flex items-center gap-[2px] px-1 py-[1px] rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 ${isOwn ? "right-1" : "left-1"}`,
                                        children: [
                                            reactions.slice(0, 3).map(({ emoji })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] leading-none",
                                                    children: emoji
                                                }, emoji, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                    lineNumber: 329,
                                                    columnNumber: 19
                                                }, this)),
                                            totalReactionCount > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-medium text-muted-foreground leading-none ml-[1px]",
                                                children: totalReactionCount
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                lineNumber: 332,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                        lineNumber: 323,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                lineNumber: 247,
                                columnNumber: 11
                            }, this),
                            !isSending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex items-center gap-0.5 shrink-0 transition-opacity ${showMenu || showReactPicker ? "opacity-100" : "opacity-0 group-hover/msg:opacity-100"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        ref: reactPickerRef,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setShowReactPicker((v)=>!v),
                                                className: "w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-all cursor-pointer",
                                                "aria-label": "React",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__["Smile"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                    lineNumber: 354,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                lineNumber: 349,
                                                columnNumber: 17
                                            }, this),
                                            showReactPicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `absolute bottom-8 z-30 bg-popover border border-border rounded-full shadow-lg px-1.5 py-1 flex items-center gap-0.5 ${isOwn ? "right-0" : "left-0"}`,
                                                children: TAPBACK_EMOJI.map((emoji)=>{
                                                    const isActive = myReactions.has(emoji);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            onToggleReaction?.(emoji);
                                                            setShowReactPicker(false);
                                                        },
                                                        "aria-label": `React with ${emoji}`,
                                                        className: `w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-base ${isActive ? "bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700" : "hover:bg-muted"}`,
                                                        children: emoji
                                                    }, emoji, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                        lineNumber: 363,
                                                        columnNumber: 25
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                lineNumber: 357,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                        lineNumber: 348,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onReply?.(message),
                                        className: "w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-all cursor-pointer",
                                        "aria-label": "Reply",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$corner$2d$up$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CornerUpLeft$3e$__["CornerUpLeft"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                            lineNumber: 389,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                        lineNumber: 384,
                                        columnNumber: 15
                                    }, this),
                                    (isOwn && onDelete || !isOwn && onReport) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        ref: menuRef,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setShowMenu((v)=>!v),
                                                className: "w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-all cursor-pointer",
                                                "aria-label": "More options",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                    lineNumber: 399,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                lineNumber: 394,
                                                columnNumber: 19
                                            }, this),
                                            showMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute top-7 right-0 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px]",
                                                children: [
                                                    isOwn && onDelete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            setShowMenu(false);
                                                            onDelete(message.id);
                                                        },
                                                        className: "flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-red-500 hover:bg-accent transition-colors cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__["Undo2"], {
                                                                size: 13
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                                lineNumber: 411,
                                                                columnNumber: 27
                                                            }, this),
                                                            "Unsend"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                        lineNumber: 404,
                                                        columnNumber: 25
                                                    }, this),
                                                    !isOwn && onReport && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            setShowMenu(false);
                                                            onReport(message.id);
                                                        },
                                                        className: "flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-red-500 hover:bg-accent transition-colors cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"], {
                                                                size: 13
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                                lineNumber: 423,
                                                                columnNumber: 27
                                                            }, this),
                                                            "Report"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                        lineNumber: 416,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                                lineNumber: 402,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                        lineNumber: 393,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                lineNumber: 342,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this),
                    showStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `flex items-center gap-1 text-[10px] mt-0.5 ${isOwn ? "mr-1" : "ml-1"} ${isFailed ? "text-red-400" : "text-muted-foreground/60"}`,
                        children: [
                            isOwn && anonymous && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                size: 10,
                                className: "text-muted-foreground/50"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                                lineNumber: 441,
                                columnNumber: 15
                            }, this),
                            isOwn && anonymous ? isSending ? "Anonymous · Sending…" : isFailed ? "Anonymous · Failed" : "Anonymous · Delivered" : isSending ? "Sending…" : isFailed ? "Failed" : "Delivered"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                        lineNumber: 437,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                lineNumber: 183,
                columnNumber: 7
            }, this),
            lightboxSrc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ImageLightbox$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                src: lightboxSrc,
                onClose: ()=>setLightboxSrc(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
                lineNumber: 453,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx",
        lineNumber: 153,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/smile.js [app-ssr] (ecmascript) <export default as Smile>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$emoji$2d$mart$2f$data$2f$sets$2f$15$2f$native$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/node_modules/@emoji-mart/data/sets/15/native.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$emoji$2d$mart$2f$react$2f$dist$2f$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@emoji-mart/react/dist/module.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$nsfw$2d$check$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/nsfw-check.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
/** Max file size: 10 MB */ const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf"
];
/** Max number of attachments per message. */ const MAX_ATTACHMENTS = 10;
function ChatInput({ onSend, disabled, error, onTyping }) {
    const [value, setValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [anonymous, setAnonymous] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showEmojiPicker, setShowEmojiPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [attachments, setAttachments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [fileError, setFileError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const emojiRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const emojiBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /**
   * Auto-resizes the textarea to fit content up to 120px.
   */ const autoResize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }, []);
    const handleChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        setValue(e.target.value);
        autoResize();
        onTyping?.();
    }, [
        autoResize,
        onTyping
    ]);
    /**
   * Sends the message with any attachments.
   */ const handleSend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const hasText = value.trim().length > 0;
        const hasFiles = attachments.length > 0;
        if (!hasText && !hasFiles || disabled) return;
        onSend(value.trim(), hasFiles ? attachments.map((a)=>a.file) : undefined, anonymous);
        setValue("");
        setAttachments([]);
        setFileError(null);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            // Keep cursor in the textarea so user can keep typing
            textareaRef.current.focus();
        }
    }, [
        value,
        attachments,
        disabled,
        anonymous,
        onSend
    ]);
    const handleKeyDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [
        handleSend
    ]);
    /**
   * Handles file selection from the file input.
   */ const handleFileSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        const files = e.target.files;
        if (!files) return;
        setFileError(null);
        const newAttachments = [];
        const remaining = MAX_ATTACHMENTS - attachments.length;
        const selectedFiles = Array.from(files).slice(0, remaining);
        if (Array.from(files).length > remaining) {
            setFileError(`Maximum ${MAX_ATTACHMENTS} attachments per message`);
        }
        for (const file of selectedFiles){
            if (file.size > MAX_FILE_SIZE) {
                setFileError(`${file.name} exceeds 10 MB limit`);
                continue;
            }
            if (!ALLOWED_TYPES.includes(file.type)) {
                setFileError(`${file.name}: unsupported file type`);
                continue;
            }
            const isImage = file.type.startsWith("image/");
            const previewUrl = isImage ? URL.createObjectURL(file) : "";
            newAttachments.push({
                file,
                previewUrl,
                isImage
            });
            // Run NSFW classification in background for image files
            if (isImage) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$nsfw$2d$check$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["classifyImage"])(file).then((result)=>{
                    setAttachments((prev)=>prev.map((att)=>att.file === file ? {
                                ...att,
                                isSensitive: result.isSensitive
                            } : att));
                }).catch(()=>{
                    // Fail-closed: classification error marks image as sensitive
                    setAttachments((prev)=>prev.map((att)=>att.file === file ? {
                                ...att,
                                isSensitive: true
                            } : att));
                });
            }
        }
        setAttachments((prev)=>[
                ...prev,
                ...newAttachments
            ]);
        // Reset input so re-selecting the same file works
        e.target.value = "";
    }, []);
    /**
   * Removes a pending attachment by index.
   */ const removeAttachment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((index)=>{
        setAttachments((prev)=>{
            const removed = prev[index];
            if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((_, i)=>i !== index);
        });
    }, []);
    /**
   * Inserts selected emoji at cursor position in textarea.
   */ const handleEmojiSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (emoji)=>{
        const native = emoji.native;
        const el = textareaRef.current;
        if (el) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const newValue = value.slice(0, start) + native + value.slice(end);
            setValue(newValue);
            requestAnimationFrame(()=>{
                el.selectionStart = el.selectionEnd = start + native.length;
                el.focus();
            });
        } else {
            setValue((prev)=>prev + native);
        }
        setShowEmojiPicker(false);
    }, [
        value
    ]);
    // Close emoji picker on outside click (ignore clicks on the toggle button)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!showEmojiPicker) return;
        function handleClick(e) {
            const target = e.target;
            if (emojiBtnRef.current?.contains(target)) return;
            if (emojiRef.current && !emojiRef.current.contains(target)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return ()=>document.removeEventListener("mousedown", handleClick);
    }, [
        showEmojiPicker
    ]);
    // Cleanup object URLs on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            attachments.forEach((a)=>{
                if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
            });
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "px-5 pt-2 pb-4 relative",
        children: [
            showEmojiPicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: emojiRef,
                className: "absolute bottom-16 right-4 z-30 shadow-xl rounded-xl overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$emoji$2d$mart$2f$react$2f$dist$2f$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    data: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$emoji$2d$mart$2f$data$2f$sets$2f$15$2f$native$2e$json__$28$json$29$__["default"],
                    onEmojiSelect: handleEmojiSelect,
                    theme: "auto",
                    previewPosition: "none",
                    skinTonePosition: "none",
                    maxFrequentRows: 2,
                    perLine: 8
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                    lineNumber: 221,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                lineNumber: 220,
                columnNumber: 9
            }, this),
            attachments.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-3 mb-3 flex-wrap px-1",
                children: attachments.map((att, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            att.isImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-sm relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: att.previewUrl,
                                        alt: att.file.name,
                                        className: `max-w-[200px] max-h-[160px] object-cover ${att.isSensitive ? "blur-lg" : ""}`
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                        lineNumber: 240,
                                        columnNumber: 19
                                    }, this),
                                    att.isSensitive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-red-500/80 text-white text-[9px] font-medium",
                                        children: "Sensitive"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                        lineNumber: 246,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-[10px] text-muted-foreground truncate",
                                        children: att.file.name
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                        lineNumber: 250,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                lineNumber: 239,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-[140px] rounded-2xl border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-zinc-800 p-3 flex flex-col items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-10 h-10 rounded-lg bg-muted flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-bold text-muted-foreground",
                                            children: att.file.name.split(".").pop()?.toUpperCase()
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                            lineNumber: 257,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                        lineNumber: 256,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-muted-foreground truncate w-full text-center",
                                        children: att.file.name
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                        lineNumber: 261,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                lineNumber: 255,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>removeAttachment(i),
                                className: "absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 dark:bg-white/80 text-white dark:text-black flex items-center justify-center shadow-sm cursor-pointer hover:bg-black/90 dark:hover:bg-white transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                    lineNumber: 270,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                                lineNumber: 266,
                                columnNumber: 15
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                        lineNumber: 237,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                lineNumber: 235,
                columnNumber: 9
            }, this),
            anonymous && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 mb-2 px-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                        size: 12,
                        className: "text-zinc-500"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                        lineNumber: 280,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-zinc-500 dark:text-zinc-400",
                        children: "Sending anonymously — your name won't be shown"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                        lineNumber: 281,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                lineNumber: 279,
                columnNumber: 9
            }, this),
            (error || fileError) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-red-500 mb-1.5 px-1",
                children: error || fileError
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                lineNumber: 288,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: fileInputRef,
                type: "file",
                multiple: true,
                accept: "image/jpeg,image/png,image/gif,image/webp,application/pdf",
                onChange: handleFileSelect,
                className: "hidden"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                lineNumber: 292,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>fileInputRef.current?.click(),
                        className: "w-10 h-10 rounded-full bg-gray-200/80 dark:bg-black/50 dark:backdrop-blur-sm border border-black/5 dark:border-white/15 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-black/60 transition-colors cursor-pointer active:scale-95",
                        "aria-label": "Add attachment",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            size: 20,
                            strokeWidth: 2.5
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                            lineNumber: 309,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                        lineNumber: 303,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setAnonymous(!anonymous),
                        className: `w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-95 ${anonymous ? "bg-zinc-800 dark:bg-white border-zinc-800 dark:border-white text-white dark:text-zinc-900" : "bg-gray-200/80 dark:bg-black/50 dark:backdrop-blur-sm border-black/5 dark:border-white/15 text-gray-500 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-black/60"}`,
                        "aria-label": anonymous ? "Switch to named message" : "Send anonymously",
                        title: anonymous ? "Anonymous mode on" : "Send anonymously",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                            lineNumber: 322,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                        lineNumber: 311,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 bg-gray-200/80 dark:bg-black/50 dark:backdrop-blur-sm rounded-[22px] border border-black/5 dark:border-white/15 px-4 py-2.5 flex items-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            ref: textareaRef,
                            value: value,
                            onChange: handleChange,
                            onKeyDown: handleKeyDown,
                            placeholder: "Message",
                            "aria-label": "Type a message",
                            rows: 1,
                            className: "flex-1 bg-transparent text-[15px] text-foreground placeholder:text-gray-400 dark:placeholder:text-zinc-500 resize-none outline-none min-h-[24px] max-h-[120px] leading-[24px] py-0"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                            lineNumber: 325,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                        lineNumber: 324,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        ref: emojiBtnRef,
                        type: "button",
                        onClick: ()=>setShowEmojiPicker(!showEmojiPicker),
                        className: "w-10 h-10 rounded-full bg-gray-200/80 dark:bg-black/50 dark:backdrop-blur-sm border border-black/5 dark:border-white/15 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-black/60 transition-colors cursor-pointer active:scale-95",
                        "aria-label": "Emoji",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__["Smile"], {
                            size: 20
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                            lineNumber: 343,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                        lineNumber: 336,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
                lineNumber: 302,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx",
        lineNumber: 217,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/DateSeparator.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DateSeparator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
/**
 * Formats a date string as an iMessage-style label.
 * "Today" includes the time (e.g. "Today 7:52 PM").
 * "Yesterday" includes time. Older dates show day and time.
 *
 * @param dateStr - ISO date string
 * @returns Formatted date label like "Today 7:52 PM"
 */ function formatDateLabel(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - target.getTime()) / 86_400_000);
    const time = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
    if (diffDays === 0) return `Today ${time}`;
    if (diffDays === 1) return `Yesterday ${time}`;
    if (diffDays < 7) {
        const day = date.toLocaleDateString("en-US", {
            weekday: "long"
        });
        return `${day} ${time}`;
    }
    const day = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
    return `${day} ${time}`;
}
function DateSeparator({ date }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-center py-3",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-[11px] font-medium text-muted-foreground/70",
            children: formatDateLabel(date)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/DateSeparator.tsx",
            lineNumber: 50,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/DateSeparator.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/TypingIndicator.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TypingIndicator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function TypingIndicator({ typingUsers }) {
    const active = typingUsers.length > 0;
    const label = active ? formatTypingLabel(typingUsers) : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-1 pl-8 overflow-hidden transition-all duration-200 ${active ? "opacity-100 h-4 mt-4 mb-0" : "opacity-0 h-0 mt-0 mb-0"}`,
        children: [
            active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex gap-[2px]",
                        children: [
                            0,
                            1,
                            2
                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-[4px] h-[4px] rounded-full bg-muted-foreground/50",
                                style: {
                                    animation: "typing-bounce 1.2s ease-in-out infinite",
                                    animationDelay: `${i * 0.2}s`
                                }
                            }, i, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/TypingIndicator.tsx",
                                lineNumber: 29,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/TypingIndicator.tsx",
                        lineNumber: 27,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-muted-foreground/50",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/TypingIndicator.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/TypingIndicator.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/TypingIndicator.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
/**
 * Formats the typing label based on number of typing users.
 *
 * @param users - Array of currently typing users
 * @returns Human-readable label like "Alice is typing..." or "3 people are typing..."
 */ function formatTypingLabel(users) {
    const name = (u)=>u.userName ?? "Someone";
    if (users.length === 1) {
        return `${name(users[0])} is typing…`;
    }
    if (users.length === 2) {
        return `${name(users[0])} and ${name(users[1])} are typing…`;
    }
    return `${users.length} people are typing…`;
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UnsendConfirmModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/undo-2.js [app-ssr] (ecmascript) <export default as Undo2>");
"use client";
;
;
;
function UnsendConfirmModal({ open, onConfirm, onCancel }) {
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [exiting, setExiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Sync visibility with open prop
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (open) {
            setVisible(true);
            setExiting(false);
        }
    }, [
        open
    ]);
    /**
   * Triggers the exit animation, then fires the callback after it completes.
   *
   * @param callback - onConfirm or onCancel to fire after animation
   */ const animateOut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((callback)=>{
        setExiting(true);
        setTimeout(()=>{
            setVisible(false);
            setExiting(false);
            callback();
        }, 180);
    }, []);
    const handleConfirm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        animateOut(onConfirm);
    }, [
        animateOut,
        onConfirm
    ]);
    const handleCancel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        animateOut(onCancel);
    }, [
        animateOut,
        onCancel
    ]);
    // Close on Escape key
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!visible) return;
        function handleKey(e) {
            if (e.key === "Escape") handleCancel();
        }
        document.addEventListener("keydown", handleKey);
        return ()=>document.removeEventListener("keydown", handleKey);
    }, [
        visible,
        handleCancel
    ]);
    if (!visible) return null;
    const backdropClass = exiting ? "animate-unsend-backdrop-out" : "animate-unsend-backdrop-in";
    const cardClass = exiting ? "animate-unsend-card-out" : "animate-unsend-card-in";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] ${backdropClass}`,
        onClick: handleCancel,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-popover rounded-2xl border border-border shadow-xl w-full max-w-[320px] mx-4 p-5 ${cardClass}`,
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center mb-3",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__["Undo2"], {
                            size: 18,
                            className: "text-red-500"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
                            lineNumber: 101,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
                        lineNumber: 100,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
                    lineNumber: 99,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-[15px] font-semibold text-foreground text-center mb-1.5",
                    children: "Unsend message?"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-[13px] text-muted-foreground text-center leading-snug mb-5",
                    children: "This will remove the message for everyone, but people may have already seen it. Unsent messages may still be stored if the message was reported."
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
                    lineNumber: 111,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleConfirm,
                            className: "w-full px-4 py-2 bg-red-500 text-white rounded-xl text-[13px] font-medium hover:bg-red-600 transition-colors cursor-pointer",
                            children: "Unsend"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleCancel,
                            className: "w-full px-4 py-2 bg-muted text-foreground rounded-xl text-[13px] font-medium hover:bg-accent transition-colors cursor-pointer",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
            lineNumber: 94,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReactionsDetailModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOff>");
"use client";
;
;
;
function ReactionsDetailModal({ open, reactions, onClose }) {
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [exiting, setExiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (open) {
            setVisible(true);
            setExiting(false);
        }
    }, [
        open
    ]);
    /**
   * Triggers exit animation then fires the close callback.
   */ const animateOut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setExiting(true);
        setTimeout(()=>{
            setVisible(false);
            setExiting(false);
            onClose();
        }, 180);
    }, [
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!visible) return;
        function handleKey(e) {
            if (e.key === "Escape") animateOut();
        }
        document.addEventListener("keydown", handleKey);
        return ()=>document.removeEventListener("keydown", handleKey);
    }, [
        visible,
        animateOut
    ]);
    if (!visible) return null;
    const backdropClass = exiting ? "animate-unsend-backdrop-out" : "animate-unsend-backdrop-in";
    const cardClass = exiting ? "animate-unsend-card-out" : "animate-unsend-card-in";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] ${backdropClass}`,
        onClick: animateOut,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-popover rounded-2xl border border-border shadow-xl w-full max-w-[340px] mx-4 overflow-hidden ${cardClass}`,
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-4 pt-4 pb-3 border-b border-border",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: animateOut,
                            className: "w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer",
                            "aria-label": "Close",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 16,
                                strokeWidth: 2.5
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-[15px] font-semibold text-foreground",
                            children: "Reactions"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-7"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-h-[320px] overflow-y-auto",
                    children: [
                        reactions.map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0",
                                children: [
                                    r.userAvatar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: r.userAvatar,
                                        alt: "",
                                        referrerPolicy: "no-referrer",
                                        className: "w-9 h-9 rounded-full object-cover shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                                        lineNumber: 118,
                                        columnNumber: 17
                                    }, this) : r.userName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-9 h-9 rounded-full bg-muted flex items-center justify-center text-[13px] font-medium text-muted-foreground shrink-0",
                                        children: r.userName[0]?.toUpperCase()
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                                        lineNumber: 125,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                            size: 14,
                                            className: "text-zinc-500 dark:text-zinc-400"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                                            lineNumber: 130,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                                        lineNumber: 129,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex-1 text-[14px] font-medium text-foreground truncate",
                                        children: r.userName ?? "Anonymous"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                                        lineNumber: 135,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[18px] shrink-0",
                                        children: r.emoji
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                                        lineNumber: 140,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, `${r.userId}-${r.emoji}-${i}`, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                                lineNumber: 112,
                                columnNumber: 13
                            }, this)),
                        reactions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-4 py-6 text-center text-sm text-muted-foreground",
                            children: "No reactions yet"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                            lineNumber: 145,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
                    lineNumber: 110,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
            lineNumber: 89,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$MessageBubble$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/MessageBubble.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/ChatInput.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$DateSeparator$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/DateSeparator.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$TypingIndicator$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/TypingIndicator.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$UnsendConfirmModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/UnsendConfirmModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ReactionsDetailModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/ReactionsDetailModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
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
/**
 * Checks if two dates fall on the same calendar day.
 *
 * @param a - First ISO date string
 * @param b - Second ISO date string
 * @returns true if both dates are on the same day
 */ function sameDay(a, b) {
    return a.slice(0, 10) === b.slice(0, 10);
}
/** Minimum time gap (ms) between messages to show a centered timestamp. */ const TIMESTAMP_GAP = 15 * 60 * 1000;
function ChatView({ messages, loading, hasMore, initialFetchDone, sending, error, currentUserId, isAdmin, onSend, onDelete, onToggleReaction, onLoadMore, reactionsMap, typingUsers, onTyping, onSendComplete }) {
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const bottomBarRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [newMessageCount, setNewMessageCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showScrollBtn, setShowScrollBtn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [replyTarget, setReplyTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Map of anonymous userId → revealed identity. Shared across all MessageBubbles. */ const [revealedIdentities, setRevealedIdentities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Map());
    /** Message ID pending unsend confirmation (null = modal closed). */ const [unsendTargetId, setUnsendTargetId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Message ID whose reactions detail modal is open (null = closed). */ const [reactionDetailMessageId, setReactionDetailMessageId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const prevMessageCountRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const isNearBottomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    /** Tracks the first message ID to detect when the chat is switched (full replace vs append). */ const prevFirstMessageIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /**
   * Checks if the scroll position is near the bottom (within 100px).
   */ const checkNearBottom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const el = scrollRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    }, []);
    /**
   * Scrolls to the bottom of the message list.
   */ const scrollToBottom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((smooth = false)=>{
        const el = scrollRef.current;
        if (el) {
            if (smooth) {
                el.scrollTo({
                    top: el.scrollHeight,
                    behavior: "smooth"
                });
            } else {
                el.scrollTop = el.scrollHeight;
            }
        }
        setNewMessageCount(0);
    }, []);
    // Reset stale count when switching chats (messages array fully replaced)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const firstId = messages.length > 0 ? messages[0].id : null;
        if (prevFirstMessageIdRef.current !== null && firstId !== prevFirstMessageIdRef.current) {
            setNewMessageCount(0);
            setShowScrollBtn(false);
            isNearBottomRef.current = true;
            prevMessageCountRef.current = messages.length;
            hasInitialScrolled.current = false;
        }
        prevFirstMessageIdRef.current = firstId;
    }, [
        messages
    ]);
    // Auto-scroll on new messages when near bottom
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (messages.length > prevMessageCountRef.current) {
            const newCount = messages.length - prevMessageCountRef.current;
            if (isNearBottomRef.current) {
                // Double rAF ensures DOM has fully laid out the new message before scrolling
                requestAnimationFrame(()=>requestAnimationFrame(()=>scrollToBottom(true)));
            } else {
                setNewMessageCount((prev)=>prev + newCount);
            }
        }
        prevMessageCountRef.current = messages.length;
    }, [
        messages.length,
        scrollToBottom
    ]);
    // Auto-scroll when content height grows (e.g. images loading, typing indicator)
    // while locked to bottom. Uses smooth scroll for a subtle feel.
    const prevScrollHeightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const el = scrollRef.current;
        if (!el) return;
        const observer = new ResizeObserver(()=>{
            const newHeight = el.scrollHeight;
            if (newHeight > prevScrollHeightRef.current && isNearBottomRef.current) {
                el.scrollTo({
                    top: newHeight,
                    behavior: "smooth"
                });
            }
            prevScrollHeightRef.current = newHeight;
        });
        // Observe all children so images, typing indicator, etc. trigger re-check
        for (const child of Array.from(el.children)){
            observer.observe(child);
        }
        return ()=>observer.disconnect();
    }, [
        messages.length
    ]);
    // Dynamically size the bottom padding to match the bottom bar's actual height.
    // Adapts automatically when the input grows (multi-line, attachments, reply bar).
    const [bottomBarHeight, setBottomBarHeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(72);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const barEl = bottomBarRef.current;
        if (!barEl) return;
        const observer = new ResizeObserver((entries)=>{
            for (const entry of entries){
                const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
                setBottomBarHeight(height);
            }
        });
        observer.observe(barEl);
        return ()=>observer.disconnect();
    }, []);
    // Initial scroll to bottom — only once when loading finishes.
    // Uses double rAF to ensure the DOM has fully laid out before scrolling.
    const hasInitialScrolled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!loading && messages.length > 0 && !hasInitialScrolled.current) {
            hasInitialScrolled.current = true;
            requestAnimationFrame(()=>requestAnimationFrame(()=>scrollToBottom()));
        }
    }, [
        loading,
        scrollToBottom,
        messages.length
    ]);
    // After the initial API fetch completes, scroll again to ensure correct position.
    // API data may differ from cache (different count or newer messages), so the
    // scroll height can change after the first render from cache.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (initialFetchDone) {
            requestAnimationFrame(()=>requestAnimationFrame(()=>scrollToBottom()));
        }
    }, [
        initialFetchDone,
        scrollToBottom
    ]);
    /**
   * Scrolls to a specific message by ID with smooth animation and flash highlight.
   *
   * @param messageId - The UUID of the message to scroll to
   */ const scrollToMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((messageId)=>{
        const el = document.getElementById(`msg-${messageId}`);
        if (!el) return;
        el.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
        // Flash highlight
        el.style.backgroundColor = "rgba(0, 122, 255, 0.1)";
        setTimeout(()=>{
            el.style.backgroundColor = "";
        }, 1500);
    }, []);
    /**
   * Records a revealed anonymous identity so all messages from that user update.
   *
   * @param userId - The anonymous user's auth ID
   * @param name - Their real display name
   * @param avatar - Their avatar URL (or null)
   */ const onRevealIdentity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((userId, name, avatar)=>{
        setRevealedIdentities((prev)=>{
            const next = new Map(prev);
            next.set(userId, {
                name,
                avatar
            });
            return next;
        });
    }, []);
    /**
   * Reports another user's message to admins via the API.
   * Shows confirmation/error via window.alert (lightweight, no toast dependency).
   *
   * @param messageId - The ID of the message being reported
   */ const handleReport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (messageId)=>{
        const confirmed = window.confirm("Report this message to admins?");
        if (!confirmed) return;
        try {
            const res = await fetch("/api/discussions/report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messageId
                })
            });
            if (res.ok) {
                window.alert("Report submitted. An admin will review this message.");
            } else {
                const data = await res.json().catch(()=>({
                        error: "Unknown error"
                    }));
                window.alert(data.error ?? "Failed to submit report.");
            }
        } catch  {
            window.alert("Network error. Please try again.");
        }
    }, []);
    /**
   * Opens the unsend confirmation modal for a given message.
   *
   * @param messageId - The ID of the message the user wants to unsend
   */ const handleUnsendRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((messageId)=>{
        setUnsendTargetId(messageId);
    }, []);
    /**
   * Confirms the unsend action — deletes the message and closes the modal.
   */ const handleUnsendConfirm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (unsendTargetId) {
            onDelete(unsendTargetId);
        }
        setUnsendTargetId(null);
    }, [
        unsendTargetId,
        onDelete
    ]);
    /**
   * Cancels the unsend action and closes the modal.
   */ const handleUnsendCancel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setUnsendTargetId(null);
    }, []);
    /**
   * Opens the reactions detail modal for a message.
   *
   * @param messageId - The ID of the message whose reactions to display
   */ const handleViewReactions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((messageId)=>{
        setReactionDetailMessageId(messageId);
    }, []);
    /**
   * Builds a lookup map of userId → { name, avatar } from all messages.
   * Used to display reactor names in the reactions detail modal.
   * Users who only sent anonymous messages won't have entries.
   */ const userInfoMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        for (const msg of messages){
            if (msg.author_name && !map.has(msg.author_id)) {
                map.set(msg.author_id, {
                    name: msg.author_name,
                    avatar: msg.author_avatar ?? null
                });
            }
        }
        return map;
    }, [
        messages
    ]);
    /**
   * Flat list of reaction details for the currently open reactions modal.
   * Resolves user IDs to names/avatars via userInfoMap.
   */ const reactionDetails = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!reactionDetailMessageId || !reactionsMap) return [];
        const groups = reactionsMap.get(reactionDetailMessageId) ?? [];
        const details = [];
        for (const group of groups){
            for (const userId of group.userIds){
                const info = userInfoMap.get(userId);
                details.push({
                    userId,
                    emoji: group.emoji,
                    userName: info?.name ?? null,
                    userAvatar: info?.avatar ?? null
                });
            }
        }
        return details;
    }, [
        reactionDetailMessageId,
        reactionsMap,
        userInfoMap
    ]);
    /**
   * Handles scroll events to track position and trigger pagination.
   */ const handleScroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const el = scrollRef.current;
        if (!el) return;
        isNearBottomRef.current = checkNearBottom();
        if (isNearBottomRef.current) {
            setNewMessageCount(0);
            setShowScrollBtn(false);
        } else {
            setShowScrollBtn(true);
        }
        if (el.scrollTop < 100 && hasMore) {
            onLoadMore();
        }
    }, [
        checkNearBottom,
        hasMore,
        onLoadMore
    ]);
    /**
   * Maps anonymous author_id → sequential number (order of first appearance).
   * Only includes authors who sent at least one anonymous message.
   */ const anonymousNumberMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        let counter = 0;
        for (const msg of messages){
            if (!msg.author_name && !msg._systemText && !map.has(msg.author_id)) {
                counter += 1;
                map.set(msg.author_id, counter);
            }
        }
        return map;
    }, [
        messages
    ]);
    /**
   * Merges consecutive "X unsent a message" system events from the same author
   * into a single "X unsent N messages" entry for cleaner display.
   */ const displayMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const result = [];
        for(let i = 0; i < messages.length; i++){
            const msg = messages[i];
            if (msg._systemText && msg._systemText.endsWith("unsent a message")) {
                // Count consecutive unsend events from the same author
                let count = 1;
                const authorPrefix = msg._systemText.replace(" unsent a message", "");
                while(i + count < messages.length && messages[i + count]._systemText === msg._systemText){
                    count++;
                }
                if (count > 1) {
                    // Create a merged event using the first message's ID
                    result.push({
                        ...msg,
                        _systemText: `${authorPrefix} unsent ${count} messages`
                    });
                    i += count - 1; // skip the merged messages
                } else {
                    result.push(msg);
                }
            } else {
                result.push(msg);
            }
        }
        return result;
    }, [
        messages
    ]);
    /**
   * Pre-computes layout data for each message:
   * - showTimestamp: whether to show a centered timestamp before this message
   * - showAuthor: whether to show the author name/avatar
   * - isLastInGroup: whether this is the last message before a visual break
   * - isLastMessage: whether this is the very last non-system message
   */ const messageLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const layout = [];
        // Find index of last non-system message
        let lastNonSystemIdx = -1;
        for(let i = displayMessages.length - 1; i >= 0; i--){
            if (!displayMessages[i]._systemText) {
                lastNonSystemIdx = i;
                break;
            }
        }
        for(let i = 0; i < displayMessages.length; i++){
            const msg = displayMessages[i];
            // System events get default layout (not rendered via MessageBubble)
            if (msg._systemText) {
                layout.push({
                    showTimestamp: false,
                    showAuthor: false,
                    isLastInGroup: false,
                    isLastMessage: false
                });
                continue;
            }
            // Find previous non-system message
            let prevNS = null;
            for(let j = i - 1; j >= 0; j--){
                if (!displayMessages[j]._systemText) {
                    prevNS = displayMessages[j];
                    break;
                }
            }
            // Find next non-system message
            let nextNS = null;
            for(let j = i + 1; j < displayMessages.length; j++){
                if (!displayMessages[j]._systemText) {
                    nextNS = displayMessages[j];
                    break;
                }
            }
            // Show timestamp if: first message, different day, or gap >= 15 min
            const dayChanged = !prevNS || !sameDay(prevNS.created_at, msg.created_at);
            const timeGap = prevNS ? new Date(msg.created_at).getTime() - new Date(prevNS.created_at).getTime() : Infinity;
            const showTimestamp = dayChanged || timeGap >= TIMESTAMP_GAP;
            // Show author if: timestamp break or different author
            const showAuthor = !prevNS || showTimestamp || prevNS.author_id !== msg.author_id;
            // Last in group if: no next message, next has timestamp, or different author
            const nextDayChanged = !nextNS || !sameDay(msg.created_at, nextNS.created_at);
            const nextTimeGap = nextNS ? new Date(nextNS.created_at).getTime() - new Date(msg.created_at).getTime() : Infinity;
            const nextHasTimestamp = nextDayChanged || nextTimeGap >= TIMESTAMP_GAP;
            const isLastInGroup = !nextNS || nextHasTimestamp || nextNS.author_id !== msg.author_id;
            layout.push({
                showTimestamp,
                showAuthor,
                isLastInGroup,
                isLastMessage: i === lastNonSystemIdx
            });
        }
        return layout;
    }, [
        displayMessages
    ]);
    // Loading skeleton
    if (loading && messages.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative h-full overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 overflow-y-auto p-4 space-y-4 pb-24",
                    children: Array.from({
                        length: 6
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex gap-2 animate-pulse ${i % 3 === 0 ? "flex-row-reverse" : ""}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-7 h-7 rounded-full bg-muted shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                    lineNumber: 491,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `rounded-2xl bg-muted ${i % 3 === 0 ? "w-40" : i % 2 === 0 ? "w-52" : "w-32"} h-9`
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                    lineNumber: 492,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                            lineNumber: 487,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                    lineNumber: 485,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute bottom-0 left-0 right-0 z-10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        onSend: ()=>{},
                        disabled: true
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                        lineNumber: 501,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                    lineNumber: 500,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
            lineNumber: 484,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-full overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: scrollRef,
                onScroll: handleScroll,
                className: "absolute inset-0 overflow-y-auto px-3 pt-3 pb-0 scroll-smooth",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center py-4 h-[44px]",
                                children: !hasMore && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[11px] text-muted-foreground",
                                    children: new Date(messages.length > 0 ? messages[0].created_at : Date.now()).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric"
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                    lineNumber: 520,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                lineNumber: 518,
                                columnNumber: 9
                            }, this),
                            displayMessages.map((msg, i)=>{
                                // System events (unsend notice, join/leave) — render as centered label
                                if (msg._systemText) {
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        id: `msg-${msg.id}`,
                                        role: "status",
                                        className: "flex justify-center py-2",
                                        style: {
                                            contentVisibility: "auto",
                                            containIntrinsicSize: "auto 32px"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] text-muted-foreground/60 italic",
                                            children: msg._systemText
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                            lineNumber: 545,
                                            columnNumber: 17
                                        }, this)
                                    }, msg.id, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                        lineNumber: 538,
                                        columnNumber: 15
                                    }, this);
                                }
                                const { showTimestamp, showAuthor, isLastInGroup, isLastMessage } = messageLayout[i];
                                const isOwn = msg.author_id === currentUserId;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    id: `msg-${msg.id}`,
                                    className: "transition-colors duration-500 rounded-lg",
                                    children: [
                                        showTimestamp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$DateSeparator$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            date: msg.created_at
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                            lineNumber: 557,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$MessageBubble$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            message: msg,
                                            isOwn: isOwn,
                                            showAuthor: showAuthor,
                                            isLastInGroup: isLastInGroup,
                                            isLastMessage: isLastMessage,
                                            anonymousNumber: !msg.author_name ? anonymousNumberMap.get(msg.author_id) : undefined,
                                            reactions: reactionsMap?.get(msg.id),
                                            currentUserId: currentUserId,
                                            isAdmin: isAdmin,
                                            revealedIdentity: revealedIdentities.get(msg.author_id),
                                            onRevealIdentity: onRevealIdentity,
                                            replyTo: msg.reply_to_id ? messages.find((m)=>m.id === msg.reply_to_id) ?? null : null,
                                            onDelete: isOwn ? handleUnsendRequest : undefined,
                                            onReport: !isOwn ? handleReport : undefined,
                                            onReply: setReplyTarget,
                                            onToggleReaction: onToggleReaction ? (emoji)=>onToggleReaction(msg.id, emoji, currentUserId) : undefined,
                                            onViewReactions: handleViewReactions,
                                            onScrollToMessage: scrollToMessage
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                            lineNumber: 558,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, msg.id, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                    lineNumber: 556,
                                    columnNumber: 13
                                }, this);
                            }),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$TypingIndicator$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                typingUsers: typingUsers ?? []
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                lineNumber: 583,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                        lineNumber: 515,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            height: Math.max(bottomBarHeight + 20, 100)
                        }
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                        lineNumber: 588,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                lineNumber: 510,
                columnNumber: 7
            }, this),
            showScrollBtn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5",
                style: {
                    bottom: bottomBarHeight + 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>scrollToBottom(true),
                        className: `px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 text-muted-foreground border border-black/10 dark:border-white/10 shadow-sm text-[11px] font-normal whitespace-nowrap transition-all duration-300 ease-out cursor-pointer ${newMessageCount > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`,
                        children: newMessageCount === 1 ? "1 new message" : `${newMessageCount} new messages`
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                        lineNumber: 594,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>scrollToBottom(true),
                        className: "w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/15 shadow-md flex items-center justify-center text-muted-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all cursor-pointer",
                        "aria-label": "Scroll to bottom",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                            lineNumber: 605,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                        lineNumber: 600,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                lineNumber: 593,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: bottomBarRef,
                className: "absolute bottom-0 left-0 right-0 z-10",
                children: [
                    replyTarget && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 px-5 py-2 border-t border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] font-medium text-muted-foreground",
                                        children: [
                                            "Replying to ",
                                            replyTarget.author_name ?? "Anonymous"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                        lineNumber: 616,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[12px] text-muted-foreground/70 truncate",
                                        children: replyTarget.body.slice(0, 80)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                        lineNumber: 619,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                lineNumber: 615,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setReplyTarget(null),
                                className: "w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors cursor-pointer shrink-0",
                                "aria-label": "Cancel reply",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 12
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                    lineNumber: 628,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                                lineNumber: 623,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                        lineNumber: 614,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        onSend: (body, files, anonymous)=>{
                            onSend(body, files, anonymous, replyTarget?.id);
                            setReplyTarget(null);
                            onSendComplete?.();
                        },
                        disabled: sending,
                        error: error,
                        onTyping: onTyping
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                        lineNumber: 634,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                lineNumber: 611,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$UnsendConfirmModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: unsendTargetId !== null,
                onConfirm: handleUnsendConfirm,
                onCancel: handleUnsendCancel
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                lineNumber: 647,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ReactionsDetailModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: reactionDetailMessageId !== null,
                reactions: reactionDetails,
                onClose: ()=>setReactionDetailMessageId(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
                lineNumber: 654,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx",
        lineNumber: 508,
        columnNumber: 5
    }, this);
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
"[project]/.claude/worktrees/claude-work/src/components/discussions/GroupAvatar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GroupAvatar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
/**
 * Gradient color pairs for group chat avatars.
 * Each entry is [from, to] for a CSS gradient.
 */ const GRADIENTS = [
    [
        "#3B82F6",
        "#1D4ED8"
    ],
    [
        "#8B5CF6",
        "#6D28D9"
    ],
    [
        "#EC4899",
        "#BE185D"
    ],
    [
        "#10B981",
        "#047857"
    ],
    [
        "#F59E0B",
        "#D97706"
    ],
    [
        "#EF4444",
        "#B91C1C"
    ],
    [
        "#06B6D4",
        "#0E7490"
    ],
    [
        "#F97316",
        "#C2410C"
    ],
    [
        "#14B8A6",
        "#0F766E"
    ],
    [
        "#A855F7",
        "#7C3AED"
    ]
];
/**
 * Deterministically picks a gradient pair from the course name.
 * Uses a simple hash so the same course always gets the same color.
 *
 * @param name - Course name string
 * @returns [fromColor, toColor] gradient pair
 */ function getGradient(name) {
    let hash = 0;
    for(let i = 0; i < name.length; i++){
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
}
function GroupAvatar({ initials, name, size = 44 }) {
    const [from, to] = getGradient(name);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-full flex items-center justify-center text-white font-bold shrink-0",
        style: {
            width: `${size}px`,
            height: `${size}px`,
            fontSize: `${size * 0.34}px`,
            background: `linear-gradient(135deg, ${from}, ${to})`
        },
        children: initials
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/GroupAvatar.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatContextMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell-off.js [app-ssr] (ecmascript) <export default as BellOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$dot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleDot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-dot.js [app-ssr] (ecmascript) <export default as CircleDot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.js [app-ssr] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin-off.js [app-ssr] (ecmascript) <export default as PinOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
"use client";
;
;
;
/** Menu width for viewport clamping. */ const MENU_WIDTH = 180;
/** Menu height estimate for viewport clamping. */ const MENU_HEIGHT = 180;
function ChatContextMenu({ position, isMuted, isPinned, isSystemCourse, onMute, onMarkUnread, onPin, onLeave, onClose }) {
    // Clamp position so menu stays within viewport
    const x = Math.min(position.x, window.innerWidth - MENU_WIDTH - 8);
    const y = Math.min(position.y, window.innerHeight - MENU_HEIGHT - 8);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50",
                onClick: onClose,
                onContextMenu: (e)=>{
                    e.preventDefault();
                    onClose();
                }
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed z-50 bg-popover rounded-lg shadow-xl border border-border py-1 min-w-[180px]",
                style: {
                    top: y,
                    left: x
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            onMute();
                            onClose();
                        },
                        className: "flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                        children: [
                            isMuted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellOff$3e$__["BellOff"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                                lineNumber: 76,
                                columnNumber: 22
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                                lineNumber: 76,
                                columnNumber: 46
                            }, this),
                            isMuted ? "Unmute" : "Mute"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            onMarkUnread();
                            onClose();
                        },
                        className: "flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$dot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleDot$3e$__["CircleDot"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            "Mark as Unread"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            onPin();
                            onClose();
                        },
                        className: "flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                        children: [
                            isPinned ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__["PinOff"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                                lineNumber: 92,
                                columnNumber: 23
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                                lineNumber: 92,
                                columnNumber: 46
                            }, this),
                            isPinned ? "Unpin" : "Pin"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    !isSystemCourse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-border my-1"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    onLeave();
                                    onClose();
                                },
                                className: "flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this),
                                    "Leave Group"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                                lineNumber: 99,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LeaveGroupModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function LeaveGroupModal({ courseName, onConfirm, onClose }) {
    const [leaving, setLeaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [closing, setClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    /**
   * Animates the modal closed then calls onClose.
   */ const handleClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (leaving) return;
        setClosing(true);
        setTimeout(()=>onClose(), 150);
    }, [
        leaving,
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleKeyDown(e) {
            if (e.key === "Escape") {
                handleClose();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return ()=>document.removeEventListener("keydown", handleKeyDown);
    }, [
        handleClose
    ]);
    /**
   * Handles the leave confirmation with loading state.
   */ const handleConfirm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLeaving(true);
        await onConfirm();
    }, [
        onConfirm
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-150 ${closing ? "opacity-0" : "animate-in fade-in duration-150"}`,
        onClick: handleClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `relative bg-card rounded-2xl border border-border shadow-2xl w-[380px] max-w-[90vw] overflow-hidden transition-all duration-150 ${closing ? "scale-95 opacity-0" : "animate-in zoom-in-95 fade-in duration-200"}`,
            onClick: (e)=>e.stopPropagation(),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-bold text-foreground",
                        children: [
                            "Leave “",
                            courseName,
                            "”?"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 text-sm text-muted-foreground leading-relaxed",
                        children: [
                            "You will be removed from this chat and lose access to all messages.",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-500 font-semibold",
                                children: "You cannot join back ever again."
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx",
                                lineNumber: 80,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx",
                        lineNumber: 78,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end gap-2.5 mt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleClose,
                                disabled: leaving,
                                className: "px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer disabled:opacity-50",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx",
                                lineNumber: 86,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleConfirm,
                                disabled: leaving,
                                className: "px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition-colors cursor-pointer",
                                children: leaving ? "Leaving..." : "Leave Group"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx",
                                lineNumber: 93,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx",
                lineNumber: 74,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx",
            lineNumber: 66,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/chat-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getInitials",
    ()=>getInitials,
    "hasFreshCache",
    ()=>hasFreshCache,
    "prefetchMembers",
    ()=>prefetchMembers,
    "prefetchMessages",
    ()=>prefetchMessages,
    "relativeTime",
    ()=>relativeTime,
    "stripParentheses",
    ()=>stripParentheses,
    "summarizeBody",
    ()=>summarizeBody
]);
/**
 * Pure helper functions extracted from ChatSidebar to keep components
 * under 300 lines. All functions are stateless and framework-agnostic.
 */ /** Image file extensions to detect in message body URLs. */ const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
/** sessionStorage key prefix for cached chat messages. */ const CACHE_PREFIX = "chat_messages_cache_";
/** sessionStorage key prefix for cached chat members. */ const MEMBERS_CACHE_PREFIX = "chat_members_cache_";
/** Cache time-to-live in milliseconds (5 minutes). */ const CACHE_TTL = 5 * 60_000;
function stripParentheses(name) {
    return name.replace(/\s*\([^)]*\)/g, "").trim();
}
function summarizeBody(body) {
    const lines = body.split("\n");
    const textLines = [];
    let imageCount = 0;
    for (const line of lines){
        // Strip [sensitive] prefix before URL detection
        const raw = line.trim();
        const t = raw.startsWith("[sensitive]") ? raw.slice("[sensitive]".length) : raw;
        if ((t.startsWith("http://") || t.startsWith("https://")) && (()=>{
            try {
                return IMAGE_EXT.test(new URL(t).pathname);
            } catch  {
                return false;
            }
        })()) {
            imageCount++;
        } else {
            textLines.push(line);
        }
    }
    const text = textLines.join(" ").trim();
    if (text && imageCount > 0) return `${text} · ${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
    if (imageCount > 0) return `${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
    return text;
}
function relativeTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}
function getInitials(name) {
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}
function hasFreshCache(courseId) {
    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + courseId);
        if (!raw) return false;
        const entry = JSON.parse(raw);
        return Date.now() - entry.timestamp < CACHE_TTL;
    } catch  {
        return false;
    }
}
async function prefetchMessages(courseId) {
    try {
        const res = await fetch(`/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=50`);
        if (!res.ok) return;
        const data = await res.json();
        const sorted = [
            ...data
        ].reverse();
        sessionStorage.setItem(CACHE_PREFIX + courseId, JSON.stringify({
            messages: sorted.slice(0, 200),
            timestamp: Date.now()
        }));
    } catch  {
    // Silent failure for prefetch
    }
}
async function prefetchMembers(courseId) {
    try {
        const existing = sessionStorage.getItem(MEMBERS_CACHE_PREFIX + courseId);
        if (existing) {
            const entry = JSON.parse(existing);
            if (Date.now() - entry.timestamp < CACHE_TTL) return;
        }
        const res = await fetch(`/api/discussions/members?courseId=${encodeURIComponent(courseId)}`);
        if (!res.ok) return;
        const data = await res.json();
        sessionStorage.setItem(MEMBERS_CACHE_PREFIX + courseId, JSON.stringify({
            members: data,
            timestamp: Date.now()
        }));
    } catch  {
    // Silent failure
    }
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell-off.js [app-ssr] (ecmascript) <export default as BellOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.js [app-ssr] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useDiscussionBoards.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$GroupAvatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/GroupAvatar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/ChatContextMenu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$LeaveGroupModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/LeaveGroupModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/chat-actions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/chat-utils.ts [app-ssr] (ecmascript)");
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
/**
 * Single conversation row in the sidebar.
 * Supports right-click context menu and displays pin/mute indicators.
 */ function ChatRow({ board, isActive, isMuted, isPinned, isUnread, onSelect, onContextMenu }) {
    const isSystem = board.course.source === "system";
    const displayName = isSystem ? board.course.name : (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stripParentheses"])(board.course.name);
    const initials = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInitials"])(displayName);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: ()=>onSelect(board.course.id, board.course.name),
        onContextMenu: (e)=>{
            e.preventDefault();
            onContextMenu({
                x: e.clientX,
                y: e.clientY
            });
        },
        disabled: isActive,
        className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left cursor-pointer disabled:cursor-default ${isActive ? "bg-gray-200 dark:bg-zinc-700" : "hover:bg-gray-100 dark:hover:bg-zinc-800"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative shrink-0",
                children: [
                    isSystem ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-11 h-11 rounded-full bg-muted flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/logo.png",
                            alt: "caltodo",
                            className: "w-7 h-7 object-contain"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                            lineNumber: 89,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$GroupAvatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        initials: initials,
                        name: board.course.name,
                        size: 44
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, this),
                    isUnread && !isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-[#007AFF] border-2 border-white dark:border-zinc-900"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-[13px] truncate ${isActive ? "font-semibold text-foreground" : "font-medium text-foreground"}`,
                                children: displayName
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                                lineNumber: 105,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 shrink-0",
                                children: [
                                    isPinned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                                        size: 11,
                                        className: "text-muted-foreground/40"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                                        lineNumber: 116,
                                        columnNumber: 15
                                    }, this),
                                    isMuted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellOff$3e$__["BellOff"], {
                                        size: 11,
                                        className: "text-muted-foreground/40"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                                        lineNumber: 119,
                                        columnNumber: 15
                                    }, this),
                                    board.last_message_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-muted-foreground/60",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["relativeTime"])(board.last_message_at)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                                        lineNumber: 122,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-[12px] truncate mt-0.5 ${isUnread && !isActive ? "text-foreground font-semibold" : "text-muted-foreground"}`,
                        children: board.last_message_body ? `${board.last_message_author ?? "Anonymous"}: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["summarizeBody"])(board.last_message_body)}` : "No messages yet"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
function ChatSidebar({ activeCourseId, onChatSelect }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { boards, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDiscussionBoards"])();
    const [mutedIds, setMutedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [pinnedIds, setPinnedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [readUpdateTick, setReadUpdateTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    // Context menu state
    const [contextMenu, setContextMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Leave confirmation modal target
    const [leaveTarget, setLeaveTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Read mute + pin states from localStorage on mount and when boards change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const muted = new Set();
        const pinned = new Set();
        for (const board of boards){
            try {
                if (localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTE_KEY_PREFIX"] + board.course.id) === "true") {
                    muted.add(board.course.id);
                }
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isPinned"])(board.course.id)) {
                    pinned.add(board.course.id);
                }
            } catch  {
            /* ignore */ }
        }
        setMutedIds(muted);
        setPinnedIds(pinned);
    }, [
        boards
    ]);
    // Listen for mute changes from ChatDetailsSidebar or context menu
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleStorage(e) {
            if (e.key?.startsWith(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTE_KEY_PREFIX"])) {
                const id = e.key.slice(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTE_KEY_PREFIX"].length);
                setMutedIds((prev)=>{
                    const next = new Set(prev);
                    if (e.newValue === "true") next.add(id);
                    else next.delete(id);
                    return next;
                });
            }
            if (e.key?.startsWith(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PIN_KEY_PREFIX"])) {
                const id = e.key.slice(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PIN_KEY_PREFIX"].length);
                setPinnedIds((prev)=>{
                    const next = new Set(prev);
                    if (e.newValue === "true") next.add(id);
                    else next.delete(id);
                    return next;
                });
            }
        }
        function handleMuteChanged(e) {
            const { courseId, muted } = e.detail;
            setMutedIds((prev)=>{
                const next = new Set(prev);
                if (muted) next.add(courseId);
                else next.delete(courseId);
                return next;
            });
        }
        function handlePinChanged(e) {
            const { courseId, pinned } = e.detail;
            setPinnedIds((prev)=>{
                const next = new Set(prev);
                if (pinned) next.add(courseId);
                else next.delete(courseId);
                return next;
            });
        }
        function handleReadUpdate() {
            setReadUpdateTick((t)=>t + 1);
        }
        window.addEventListener("storage", handleStorage);
        window.addEventListener("calchat-mute-changed", handleMuteChanged);
        window.addEventListener("calchat-pin-changed", handlePinChanged);
        window.addEventListener("calchat-read-update", handleReadUpdate);
        return ()=>{
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("calchat-mute-changed", handleMuteChanged);
            window.removeEventListener("calchat-pin-changed", handlePinChanged);
            window.removeEventListener("calchat-read-update", handleReadUpdate);
        };
    }, []);
    // Mark the active chat as read whenever it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["READ_AT_PREFIX"] + activeCourseId, new Date().toISOString());
        } catch  {
        /* ignore */ }
        // Notify sidebar badge to recheck unread count
        window.dispatchEvent(new CustomEvent("calchat-read-update", {
            detail: {
                courseId: activeCourseId
            }
        }));
    }, [
        activeCourseId
    ]);
    /**
   * Checks if a board has unread messages by comparing last_message_at with
   * the stored read_at timestamp. Also considers the user's own last-sent
   * timestamp so messages the current user typed are never flagged unread,
   * and applies a small clock-skew tolerance to avoid flicker when the
   * server's last_message_at is a hair newer than the local read_at.
   */ const OWN_CLOCK_SKEW_MS = 5000;
    function isUnread(board) {
        // readUpdateTick is used to trigger re-evaluation
        void readUpdateTick;
        try {
            // No messages yet → nothing to be unread about
            if (!board.last_message_at) return false;
            const readAt = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["READ_AT_PREFIX"] + board.course.id);
            const lastSentRaw = localStorage.getItem(`calchat_last_sent_${board.course.id}`);
            const readTime = readAt ? new Date(readAt).getTime() : 0;
            const sentTime = lastSentRaw ? parseInt(lastSentRaw, 10) : 0;
            // Never opened AND never sent → unread
            if (!readTime && !sentTime) return true;
            const lastMsg = new Date(board.last_message_at).getTime();
            return lastMsg > Math.max(readTime, sentTime) + OWN_CLOCK_SKEW_MS;
        } catch  {
            return false;
        }
    }
    // Eagerly prefetch messages and members for all chats on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (boards.length === 0) return;
        for (const board of boards){
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasFreshCache"])(board.course.id)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prefetchMessages"])(board.course.id);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prefetchMembers"])(board.course.id);
        }
    }, [
        boards
    ]);
    // Sort boards: system first → pinned → rest (stable order within groups).
    // Unread state intentionally does NOT affect order — reading or receiving a
    // message should not shuffle the list position.
    const sortedBoards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            ...boards
        ].sort((a, b)=>{
            const aSystem = a.course.source === "system" ? 0 : 1;
            const bSystem = b.course.source === "system" ? 0 : 1;
            if (aSystem !== bSystem) return aSystem - bSystem;
            const aPinned = pinnedIds.has(a.course.id) ? 0 : 1;
            const bPinned = pinnedIds.has(b.course.id) ? 0 : 1;
            if (aPinned !== bPinned) return aPinned - bPinned;
            return 0;
        });
    }, [
        boards,
        pinnedIds
    ]);
    /**
   * Handles the leave group confirmation. Calls the API, then navigates
   * to discussions list if the left chat was the active one.
   */ async function handleLeaveConfirm() {
        if (!leaveTarget) return;
        const courseId = leaveTarget.course.id;
        const success = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leaveGroup"])(courseId);
        if (success) {
            setLeaveTarget(null);
            if (courseId === activeCourseId) {
                router.push("/app/discussions");
            }
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 pt-5 pb-3 shrink-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-base md:text-xl font-bold text-foreground",
                    children: "Messages"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                    lineNumber: 326,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                lineNumber: 325,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto px-2 py-1.5",
                children: loading && boards.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1",
                    children: Array.from({
                        length: 5
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 px-3 py-2.5 animate-pulse",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-11 h-11 rounded-full bg-muted shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                                    lineNumber: 338,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3.5 bg-muted rounded w-24 mb-1.5"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                                            lineNumber: 340,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3 bg-muted rounded w-36"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                                            lineNumber: 341,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                                    lineNumber: 339,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                            lineNumber: 334,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                    lineNumber: 332,
                    columnNumber: 11
                }, this) : boards.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-4 py-8 text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: "No chats yet"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                        lineNumber: 348,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                    lineNumber: 347,
                    columnNumber: 11
                }, this) : sortedBoards.map((board)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatRow, {
                        board: board,
                        isActive: board.course.id === activeCourseId,
                        isMuted: mutedIds.has(board.course.id),
                        isPinned: pinnedIds.has(board.course.id),
                        isUnread: isUnread(board),
                        onSelect: onChatSelect,
                        onContextMenu: (pos)=>setContextMenu({
                                board,
                                position: pos
                            })
                    }, board.course.id, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                        lineNumber: 352,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                lineNumber: 330,
                columnNumber: 7
            }, this),
            contextMenu && typeof document !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                position: contextMenu.position,
                isMuted: mutedIds.has(contextMenu.board.course.id),
                isPinned: pinnedIds.has(contextMenu.board.course.id),
                isSystemCourse: contextMenu.board.course.source === "system",
                onMute: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toggleMute"])(contextMenu.board.course.id, mutedIds.has(contextMenu.board.course.id)),
                onMarkUnread: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["markAsUnread"])(contextMenu.board.course.id),
                onPin: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["togglePin"])(contextMenu.board.course.id, pinnedIds.has(contextMenu.board.course.id)),
                onLeave: ()=>setLeaveTarget(contextMenu.board),
                onClose: ()=>setContextMenu(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                lineNumber: 368,
                columnNumber: 9
            }, this),
            leaveTarget && typeof document !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$LeaveGroupModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                courseName: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stripParentheses"])(leaveTarget.course.name),
                onConfirm: handleLeaveConfirm,
                onClose: ()=>setLeaveTarget(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
                lineNumber: 393,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx",
        lineNumber: 323,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MemberList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useChatMembers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useChatMembers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$PresenceContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/PresenceContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/**
 * Returns the Tailwind background class for a given user status.
 *
 * @param status - User status value
 * @returns Tailwind bg class string
 */ function statusDotColor(status) {
    switch(status){
        case "idle":
            return "bg-yellow-500";
        case "dnd":
            return "bg-red-500";
        default:
            return "bg-green-500";
    }
}
function MemberList({ courseId, onlineUserIds, avatarSize = "default", onMemberClick }) {
    const isLg = avatarSize === "lg";
    const { members, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useChatMembers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChatMembers"])(courseId);
    const { userStatuses } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$PresenceContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePresence"])();
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Sort: online members first, then alphabetical within each group
    const sortedMembers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            ...members
        ].sort((a, b)=>{
            const aOnline = onlineUserIds?.has(a.user_id) ? 0 : 1;
            const bOnline = onlineUserIds?.has(b.user_id) ? 0 : 1;
            if (aOnline !== bOnline) return aOnline - bOnline;
            return (a.user_name ?? "").localeCompare(b.user_name ?? "");
        });
    }, [
        members,
        onlineUserIds
    ]);
    // Per-chat online count: only count members of THIS chat who are online
    const onlineCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!onlineUserIds || onlineUserIds.size === 0) return 0;
        return members.filter((m)=>onlineUserIds.has(m.user_id)).length;
    }, [
        members,
        onlineUserIds
    ]);
    if (loading && members.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "animate-pulse",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-3 bg-muted rounded w-20 mb-3"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: Array.from({
                        length: 3
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-5 h-5 rounded-full bg-muted"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                                    lineNumber: 77,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-2.5 bg-muted rounded w-20"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                            lineNumber: 76,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
            lineNumber: 72,
            columnNumber: 7
        }, this);
    }
    if (members.length === 0) return null;
    const visibleMembers = expanded ? sortedMembers : sortedMembers.slice(0, 8);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 pb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[12px] font-medium text-muted-foreground",
                        children: [
                            members.length,
                            " members"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[12px] font-medium",
                        children: onlineCount > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-green-500",
                            children: [
                                onlineCount,
                                " online"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                            lineNumber: 99,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-muted-foreground/40",
                            children: "0 online"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                            lineNumber: 101,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-0.5",
                children: visibleMembers.map((member)=>{
                    const isOnline = onlineUserIds?.has(member.user_id);
                    const status = userStatuses.get(member.user_id) ?? "online";
                    const dotColor = statusDotColor(status);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: ()=>onMemberClick?.(member.user_id),
                        className: `flex items-center gap-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 px-2 -mx-2 transition-colors ${onMemberClick ? "cursor-pointer" : ""}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative shrink-0",
                                children: [
                                    member.user_avatar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: member.user_avatar,
                                        alt: "",
                                        referrerPolicy: "no-referrer",
                                        className: isLg ? "w-14 h-14 rounded-full object-cover" : "w-9 h-9 rounded-full object-cover"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                                        lineNumber: 120,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: isLg ? "w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-medium text-muted-foreground" : "w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground",
                                        children: (member.user_name ?? "?")[0]?.toUpperCase()
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                                        lineNumber: 131,
                                        columnNumber: 19
                                    }, this),
                                    isOnline && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: isLg ? `absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${dotColor} border-[2.5px] border-white dark:border-zinc-900` : `absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${dotColor} border-2 border-white dark:border-zinc-900`
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                                        lineNumber: 142,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                                lineNumber: 118,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: isLg ? "text-[15px] text-foreground truncate" : "text-[14px] text-foreground truncate",
                                children: member.user_name ?? "Unknown"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                                lineNumber: 151,
                                columnNumber: 15
                            }, this)
                        ]
                    }, member.user_id, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                        lineNumber: 113,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            members.length > 8 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pt-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setExpanded(!expanded),
                    className: "text-[11px] text-blue-500 hover:text-blue-600 font-medium cursor-pointer",
                    children: expanded ? "Show less" : `Show all ${members.length}`
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                    lineNumber: 167,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
                lineNumber: 166,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UserProfileModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flag.js [app-ssr] (ecmascript) <export default as Flag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/**
 * Returns a human-readable badge label for a course source.
 *
 * @param source - The course source ("canvas", "gradescope", "pensieve")
 * @returns Display label string
 */ function getSourceLabel(source) {
    switch(source){
        case "canvas":
            return "bCourses";
        case "gradescope":
            return "Gradescope";
        case "pensieve":
            return "Pensive";
        default:
            return source;
    }
}
function UserProfileModal({ userId, onClose }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [userName, setUserName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [userAvatar, setUserAvatar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sharedCourses, setSharedCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [friendCount, setFriendCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [karma, setKarma] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [closing, setClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [reporting, setReporting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/discussions/profile?userId=${encodeURIComponent(userId)}`);
                if (res.ok && !cancelled) {
                    const data = await res.json();
                    setUserName(data.userName);
                    setUserAvatar(data.userAvatar);
                    setSharedCourses(data.sharedCourses ?? []);
                }
            } catch  {
            /* non-critical */ } finally{
                if (!cancelled) setLoading(false);
            }
        }
        async function fetchFriendCount() {
            try {
                const res = await fetch(`/api/friends/count?userId=${encodeURIComponent(userId)}`);
                if (res.ok && !cancelled) {
                    const data = await res.json();
                    setFriendCount(data.count ?? 0);
                }
            } catch  {
            /* non-critical */ }
        }
        async function fetchKarma() {
            try {
                const res = await fetch(`/api/users/karma?userId=${encodeURIComponent(userId)}`);
                if (res.ok && !cancelled) {
                    const data = await res.json();
                    setKarma(data.karma ?? 0);
                }
            } catch  {
            /* non-critical */ }
        }
        fetchProfile();
        fetchFriendCount();
        fetchKarma();
        return ()=>{
            cancelled = true;
        };
    }, [
        userId
    ]);
    /**
   * Animates the modal closed then calls onClose.
   */ const handleClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setClosing(true);
        setTimeout(()=>onClose(), 150);
    }, [
        onClose
    ]);
    /**
   * Reports the user via POST /api/users/report and shows a confirmation alert.
   */ async function handleReport() {
        if (reporting) return;
        setReporting(true);
        try {
            const res = await fetch("/api/users/report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId
                })
            });
            if (res.ok) {
                alert("Report submitted. Thank you.");
            } else {
                const data = await res.json().catch(()=>({}));
                alert(data.error || "Failed to submit report.");
            }
        } catch  {
            alert("Failed to submit report.");
        } finally{
            setReporting(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-150 ${closing ? "opacity-0" : "animate-in fade-in duration-150"}`,
        onClick: handleClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `relative bg-card rounded-2xl border border-border shadow-2xl w-[380px] max-w-[90vw] overflow-hidden transition-all duration-150 ${closing ? "scale-95 opacity-0" : "animate-in zoom-in-95 fade-in duration-200"}`,
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-3 right-3 z-10 flex items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleReport,
                            disabled: reporting,
                            className: "p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-accent transition-colors cursor-pointer disabled:opacity-40",
                            "aria-label": "Report user",
                            title: "Report user",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                            lineNumber: 155,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleClose,
                            className: "p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer",
                            "aria-label": "Close profile",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                            lineNumber: 164,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this),
                loading ? /* Loading skeleton */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 space-y-4 animate-pulse",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-20 h-20 rounded-full bg-muted shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 177,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-5 bg-muted rounded w-32"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                            lineNumber: 179,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3 bg-muted rounded w-20"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                            lineNumber: 180,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 178,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                            lineNumber: 176,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-3 bg-muted rounded w-24"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 184,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-8 bg-muted rounded"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 185,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-8 bg-muted rounded"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 186,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                            lineNumber: 183,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                    lineNumber: 175,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-5 p-5 pb-4",
                            children: [
                                userAvatar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: userAvatar,
                                    alt: "",
                                    className: "w-20 h-20 rounded-full shrink-0",
                                    referrerPolicy: "no-referrer"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 194,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-medium text-muted-foreground shrink-0",
                                    children: (userName ?? "?")[0]?.toUpperCase()
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 201,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-bold text-foreground truncate",
                                            children: userName || "Unknown"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                            lineNumber: 206,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3 mt-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground",
                                                    children: [
                                                        friendCount,
                                                        " ",
                                                        friendCount === 1 ? "Friend" : "Friends"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                                    lineNumber: 210,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground group relative cursor-default",
                                                    children: [
                                                        karma,
                                                        " Karma",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 rounded-lg bg-popover border border-border text-xs text-muted-foreground px-2.5 py-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50",
                                                            children: "Total messages sent in Chat"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                                            lineNumber: 215,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                                    lineNumber: 213,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                            lineNumber: 209,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 205,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                            lineNumber: 192,
                            columnNumber: 13
                        }, this),
                        sharedCourses.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-5 pb-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] font-medium text-foreground mb-2",
                                    children: "Shared Courses"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 226,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1",
                                    children: sharedCourses.map((course)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                router.push(`/app/discussions/${course.id}`);
                                                handleClose();
                                            },
                                            className: "flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm text-foreground truncate flex-1",
                                                    children: course.name
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                                    lineNumber: 239,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0",
                                                    children: getSourceLabel(course.source)
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                                    lineNumber: 242,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, course.id, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                            lineNumber: 231,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                    lineNumber: 229,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                            lineNumber: 225,
                            columnNumber: 15
                        }, this),
                        sharedCourses.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-5 pb-5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground",
                                children: "No shared courses."
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                                lineNumber: 253,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
                            lineNumber: 252,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
            lineNumber: 147,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx",
        lineNumber: 141,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatDetailsSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell-off.js [app-ssr] (ecmascript) <export default as BellOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$MemberList$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/MemberList.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$UserProfileModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/UserProfileModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/chat-actions.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function ChatDetailsSidebar({ courseId, courseName, onlineUserIds, onClose, onNameOverride, onMuteChange, isSystemCourse }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    // Group name editing
    const [nameInput, setNameInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isEditingName, setIsEditingName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Mute state
    const [isMuted, setIsMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Leave confirmation
    const [showLeaveConfirm, setShowLeaveConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [leaving, setLeaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Profile modal
    const [profileUserId, setProfileUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Load persisted name override and mute state from localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const savedName = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NAME_KEY_PREFIX"] + courseId);
            setNameInput(savedName ?? "");
            const savedMute = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTE_KEY_PREFIX"] + courseId);
            setIsMuted(savedMute === "true");
        } catch  {
        // localStorage unavailable
        }
    }, [
        courseId
    ]);
    /**
   * Saves the custom group name to localStorage and notifies parent.
   * An empty value clears the override.
   */ const handleSaveName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const trimmed = nameInput.trim();
        try {
            if (trimmed) {
                localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NAME_KEY_PREFIX"] + courseId, trimmed);
            } else {
                localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NAME_KEY_PREFIX"] + courseId);
            }
        } catch  {
        // localStorage unavailable
        }
        onNameOverride(trimmed || null);
        setIsEditingName(false);
        // Notify chat about the name change
        if (trimmed && trimmed !== courseName) {
            window.dispatchEvent(new CustomEvent("calchat-name-changed", {
                detail: {
                    courseId,
                    newName: trimmed
                }
            }));
        }
    }, [
        courseId,
        courseName,
        nameInput,
        onNameOverride
    ]);
    /**
   * Toggles the mute state using shared action, then updates local + parent state.
   */ const handleToggleMute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const newMuted = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toggleMute"])(courseId, isMuted);
        setIsMuted(newMuted);
        onMuteChange(newMuted);
    }, [
        courseId,
        isMuted,
        onMuteChange
    ]);
    /**
   * Calls the shared leave action, then navigates to discussions list on success.
   */ const handleLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLeaving(true);
        const success = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["leaveGroup"])(courseId);
        if (success) {
            router.push("/app/discussions");
        } else {
            setLeaving(false);
        }
    }, [
        courseId,
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full flex flex-col bg-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-base font-semibold text-foreground",
                        children: "Details"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors cursor-pointer",
                        "aria-label": "Close details",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            size: 14
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                            lineNumber: 134,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto px-5 py-4 space-y-6",
                children: [
                    !isSystemCourse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[12px] font-medium text-muted-foreground",
                                        children: "Group Name"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                        lineNumber: 144,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: isEditingName ? nameInput : nameInput || courseName,
                                        onChange: (e)=>setNameInput(e.target.value),
                                        onFocus: ()=>{
                                            if (!isEditingName) {
                                                setIsEditingName(true);
                                                // Pre-fill with current display name if empty
                                                if (!nameInput) setNameInput(courseName);
                                            }
                                        },
                                        onBlur: ()=>{
                                            handleSaveName();
                                        },
                                        onKeyDown: (e)=>{
                                            if (e.key === "Enter") e.target.blur();
                                            if (e.key === "Escape") {
                                                setIsEditingName(false);
                                                // Reset to saved value
                                                try {
                                                    const saved = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NAME_KEY_PREFIX"] + courseId);
                                                    setNameInput(saved ?? "");
                                                } catch  {}
                                            }
                                        },
                                        placeholder: courseName,
                                        maxLength: 60,
                                        className: "mt-1.5 w-full px-3 py-1.5 text-sm rounded-lg border border-transparent bg-transparent text-foreground placeholder:text-muted-foreground/50 hover:border-border focus:border-border focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors cursor-text"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                        lineNumber: 147,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                className: "border-border -mx-5"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                lineNumber: 178,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2.5",
                                children: [
                                    isMuted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BellOff$3e$__["BellOff"], {
                                        size: 16,
                                        className: "text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                        lineNumber: 186,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                        size: 16,
                                        className: "text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                        lineNumber: 188,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-foreground",
                                        children: "Mute Messages"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                        lineNumber: 190,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleToggleMute,
                                className: `relative w-10 h-6 rounded-full transition-colors cursor-pointer ${isMuted ? "bg-blue-500" : "bg-muted-foreground/30"}`,
                                role: "switch",
                                "aria-checked": isMuted,
                                "aria-label": "Mute messages",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isMuted ? "translate-x-4" : "translate-x-0"}`
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                    lineNumber: 201,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                        className: "border-border -mx-5"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                        lineNumber: 209,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$MemberList$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            courseId: courseId,
                            onlineUserIds: onlineUserIds,
                            avatarSize: "lg",
                            onMemberClick: setProfileUserId
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                            lineNumber: 213,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                        lineNumber: 212,
                        columnNumber: 9
                    }, this),
                    !isSystemCourse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                className: "border-border -mx-5"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                lineNumber: 224,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: showLeaveConfirm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: "You will be removed from this chat and lose access to its messages. This cannot be undone."
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                            lineNumber: 229,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleLeave,
                                                    disabled: leaving,
                                                    className: "px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition-colors cursor-pointer",
                                                    children: leaving ? "Leaving..." : "Confirm Leave"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                                    lineNumber: 233,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setShowLeaveConfirm(false),
                                                    disabled: leaving,
                                                    className: "px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                                                    children: "Cancel"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                                    lineNumber: 240,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                            lineNumber: 232,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                    lineNumber: 228,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowLeaveConfirm(true),
                                    className: "flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                            size: 15
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                            lineNumber: 254,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Leave Chat"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                            lineNumber: 255,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                    lineNumber: 250,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                                lineNumber: 226,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this),
            profileUserId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$UserProfileModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                userId: profileUserId,
                onClose: ()=>setProfileUserId(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
                lineNumber: 265,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CalChatWelcomeModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-ssr] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-ssr] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useOnboardingStatus.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDismissedModals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useDismissedModals.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function CalChatWelcomeModal() {
    const { hasCompletedOnboarding } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOnboardingStatus"])();
    const { isDismissed, dismiss, loaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDismissedModals$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDismissedModals"])();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [exiting, setExiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [respectChecked, setRespectChecked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [trackingChecked, setTrackingChecked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!loaded) return;
        if (!hasCompletedOnboarding || isDismissed("calchat_welcome")) return;
        setVisible(true);
    }, [
        loaded,
        hasCompletedOnboarding,
        isDismissed
    ]);
    /**
   * Accepts the community standards and dismisses the modal.
   */ const handleAccept = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        dismiss("calchat_welcome");
        setExiting(true);
        setTimeout(()=>{
            setVisible(false);
            setExiting(false);
        }, 250);
    }, [
        dismiss
    ]);
    if (!visible) return null;
    const backdropClass = exiting ? "animate-announce-backdrop-out" : "animate-announce-backdrop-in";
    const cardClass = exiting ? "animate-announce-card-out" : "animate-announce-card-in";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm ${backdropClass}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-popover rounded-2xl shadow-2xl w-full w-[calc(100%-2rem)] max-w-md p-8 ${cardClass}`,
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center gap-2 mb-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-1 w-16 rounded-full bg-foreground"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                    lineNumber: 62,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xl font-semibold text-foreground mb-2 animate-drop-in",
                    style: {
                        animationDelay: "150ms"
                    },
                    children: "welcome to Chat"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground mb-6 leading-relaxed animate-drop-in",
                    style: {
                        animationDelay: "220ms"
                    },
                    children: "chat with your classmates in real time. you can send messages with your name or anonymously."
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6 animate-drop-in",
                    style: {
                        animationDelay: "290ms"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3.5 py-4 border-t border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                    size: 18,
                                    className: "text-foreground shrink-0 mt-0.5"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 89,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-foreground",
                                            children: "real-time class chat"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                            lineNumber: 91,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                            children: "message classmates, share files, and react to messages"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                            lineNumber: 92,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                            lineNumber: 88,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3.5 py-4 border-t border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                    size: 18,
                                    className: "text-foreground shrink-0 mt-0.5"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 100,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-foreground",
                                            children: "anonymous mode"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                            lineNumber: 102,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                            children: "send messages anonymously — your identity is hidden from other students"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                            lineNumber: 103,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 101,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                            lineNumber: 99,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3.5 py-4 border-t border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                    size: 18,
                                    className: "text-foreground shrink-0 mt-0.5"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-foreground",
                                            children: "safe and moderated"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                            lineNumber: 113,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                            children: "anonymous messages are tracked for safety but never shown to other students"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                            lineNumber: 114,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-3 mb-6 animate-drop-in",
                    style: {
                        animationDelay: "340ms"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-start gap-3 cursor-pointer select-none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: respectChecked,
                                    onChange: (e)=>setRespectChecked(e.target.checked),
                                    className: "mt-0.5 w-4 h-4 rounded border-border accent-foreground cursor-pointer"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 127,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[13px] text-foreground leading-snug",
                                    children: "I will be respectful and follow community standards"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 133,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-start gap-3 cursor-pointer select-none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: trackingChecked,
                                    onChange: (e)=>setTrackingChecked(e.target.checked),
                                    className: "mt-0.5 w-4 h-4 rounded border-border accent-foreground cursor-pointer"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 138,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[13px] text-foreground leading-snug",
                                    children: "I understand anonymous messages are tracked for safety"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                                    lineNumber: 144,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                            lineNumber: 137,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end animate-drop-in",
                    style: {
                        animationDelay: "410ms"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleAccept,
                        disabled: !respectChecked || !trackingChecked,
                        className: "px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
                        children: "let's go →"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                        lineNumber: 155,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
                    lineNumber: 151,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
            lineNumber: 57,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this), document.body);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CalChatLockedModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as Lock>");
"use client";
;
;
;
;
function CalChatLockedModal({ open, onClose }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const isTourActive = false; // Tour removed
    /**
   * Navigates to Settings/Integrations to sync classes.
   */ const handleSync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        onClose();
        router.push("/app/settings?section=integrations");
    }, [
        router,
        onClose
    ]);
    // Close on Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        function handleKeyDown(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKeyDown);
        return ()=>document.removeEventListener("keydown", handleKeyDown);
    }, [
        open,
        onClose
    ]);
    if (!open) return null;
    /** Card content shared between tour and non-tour rendering. */ const cardContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center mb-4 animate-drop-in",
                style: {
                    animationDelay: "150ms"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-drop-in",
                style: {
                    animationDelay: "360ms"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-drop-in text-center mt-3",
                style: {
                    animationDelay: "410ms"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md animate-announce-backdrop-in",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
"[project]/.claude/worktrees/claude-work/src/lib/admin.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/logger.ts [app-ssr] (ecmascript)");
;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
function isAdmin(email) {
    if (!email) return false;
    const result = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (result) {
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logger"].info("Admin access granted", {
            email
        });
    }
    return result;
}
}),
"[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourseChatPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCourseChat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useCourseChat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useMessageReactions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useMessageReactions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$PresenceContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/PresenceContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useTypingIndicator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useTypingIndicator.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useChatMembers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useChatMembers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/ChatView.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatSidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/ChatSidebar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatDetailsSidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/ChatDetailsSidebar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useDiscussionBoards.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$CalChatWelcomeModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/discussions/CalChatWelcomeModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$CalChatLockedModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/CalChatLockedModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useOnboardingStatus.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/chat-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/chat-actions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$admin$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/admin.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sounds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/sounds.ts [app-ssr] (ecmascript)");
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
;
;
;
const LAST_CHAT_KEY = "calchat_last_course";
/**
 * Thin loading bar at the top that reflects actual load progress.
 * Quickly fills to ~80%, then completes when `done` becomes true.
 *
 * @param done - Set to true when loading finishes to fill to 100% and fade out
 */ function LoadingBar({ done }) {
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const intervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Kick off to 20% immediately
        setProgress(20);
        setVisible(true);
        // Creep toward 80% over time
        intervalRef.current = setInterval(()=>{
            setProgress((p)=>{
                if (p >= 80) return p;
                return p + (80 - p) * 0.1;
            });
        }, 200);
        return ()=>{
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (done) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setProgress(100);
            const timer = setTimeout(()=>setVisible(false), 300);
            return ()=>clearTimeout(timer);
        }
    }, [
        done
    ]);
    if (!visible) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute top-0 left-0 right-0 h-0.5 z-20 overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full bg-[#007AFF] origin-left transition-transform duration-300 ease-out",
            style: {
                transform: `scaleX(${progress / 100})`
            }
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
            lineNumber: 68,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
function CourseChatPage({ params }) {
    const { courseId: initialCourseId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["use"])(params);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { hasCompletedOnboarding, loading: onboardingLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useOnboardingStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOnboardingStatus"])({
        skipCache: true
    });
    const initialName = searchParams.get("name") || "Chat";
    // Active chat managed as client state for instant switching
    const [activeCourseId, setActiveCourseId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialCourseId);
    const [activeCourseName, setActiveCourseName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialName);
    const [nameOverride, setNameOverride] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isMuted, setIsMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const displayName = nameOverride || (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stripParentheses"])(activeCourseName);
    const supabaseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])());
    /** Tracks message count to detect genuinely new messages (vs initial load). */ const notifBaselineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { boards } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDiscussionBoards$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDiscussionBoards"])();
    const activeBoard = boards.find((b)=>b.course.id === activeCourseId);
    const activeMemberCount = activeBoard?.member_count ?? 0;
    const isSystemCourse = activeBoard?.course.source === "system";
    const [currentUserId, setCurrentUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isAdmin, setIsAdmin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDetails, setShowDetails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { messages, loading, hasMore, initialFetchDone, sending, error, sendMessage, deleteMessage, loadMore } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useCourseChat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCourseChat"])(activeCourseId, {
        isSystemCourse,
        isAdmin
    });
    const { onlineUserIds } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$PresenceContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePresence"])();
    const { members: chatMembers } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useChatMembers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChatMembers"])(activeCourseId);
    const { reactionsMap, toggleReaction } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useMessageReactions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMessageReactions"])(activeCourseId);
    const { typingUsers, startTyping, stopTyping } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useTypingIndicator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTypingIndicator"])(activeCourseId, currentUserId);
    // Per-chat online count: only count members of THIS chat who are online
    const chatOnlineCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (onlineUserIds.size === 0 || chatMembers.length === 0) return 0;
        return chatMembers.filter((m)=>onlineUserIds.has(m.user_id)).length;
    }, [
        onlineUserIds,
        chatMembers
    ]);
    // Get current user ID and admin status — only once
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        supabaseRef.current.auth.getUser().then(({ data: { user } })=>{
            if (user) {
                setCurrentUserId(user.id);
                // UI hint only — server enforces admin in /api/discussions/admin/reveal
                setIsAdmin((0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$admin$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAdmin"])(user.email));
            }
            setReady(true);
        });
    }, []);
    // Load persisted name override, mute state, and save last-viewed chat
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const savedName = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NAME_KEY_PREFIX"] + activeCourseId);
            setNameOverride(savedName);
            const savedMute = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUTE_KEY_PREFIX"] + activeCourseId);
            setIsMuted(savedMute === "true");
            // Remember this chat for next visit
            localStorage.setItem(LAST_CHAT_KEY, activeCourseId);
        } catch  {
        // localStorage unavailable
        }
    }, [
        activeCourseId
    ]);
    /**
   * Switches to a different chat without full page navigation.
   * Updates state immediately and silently updates the URL bar.
   */ const handleChatSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((courseId, courseName)=>{
        if (courseId === activeCourseId) return;
        setActiveCourseId(courseId);
        setActiveCourseName(courseName);
        notifBaselineRef.current = null; // Reset so first load of new chat doesn't notify
        const url = `/app/discussions/${courseId}?name=${encodeURIComponent(courseName)}`;
        window.history.replaceState(null, "", url);
    }, [
        activeCourseId
    ]);
    // Request desktop notification permission on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);
    // Desktop notifications for new messages from others (suppressed when muted).
    // Gated on initialFetchDone so pre-existing messages never trigger notifications.
    /** Tracks whether notification baseline has been initialized after initial fetch. */ const notifInitializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    /** Tracks the timestamp of the last desktop notification for throttling (max 1 per 5s). */ const lastNotifTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    // Reset notification baseline when switching chats
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        notifBaselineRef.current = null;
        notifInitializedRef.current = false;
    }, [
        activeCourseId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Wait for initial fetch to complete before monitoring
        if (!initialFetchDone || messages.length === 0) return;
        // First run after fetch: snapshot baseline without notifying
        if (!notifInitializedRef.current) {
            notifInitializedRef.current = true;
            notifBaselineRef.current = messages.length;
            return;
        }
        // Only notify when messages actually increased beyond baseline
        if (notifBaselineRef.current !== null && messages.length <= notifBaselineRef.current) {
            notifBaselineRef.current = messages.length;
            return;
        }
        notifBaselineRef.current = messages.length;
        if (isMuted || !currentUserId || !("Notification" in window) || Notification.permission !== "granted" || !document.hidden) {
            return;
        }
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.author_id === currentUserId || lastMsg._systemText) return;
        const senderLabel = lastMsg.author_name ?? "Anonymous";
        // Summarize message body: replace image URLs with friendly label
        const imageExt = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
        const lines = lastMsg.body.split("\n");
        const textLines = lines.filter((l)=>{
            const t = l.trim();
            if (!t.startsWith("http://") && !t.startsWith("https://")) return true;
            try {
                return !imageExt.test(new URL(t).pathname);
            } catch  {
                return true;
            }
        });
        const imageCount = lines.length - textLines.length;
        const textPart = textLines.join(" ").trim();
        let notifBody;
        if (textPart && imageCount > 0) {
            notifBody = `${textPart.slice(0, 80)} · ${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
        } else if (imageCount > 0) {
            notifBody = `${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
        } else {
            notifBody = textPart.slice(0, 100);
        }
        // Throttle: max 1 desktop notification per 5 seconds
        const notifNow = Date.now();
        if (notifNow - lastNotifTimeRef.current < 5000) return;
        lastNotifTimeRef.current = notifNow;
        new Notification(`CalTodo — ${senderLabel}`, {
            body: `${displayName}: ${notifBody}`,
            icon: "/icon-light.png",
            tag: `caltodo-chat-${activeCourseId}`
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        messages.length,
        initialFetchDone
    ]);
    // Play receive sound ONLY for genuinely new real-time messages.
    // Tracks last message ID (not count) to avoid false triggers from
    // initial load, cache hydration, chat switching, or loadMore.
    /** ID of the newest message when baseline was established. */ const soundLastIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Whether the sound baseline has been initialized after initial fetch. */ const soundInitializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Reset sound tracking when switching chats
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        soundLastIdRef.current = null;
        soundInitializedRef.current = false;
    }, [
        activeCourseId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Wait for initial fetch to complete before monitoring
        if (!initialFetchDone || messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        // First run after fetch: snapshot baseline ID without playing
        if (!soundInitializedRef.current) {
            soundInitializedRef.current = true;
            soundLastIdRef.current = lastMsg.id;
            return;
        }
        // Last message unchanged — no new message appended (e.g. loadMore prepends)
        if (lastMsg.id === soundLastIdRef.current) return;
        soundLastIdRef.current = lastMsg.id;
        // Guard: muted, no user, own message, or system event
        if (isMuted || !currentUserId) return;
        if (lastMsg.author_id === currentUserId || lastMsg._systemText) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$sounds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playMessageReceived"])();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        messages.length,
        initialFetchDone
    ]);
    // Show loading bar while chat data or user ID is loading
    const isLoading = !ready || loading && messages.length === 0;
    const loadingDone = ready && !loading;
    // Block access while onboarding status is loading (prevents bypass via network throttle)
    // and when onboarding is confirmed incomplete
    if (onboardingLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-full",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                lineNumber: 314,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
            lineNumber: 313,
            columnNumber: 7
        }, this);
    }
    if (!hasCompletedOnboarding) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$CalChatLockedModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            open: true,
            onClose: ()=>router.push("/app/inbox")
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
            lineNumber: 321,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "tour-calchat-page",
        className: "absolute inset-0 flex",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$CalChatWelcomeModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                lineNumber: 327,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:flex w-72 shrink-0 border-r border-black/30 dark:border-white/20 flex-col",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatSidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    activeCourseId: activeCourseId,
                    onChatSelect: handleChatSelect
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                    lineNumber: 330,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                lineNumber: 329,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0 flex flex-col relative",
                children: [
                    isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingBar, {
                        done: loadingDone
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                        lineNumber: 339,
                        columnNumber: 23
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 px-4 pt-5 pb-3 border-b border-black/30 dark:border-white/20 shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.back(),
                                className: "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer md:hidden",
                                title: "Back to all chats",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    size: 18,
                                    className: "text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                    lineNumber: 348,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                lineNumber: 343,
                                columnNumber: 11
                            }, this),
                            isSystemCourse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "/logo.png",
                                    alt: "caltodo",
                                    className: "w-5 h-5 object-contain"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                    lineNumber: 352,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                lineNumber: 351,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-sm font-semibold text-foreground truncate",
                                        children: displayName
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                        lineNumber: 360,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] font-medium h-[16px] text-muted-foreground/40 dark:text-muted-foreground/70",
                                        children: [
                                            activeMemberCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    activeMemberCount,
                                                    " members · "
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                                lineNumber: 364,
                                                columnNumber: 41
                                            }, this),
                                            chatOnlineCount > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-green-500",
                                                children: [
                                                    chatOnlineCount,
                                                    " online"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                                lineNumber: 366,
                                                columnNumber: 19
                                            }, this) : "0 online"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                        lineNumber: 363,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                lineNumber: 359,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowDetails((v)=>!v),
                                className: "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer",
                                "aria-label": "View details",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    size: 18,
                                    className: "text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                    lineNumber: 376,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                                lineNumber: 371,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                        lineNumber: 342,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-h-0 flex flex-col",
                        children: ready ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            messages: messages,
                            loading: loading,
                            hasMore: hasMore,
                            initialFetchDone: initialFetchDone,
                            sending: sending,
                            error: error,
                            currentUserId: currentUserId,
                            isAdmin: isAdmin,
                            reactionsMap: reactionsMap,
                            onSend: sendMessage,
                            onDelete: deleteMessage,
                            onToggleReaction: toggleReaction,
                            onLoadMore: loadMore,
                            typingUsers: typingUsers,
                            onTyping: startTyping,
                            onSendComplete: stopTyping
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                            lineNumber: 383,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                            lineNumber: 402,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                        lineNumber: 381,
                        columnNumber: 9
                    }, this),
                    showDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 z-30 md:hidden bg-white dark:bg-zinc-900",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatDetailsSidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            courseId: activeCourseId,
                            courseName: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stripParentheses"])(activeCourseName),
                            onlineUserIds: onlineUserIds,
                            onClose: ()=>setShowDetails(false),
                            onNameOverride: (name)=>setNameOverride(name),
                            onMuteChange: (muted)=>setIsMuted(muted),
                            isSystemCourse: isSystemCourse
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                            lineNumber: 409,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                        lineNumber: 408,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                lineNumber: 337,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `hidden md:block shrink-0 overflow-hidden transition-all duration-300 border-l border-black/30 dark:border-white/20 ${showDetails ? "w-80" : "w-0 border-l-0"}`,
                children: showDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-80 h-full",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$discussions$2f$ChatDetailsSidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        courseId: activeCourseId,
                        courseName: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$chat$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stripParentheses"])(activeCourseName),
                        onlineUserIds: onlineUserIds,
                        onClose: ()=>setShowDetails(false),
                        onNameOverride: (name)=>setNameOverride(name),
                        onMuteChange: (muted)=>setIsMuted(muted),
                        isSystemCourse: isSystemCourse
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                        lineNumber: 430,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                    lineNumber: 429,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
                lineNumber: 423,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/discussions/[courseId]/page.tsx",
        lineNumber: 326,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_claude_worktrees_claude-work_src_ddf8d823._.js.map