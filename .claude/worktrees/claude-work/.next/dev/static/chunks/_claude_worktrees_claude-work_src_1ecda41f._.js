(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/lib/analytics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "trackEvent",
    ()=>trackEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$analytics$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@vercel/analytics/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$dist$2f$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/posthog-js/dist/module.js [app-client] (ecmascript)");
;
;
function trackEvent(name, properties) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$analytics$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["track"])(name, properties ?? {});
    // PostHog is not initialized in development — guard to avoid errors
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/solar.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSunTimes",
    ()=>getSunTimes,
    "isDarkBySun",
    ()=>isDarkBySun
]);
/**
 * Pure sunrise/sunset calculation using the simplified NOAA solar equation.
 * No external dependencies or side effects. Accurate to ~2 minutes.
 */ /** Degrees to radians. */ const DEG = Math.PI / 180;
/** Radians to degrees. */ const RAD = 180 / Math.PI;
function getSunTimes(lat, lng, date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // Day of year
    const n1 = Math.floor(275 * month / 9);
    const n2 = Math.floor((month + 9) / 12);
    const n3 = 1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3);
    const dayOfYear = n1 - n2 * n3 + day - 30;
    // Solar declination (radians)
    const declination = -23.45 * DEG * Math.cos(DEG * (360 / 365) * (dayOfYear + 10));
    // Hour angle (degrees)
    const latRad = lat * DEG;
    const cosHourAngle = (Math.cos(90.833 * DEG) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination));
    // Polar day/night: sun never sets or never rises
    if (cosHourAngle > 1 || cosHourAngle < -1) {
        const noon = new Date(date);
        noon.setHours(12, 0, 0, 0);
        return {
            sunrise: noon,
            sunset: noon
        };
    }
    const hourAngle = Math.acos(cosHourAngle) * RAD;
    // Solar noon in hours (UTC), then convert to local offset
    const tzOffset = -date.getTimezoneOffset() / 60;
    const solarNoon = 12 - lng / 15 + tzOffset;
    const sunriseHour = solarNoon - hourAngle / 15;
    const sunsetHour = solarNoon + hourAngle / 15;
    const sunrise = new Date(date);
    sunrise.setHours(0, 0, 0, 0);
    sunrise.setMinutes(Math.round(sunriseHour * 60));
    const sunset = new Date(date);
    sunset.setHours(0, 0, 0, 0);
    sunset.setMinutes(Math.round(sunsetHour * 60));
    return {
        sunrise,
        sunset
    };
}
function isDarkBySun(lat, lng, date = new Date()) {
    const { sunrise, sunset } = getSunTimes(lat, lng, date);
    // Polar edge case: sunrise === sunset means polar day or night.
    // If declination puts us in polar day, not dark; polar night, dark.
    if (sunrise.getTime() === sunset.getTime()) {
        const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
        // Northern hemisphere summer (roughly Apr-Sep) = polar day if lat > 66
        const isSummerHalf = lat > 0 ? dayOfYear > 80 && dayOfYear < 267 : dayOfYear < 80 || dayOfYear > 267;
        return !isSummerHalf;
    }
    return date < sunrise || date > sunset;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/geolocation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCachedCoords",
    ()=>getCachedCoords,
    "getUserCoords",
    ()=>getUserCoords
]);
/**
 * Geolocation utilities with localStorage caching.
 * Falls back to Berkeley, CA (37.87, -122.27) when unavailable.
 */ /** localStorage key for cached coordinates. */ const COORDS_KEY = "caltodo_coords";
/** Default coordinates: Berkeley, CA. */ const DEFAULT_COORDS = {
    lat: 37.87,
    lng: -122.27
};
function getCachedCoords() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const stored = localStorage.getItem(COORDS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
                return parsed;
            }
        }
    } catch  {
    // localStorage or JSON parse failed
    }
    return DEFAULT_COORDS;
}
function getUserCoords() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
        return Promise.resolve(getCachedCoords());
    }
    return new Promise((resolve)=>{
        navigator.geolocation.getCurrentPosition((position)=>{
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            try {
                localStorage.setItem(COORDS_KEY, JSON.stringify(coords));
            } catch  {
            // localStorage unavailable
            }
            resolve(coords);
        }, ()=>{
            // Geolocation denied or failed — use cached/default
            resolve(getCachedCoords());
        }, {
            timeout: 5000,
            maximumAge: 86400000
        });
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "resolveTheme",
    ()=>resolveTheme,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/analytics.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$solar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/solar.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$geolocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/geolocation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
/** localStorage key for persisting theme preference. */ const THEME_KEY = "caltodo_theme";
/** localStorage key for persisting the active color theme (e.g. "miffy"). */ const COLOR_THEME_KEY = "caltodo_color_theme";
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
/**
 * Determines whether the current time is dark based on sunset/sunrise
 * using cached (or default) coordinates. Synchronous for initial render.
 *
 * @returns "dark" if before sunrise or after sunset, "light" otherwise
 */ function getSolarTheme() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const { lat, lng } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$geolocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCachedCoords"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$solar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isDarkBySun"])(lat, lng) ? "dark" : "light";
}
function resolveTheme(pref) {
    if (pref === "auto") return getSolarTheme();
    return pref;
}
/** All known color theme class names for easy removal. */ const COLOR_THEME_CLASSES = [
    "theme-miffy",
    "theme-ocean",
    "theme-forest",
    "theme-sunset",
    "theme-lavender",
    "theme-nord",
    "theme-rosewood",
    "theme-midnight",
    "theme-matcha",
    "theme-dracula",
    "theme-cyber",
    "theme-sandstone",
    "theme-tokyo-night"
];
/**
 * Syncs the browser tab favicon based on the current resolved theme and color theme.
 * Miffy theme uses dedicated Miffy favicons; default uses standard bear icon.
 */ function syncFavicon() {
    if (typeof document === "undefined") return;
    const link = document.querySelector('link[rel="icon"]');
    if (!link) return;
    const isDark = document.documentElement.classList.contains("dark");
    const isMiffy = document.documentElement.classList.contains("theme-miffy");
    if (isMiffy) {
        link.href = isDark ? "/favicon-miffy-dark.png" : "/favicon-miffy.png";
    } else {
        link.href = isDark ? "/icon-dark.png" : "/icon-light.png";
    }
}
/**
 * Applies the theme class to the <html> element.
 * Adds or removes the "dark" class to enable Tailwind dark: variants.
 *
 * @param theme - The resolved theme to apply ("light" or "dark")
 * @param animate - Whether to add a subtle opacity transition
 */ function applyTheme(theme, animate = false) {
    if (typeof document === "undefined") return;
    if (!animate) {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        syncFavicon();
        return;
    }
    // Subtle fade: briefly lower page opacity, switch theme, restore
    document.documentElement.style.transition = "opacity 150ms ease";
    document.documentElement.style.opacity = "0.7";
    setTimeout(()=>{
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        syncFavicon();
        document.documentElement.style.opacity = "1";
        setTimeout(()=>{
            document.documentElement.style.transition = "";
        }, 150);
    }, 150);
}
/**
 * Applies or removes the color theme class on <html>.
 * Removes all known color theme classes first, then adds the active one.
 *
 * @param colorTheme - The color theme ID to apply, or null to clear
 */ function applyColorTheme(colorTheme) {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    COLOR_THEME_CLASSES.forEach((cls)=>el.classList.remove(cls));
    if (colorTheme) {
        el.classList.add(`theme-${colorTheme}`);
    }
    syncFavicon();
}
/** Set of all valid color theme IDs for validation. */ const VALID_COLOR_THEMES = new Set([
    "miffy",
    "ocean",
    "forest",
    "sunset",
    "lavender",
    "nord",
    "rosewood",
    "midnight",
    "matcha",
    "dracula",
    "cyber",
    "sandstone",
    "tokyo-night"
]);
/**
 * Reads the stored color theme from localStorage.
 * Returns null if nothing valid is stored.
 *
 * @returns The stored color theme, or null
 */ function getInitialColorTheme() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const stored = localStorage.getItem(COLOR_THEME_KEY);
        if (stored && VALID_COLOR_THEMES.has(stored)) return stored;
    } catch  {
    // localStorage unavailable
    }
    return null;
}
/**
 * Reads the stored theme preference from localStorage.
 * Falls back to "auto" if no valid preference is stored.
 *
 * @returns The stored preference, defaulting to "auto"
 */ function getInitialPreference() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === "dark" || stored === "light" || stored === "auto") return stored;
    } catch  {
    // localStorage unavailable
    }
    return "light";
}
/** Cycle order for toggleTheme: light → dark → auto → light. */ const CYCLE = {
    light: "dark",
    dark: "auto",
    auto: "light"
};
/** Interval in ms to re-check solar position when in "auto" mode. */ const SOLAR_CHECK_INTERVAL = 60_000;
function ThemeProvider({ children }) {
    _s();
    const [preference, setPreferenceState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("auto");
    const [resolvedTheme, setResolvedTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("light");
    const [colorTheme, setColorThemeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const preferenceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])("auto");
    // On mount, read stored preference and apply the resolved theme + color theme.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            const stored = getInitialPreference();
            const resolved = resolveTheme(stored);
            setPreferenceState(stored);
            preferenceRef.current = stored;
            setResolvedTheme(resolved);
            applyTheme(resolved);
            const storedColor = getInitialColorTheme();
            setColorThemeState(storedColor);
            applyColorTheme(storedColor);
        }
    }["ThemeProvider.useEffect"], []);
    // When preference is "auto": fetch fresh coords, poll solar position every 60s.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            if (preference !== "auto") return;
            // Fetch fresh geolocation (async, updates cache for next check)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$geolocation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUserCoords"])().then({
                "ThemeProvider.useEffect": ()=>{
                    // Guard: preference may have changed while coords were loading
                    if (preferenceRef.current !== "auto") return;
                    const next = resolveTheme("auto");
                    setResolvedTheme(next);
                    applyTheme(next);
                }
            }["ThemeProvider.useEffect"]);
            const interval = setInterval({
                "ThemeProvider.useEffect.interval": ()=>{
                    // Only update if still in auto mode
                    if (preferenceRef.current !== "auto") return;
                    const next = resolveTheme("auto");
                    setResolvedTheme({
                        "ThemeProvider.useEffect.interval": (prev)=>{
                            if (prev !== next) {
                                applyTheme(next, true);
                            }
                            return next;
                        }
                    }["ThemeProvider.useEffect.interval"]);
                }
            }["ThemeProvider.useEffect.interval"], SOLAR_CHECK_INTERVAL);
            return ({
                "ThemeProvider.useEffect": ()=>clearInterval(interval)
            })["ThemeProvider.useEffect"];
        }
    }["ThemeProvider.useEffect"], [
        preference
    ]);
    const setPreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeProvider.useCallback[setPreference]": (pref)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])("theme_changed", {
                theme: pref
            });
            const resolved = resolveTheme(pref);
            setPreferenceState(pref);
            preferenceRef.current = pref;
            setResolvedTheme(resolved);
            applyTheme(resolved, true);
            try {
                localStorage.setItem(THEME_KEY, pref);
            } catch  {
            // localStorage unavailable
            }
        }
    }["ThemeProvider.useCallback[setPreference]"], []);
    const toggleTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeProvider.useCallback[toggleTheme]": ()=>{
            setPreferenceState({
                "ThemeProvider.useCallback[toggleTheme]": (prev)=>{
                    const next = CYCLE[prev];
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])("theme_changed", {
                        theme: next
                    });
                    const resolved = resolveTheme(next);
                    preferenceRef.current = next;
                    setResolvedTheme(resolved);
                    applyTheme(resolved, true);
                    try {
                        localStorage.setItem(THEME_KEY, next);
                    } catch  {
                    // localStorage unavailable
                    }
                    return next;
                }
            }["ThemeProvider.useCallback[toggleTheme]"]);
        }
    }["ThemeProvider.useCallback[toggleTheme]"], []);
    /**
   * Activate or deactivate a color theme.
   * Persists to localStorage and applies the class on <html>.
   *
   * @param theme - Color theme ID to activate, or null to deactivate
   */ const setColorTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeProvider.useCallback[setColorTheme]": (theme)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackEvent"])("color_theme_changed", {
                colorTheme: theme ?? "default"
            });
            setColorThemeState(theme);
            applyColorTheme(theme);
            try {
                if (theme) {
                    localStorage.setItem(COLOR_THEME_KEY, theme);
                } else {
                    localStorage.removeItem(COLOR_THEME_KEY);
                }
            } catch  {
            // localStorage unavailable
            }
        }
    }["ThemeProvider.useCallback[setColorTheme]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: {
            preference,
            resolvedTheme,
            setPreference,
            toggleTheme,
            colorTheme,
            setColorTheme
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx",
        lineNumber: 311,
        columnNumber: 5
    }, this);
}
_s(ThemeProvider, "IsYpXra3Wt2bnqRM4azT9lyouws=");
_c = ThemeProvider;
function useTheme() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return ctx;
}
_s1(useTheme, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/SWRProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SWRProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * SWR provider with localStorage-backed cache persistence.
 * Wraps the app with SWRConfig so all useSWR hooks share a single cache.
 * On page unload the in-memory cache is serialized to localStorage.
 * On next load SWR reads from it and returns stale data instantly.
 *
 * @param children - React children to wrap
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/swr/dist/index/index.mjs [app-client] (ecmascript) <locals>");
"use client";
;
;
const STORAGE_KEY = "caltodo_swr_cache";
/**
 * Creates an SWR cache provider backed by localStorage.
 * Reads existing entries from localStorage on init, writes back on page unload.
 *
 * @param _parentCache - Parent cache from SWR (unused, we replace entirely)
 * @returns Map-based cache provider for SWR
 */ function localStorageProvider(_parentCache) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let stored = [];
    if ("TURBOPACK compile-time truthy", 1) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                stored = JSON.parse(raw);
            }
        } catch  {
        // Corrupted or unavailable localStorage — start fresh
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = new Map(stored);
    if ("TURBOPACK compile-time truthy", 1) {
        window.addEventListener("beforeunload", ()=>{
            try {
                const entries = Array.from(map.entries());
                localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            } catch  {
            // localStorage full or unavailable — silently skip
            }
        });
    }
    return {
        keys: ()=>map.keys(),
        get: (key)=>map.get(key),
        set: (key, value)=>map.set(key, value),
        delete: (key)=>map.delete(key)
    };
}
function SWRProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SWRConfig"], {
        value: {
            provider: localStorageProvider
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/SWRProvider.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
_c = SWRProvider;
var _c;
__turbopack_context__.k.register(_c, "SWRProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/PostHogProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PostHogProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$dist$2f$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/posthog-js/dist/module.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/posthog-js/react/dist/esm/index.js [app-client] (ecmascript)");
"use client";
;
;
;
/**
 * Initialize PostHog synchronously at module level (not in useEffect).
 * This ensures PostHog is ready before any component renders or fires events,
 * eliminating the race condition where events were dropped before init completed.
 *
 * Only runs in the browser (typeof window check) and in production.
 */ /**
 * Error messages that are benign and should not be reported to PostHog.
 * - NEXT_REDIRECT: Next.js internal mechanism, not a real error
 * - AbortError: Fetch requests cancelled during navigation
 * - Script error: Cross-origin scripts with no useful info
 * - Minified React error #418/#423: Hydration mismatches, often from browser extensions
 * - ChunkLoadError: Handled by ChunkErrorRecovery with auto-reload
 * - unexpected response: Transient network issues
 */ const IGNORED_ERROR_PATTERNS = [
    "NEXT_REDIRECT",
    "AbortError",
    "signal is aborted without reason",
    "Script error",
    "Minified React error #418",
    "Minified React error #423",
    "ChunkLoadError",
    "Loading chunk",
    "Failed to load chunk",
    "An unexpected response was received from the server"
];
/**
 * Checks whether an exception event matches any ignored error pattern.
 * Inspects both legacy top-level properties ($exception_message, $exception_type)
 * and the newer $exception_list array format used by PostHog SDK v1.100+.
 *
 * @param properties - The event properties from a PostHog $exception event
 * @returns true if the error matches a known benign pattern and should be dropped
 */ function isIgnoredException(properties) {
    if (!properties) return false;
    // Check top-level $exception_message + $exception_type (legacy format)
    const message = properties.$exception_message ?? "";
    const type = properties.$exception_type ?? "";
    const combined = `${type} ${message}`;
    for (const pattern of IGNORED_ERROR_PATTERNS){
        if (combined.includes(pattern)) return true;
    }
    // Check $exception_list entries (PostHog SDK v1.100+ exception autocapture)
    const exceptionList = properties.$exception_list;
    if (Array.isArray(exceptionList)) {
        for (const entry of exceptionList){
            const entryType = entry?.type ?? "";
            const entryValue = entry?.value ?? "";
            const entryCombined = `${entryType} ${entryValue}`;
            for (const pattern of IGNORED_ERROR_PATTERNS){
                if (entryCombined.includes(pattern)) return true;
            }
        }
    }
    return false;
}
/**
 * Checks whether the current page is an authenticated app route (/app/*).
 * Used to restrict all PostHog event capture to authenticated users only,
 * preventing landing page visitors from skewing retention and usage metrics.
 *
 * @returns true if the browser URL starts with /app/
 */ function isAuthenticatedRoute() {
    try {
        return window.location.pathname.startsWith("/app");
    } catch  {
        return false;
    }
}
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
function PostHogProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PostHogProvider"], {
        client: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$posthog$2d$js$2f$dist$2f$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        children: children
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/PostHogProvider.tsx",
        lineNumber: 131,
        columnNumber: 10
    }, this);
}
_c = PostHogProvider;
var _c;
__turbopack_context__.k.register(_c, "PostHogProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ChunkErrorRecovery.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChunkErrorRecovery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function ChunkErrorRecovery() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChunkErrorRecovery.useEffect": ()=>{
            const RELOAD_KEY = "caltodo_chunk_reload";
            function handleError(event) {
                const error = event.error;
                if (error?.name === "ChunkLoadError" || error?.message?.includes("Loading chunk") || error?.message?.includes("Failed to load chunk")) {
                    const lastReload = sessionStorage.getItem(RELOAD_KEY);
                    const now = Date.now();
                    // Only auto-reload once per 60 seconds to prevent loops
                    if (!lastReload || now - parseInt(lastReload, 10) > 60_000) {
                        sessionStorage.setItem(RELOAD_KEY, String(now));
                        window.location.reload();
                    }
                }
            }
            function handleRejection(event) {
                const reason = event.reason;
                if (reason?.name === "ChunkLoadError" || reason?.message?.includes("Loading chunk") || reason?.message?.includes("Failed to load chunk")) {
                    const lastReload = sessionStorage.getItem(RELOAD_KEY);
                    const now = Date.now();
                    if (!lastReload || now - parseInt(lastReload, 10) > 60_000) {
                        sessionStorage.setItem(RELOAD_KEY, String(now));
                        window.location.reload();
                    }
                }
            }
            window.addEventListener("error", handleError);
            window.addEventListener("unhandledrejection", handleRejection);
            return ({
                "ChunkErrorRecovery.useEffect": ()=>{
                    window.removeEventListener("error", handleError);
                    window.removeEventListener("unhandledrejection", handleRejection);
                }
            })["ChunkErrorRecovery.useEffect"];
        }
    }["ChunkErrorRecovery.useEffect"], []);
    return null;
}
_s(ChunkErrorRecovery, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = ChunkErrorRecovery;
var _c;
__turbopack_context__.k.register(_c, "ChunkErrorRecovery");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_claude_worktrees_claude-work_src_1ecda41f._.js.map