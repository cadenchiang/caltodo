(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CanvasSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function CanvasSettings({ credentials, onUpdate }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const { tasks, deleteTasksBySource } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const [disconnecting, setDisconnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showConfirm, setShowConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isConnected = Boolean(credentials.canvas_token) || Boolean(credentials.canvas_ical_url);
    const isExpired = Boolean(credentials.canvas_token) && credentials.canvas_token_expired;
    const sourceTaskCount = tasks.filter((t)=>t.source === "canvas").length;
    /**
   * Disconnects bCourses by clearing the canvas token via API.
   * Updates parent state and shows confirmation toast.
   */ async function handleDisconnect() {
        setShowConfirm(false);
        setDisconnecting(true);
        try {
            const res = await fetch("/api/credentials", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    canvas_token: null,
                    canvas_ical_url: null
                })
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                throw new Error(data.error || "Failed to disconnect");
            }
            const updated = await res.json();
            onUpdate(updated);
            await deleteTasksBySource("canvas");
            showToast("bCourses disconnected.");
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to disconnect");
        } finally{
            setDisconnecting(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-border bg-card px-3 sm:px-4 py-3.5 shadow-sm dark:shadow-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2.5 sm:gap-3.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/bcourses-logo.png",
                            alt: "",
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                            lineNumber: 68,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-foreground",
                                children: "bCourses"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground truncate",
                                children: "Canvas for Cal students"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                                lineNumber: 72,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    isConnected ? isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            // Disconnect first, then redirect to reconnect
                            handleDisconnect();
                            router.push("/app/onboarding?setup=canvas");
                        },
                        className: "text-xs font-semibold text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors shrink-0 cursor-pointer",
                        children: "Expired — Reconnect"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                        lineNumber: 76,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowConfirm(true),
                        disabled: disconnecting,
                        "aria-label": "Disconnect bCourses",
                        className: "group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg shrink-0 border transition-colors cursor-pointer disabled:opacity-60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "group-hover:hidden",
                                children: disconnecting ? "Disconnecting..." : "Connected"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                                lineNumber: 95,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hidden group-hover:inline",
                                children: "Disconnect"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                                lineNumber: 96,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                        lineNumber: 87,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push("/app/onboarding?setup=canvas"),
                        className: "text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer",
                        children: "Connect"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                        lineNumber: 100,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            showConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9999] flex items-center justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-foreground mb-2",
                                    children: "Disconnect bCourses?"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                                    lineNumber: 114,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground mb-6",
                                    children: sourceTaskCount > 0 ? `This will remove ${sourceTaskCount === 1 ? "1 synced task" : `${sourceTaskCount} synced tasks`} from bCourses. You can reconnect later to sync them again.` : "No synced tasks to remove. You can reconnect later to sync again."
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                                    lineNumber: 117,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleDisconnect,
                                            className: "w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer",
                                            children: "Disconnect"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                                            lineNumber: 123,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setShowConfirm(false),
                                            className: "w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                                            lineNumber: 130,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                                    lineNumber: 122,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                            lineNumber: 113,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(CanvasSettings, "jZiD1EpMSe62jKrcCDTeyluHVQs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"]
    ];
});
_c = CanvasSettings;
var _c;
__turbopack_context__.k.register(_c, "CanvasSettings");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CanvasGenericCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CanvasGenericCard() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm dark:shadow-none",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-3.5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: "/canvas-logo.png",
                        alt: "",
                        className: "w-7 h-7 object-contain"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx",
                        lineNumber: 19,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 min-w-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-semibold text-foreground",
                            children: "Canvas"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-muted-foreground truncate",
                            children: "Connect another Canvas instance"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>router.push("/app/onboarding?setup=canvas-add"),
                    className: "text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer",
                    children: "Connect"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_s(CanvasGenericCard, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = CanvasGenericCard;
var _c;
__turbopack_context__.k.register(_c, "CanvasGenericCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GradescopeSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function GradescopeSettings({ credentials, onUpdate }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const { tasks, deleteTasksBySource } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const [disconnecting, setDisconnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showConfirm, setShowConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isConnected = Boolean(credentials.gradescope_email) || credentials.has_gradescope_password;
    const isAuthFailed = isConnected && credentials.gradescope_auth_failed;
    const sourceTaskCount = tasks.filter((t)=>t.source === "gradescope").length;
    /**
   * Disconnects Gradescope by clearing email and password via API.
   * Updates parent state and shows confirmation toast.
   */ async function handleDisconnect() {
        setShowConfirm(false);
        setDisconnecting(true);
        try {
            const res = await fetch("/api/credentials", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    gradescope_email: null,
                    gradescope_password: null
                })
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                throw new Error(data.error || "Failed to disconnect");
            }
            const updated = await res.json();
            onUpdate(updated);
            await deleteTasksBySource("gradescope");
            showToast("Gradescope disconnected.");
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to disconnect");
        } finally{
            setDisconnecting(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-border bg-card px-3 sm:px-4 py-3.5 shadow-sm dark:shadow-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2.5 sm:gap-3.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/gradescope-logo.png",
                            alt: "",
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                            lineNumber: 68,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-foreground",
                                children: "Gradescope"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground truncate",
                                children: isConnected && credentials.gradescope_email ? credentials.gradescope_email : "Sync assignments from Gradescope"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                                lineNumber: 72,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    isConnected ? isAuthFailed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push("/app/onboarding?setup=gradescope"),
                        className: "text-xs font-semibold text-red-500 dark:text-red-400 px-3 py-1 rounded-lg border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shrink-0 cursor-pointer",
                        children: "Login Failed — Retry"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                        lineNumber: 80,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowConfirm(true),
                        disabled: disconnecting,
                        "aria-label": "Disconnect Gradescope",
                        className: "group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg shrink-0 border transition-colors cursor-pointer disabled:opacity-60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "group-hover:hidden",
                                children: disconnecting ? "Disconnecting..." : "Connected"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                                lineNumber: 95,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hidden group-hover:inline",
                                children: "Disconnect"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                                lineNumber: 96,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                        lineNumber: 87,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push("/app/onboarding?setup=gradescope"),
                        className: "text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer",
                        children: "Connect"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                        lineNumber: 100,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            showConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9999] flex items-center justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-foreground mb-2",
                                    children: "Disconnect Gradescope?"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                                    lineNumber: 114,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground mb-6",
                                    children: sourceTaskCount > 0 ? `This will remove ${sourceTaskCount === 1 ? "1 synced task" : `${sourceTaskCount} synced tasks`} from Gradescope. You can reconnect later to sync them again.` : "No synced tasks to remove. You can reconnect later to sync again."
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                                    lineNumber: 117,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleDisconnect,
                                            className: "w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer",
                                            children: "Disconnect"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                                            lineNumber: 123,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setShowConfirm(false),
                                            className: "w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                                            lineNumber: 130,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                                    lineNumber: 122,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                            lineNumber: 113,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(GradescopeSettings, "jZiD1EpMSe62jKrcCDTeyluHVQs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"]
    ];
});
_c = GradescopeSettings;
var _c;
__turbopack_context__.k.register(_c, "GradescopeSettings");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PensieveSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function PensieveSettings({ credentials, onUpdate }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const { tasks, deleteTasksBySource } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const [disconnecting, setDisconnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showConfirm, setShowConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isConnected = Boolean(credentials.pensieve_calendar_url);
    const sourceTaskCount = tasks.filter((t)=>t.source === "pensieve").length;
    /**
   * Disconnects Pensieve by clearing the calendar URL via API.
   * Updates parent state and shows confirmation toast.
   */ async function handleDisconnect() {
        setShowConfirm(false);
        setDisconnecting(true);
        try {
            const res = await fetch("/api/credentials", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pensieve_calendar_url: null
                })
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                throw new Error(data.error || "Failed to disconnect");
            }
            const updated = await res.json();
            onUpdate(updated);
            await deleteTasksBySource("pensieve");
            showToast("Pensive disconnected.");
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to disconnect");
        } finally{
            setDisconnecting(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-border bg-card px-3 sm:px-4 py-3.5 shadow-sm dark:shadow-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2.5 sm:gap-3.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/pensieve-logo.png",
                            alt: "",
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-foreground",
                                children: "Pensive"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground truncate",
                                children: "Sync CS & Data Science review assignments"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    isConnected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowConfirm(true),
                        disabled: disconnecting,
                        "aria-label": "Disconnect Pensive",
                        className: "group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg shrink-0 border transition-colors cursor-pointer disabled:opacity-60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "group-hover:hidden",
                                children: disconnecting ? "..." : "Connected"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hidden group-hover:inline",
                                children: "Disconnect"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                                lineNumber: 83,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                        lineNumber: 74,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push("/app/onboarding?setup=pensieve"),
                        className: "text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer",
                        children: "Connect"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                        lineNumber: 86,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            showConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9999] flex items-center justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-foreground mb-2",
                                    children: "Disconnect Pensive?"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                                    lineNumber: 100,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground mb-6",
                                    children: sourceTaskCount > 0 ? `This will remove ${sourceTaskCount === 1 ? "1 synced task" : `${sourceTaskCount} synced tasks`} from Pensive. You can reconnect later to sync them again.` : "No synced tasks to remove. You can reconnect later to sync again."
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                                    lineNumber: 103,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleDisconnect,
                                            className: "w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer",
                                            children: "Disconnect"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                                            lineNumber: 109,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setShowConfirm(false),
                                            className: "w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                                            lineNumber: 116,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                                    lineNumber: 108,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                            lineNumber: 99,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                        lineNumber: 98,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
                lineNumber: 96,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
_s(PensieveSettings, "jZiD1EpMSe62jKrcCDTeyluHVQs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"]
    ];
});
_c = PensieveSettings;
var _c;
__turbopack_context__.k.register(_c, "PensieveSettings");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdditionalCanvasCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function AdditionalCanvasCard({ account, credentials, onUpdate }) {
    _s();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const { deleteTasksByExternalIdPrefix } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const [disconnecting, setDisconnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showConfirm, setShowConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Check if token has expired (120-day lifetime)
    const isExpired = (()=>{
        if (!account.token_created_at) return false;
        const createdAt = new Date(account.token_created_at).getTime();
        const days120 = 120 * 24 * 60 * 60 * 1000;
        return Date.now() - createdAt > days120;
    })();
    /**
   * Disconnects this additional Canvas account by removing it from the JSONB array.
   * Also deletes all tasks synced from this account (matched by external_id prefix).
   */ async function handleDisconnect() {
        setShowConfirm(false);
        setDisconnecting(true);
        try {
            const updatedAccounts = (credentials.additional_canvas_accounts ?? []).filter((a)=>a.id !== account.id);
            const res = await fetch("/api/credentials", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    additional_canvas_accounts: updatedAccounts
                })
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                throw new Error(data.error || "Failed to disconnect");
            }
            const updated = await res.json();
            onUpdate(updated);
            // Clean up tasks from this account using the namespaced external_id prefix
            await deleteTasksByExternalIdPrefix(`${account.id}:`);
            showToast(`${account.label} disconnected.`);
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to disconnect");
        } finally{
            setDisconnecting(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-border bg-card px-3 sm:px-4 py-3.5 shadow-sm dark:shadow-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2.5 sm:gap-3.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/canvas-logo.png",
                            alt: "",
                            className: "w-7 h-7 object-contain"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-foreground",
                                children: account.label
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                                lineNumber: 77,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground truncate",
                                children: account.base_url
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                                lineNumber: 78,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleDisconnect(),
                        className: "text-xs font-semibold text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors shrink-0 cursor-pointer",
                        children: "Expired — Remove"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowConfirm(true),
                        disabled: disconnecting,
                        "aria-label": `Disconnect ${account.label}`,
                        className: "group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg shrink-0 border transition-colors cursor-pointer disabled:opacity-60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "group-hover:hidden",
                                children: disconnecting ? "..." : "Connected"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hidden group-hover:inline",
                                children: "Disconnect"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            showConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9999] flex items-center justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-foreground mb-2",
                                    children: [
                                        "Disconnect ",
                                        account.label,
                                        "?"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                                    lineNumber: 107,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground mb-6",
                                    children: [
                                        "This will remove all synced tasks from ",
                                        account.label,
                                        ". You can re-add this account later."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                                    lineNumber: 110,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleDisconnect,
                                            className: "w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer",
                                            children: "Disconnect"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                                            lineNumber: 114,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setShowConfirm(false),
                                            className: "w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                                            lineNumber: 121,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                                    lineNumber: 113,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                            lineNumber: 106,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
                lineNumber: 103,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_s(AdditionalCanvasCard, "gFKSSN2UhkpNPcLUxboinLIsMVo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"]
    ];
});
_c = AdditionalCanvasCard;
var _c;
__turbopack_context__.k.register(_c, "AdditionalCanvasCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourseSelectModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
/** Duration of the exit animation in ms. */ const EXIT_DURATION = 200;
function CourseSelectModal({ open, onClose, title, courses, groups, selectedIds, onToggle, onSelectAll, onDeselectAll }) {
    _s();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const allCourses = groups ? groups.flatMap((g)=>g.courses) : courses;
    const totalCount = allCourses.length;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CourseSelectModal.useEffect": ()=>{
            if (open) {
                setMounted(true);
                requestAnimationFrame({
                    "CourseSelectModal.useEffect": ()=>setVisible(true)
                }["CourseSelectModal.useEffect"]);
            } else {
                setVisible(false);
            }
        }
    }["CourseSelectModal.useEffect"], [
        open
    ]);
    const handleClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CourseSelectModal.useCallback[handleClose]": ()=>{
            setVisible(false);
            const timer = setTimeout({
                "CourseSelectModal.useCallback[handleClose].timer": ()=>{
                    setMounted(false);
                    onClose();
                }
            }["CourseSelectModal.useCallback[handleClose].timer"], EXIT_DURATION);
            return ({
                "CourseSelectModal.useCallback[handleClose]": ()=>clearTimeout(timer)
            })["CourseSelectModal.useCallback[handleClose]"];
        }
    }["CourseSelectModal.useCallback[handleClose]"], [
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CourseSelectModal.useEffect": ()=>{
            if (!mounted) return;
            function onKeyDown(e) {
                if (e.key === "Escape") handleClose();
            }
            window.addEventListener("keydown", onKeyDown);
            return ({
                "CourseSelectModal.useEffect": ()=>window.removeEventListener("keydown", onKeyDown)
            })["CourseSelectModal.useEffect"];
        }
    }["CourseSelectModal.useEffect"], [
        mounted,
        handleClose
    ]);
    if (!mounted) return null;
    const allSelected = totalCount > 0 && selectedIds.size === totalCount;
    const activeGroups = groups?.filter((g)=>g.courses.length > 0) ?? [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out",
                style: {
                    opacity: visible ? 1 : 0
                },
                onClick: handleClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative bg-card w-full h-full sm:h-[85vh] flex flex-col sm:rounded-2xl sm:border sm:border-border shadow-2xl ${activeGroups.length > 1 ? "sm:max-w-4xl" : "sm:max-w-lg"} sm:mx-4 ${visible ? "animate-modal-in" : "animate-modal-out"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0 sm:rounded-t-2xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-semibold text-foreground",
                                children: [
                                    title,
                                    " (",
                                    selectedIds.size,
                                    "/",
                                    totalCount,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                lineNumber: 126,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: allSelected ? onDeselectAll : onSelectAll,
                                        className: "text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer",
                                        children: allSelected ? "Deselect all" : "Select all"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                        lineNumber: 130,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleClose,
                                        className: "p-1 text-subtle-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent cursor-pointer",
                                        "aria-label": "Close",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                            lineNumber: 142,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                        lineNumber: 137,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-auto sm:overflow-hidden min-h-0",
                        children: [
                            activeGroups.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row h-full sm:gap-1 sm:px-1 sm:py-1",
                                children: activeGroups.map((group)=>{
                                    const groupSelectedCount = group.courses.filter((c)=>selectedIds.has(c.id)).length;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 flex flex-col min-w-0 sm:min-h-0 sm:overflow-hidden sm:rounded-xl sm:bg-muted/50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "px-3 py-2 flex items-baseline gap-2 shrink-0",
                                                children: [
                                                    group.color && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-2.5 h-2.5 rounded-full shrink-0 self-center",
                                                        style: {
                                                            backgroundColor: group.color
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-bold text-foreground leading-none",
                                                        children: group.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                        lineNumber: 163,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[11px] text-muted-foreground leading-none",
                                                        children: [
                                                            groupSelectedCount,
                                                            "/",
                                                            group.courses.length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                        lineNumber: 164,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                lineNumber: 156,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 overflow-y-auto min-h-0 px-1 pb-1",
                                                children: group.courses.map((course)=>{
                                                    const checked = selectedIds.has(course.id);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>onToggle(course.id),
                                                        className: `w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${checked ? "bg-accent/60" : "hover:bg-accent/30"}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all duration-150",
                                                                style: {
                                                                    backgroundColor: checked ? group.color || "#3b82f6" : "transparent",
                                                                    border: checked ? "none" : "1.5px solid var(--input-border)"
                                                                },
                                                                children: checked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                    size: 10,
                                                                    className: "text-white",
                                                                    strokeWidth: 3
                                                                }, void 0, false, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                                    lineNumber: 188,
                                                                    columnNumber: 43
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                                lineNumber: 181,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-[13px] truncate ${checked ? "text-foreground" : "text-muted-foreground"}`,
                                                                children: course.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                                lineNumber: 190,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, String(course.id), true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                        lineNumber: 173,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                lineNumber: 169,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, group.label, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                        lineNumber: 154,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                lineNumber: 150,
                                columnNumber: 13
                            }, this) : // Flat list fallback
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    courses.map((course)=>{
                                        const checked = selectedIds.has(course.id);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>onToggle(course.id),
                                            className: `w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors cursor-pointer ${checked ? "bg-accent/50" : "hover:bg-accent/30"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all duration-150",
                                                    style: {
                                                        backgroundColor: checked ? "#3b82f6" : "transparent",
                                                        border: checked ? "none" : "1.5px solid var(--input-border)"
                                                    },
                                                    children: checked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        size: 10,
                                                        className: "text-white",
                                                        strokeWidth: 3
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 35
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                    lineNumber: 215,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[13px] truncate ${checked ? "text-foreground" : "text-muted-foreground"}`,
                                                    children: course.name
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                                    lineNumber: 224,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, String(course.id), true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                            lineNumber: 207,
                                            columnNumber: 19
                                        }, this);
                                    }),
                                    courses.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-5 py-8 text-sm text-subtle-foreground text-center",
                                        children: "No active courses found."
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                        lineNumber: 231,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                lineNumber: 203,
                                columnNumber: 13
                            }, this),
                            activeGroups.length > 0 && allCourses.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-5 py-8 text-sm text-subtle-foreground text-center",
                                children: "No active courses found."
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                                lineNumber: 238,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                        lineNumber: 148,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 py-3.5 border-t border-border shrink-0 sm:rounded-b-2xl",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleClose,
                            className: "w-full px-4 py-2 rounded-xl text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-all cursor-pointer",
                            children: "Done"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                            lineNumber: 246,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this), document.body);
}
_s(CourseSelectModal, "Ynyg+VldNB6yVQywchsXHBkwgU0=");
_c = CourseSelectModal;
var _c;
__turbopack_context__.k.register(_c, "CourseSelectModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClassChangeConfirmDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ClassChangeConfirmDialog({ addedNames, removedNames, removedTaskCount, loading, onConfirm, onCancel }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClassChangeConfirmDialog.useEffect": ()=>{
            function handleKeyDown(e) {
                if (e.key === "Escape") {
                    onCancel();
                }
            }
            document.addEventListener("keydown", handleKeyDown);
            return ({
                "ClassChangeConfirmDialog.useEffect": ()=>document.removeEventListener("keydown", handleKeyDown)
            })["ClassChangeConfirmDialog.useEffect"];
        }
    }["ClassChangeConfirmDialog.useEffect"], [
        onCancel
    ]);
    const hasAdded = addedNames.length > 0;
    const hasRemoved = removedNames.length > 0;
    // Determine title and confirm button style
    let title;
    let confirmLabel;
    let confirmClass;
    if (hasRemoved && !hasAdded) {
        title = "Hide classes?";
        confirmLabel = "Hide";
        confirmClass = "bg-gray-900 dark:bg-white dark:text-gray-900";
    } else if (hasAdded && !hasRemoved) {
        title = "Sync new classes?";
        confirmLabel = "Sync";
        confirmClass = "bg-gray-900 dark:bg-white dark:text-gray-900";
    } else {
        title = "Update classes?";
        confirmLabel = "Update";
        confirmClass = "bg-gray-900 dark:bg-white dark:text-gray-900";
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-semibold text-foreground mb-3",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                            lineNumber: 80,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm text-muted-foreground mb-6 space-y-2",
                            children: [
                                hasAdded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: [
                                        "Sync assignments from",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium text-foreground",
                                            children: addedNames.join(", ")
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                                            lineNumber: 88,
                                            columnNumber: 17
                                        }, this),
                                        "."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                                    lineNumber: 86,
                                    columnNumber: 15
                                }, this),
                                hasRemoved && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: [
                                        removedTaskCount > 0 ? `Hide ${removedTaskCount === 1 ? "1 task" : `${removedTaskCount} tasks`} from ` : "Hide ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium text-foreground",
                                            children: removedNames.join(", ")
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                                            lineNumber: 99,
                                            columnNumber: 17
                                        }, this),
                                        ".",
                                        removedTaskCount > 0 && " You can bring them back by re-selecting the course."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                                    lineNumber: 95,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onConfirm,
                                    disabled: loading,
                                    className: `w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${confirmClass}`,
                                    children: [
                                        loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            size: 14,
                                            className: "animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                                            lineNumber: 115,
                                            columnNumber: 27
                                        }, this),
                                        confirmLabel
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onCancel,
                                    disabled: loading,
                                    className: "w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer disabled:opacity-60",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                    lineNumber: 79,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this), document.body);
}
_s(ClassChangeConfirmDialog, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = ClassChangeConfirmDialog;
var _c;
__turbopack_context__.k.register(_c, "ClassChangeConfirmDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClassesSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$CourseSelectModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/CourseSelectModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$ClassChangeConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/ClassChangeConfirmDialog.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
/** localStorage key for cached total course counts per platform. */ const TOTALS_KEY = "caltodo_course_totals";
/**
 * Reads cached course totals from localStorage.
 * @returns Stored totals or null if not found/invalid
 */ function getCachedTotals() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = localStorage.getItem(TOTALS_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
/**
 * Writes course totals to localStorage.
 * @param totals - The totals to cache
 */ function setCachedTotals(totals) {
    try {
        localStorage.setItem(TOTALS_KEY, JSON.stringify(totals));
    } catch  {
    /* ignore quota errors */ }
}
function ClassesSection({ credentials, onUpdate }) {
    _s();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const { tasks, fetchTasks, dismissTasksByCourseNames, undismissTasksByCourseNames } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showModal, setShowModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirming, setConfirming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingChanges, setPendingChanges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Unified courses for the modal (prefixed IDs)
    const [canvasCourses, setCanvasCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [gseCourses, setGseCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [pensieveCourses, setPensieveCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedIds, setSelectedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const canvasSelected = credentials.selected_canvas_courses ?? [];
    const gsSelected = credentials.selected_gradescope_courses ?? [];
    const pensieveSelected = credentials.selected_pensieve_courses ?? [];
    /** Unique course names from syllabus-imported tasks, sorted alphabetically. */ const syllabusCourses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ClassesSection.useMemo[syllabusCourses]": ()=>{
            const names = new Set();
            for (const t of tasks){
                if (t.source === "syllabus" && t.course_name) {
                    names.add(t.course_name);
                }
            }
            return Array.from(names).sort({
                "ClassesSection.useMemo[syllabusCourses]": (a, b)=>a.localeCompare(b)
            }["ClassesSection.useMemo[syllabusCourses]"]);
        }
    }["ClassesSection.useMemo[syllabusCourses]"], [
        tasks
    ]);
    const hasSyllabus = syllabusCourses.length > 0;
    const totalSelected = canvasSelected.length + gsSelected.length + pensieveSelected.length + syllabusCourses.length;
    const hasCanvas = !!credentials.canvas_token || !!credentials.canvas_ical_url;
    const hasCanvasToken = !!credentials.canvas_token;
    const hasCanvasIcal = !!credentials.canvas_ical_url;
    const hasGradescope = !!credentials.gradescope_email;
    const hasPensieve = !!credentials.pensieve_calendar_url;
    const platformCount = (hasCanvas ? 1 : 0) + (hasGradescope ? 1 : 0) + (hasPensieve ? 1 : 0) + (hasSyllabus ? 1 : 0);
    const cachedTotals = getCachedTotals();
    if (!hasCanvas && !hasGradescope && !hasPensieve && !hasSyllabus && totalSelected === 0) {
        return null;
    }
    /**
   * Fetches course lists from Canvas, Gradescope, and Pensieve APIs in parallel.
   * Prefixes IDs with canvas-/gs-/pensieve- to avoid collisions in the unified modal.
   * Pre-selects previously selected courses.
   */ async function handleEdit() {
        setLoading(true);
        try {
            const promises = [];
            let fetchedCanvas = [];
            let fetchedGs = [];
            let fetchedPensieve = [];
            if (hasCanvasToken) {
                promises.push(fetch("/api/canvas/courses").then(async (res)=>{
                    if (!res.ok) {
                        const body = await res.json().catch(()=>({}));
                        throw new Error(body.error || "Failed to load bCourses");
                    }
                    return res.json();
                }).then((data)=>{
                    fetchedCanvas = data.courses.map((c)=>({
                            id: `canvas-${c.id}`,
                            name: c.name
                        }));
                }));
            } else if (hasCanvasIcal) {
                promises.push(fetch("/api/canvas/ical-preview", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: credentials.canvas_ical_url
                    })
                }).then(async (res)=>{
                    if (!res.ok) {
                        const body = await res.json().catch(()=>({}));
                        throw new Error(body.error || "Failed to load bCourses courses");
                    }
                    return res.json();
                }).then((data)=>{
                    fetchedCanvas = data.courses.map((c)=>({
                            id: `canvas-${c.name}`,
                            name: c.name
                        }));
                }));
            }
            if (hasGradescope) {
                promises.push(fetch("/api/gradescope/courses", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                }).then(async (res)=>{
                    if (!res.ok) {
                        const body = await res.json().catch(()=>({}));
                        throw new Error(body.error || "Failed to load Gradescope courses");
                    }
                    return res.json();
                }).then((data)=>{
                    fetchedGs = data.courses.map((c)=>({
                            id: `gs-${c.id}`,
                            name: c.name
                        }));
                }));
            }
            if (hasPensieve) {
                promises.push(fetch("/api/pensieve/courses").then(async (res)=>{
                    if (!res.ok) {
                        const body = await res.json().catch(()=>({}));
                        throw new Error(body.error || "Failed to load Pensive courses");
                    }
                    return res.json();
                }).then((data)=>{
                    fetchedPensieve = data.courses.map((c)=>({
                            id: `pensieve-${c.id}`,
                            name: c.name
                        }));
                }));
            }
            await Promise.all(promises);
            setCanvasCourses(fetchedCanvas);
            setGseCourses(fetchedGs);
            setPensieveCourses(fetchedPensieve);
            setCachedTotals({
                canvas: fetchedCanvas.length,
                gradescope: fetchedGs.length,
                pensieve: fetchedPensieve.length
            });
            // Build syllabus courses for the modal (read-only, always selected)
            const syllabusList = syllabusCourses.map((name)=>({
                    id: `syllabus-${name}`,
                    name
                }));
            const prevSelected = new Set();
            // For iCal courses (id=0), match by name; for API-token courses, match by numeric ID
            if (hasCanvasIcal) {
                canvasSelected.forEach((c)=>prevSelected.add(`canvas-${c.name}`));
            } else {
                canvasSelected.forEach((c)=>prevSelected.add(`canvas-${c.id}`));
            }
            gsSelected.forEach((c)=>prevSelected.add(`gs-${c.id}`));
            pensieveSelected.forEach((c)=>prevSelected.add(`pensieve-${c.id}`));
            // Syllabus courses are always selected (managed via Syllabus settings, not here)
            syllabusList.forEach((c)=>prevSelected.add(c.id));
            if (prevSelected.size === syllabusList.length && prevSelected.size > 0) {
                // Only syllabus courses exist — auto-select all fetched courses too
                fetchedCanvas.forEach((c)=>prevSelected.add(c.id));
                fetchedGs.forEach((c)=>prevSelected.add(c.id));
                fetchedPensieve.forEach((c)=>prevSelected.add(c.id));
            } else if (prevSelected.size === syllabusList.length) {
                // No previous selections at all — auto-select everything
                fetchedCanvas.forEach((c)=>prevSelected.add(c.id));
                fetchedGs.forEach((c)=>prevSelected.add(c.id));
                fetchedPensieve.forEach((c)=>prevSelected.add(c.id));
            }
            setSelectedIds(prevSelected);
            setShowModal(true);
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to load courses");
        } finally{
            setLoading(false);
        }
    }
    /** Toggles a single course's selected state (prefixed ID). Syllabus courses are locked. */ function handleToggle(id) {
        if (id.startsWith("syllabus-")) return;
        setSelectedIds((prev)=>{
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }
    /**
   * Called when the course modal closes. Computes the diff between old
   * and new selections. If nothing changed, closes silently. Otherwise
   * shows a confirmation dialog before saving.
   */ function handleModalDone() {
        const newCanvasCourses = canvasCourses.filter((c)=>selectedIds.has(c.id)).map((c)=>{
            const rawId = c.id.replace("canvas-", "");
            const numericId = parseInt(rawId, 10);
            return {
                id: isNaN(numericId) ? 0 : numericId,
                name: c.name
            };
        });
        const newGsCourses = gseCourses.filter((c)=>selectedIds.has(c.id)).map((c)=>({
                id: c.id.replace("gs-", ""),
                name: c.name
            }));
        const newPensieveCourses = pensieveCourses.filter((c)=>selectedIds.has(c.id)).map((c)=>({
                id: c.id.replace("pensieve-", ""),
                name: c.name
            }));
        // Use name-based comparison (works for both API-token and iCal courses)
        const oldCanvasNames = new Set(canvasSelected.map((c)=>c.name));
        const oldGsIds = new Set(gsSelected.map((c)=>c.id));
        const oldPensieveIds = new Set(pensieveSelected.map((c)=>c.id));
        const addedCanvasCourses = newCanvasCourses.filter((c)=>!oldCanvasNames.has(c.name));
        const addedGsCourses = newGsCourses.filter((c)=>!oldGsIds.has(c.id));
        const addedPensieveCourses = newPensieveCourses.filter((c)=>!oldPensieveIds.has(c.id));
        const newCanvasNames = new Set(newCanvasCourses.map((c)=>c.name));
        const newGsIds = new Set(newGsCourses.map((c)=>c.id));
        const newPensieveIds = new Set(newPensieveCourses.map((c)=>c.id));
        const removedNames = [
            ...canvasSelected.filter((c)=>!newCanvasNames.has(c.name)).map((c)=>c.name),
            ...gsSelected.filter((c)=>!newGsIds.has(c.id)).map((c)=>c.name),
            ...pensieveSelected.filter((c)=>!newPensieveIds.has(c.id)).map((c)=>c.name)
        ];
        const removedTaskCount = tasks.filter((t)=>t.course_name && removedNames.includes(t.course_name)).length;
        const addedNames = [
            ...addedCanvasCourses,
            ...addedGsCourses,
            ...addedPensieveCourses
        ].map((c)=>c.name);
        setShowModal(false);
        if (addedNames.length === 0 && removedNames.length === 0) return;
        setPendingChanges({
            newCanvasCourses,
            newGsCourses,
            newPensieveCourses,
            addedCanvasCourses,
            addedGsCourses,
            addedPensieveCourses,
            addedNames,
            removedNames,
            removedTaskCount
        });
    }
    /**
   * Executes the confirmed class changes: saves credentials, deletes
   * tasks for removed courses, syncs assignments for added courses,
   * and shows a result toast with counts and inbox navigation.
   */ async function handleConfirmedSave() {
        if (!pendingChanges) return;
        setConfirming(true);
        const { newCanvasCourses, newGsCourses, newPensieveCourses, addedCanvasCourses, addedGsCourses, addedPensieveCourses, removedNames } = pendingChanges;
        const hasAdded = addedCanvasCourses.length + addedGsCourses.length + addedPensieveCourses.length > 0;
        const hasRemoved = removedNames.length > 0;
        try {
            // 1. Save updated course selections
            const payload = {
                selected_canvas_courses: newCanvasCourses,
                selected_gradescope_courses: newGsCourses,
                selected_pensieve_courses: newPensieveCourses
            };
            const res = await fetch("/api/credentials", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>({}));
                throw new Error(data.error || "Failed to save");
            }
            const updated = await res.json();
            onUpdate(updated);
            // 2. Hide tasks for removed courses (soft-dismiss, not delete)
            let hiddenCount = 0;
            if (hasRemoved) {
                hiddenCount = await dismissTasksByCourseNames(removedNames);
            }
            // 3. Restore previously hidden tasks for re-added courses
            const reAddedNames = pendingChanges.addedNames;
            let restoredCount = 0;
            if (reAddedNames.length > 0) {
                restoredCount = await undismissTasksByCourseNames(reAddedNames);
            }
            // 4. Sync assignments for added courses
            let syncedCount = 0;
            if (hasAdded) {
                const syncRes = await fetch("/api/assignments/sync", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        canvas_courses: addedCanvasCourses.length > 0 ? addedCanvasCourses : undefined,
                        gradescope_courses: addedGsCourses.length > 0 ? addedGsCourses : undefined
                    })
                });
                if (syncRes.ok) {
                    const syncResult = await syncRes.json();
                    syncedCount = (syncResult.canvas?.synced ?? 0) + (syncResult.gradescope?.synced ?? 0) + (syncResult.pensieve?.synced ?? 0);
                }
                await fetchTasks();
            }
            // 4b. Invalidate CalChat discussion boards cache so course list updates
            try {
                sessionStorage.removeItem("discussion_boards_cache_v2");
            } catch  {}
            window.dispatchEvent(new CustomEvent("caltodo-courses-changed"));
            // 5. Build result toast
            const parts = [];
            if (syncedCount > 0) {
                const addedStr = pendingChanges.addedNames.join(", ");
                parts.push(`Synced ${syncedCount} ${syncedCount === 1 ? "task" : "tasks"} from ${addedStr}`);
            } else if (restoredCount > 0) {
                parts.push(`Restored ${restoredCount} ${restoredCount === 1 ? "task" : "tasks"} from ${reAddedNames.join(", ")}`);
            } else if (hasAdded) {
                parts.push(`No new tasks from ${pendingChanges.addedNames.join(", ")}`);
            }
            if (hiddenCount > 0) {
                parts.push(`Hidden ${hiddenCount} ${hiddenCount === 1 ? "task" : "tasks"} from ${removedNames.join(", ")}`);
            } else if (hasRemoved) {
                parts.push(`Hidden ${removedNames.join(", ")}`);
            }
            showToast(parts.join(". ") + ".", {
                duration: 8_000,
                action: {
                    label: "Inbox",
                    onClick: ()=>{
                        window.location.href = "/app/inbox";
                    }
                }
            });
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to update classes");
        } finally{
            setConfirming(false);
            setPendingChanges(null);
        }
    }
    // Build summary text
    const totalAvailable = cachedTotals ? cachedTotals.canvas + cachedTotals.gradescope + cachedTotals.pensieve : null;
    const summaryCount = totalAvailable ? `${totalSelected}/${totalAvailable}` : `${totalSelected}`;
    const platformText = platformCount > 1 ? `from ${platformCount} platforms` : platformCount === 1 ? "from 1 platform" : "";
    const syllabusModalCourses = syllabusCourses.map((name)=>({
            id: `syllabus-${name}`,
            name
        }));
    const groups = [
        ...canvasCourses.length > 0 ? [
            {
                label: "bCourses",
                courses: canvasCourses,
                color: "#3b82f6"
            }
        ] : [],
        ...gseCourses.length > 0 ? [
            {
                label: "Gradescope",
                courses: gseCourses,
                color: "#14b8a6"
            }
        ] : [],
        ...pensieveCourses.length > 0 ? [
            {
                label: "Pensive",
                courses: pensieveCourses,
                color: "#8B5CF6"
            }
        ] : [],
        ...syllabusModalCourses.length > 0 ? [
            {
                label: "Syllabus",
                courses: syllabusModalCourses,
                color: "#7c3aed"
            }
        ] : []
    ];
    const allModalCourses = [
        ...canvasCourses,
        ...gseCourses,
        ...pensieveCourses,
        ...syllabusModalCourses
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-subtle-foreground",
                        children: [
                            summaryCount,
                            " class",
                            totalSelected !== 1 ? "es" : "",
                            " selected",
                            platformText ? ` ${platformText}` : ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                        lineNumber: 457,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleEdit,
                        disabled: loading,
                        className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60",
                        children: [
                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                size: 16,
                                className: "animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                                lineNumber: 465,
                                columnNumber: 22
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                                lineNumber: 465,
                                columnNumber: 71
                            }, this),
                            loading ? "Loading..." : "Edit"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                        lineNumber: 460,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                lineNumber: 456,
                columnNumber: 7
            }, this),
            totalSelected > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2",
                children: [
                    canvasSelected.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200",
                            children: c.name
                        }, `canvas-${c.id}-${i}`, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                            lineNumber: 473,
                            columnNumber: 13
                        }, this)),
                    gsSelected.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-200",
                            children: c.name
                        }, `gs-${c.id}`, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                            lineNumber: 481,
                            columnNumber: 13
                        }, this)),
                    pensieveSelected.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200",
                            children: c.name
                        }, `pensieve-${c.id}`, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                            lineNumber: 489,
                            columnNumber: 13
                        }, this)),
                    syllabusCourses.map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200",
                            children: name
                        }, `syllabus-${name}`, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                            lineNumber: 497,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                lineNumber: 471,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground",
                children: "No classes selected. Tap Edit to choose courses."
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                lineNumber: 506,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$CourseSelectModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: showModal,
                onClose: handleModalDone,
                title: "Select Classes",
                courses: allModalCourses,
                groups: groups.length > 0 ? groups : undefined,
                selectedIds: selectedIds,
                onToggle: handleToggle,
                onSelectAll: ()=>setSelectedIds(new Set(allModalCourses.map((c)=>c.id))),
                onDeselectAll: ()=>setSelectedIds(new Set())
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                lineNumber: 511,
                columnNumber: 7
            }, this),
            pendingChanges && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$ClassChangeConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                addedNames: pendingChanges.addedNames,
                removedNames: pendingChanges.removedNames,
                removedTaskCount: pendingChanges.removedTaskCount,
                loading: confirming,
                onConfirm: handleConfirmedSave,
                onCancel: ()=>setPendingChanges(null)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
                lineNumber: 524,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx",
        lineNumber: 455,
        columnNumber: 5
    }, this);
}
_s(ClassesSection, "utdjuRBiOLl3ELIfPRmgzcw5ZtU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"]
    ];
});
_c = ClassesSection;
var _c;
__turbopack_context__.k.register(_c, "ClassesSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IntegrationClasses",
    ()=>IntegrationClasses,
    "IntegrationProvider",
    ()=>IntegrationProvider,
    "default",
    ()=>IntegrationSettings,
    "useCredentials",
    ()=>useCredentials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$CanvasSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/CanvasSettings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$CanvasGenericCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/CanvasGenericCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$GradescopeSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/GradescopeSettings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$PensieveSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/PensieveSettings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$AdditionalCanvasCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/AdditionalCanvasCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$ClassesSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/ClassesSection.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
const CACHE_KEY = "caltodo_credentials_cache";
/**
 * Reads cached credentials from localStorage.
 * @returns Cached IntegrationCredentials or null if not found/invalid
 */ function getCachedCredentials() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
/**
 * Writes credentials to localStorage cache.
 * @param creds - The credentials to cache
 */ function setCachedCredentials(creds) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(creds));
    } catch  {
    /* ignore quota errors */ }
}
/** Default empty credentials used for instant render before API responds. */ const EMPTY_CREDENTIALS = {
    canvas_token: null,
    canvas_base_url: "",
    canvas_ical_url: null,
    canvas_token_expired: false,
    gradescope_email: null,
    has_gradescope_password: false,
    gradescope_auth_failed: false,
    last_synced_at: null,
    selected_canvas_courses: null,
    selected_gradescope_courses: null,
    selected_pensieve_courses: null,
    dismissed_canvas_course_ids: [],
    has_google_calendar: false,
    google_calendar_id: null,
    google_email: null,
    google_photo_url: null,
    canvas_token_created_at: null,
    is_founding_member: false,
    pensieve_calendar_url: null,
    brightspace_calendar_url: null,
    additional_canvas_accounts: [],
    has_completed_onboarding: false,
    email_digest_enabled: true,
    email_digest_hour: 15,
    email_digest_address: null,
    dismissed_modals: {}
};
/** Shared context so IntegrationSettings and IntegrationClasses use the same credentials state. */ const CredentialsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function useCredentials() {
    _s();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CredentialsContext);
    if (!ctx) throw new Error("useCredentials must be inside IntegrationProvider");
    return ctx;
}
_s(useCredentials, "/dMy7t63NXD4eYACoT93CePwGrg=");
function IntegrationProvider({ children }) {
    _s1();
    // Always start with EMPTY_CREDENTIALS to avoid hydration mismatch
    // (localStorage is unavailable during SSR). Cache is restored in useEffect.
    const [credentials, setCredentials] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_CREDENTIALS);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const fetchCredentials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IntegrationProvider.useCallback[fetchCredentials]": async ()=>{
            setLoading(true);
            try {
                const res = await fetch("/api/credentials");
                if (res.ok) {
                    const data = await res.json();
                    setCredentials(data);
                    setCachedCredentials(data);
                }
            } catch  {
            /* silently fail — cached or empty state is already shown */ } finally{
                setLoading(false);
            }
        }
    }["IntegrationProvider.useCallback[fetchCredentials]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "IntegrationProvider.useEffect": ()=>{
            // Hydrate from localStorage cache for instant render, but keep loading=true
            // until API responds to avoid flickering between stale and fresh state
            const cached = getCachedCredentials();
            if (cached) {
                setCredentials(cached);
            }
            // Fetch fresh data — loading stays true until this completes
            fetchCredentials();
        }
    }["IntegrationProvider.useEffect"], [
        fetchCredentials
    ]);
    // Re-fetch credentials when sync completes (updates Classes tab in real-time)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "IntegrationProvider.useEffect": ()=>{
            function handleCredentialsChanged() {
                fetchCredentials();
            }
            window.addEventListener("credentials-changed", handleCredentialsChanged);
            return ({
                "IntegrationProvider.useEffect": ()=>window.removeEventListener("credentials-changed", handleCredentialsChanged)
            })["IntegrationProvider.useEffect"];
        }
    }["IntegrationProvider.useEffect"], [
        fetchCredentials
    ]);
    function handleUpdate(updated) {
        setCredentials(updated);
        setCachedCredentials(updated);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CredentialsContext.Provider, {
        value: {
            credentials,
            loading,
            handleUpdate,
            refresh: fetchCredentials
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx",
        lineNumber: 146,
        columnNumber: 5
    }, this);
}
_s1(IntegrationProvider, "v58su4IXrn2PWDsMcTvw58FCDOk=");
_c = IntegrationProvider;
function IntegrationSettings() {
    _s2();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CredentialsContext);
    const { syncing, lastSyncedAt, syncResult } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    if (!ctx) throw new Error("IntegrationSettings must be inside IntegrationProvider");
    const { credentials, handleUpdate } = ctx;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$CanvasSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                credentials: credentials,
                onUpdate: handleUpdate,
                syncing: syncing,
                lastSyncedAt: lastSyncedAt,
                syncedCount: syncResult?.canvas.synced
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx",
                lineNumber: 165,
                columnNumber: 7
            }, this),
            (credentials.additional_canvas_accounts ?? []).map((account)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$AdditionalCanvasCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    account: account,
                    credentials: credentials,
                    onUpdate: handleUpdate
                }, account.id, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx",
                    lineNumber: 174,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$GradescopeSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                credentials: credentials,
                onUpdate: handleUpdate,
                syncing: syncing,
                lastSyncedAt: lastSyncedAt,
                syncedCount: syncResult?.gradescope.synced
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx",
                lineNumber: 181,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$PensieveSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                credentials: credentials,
                onUpdate: handleUpdate,
                syncing: syncing,
                lastSyncedAt: lastSyncedAt,
                syncedCount: syncResult?.pensieve.synced
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx",
                lineNumber: 188,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$CanvasGenericCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx",
        lineNumber: 164,
        columnNumber: 5
    }, this);
}
_s2(IntegrationSettings, "QLWNSKGnVfpq4bwzoNuu+ip9M4M=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"]
    ];
});
_c1 = IntegrationSettings;
function IntegrationClasses() {
    _s3();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CredentialsContext);
    if (!ctx) throw new Error("IntegrationClasses must be inside IntegrationProvider");
    const { credentials, handleUpdate } = ctx;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$ClassesSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        credentials: credentials,
        onUpdate: handleUpdate
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx",
        lineNumber: 209,
        columnNumber: 10
    }, this);
}
_s3(IntegrationClasses, "/dMy7t63NXD4eYACoT93CePwGrg=");
_c2 = IntegrationClasses;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "IntegrationProvider");
__turbopack_context__.k.register(_c1, "IntegrationSettings");
__turbopack_context__.k.register(_c2, "IntegrationClasses");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GoogleAuthWarningModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
"use client";
;
;
;
function GoogleAuthWarningModal({ open, onContinue, onCancel }) {
    if (!open || typeof document === "undefined") return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
                onClick: onCancel
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        size: 20,
                                        className: "text-amber-500"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                                        lineNumber: 41,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                                    lineNumber: 40,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-foreground",
                                    children: "Google Verification Notice"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                                    lineNumber: 43,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground mb-4 leading-relaxed",
                            children: "You may see a warning that says \"Google hasn't verified this app.\" This is normal — Google's verification process takes time. Your data is safe."
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm text-muted-foreground mb-6 leading-relaxed bg-muted/50 rounded-xl px-4 py-3 border border-border/50",
                            children: [
                                "Click ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium text-foreground",
                                    children: "Advanced"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                                    lineNumber: 53,
                                    columnNumber: 19
                                }, this),
                                " ",
                                "→ ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium text-foreground",
                                    children: "Go to CalTodo (unsafe)"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                                    lineNumber: 54,
                                    columnNumber: 15
                                }, this),
                                " ",
                                "to continue."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onContinue,
                                    className: "w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all cursor-pointer",
                                    children: "Continue"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                                    lineNumber: 58,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onCancel,
                                    className: "w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                                    lineNumber: 65,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this), document.body);
}
_c = GoogleAuthWarningModal;
var _c;
__turbopack_context__.k.register(_c, "GoogleAuthWarningModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GoogleCalendarSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$GoogleAuthWarningModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/GoogleAuthWarningModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2f$read$2d$sync$2d$stream$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/gcal/read-sync-stream.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
/**
 * Google Calendar integration row card.
 * Compact horizontal layout: logo in gray square, title + description, Connected/Connect badge.
 * Connect triggers OAuth flow; Connected is a static label (disconnect available via calendar header).
 * Detects ?gcal=connected query param to auto-create calendar and sync.
 */ "use client";
;
;
;
;
;
;
;
/**
 * Module-level ref for showToast so sync can fire toasts after navigation.
 * Updated every render by the component.
 */ let globalShowToast = null;
/** Module-level ref for updateToastProgress so sync can update progress after navigation. */ let globalUpdateProgress = null;
// readSyncStream is now imported from @/lib/gcal/read-sync-stream
/** Whether a module-level background sync is currently in progress. */ let moduleSyncInProgress = false;
/** Whether the current module-level sync is silent (auto-sync). Silent syncs don't show a progress bar. */ let moduleSyncSilent = false;
/** Callback to notify the mounted component of sync state changes. */ let onModuleSyncStateChange = null;
/** Timestamp of the last auto-sync attempt. Used to enforce a cooldown so we don't retry endlessly on persistent failures. */ let lastAutoSyncAt = 0;
/** Minimum interval (ms) between automatic sync attempts. */ const AUTO_SYNC_COOLDOWN_MS = 5 * 60_000;
/**
 * Runs the initial-sync in the background at module level.
 * Survives component unmount so users can navigate away from the integrations tab.
 * Uses globalShowToast/globalUpdateProgress for toast notifications.
 */ /** Tracks consecutive sync failures to prevent endless retries. */ let consecutiveSyncFailures = 0;
const MAX_AUTO_SYNC_FAILURES = 1;
/**
 * Runs background sync of unsynced tasks to Google Calendar.
 * When silent=true (auto-sync), suppresses toasts and emits a custom event on failure.
 * When silent=false (manual), shows progress toasts.
 *
 * @param silent - If true, suppresses toast notifications (used for auto-sync)
 */ async function runBackgroundSync(silent = false) {
    if (moduleSyncInProgress) return;
    moduleSyncInProgress = true;
    moduleSyncSilent = silent;
    // Only notify UI for non-silent syncs — silent auto-syncs run invisibly
    if (!silent) onModuleSyncStateChange?.(true, {
        synced: 0,
        total: 0
    });
    const toast = (msg, opts)=>{
        if (!silent) globalShowToast?.(msg, opts);
    };
    const progress = (p)=>{
        if (!silent) globalUpdateProgress?.(p);
    };
    toast("Syncing tasks to Google Calendar...", {
        progress: 0
    });
    try {
        const syncRes = await fetch("/api/gcal/initial-sync", {
            method: "POST"
        });
        const contentType = syncRes.headers.get("Content-Type") ?? "";
        if (contentType.includes("application/json")) {
            const result = await syncRes.json();
            progress(100);
            if (syncRes.ok && result.synced === 0 && result.total === 0) {
                consecutiveSyncFailures = 0;
                toast("All tasks are already synced.");
            } else if (!syncRes.ok) {
                consecutiveSyncFailures++;
                toast(`Sync failed: ${result.error || syncRes.status}`);
            }
            return;
        }
        const finalResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2f$read$2d$sync$2d$stream$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["readSyncStream"])(syncRes, {
            onProgress: (synced, total)=>{
                if (!silent) onModuleSyncStateChange?.(true, {
                    synced,
                    total
                });
                if (total > 0) progress(Math.round(synced / total * 100));
            },
            onDone: ()=>{
                if (!silent) onModuleSyncStateChange?.(true, null);
            }
        });
        if (!finalResult) {
            progress(100);
            consecutiveSyncFailures++;
            toast("Sync failed: no response stream.");
            return;
        }
        if (finalResult.synced > 0) {
            consecutiveSyncFailures = 0;
            const msg = finalResult.synced === finalResult.total ? `Synced ${finalResult.synced} task${finalResult.synced === 1 ? "" : "s"} to Google Calendar.` : `Synced ${finalResult.synced} of ${finalResult.total} tasks to Google Calendar.`;
            toast(msg);
        } else if (finalResult.total > 0) {
            consecutiveSyncFailures++;
            if (!silent) {
                toast(`Sync failed for all ${finalResult.total} tasks. Check your Google Calendar permissions.`);
            }
        } else {
            consecutiveSyncFailures = 0;
            toast("All tasks are already synced.");
        }
    } catch (err) {
        console.error("Background sync error:", err);
        consecutiveSyncFailures++;
        progress(100);
        toast("Failed to sync tasks. Please try again.");
    } finally{
        moduleSyncInProgress = false;
        moduleSyncSilent = false;
        onModuleSyncStateChange?.(false, null);
    }
}
/**
 * Inline Google Calendar logo SVG for brand recognition.
 *
 * @param size - Icon dimensions in pixels (default 16)
 */ function GoogleCalendarIcon({ size = 16 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: size,
        height: size,
        viewBox: "0 0 122.88 122.88",
        className: "inline-block shrink-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78",
                fill: "#fff"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 143,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "93.78,122.88 122.88,93.78 93.78,93.78",
                fill: "#EA4335"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78",
                fill: "#FBBC04"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88",
                fill: "#34A853"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0z",
                fill: "#188038"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88z",
                fill: "#1967D2"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0z",
                fill: "#4285F4"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 149,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M42.37,79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c0.51,1.94,1.4,3.44,2.67,4.51c1.26,1.07,2.8,1.59,4.59,1.59c1.84,0,3.41-0.56,4.73-1.67c1.32-1.12,1.98-2.54,1.98-4.26c0-1.76-0.7-3.2-2.09-4.32c-1.39-1.12-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79,0,3.31-0.48,4.54-1.46c1.23-0.97,1.84-2.3,1.84-3.99c0-1.5-0.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65,0-2.96,0.44-3.93,1.32c-0.97,0.88-1.7,2-2.12,3.24l-5.55-2.31c0.74-2.09,2.09-3.93,4.07-5.52c1.98-1.59,4.51-2.39,7.58-2.39c2.27,0,4.32,0.44,6.13,1.32c1.81,0.88,3.23,2.1,4.26,3.65c1.03,1.56,1.54,3.31,1.54,5.25c0,1.98-0.48,3.65-1.43,5.03c-0.95,1.37-2.13,2.43-3.52,3.16v0.33c1.79,0.74,3.36,1.96,4.51,3.52c1.17,1.58,1.76,3.46,1.76,5.66c0,2.2-0.56,4.16-1.67,5.88c-1.12,1.72-2.66,3.08-4.62,4.07c-1.96,0.99-4.17,1.49-6.62,1.49C47.41,81.72,44.79,80.91,42.37,79.27z",
                fill: "#1A73E8"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 150,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M76.83,51.43l-6.16,4.45l-3.08-4.67l11.05-7.97h4.24v37.6h-6.05V51.43z",
                fill: "#1A73E8"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
        lineNumber: 137,
        columnNumber: 5
    }, this);
}
_c = GoogleCalendarIcon;
/** localStorage key for caching GCal connection state (used by sidebar/header). */ const GCAL_CACHE_KEY = "gcal_status";
function GoogleCalendarSettings() {
    _s();
    const { showToast, updateToastProgress } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { credentials, refresh } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCredentials"])();
    // Derive GCal state from the shared credentials context
    const connected = !!credentials.has_google_calendar;
    const googleEmail = credentials.google_email ?? null;
    const selectedCalendarId = credentials.google_calendar_id ?? null;
    const [syncing, setSyncing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [disconnecting, setDisconnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAuthWarning, setShowAuthWarning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [syncProgress, setSyncProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Local override for connected state during OAuth flow (before context refreshes)
    const [oauthConnecting, setOauthConnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    /** Whether the user's token lacks write scope and needs reconnection. */ const [needsReconnect, setNeedsReconnect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const mountedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    globalShowToast = showToast;
    globalUpdateProgress = updateToastProgress;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoogleCalendarSettings.useEffect": ()=>{
            mountedRef.current = true;
            return ({
                "GoogleCalendarSettings.useEffect": ()=>{
                    mountedRef.current = false;
                }
            })["GoogleCalendarSettings.useEffect"];
        }
    }["GoogleCalendarSettings.useEffect"], []);
    // Keep the gcal_status localStorage cache in sync for sidebar/header
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoogleCalendarSettings.useEffect": ()=>{
            try {
                localStorage.setItem(GCAL_CACHE_KEY, JSON.stringify({
                    connected,
                    calendarId: selectedCalendarId,
                    email: googleEmail,
                    photoUrl: credentials.google_photo_url ?? null
                }));
            } catch  {}
        }
    }["GoogleCalendarSettings.useEffect"], [
        connected,
        selectedCalendarId,
        googleEmail,
        credentials.google_photo_url
    ]);
    function toast(msg, opts) {
        (globalShowToast ?? showToast)(msg, opts);
    }
    function toastProgress(progress) {
        (globalUpdateProgress ?? updateToastProgress)(progress);
    }
    function ifMounted(setter, value) {
        if (mountedRef.current) setter(value);
    }
    // Check if existing token has write scope — prompt reconnect if read-only.
    // Only checks once per session to avoid nagging after a successful reconnect.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoogleCalendarSettings.useEffect": ()=>{
            if (!connected || oauthConnecting) return;
            try {
                if (sessionStorage.getItem("gcal-scope-ok") === "1") return;
            } catch  {}
            let cancelled = false;
            ({
                "GoogleCalendarSettings.useEffect": async ()=>{
                    try {
                        const res = await fetch("/api/gcal/check-scope");
                        if (!res.ok || cancelled) return;
                        const data = await res.json();
                        if (cancelled || !mountedRef.current) return;
                        if (data.needsReconnect) {
                            setNeedsReconnect(true);
                        } else {
                            try {
                                sessionStorage.setItem("gcal-scope-ok", "1");
                            } catch  {}
                        }
                    } catch  {}
                }
            })["GoogleCalendarSettings.useEffect"]();
            return ({
                "GoogleCalendarSettings.useEffect": ()=>{
                    cancelled = true;
                }
            })["GoogleCalendarSettings.useEffect"];
        }
    }["GoogleCalendarSettings.useEffect"], [
        connected,
        oauthConnecting
    ]);
    // Auto-sync unsynced tasks on mount — no manual banner needed.
    // Skips if already syncing, during OAuth setup, or within cooldown.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoogleCalendarSettings.useEffect": ()=>{
            if (!connected || oauthConnecting || moduleSyncInProgress) return;
            if (Date.now() - lastAutoSyncAt < AUTO_SYNC_COOLDOWN_MS) return;
            if (consecutiveSyncFailures >= MAX_AUTO_SYNC_FAILURES) return;
            let cancelled = false;
            ({
                "GoogleCalendarSettings.useEffect": async ()=>{
                    try {
                        const res = await fetch("/api/gcal/unsynced-count");
                        if (!res.ok || cancelled) return;
                        const data = await res.json();
                        if (!cancelled && mountedRef.current && data.count > 0 && !moduleSyncInProgress) {
                            lastAutoSyncAt = Date.now();
                            // Silent auto-sync — no progress bar, runs invisibly in background
                            runBackgroundSync(true);
                        }
                    } catch  {}
                }
            })["GoogleCalendarSettings.useEffect"]();
            return ({
                "GoogleCalendarSettings.useEffect": ()=>{
                    cancelled = true;
                }
            })["GoogleCalendarSettings.useEffect"];
        }
    }["GoogleCalendarSettings.useEffect"], [
        connected,
        oauthConnecting
    ]);
    // Register module-level sync callback so sync survives navigation away.
    // Only show progress bar for non-silent (user-initiated) syncs.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoogleCalendarSettings.useEffect": ()=>{
            if (moduleSyncInProgress && !moduleSyncSilent) {
                setSyncing(true);
            }
            onModuleSyncStateChange = ({
                "GoogleCalendarSettings.useEffect": (isSyncing, progress)=>{
                    if (mountedRef.current) {
                        setSyncing(isSyncing);
                        setSyncProgress(progress);
                    }
                }
            })["GoogleCalendarSettings.useEffect"];
            return ({
                "GoogleCalendarSettings.useEffect": ()=>{
                    onModuleSyncStateChange = null;
                }
            })["GoogleCalendarSettings.useEffect"];
        }
    }["GoogleCalendarSettings.useEffect"], []);
    async function autoSetupCalendar() {
        setSyncing(true);
        // Fresh OAuth means full scope — skip future scope checks this session
        try {
            sessionStorage.setItem("gcal-scope-ok", "1");
        } catch  {}
        toast("Setting up Google Calendar...", {
            progress: 0
        });
        try {
            await refresh();
            // Fetch available calendars and select them (max 10 per route validation)
            const calListRes = await fetch("/api/gcal/calendars?all=true");
            let calendarIds = [
                "primary"
            ];
            if (calListRes.ok) {
                const calData = await calListRes.json();
                if (calData.calendars && calData.calendars.length > 0) {
                    calendarIds = calData.calendars.map((c)=>c.id).slice(0, 10);
                }
            }
            const selectRes = await fetch("/api/gcal/select-calendar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    calendarIds
                })
            });
            if (!selectRes.ok) {
                const err = await selectRes.json();
                toast(`Failed to set up calendar: ${err.error || selectRes.status}`);
                return;
            }
            const selectResult = await selectRes.json();
            const gcalUrl = googleEmail ? `https://calendar.google.com/calendar/r?authuser=${encodeURIComponent(googleEmail)}` : "https://calendar.google.com";
            const openAction = {
                action: {
                    label: "Open",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                        size: 14
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                        lineNumber: 305,
                        columnNumber: 17
                    }, this),
                    onClick: ()=>window.open(gcalUrl, "_blank")
                }
            };
            if (selectResult.needsSync) {
                ifMounted(setSyncProgress, {
                    synced: 0,
                    total: 0
                });
                toast("Syncing tasks to Google Calendar...", {
                    progress: 0
                });
                const syncRes = await fetch("/api/gcal/initial-sync", {
                    method: "POST"
                });
                const contentType = syncRes.headers.get("Content-Type") ?? "";
                if (contentType.includes("application/json")) {
                    const syncResult = await syncRes.json();
                    if (!syncRes.ok) {
                        toast(`Sync failed: ${syncResult.error || syncRes.status}`);
                    } else if (syncResult.synced > 0) {
                        const msg = syncResult.synced === syncResult.total ? `Synced ${syncResult.synced} task${syncResult.synced === 1 ? "" : "s"} to Google Calendar.` : `Synced ${syncResult.synced} of ${syncResult.total} tasks to Google Calendar.`;
                        toast(msg, openAction);
                    } else {
                        toast("Calendar created! No tasks with due dates to sync.", openAction);
                    }
                    return;
                }
                const finalResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$gcal$2f$read$2d$sync$2d$stream$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["readSyncStream"])(syncRes, {
                    onProgress: (synced, total)=>{
                        ifMounted(setSyncProgress, {
                            synced,
                            total
                        });
                        if (total > 0) toastProgress(Math.round(synced / total * 100));
                    },
                    onDone: ()=>ifMounted(setSyncProgress, null)
                });
                if (!finalResult) {
                    toast("Sync failed: no response stream.");
                    return;
                }
                if (finalResult && finalResult.synced > 0) {
                    const msg = finalResult.synced === finalResult.total ? `Synced ${finalResult.synced} task${finalResult.synced === 1 ? "" : "s"} to Google Calendar. New tasks will sync automatically.` : `Synced ${finalResult.synced} of ${finalResult.total} tasks to Google Calendar. New tasks will sync automatically.`;
                    toast(msg, openAction);
                } else if (finalResult && finalResult.total > 0 && finalResult.synced === 0) {
                    toast(`Sync failed for all ${finalResult.total} tasks. Check your Google Calendar permissions.`);
                } else if (finalResult && finalResult.total === 0) {
                    toast("Google Calendar connected! No tasks to sync yet — new tasks will sync automatically.", openAction);
                }
            /* sync complete */ } else {
                toast("Google Calendar connected! New tasks will sync automatically.", openAction);
            }
        } catch (err) {
            console.error("Auto-setup calendar error:", err);
            toast("Failed to set up calendar. Please try again.");
        } finally{
            ifMounted(setSyncing, false);
            ifMounted(setSyncProgress, null);
            ifMounted(setOauthConnecting, false);
            // Refresh shared context so all cards reflect updated state
            await refresh();
            // Notify sidebar/header to update GCal badge in the same tab
            try {
                window.dispatchEvent(new CustomEvent("gcal-status-change", {
                    detail: {
                        connected: true
                    }
                }));
            } catch  {}
            // Navigate back to integrations section after sync completes
            router.replace("/app/settings?section=integrations");
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoogleCalendarSettings.useEffect": ()=>{
            const gcalParam = searchParams.get("gcal");
            // Skip auto-setup if running inside a popup — the opener window handles it
            if (window.opener) return;
            if (gcalParam === "connected") {
                setOauthConnecting(true);
                autoSetupCalendar();
                const url = new URL(window.location.href);
                url.searchParams.delete("gcal");
                window.history.replaceState({}, "", url.toString());
            } else if (gcalParam === "error") {
                const reason = searchParams.get("reason");
                const messages = {
                    denied: "Google Calendar access was denied.",
                    csrf: "Security check failed. Please try again.",
                    token_exchange: "Failed to connect. Please try again.",
                    missing_tokens: "Failed to get tokens from Google. Please try again.",
                    config: "Google Calendar is not configured on this server.",
                    storage: "Failed to save connection. Please try again."
                };
                showToast(messages[reason ?? ""] ?? "Failed to connect Google Calendar.");
                const url = new URL(window.location.href);
                url.searchParams.delete("gcal");
                url.searchParams.delete("reason");
                window.history.replaceState({}, "", url.toString());
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["GoogleCalendarSettings.useEffect"], [
        searchParams,
        showToast
    ]);
    /**
   * Disconnects Google Calendar via API.
   * Clears local state/cache and shows confirmation toast.
   */ async function handleDisconnect() {
        setDisconnecting(true);
        try {
            await fetch("/api/gcal/disconnect", {
                method: "POST"
            });
            try {
                localStorage.removeItem(GCAL_CACHE_KEY);
            } catch  {}
            await refresh();
            // Notify header/sidebar to update GCal badge
            try {
                window.dispatchEvent(new CustomEvent("gcal-status-change", {
                    detail: {
                        connected: false
                    }
                }));
            } catch  {}
            showToast("Google Calendar disconnected.");
        } catch  {
            showToast("Failed to disconnect Google Calendar.");
        } finally{
            setDisconnecting(false);
        }
    }
    /**
   * Shows the auth warning modal before starting the OAuth flow.
   */ function handleConnect() {
        setShowAuthWarning(true);
    }
    /**
   * Proceeds with OAuth after user acknowledges the warning.
   * Desktop: opens Google OAuth in a centered popup, polls for completion.
   * Mobile: falls back to full-page redirect.
   */ function handleConfirmConnect() {
        setShowAuthWarning(false);
        const isDesktop = ("TURBOPACK compile-time value", "object") !== "undefined" && window.innerWidth >= 768;
        if (!isDesktop) {
            window.location.href = "/api/gcal/auth";
            return;
        }
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open("/api/gcal/auth", "gcal-auth", `width=${width},height=${height},left=${left},top=${top},popup=true`);
        if (!popup || popup.closed) {
            // Popup blocked — fall back to full redirect
            window.location.href = "/api/gcal/auth";
            return;
        }
        /**
     * Polls the popup URL until it navigates back to our origin with
     * ?gcal=connected or ?gcal=error, then closes the popup and handles the result.
     */ const pollId = setInterval(()=>{
            try {
                if (!popup || popup.closed) {
                    clearInterval(pollId);
                    return;
                }
                const popupUrl = popup.location.href;
                if (popupUrl.includes("gcal=connected")) {
                    clearInterval(pollId);
                    popup.close();
                    setOauthConnecting(true);
                    autoSetupCalendar();
                } else if (popupUrl.includes("gcal=error")) {
                    clearInterval(pollId);
                    popup.close();
                    const url = new URL(popupUrl);
                    const reason = url.searchParams.get("reason");
                    const messages = {
                        denied: "Google Calendar access was denied.",
                        csrf: "Security check failed. Please try again.",
                        token_exchange: "Failed to connect. Please try again.",
                        missing_tokens: "Failed to get tokens from Google. Please try again.",
                        config: "Google Calendar is not configured on this server.",
                        storage: "Failed to save connection. Please try again."
                    };
                    showToast(messages[reason ?? ""] ?? "Failed to connect Google Calendar.");
                }
            } catch  {
            // Cross-origin — popup is still on Google domain, keep polling
            }
        }, 300);
    }
    const isConnectedOrConnecting = connected || oauthConnecting;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-4 py-3.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GoogleCalendarIcon, {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                    lineNumber: 503,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                lineNumber: 502,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-foreground whitespace-nowrap",
                                                children: "Google Calendar"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                                lineNumber: 508,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-medium text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap",
                                                children: "Real-time"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                                lineNumber: 509,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                        lineNumber: 507,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground truncate",
                                        children: isConnectedOrConnecting && googleEmail ? googleEmail : "Sync tasks to Google Calendar in real time"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                        lineNumber: 513,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                lineNumber: 506,
                                columnNumber: 11
                            }, this),
                            isConnectedOrConnecting ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleDisconnect,
                                disabled: disconnecting,
                                "aria-label": "Disconnect Google Calendar",
                                className: "group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg shrink-0 border transition-colors cursor-pointer disabled:opacity-60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "group-hover:hidden",
                                        children: disconnecting ? "..." : "Connected"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                        lineNumber: 529,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden group-hover:inline",
                                        children: "Disconnect"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                        lineNumber: 530,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                lineNumber: 521,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleConnect,
                                className: "text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer",
                                children: "Connect"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                lineNumber: 533,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                        lineNumber: 500,
                        columnNumber: 9
                    }, this),
                    needsReconnect && isConnectedOrConnecting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-4 mb-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-amber-800 dark:text-amber-300 mb-1.5",
                                children: "Please reconnect to enable task syncing to Google Calendar."
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                lineNumber: 545,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: async ()=>{
                                    setNeedsReconnect(false);
                                    try {
                                        sessionStorage.removeItem("gcal-scope-ok");
                                    } catch  {}
                                    await handleDisconnect();
                                    handleConnect();
                                },
                                className: "text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 underline underline-offset-2 cursor-pointer",
                                children: "Reconnect now"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                                lineNumber: 548,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                        lineNumber: 544,
                        columnNumber: 11
                    }, this),
                    syncing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-1 w-full bg-muted overflow-hidden",
                        children: syncProgress && syncProgress.total > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-full bg-blue-500 transition-all duration-700 ease-out",
                            style: {
                                width: `${Math.round(syncProgress.synced / syncProgress.total * 100)}%`
                            }
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                            lineNumber: 566,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-full w-1/3 bg-blue-500 rounded-full animate-sync-bar"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                            lineNumber: 571,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                        lineNumber: 564,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 499,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$GoogleAuthWarningModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: showAuthWarning,
                onContinue: handleConfirmConnect,
                onCancel: ()=>setShowAuthWarning(false)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx",
                lineNumber: 577,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(GoogleCalendarSettings, "zDCYFSrEjwiuw65qaSSLqGJqKd0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCredentials"]
    ];
});
_c1 = GoogleCalendarSettings;
var _c, _c1;
__turbopack_context__.k.register(_c, "GoogleCalendarIcon");
__turbopack_context__.k.register(_c1, "GoogleCalendarSettings");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IntegrationsWelcomeModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDismissedModals$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/hooks/useDismissedModals.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
/**
 * Inline Google Calendar logo SVG.
 */ function GCalIcon({ size = 18 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: size,
        height: size,
        viewBox: "0 0 122.88 122.88",
        className: "shrink-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78",
                fill: "#fff"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "93.78,122.88 122.88,93.78 93.78,93.78",
                fill: "#EA4335"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78",
                fill: "#FBBC04"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88",
                fill: "#34A853"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0z",
                fill: "#188038"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88z",
                fill: "#1967D2"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0z",
                fill: "#4285F4"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M42.37,79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c0.51,1.94,1.4,3.44,2.67,4.51c1.26,1.07,2.8,1.59,4.59,1.59c1.84,0,3.41-0.56,4.73-1.67c1.32-1.12,1.98-2.54,1.98-4.26c0-1.76-0.7-3.2-2.09-4.32c-1.39-1.12-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79,0,3.31-0.48,4.54-1.46c1.23-0.97,1.84-2.3,1.84-3.99c0-1.5-0.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65,0-2.96,0.44-3.93,1.32c-0.97,0.88-1.7,2-2.12,3.24l-5.55-2.31c0.74-2.09,2.09-3.93,4.07-5.52c1.98-1.59,4.51-2.39,7.58-2.39c2.27,0,4.32,0.44,6.13,1.32c1.81,0.88,3.23,2.1,4.26,3.65c1.03,1.56,1.54,3.31,1.54,5.25c0,1.98-0.48,3.65-1.43,5.03c-0.95,1.37-2.13,2.43-3.52,3.16v0.33c1.79,0.74,3.36,1.96,4.51,3.52c1.17,1.58,1.76,3.46,1.76,5.66c0,2.2-0.56,4.16-1.67,5.88c-1.12,1.72-2.66,3.08-4.62,4.07c-1.96,0.99-4.17,1.49-6.62,1.49C47.41,81.72,44.79,80.91,42.37,79.27z",
                fill: "#1A73E8"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M76.83,51.43l-6.16,4.45l-3.08-4.67l11.05-7.97h4.24v37.6h-6.05V51.43z",
                fill: "#1A73E8"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = GCalIcon;
function IntegrationsWelcomeModal() {
    _s();
    const { isDismissed, dismiss, loaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDismissedModals$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDismissedModals"])();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [exiting, setExiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "IntegrationsWelcomeModal.useEffect": ()=>{
            if (!loaded) return;
            if (isDismissed("integrations_welcome")) return;
            const timer = setTimeout({
                "IntegrationsWelcomeModal.useEffect.timer": ()=>{
                    setVisible(true);
                }
            }["IntegrationsWelcomeModal.useEffect.timer"], 300);
            return ({
                "IntegrationsWelcomeModal.useEffect": ()=>clearTimeout(timer)
            })["IntegrationsWelcomeModal.useEffect"];
        }
    }["IntegrationsWelcomeModal.useEffect"], [
        loaded,
        isDismissed
    ]);
    /**
   * Dismisses the modal with exit animation and persists to server.
   */ const handleDismiss = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IntegrationsWelcomeModal.useCallback[handleDismiss]": ()=>{
            dismiss("integrations_welcome");
            setExiting(true);
            setTimeout({
                "IntegrationsWelcomeModal.useCallback[handleDismiss]": ()=>{
                    setVisible(false);
                    setExiting(false);
                }
            }["IntegrationsWelcomeModal.useCallback[handleDismiss]"], 250);
        }
    }["IntegrationsWelcomeModal.useCallback[handleDismiss]"], [
        dismiss
    ]);
    if (!visible) return null;
    const backdropClass = exiting ? "animate-announce-backdrop-out" : "animate-announce-backdrop-in";
    const cardClass = exiting ? "animate-announce-card-out" : "animate-announce-card-in";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm ${backdropClass}`,
        onClick: handleDismiss,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-popover rounded-2xl shadow-2xl w-full w-[calc(100%-2rem)] max-w-md p-8 ${cardClass}`,
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center gap-2 mb-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-1 w-16 rounded-full bg-foreground"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                        lineNumber: 82,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xl font-semibold text-foreground mb-2 animate-drop-in",
                    style: {
                        animationDelay: "150ms"
                    },
                    children: "your integrations"
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground mb-6 leading-relaxed animate-drop-in",
                    style: {
                        animationDelay: "220ms"
                    },
                    children: "connect your class platforms to automatically import assignments and deadlines."
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-8 animate-drop-in",
                    style: {
                        animationDelay: "290ms"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3.5 py-4 border-t border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                    size: 18,
                                    className: "text-foreground shrink-0 mt-0.5"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-foreground",
                                            children: "sync your classes"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                            lineNumber: 110,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                            children: "connect bCourses, Gradescope, or Pensive to import assignments"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                            lineNumber: 111,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3.5 py-4 border-t border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "shrink-0 mt-0.5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GCalIcon, {
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                        lineNumber: 120,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-foreground",
                                            children: "live sync to Google Calendar"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                            lineNumber: 123,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                            children: "your assignments automatically appear on your calendar"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                            lineNumber: 124,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3.5 py-4 border-t border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                    size: 18,
                                    className: "text-foreground shrink-0 mt-0.5"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-foreground",
                                            children: "your data is safe and encrypted"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                            lineNumber: 134,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
                                            children: "all credentials are encrypted with AES-256. no one — not even us — can see your information."
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                            lineNumber: 135,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                                    lineNumber: 133,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end animate-drop-in",
                    style: {
                        animationDelay: "360ms"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleDismiss,
                        className: "px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95",
                        children: "got it →"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                        lineNumber: 147,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
                    lineNumber: 143,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
            lineNumber: 76,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this), document.body);
}
_s(IntegrationsWelcomeModal, "aCMm50pPDvUTEjT2wC2JKLfbeGg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$hooks$2f$useDismissedModals$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDismissedModals"]
    ];
});
_c1 = IntegrationsWelcomeModal;
var _c, _c1;
__turbopack_context__.k.register(_c, "GCalIcon");
__turbopack_context__.k.register(_c1, "IntegrationsWelcomeModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SyllabusSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function SyllabusSettings() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const { tasks, deleteTasksBySource, deleteSyllabusTasksByCourse } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const [disconnecting, setDisconnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    /** Which course or "all" to confirm deletion for. */ const [confirmTarget, setConfirmTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const syllabusTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SyllabusSettings.useMemo[syllabusTasks]": ()=>tasks.filter({
                "SyllabusSettings.useMemo[syllabusTasks]": (t)=>t.source === "syllabus"
            }["SyllabusSettings.useMemo[syllabusTasks]"])
    }["SyllabusSettings.useMemo[syllabusTasks]"], [
        tasks
    ]);
    /** Groups syllabus tasks by course_name, sorted alphabetically. */ const courseGroups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SyllabusSettings.useMemo[courseGroups]": ()=>{
            const map = new Map();
            for (const t of syllabusTasks){
                const name = t.course_name || "Untitled Syllabus";
                map.set(name, (map.get(name) || 0) + 1);
            }
            return Array.from(map.entries()).sort({
                "SyllabusSettings.useMemo[courseGroups]": ([a], [b])=>a.localeCompare(b)
            }["SyllabusSettings.useMemo[courseGroups]"]).map({
                "SyllabusSettings.useMemo[courseGroups]": ([name, count])=>({
                        name,
                        count
                    })
            }["SyllabusSettings.useMemo[courseGroups]"]);
        }
    }["SyllabusSettings.useMemo[courseGroups]"], [
        syllabusTasks
    ]);
    const totalCount = syllabusTasks.length;
    /**
   * Deletes tasks for a specific course or all syllabus tasks.
   *
   * @param target - course_name to delete, or "all" for everything
   */ async function handleDelete(target) {
        setConfirmTarget(null);
        setDisconnecting(true);
        try {
            if (target === "all") {
                await deleteTasksBySource("syllabus");
                showToast("All syllabus tasks removed.");
            } else {
                await deleteSyllabusTasksByCourse(target);
                showToast(`Removed tasks from "${target}".`);
            }
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to remove tasks");
        } finally{
            setDisconnecting(false);
        }
    }
    /** Count for the current confirm target. */ const confirmCount = confirmTarget === "all" ? totalCount : courseGroups.find((g)=>g.name === confirmTarget)?.count ?? 0;
    const confirmLabel = confirmTarget === "all" ? `all ${totalCount} imported task${totalCount === 1 ? "" : "s"}` : `${confirmCount} task${confirmCount === 1 ? "" : "s"} from "${confirmTarget}"`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-border bg-card px-3 sm:px-4 py-3.5 shadow-sm dark:shadow-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2.5 sm:gap-3.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                            size: 20,
                            className: "text-purple-500"
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-foreground",
                                children: "Syllabus"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground truncate",
                                children: totalCount === 0 ? "Import assignments from a syllabus PDF" : totalCount === 1 ? "1 assignment imported" : `${totalCount} assignments imported`
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.push("/app/onboarding?setup=syllabus"),
                                className: "text-xs font-medium text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors cursor-pointer",
                                children: totalCount > 0 ? "Upload Another" : "Upload"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            totalCount > 0 && courseGroups.length <= 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setConfirmTarget("all"),
                                disabled: disconnecting,
                                "aria-label": "Disconnect Syllabus",
                                className: "group min-w-[84px] text-xs font-medium px-3 py-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "group-hover:hidden",
                                        children: disconnecting ? "..." : "Connected"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                        lineNumber: 109,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden group-hover:inline",
                                        children: "Disconnect"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                        lineNumber: 110,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            courseGroups.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 pt-3 border-t border-border space-y-2",
                children: [
                    courseGroups.map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between gap-2 px-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0 flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-medium text-foreground truncate",
                                            children: group.name
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                            lineNumber: 122,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] text-muted-foreground",
                                            children: [
                                                group.count,
                                                " task",
                                                group.count === 1 ? "" : "s"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                            lineNumber: 123,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                    lineNumber: 121,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setConfirmTarget(group.name),
                                    disabled: disconnecting,
                                    className: "text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-60 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10",
                                    "aria-label": `Remove ${group.name}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                        lineNumber: 133,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                    lineNumber: 127,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, group.name, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                            lineNumber: 120,
                            columnNumber: 13
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setConfirmTarget("all"),
                        disabled: disconnecting,
                        className: "w-full text-[11px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg py-1.5 transition-colors cursor-pointer disabled:opacity-60",
                        children: "Remove All"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                        lineNumber: 137,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                lineNumber: 118,
                columnNumber: 9
            }, this),
            confirmTarget && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9999] flex items-center justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
                        onClick: ()=>setConfirmTarget(null)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                        lineNumber: 149,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-modal-in",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-foreground mb-2",
                                    children: "Remove syllabus tasks?"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                    lineNumber: 152,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground mb-6",
                                    children: [
                                        "This will remove ",
                                        confirmLabel,
                                        ". You can upload again later."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                    lineNumber: 155,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>handleDelete(confirmTarget),
                                            className: "w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer",
                                            children: "Remove"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                            lineNumber: 159,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setConfirmTarget(null),
                                            className: "w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                            lineNumber: 166,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                                    lineNumber: 158,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                            lineNumber: 151,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
                lineNumber: 148,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
_s(SyllabusSettings, "Ffz8lD0D6ExjD9mgT+iQhZGGuo8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"]
    ];
});
_c = SyllabusSettings;
var _c;
__turbopack_context__.k.register(_c, "SyllabusSettings");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IntegrationsSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$GoogleCalendarSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/GoogleCalendarSettings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationsWelcomeModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationsWelcomeModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$SyllabusSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/SyllabusSettings.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
/**
 * Inline Google Calendar logo SVG for the add-integration dropdown.
 */ function GCalDropdownIcon({ size = 15 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: size,
        height: size,
        viewBox: "0 0 122.88 122.88",
        className: "shrink-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78",
                fill: "#fff"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "93.78,122.88 122.88,93.78 93.78,93.78",
                fill: "#EA4335"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78",
                fill: "#FBBC04"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88",
                fill: "#34A853"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0z",
                fill: "#188038"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88z",
                fill: "#1967D2"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0z",
                fill: "#4285F4"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M42.37,79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c0.51,1.94,1.4,3.44,2.67,4.51c1.26,1.07,2.8,1.59,4.59,1.59c1.84,0,3.41-0.56,4.73-1.67c1.32-1.12,1.98-2.54,1.98-4.26c0-1.76-0.7-3.2-2.09-4.32c-1.39-1.12-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79,0,3.31-0.48,4.54-1.46c1.23-0.97,1.84-2.3,1.84-3.99c0-1.5-0.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65,0-2.96,0.44-3.93,1.32c-0.97,0.88-1.7,2-2.12,3.24l-5.55-2.31c0.74-2.09,2.09-3.93,4.07-5.52c1.98-1.59,4.51-2.39,7.58-2.39c2.27,0,4.32,0.44,6.13,1.32c1.81,0.88,3.23,2.1,4.26,3.65c1.03,1.56,1.54,3.31,1.54,5.25c0,1.98-0.48,3.65-1.43,5.03c-0.95,1.37-2.13,2.43-3.52,3.16v0.33c1.79,0.74,3.36,1.96,4.51,3.52c1.17,1.58,1.76,3.46,1.76,5.66c0,2.2-0.56,4.16-1.67,5.88c-1.12,1.72-2.66,3.08-4.62,4.07c-1.96,0.99-4.17,1.49-6.62,1.49C47.41,81.72,44.79,80.91,42.37,79.27z",
                fill: "#1A73E8"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M76.83,51.43l-6.16,4.45l-3.08-4.67l11.05-7.97h4.24v37.6h-6.05V51.43z",
                fill: "#1A73E8"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_c = GCalDropdownIcon;
/** Platform options shown in the "Add integration" dropdown. Always visible. */ const ADD_OPTIONS = [
    {
        id: "gcal",
        label: "Google Calendar",
        description: "Sync tasks to Google Calendar",
        logo: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GCalDropdownIcon, {
            size: 15
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
            lineNumber: 42,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        route: "/api/gcal/auth"
    },
    {
        id: "canvas",
        label: "bCourses",
        description: "UC Berkeley Canvas LMS",
        logo: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: "/bcourses-logo.png",
            alt: "",
            className: "w-4 h-4"
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
            lineNumber: 49,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        route: "/app/onboarding?setup=canvas"
    },
    {
        id: "canvas-add",
        label: "Canvas",
        description: "Sync all your Canvas assignments",
        logo: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: "/canvas-logo.png",
            alt: "",
            className: "w-5 h-5 object-contain"
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
            lineNumber: 56,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        route: "/app/onboarding?setup=canvas-add"
    },
    {
        id: "gradescope",
        label: "Gradescope",
        description: "Sync deadlines from Gradescope",
        logo: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: "/gradescope-logo.png",
            alt: "",
            className: "w-4 h-4"
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
            lineNumber: 63,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        route: "/app/onboarding?setup=gradescope"
    },
    {
        id: "pensieve",
        label: "Pensive",
        description: "Sync CS/DS assignments",
        logo: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: "/pensieve-logo.png",
            alt: "",
            className: "w-4 h-4"
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
            lineNumber: 70,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        route: "/app/onboarding?setup=pensieve"
    },
    {
        id: "syllabus",
        label: "Syllabus",
        description: "Import assignments from a syllabus",
        logo: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
            size: 15,
            className: "text-purple-500"
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
            lineNumber: 77,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        route: "/app/onboarding?setup=syllabus"
    }
];
function IntegrationsSection() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close on any click outside the container
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "IntegrationsSection.useEffect": ()=>{
            if (!open) return;
            function handleMouseDown(e) {
                if (containerRef.current && !containerRef.current.contains(e.target)) {
                    setOpen(false);
                }
            }
            document.addEventListener("mousedown", handleMouseDown);
            return ({
                "IntegrationsSection.useEffect": ()=>document.removeEventListener("mousedown", handleMouseDown)
            })["IntegrationsSection.useEffect"];
        }
    }["IntegrationsSection.useEffect"], [
        open
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationsWelcomeModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold text-foreground",
                        children: "Integrations"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        ref: containerRef,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setOpen((v)=>!v),
                                className: "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                                "aria-label": "Add integration",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                                    lineNumber: 115,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                                lineNumber: 110,
                                columnNumber: 11
                            }, this),
                            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-50 p-1 origin-top-right overflow-hidden animate-popover-in",
                                children: ADD_OPTIONS.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setOpen(false);
                                            if (opt.id === "gcal") {
                                                window.location.href = opt.route;
                                            } else {
                                                router.push(opt.route);
                                            }
                                        },
                                        className: "w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left hover:bg-accent transition-colors cursor-pointer rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0",
                                                children: opt.logo
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                                                lineNumber: 132,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[13px] font-medium text-foreground",
                                                children: opt.label
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                                                lineNumber: 135,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, opt.id, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                                        lineNumber: 120,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                                lineNumber: 118,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-subtle-foreground mb-4",
                children: "Connect your accounts to sync assignments and events."
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$GoogleCalendarSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$SyllabusSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                        lineNumber: 148,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
_s(IntegrationsSection, "BP4ipeOmfW+qRTZ0qeSKBYDDNwA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = IntegrationsSection;
var _c, _c1;
__turbopack_context__.k.register(_c, "GCalDropdownIcon");
__turbopack_context__.k.register(_c1, "IntegrationsSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/sections/ClassesSectionWrapper.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClassesSectionWrapper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx [app-client] (ecmascript)");
"use client";
;
;
function ClassesSectionWrapper() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-lg font-semibold text-foreground mb-1",
                children: "Classes"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/ClassesSectionWrapper.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-subtle-foreground mb-4",
                children: "Choose which classes to sync assignments from."
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/ClassesSectionWrapper.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IntegrationClasses"], {}, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/ClassesSectionWrapper.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/ClassesSectionWrapper.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = ClassesSectionWrapper;
var _c;
__turbopack_context__.k.register(_c, "ClassesSectionWrapper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/.claude/worktrees/claude-work/src/components/layout/ThemeToggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-client] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
/** Segment definitions for the 3-position theme toggle. */ const SEGMENTS = [
    {
        value: "light",
        label: "Light mode",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"]
    },
    {
        value: "auto",
        label: "Auto (sunset)",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"]
    },
    {
        value: "dark",
        label: "Dark mode",
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"]
    }
];
function ThemeToggle({ className }) {
    _s();
    const { preference, resolvedTheme, setPreference } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const isDark = resolvedTheme === "dark";
    const activeIndex = SEGMENTS.findIndex((s)=>s.value === preference);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex w-fit h-9 rounded-full p-1 transition-colors duration-300", isDark ? "bg-zinc-950 border border-zinc-800" : "bg-white border border-zinc-200", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute top-1 left-1 h-7 w-8 rounded-full transition-all duration-300 ease-in-out", isDark ? "bg-zinc-800" : "bg-gray-200"),
                style: {
                    transform: `translateX(${activeIndex * 32}px)`
                },
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ThemeToggle.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            SEGMENTS.map(({ value, label, Icon })=>{
                const isActive = preference === value;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>setPreference(value),
                    "aria-label": label,
                    "aria-pressed": isActive,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative z-10 flex h-7 w-8 items-center justify-center rounded-full transition-colors duration-200", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-4 w-4 transition-colors duration-200", isActive ? isDark ? "text-white" : "text-gray-700" : isDark ? "text-zinc-500" : "text-gray-400"),
                        strokeWidth: 1.5
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ThemeToggle.tsx",
                        lineNumber: 65,
                        columnNumber: 13
                    }, this)
                }, value, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ThemeToggle.tsx",
                    lineNumber: 54,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/layout/ThemeToggle.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_s(ThemeToggle, "HGyz6qNR8m35miE0/9jBDIApnoY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = ThemeToggle;
var _c;
__turbopack_context__.k.register(_c, "ThemeToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AppearanceSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$layout$2f$ThemeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/layout/ThemeToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ThemeContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
/** localStorage key for the set of unlocked theme IDs. */ const UNLOCKED_THEMES_KEY = "caltodo_unlocked_themes";
/** Hardcoded access code for the Miffy theme (case-insensitive). */ const MIFFY_ACCESS_CODE = "CHENFEI";
/** All available themes displayed in the picker grid. */ const THEME_OPTIONS = [
    {
        id: "ocean",
        name: "Ocean",
        description: "Deep blue-teal",
        locked: false,
        swatches: [
            "#5ba4c8",
            "#2e88b0",
            "#e0eff5",
            "#143e52"
        ]
    },
    {
        id: "forest",
        name: "Forest",
        description: "Green-emerald earth",
        locked: false,
        swatches: [
            "#4a9a4a",
            "#388038",
            "#e4f0e0",
            "#1a2e1a"
        ]
    },
    {
        id: "sunset",
        name: "Sunset",
        description: "Warm orange-coral",
        locked: false,
        swatches: [
            "#e87040",
            "#d85828",
            "#fce8dc",
            "#2c1a10"
        ]
    },
    {
        id: "lavender",
        name: "Lavender",
        description: "Soft purple-violet",
        locked: false,
        swatches: [
            "#8a60c0",
            "#7248a8",
            "#ebe0f5",
            "#1e1a2e"
        ]
    },
    {
        id: "nord",
        name: "Nord",
        description: "Arctic blue-gray",
        locked: false,
        swatches: [
            "#5e81ac",
            "#81a1c1",
            "#d8dee9",
            "#2e3440"
        ]
    },
    {
        id: "rosewood",
        name: "Rosewood",
        description: "Wine-burgundy",
        locked: false,
        swatches: [
            "#a03040",
            "#882838",
            "#f0e0e0",
            "#2a1418"
        ]
    },
    {
        id: "midnight",
        name: "Midnight",
        description: "Navy with electric blue",
        locked: false,
        swatches: [
            "#3a6cf0",
            "#2a58d8",
            "#dce0ea",
            "#0a0e18"
        ]
    },
    {
        id: "matcha",
        name: "Matcha",
        description: "Warm sage green",
        locked: false,
        swatches: [
            "#7C9A6E",
            "#D4C5A0",
            "#F7F5F0",
            "#1A2118"
        ]
    },
    {
        id: "dracula",
        name: "Dracula",
        description: "Bold gothic purple",
        locked: false,
        swatches: [
            "#BD93F9",
            "#FF79C6",
            "#F8F8F2",
            "#282A36"
        ]
    },
    {
        id: "cyber",
        name: "Cyber",
        description: "Neon cyberpunk glow",
        locked: false,
        swatches: [
            "#0ABDC6",
            "#EA00D9",
            "#E8F4F5",
            "#0B0C10"
        ]
    },
    {
        id: "sandstone",
        name: "Sandstone",
        description: "Warm elevated neutrals",
        locked: false,
        swatches: [
            "#C4956A",
            "#A68B6B",
            "#FAF6F1",
            "#1F1A15"
        ]
    },
    {
        id: "tokyo-night",
        name: "Tokyo Night",
        description: "Deep city blues",
        locked: false,
        swatches: [
            "#7AA2F7",
            "#BB9AF7",
            "#D5D6DB",
            "#1A1B26"
        ]
    },
    {
        id: "miffy",
        name: "Miffy",
        description: "Pastel pink palette",
        locked: true,
        swatches: [
            "#e8729a",
            "#f4a0bc",
            "#fce8ef",
            "#1a1118"
        ]
    }
];
/**
 * Reads the set of unlocked theme IDs from localStorage.
 *
 * @returns Array of unlocked theme ID strings
 */ function getUnlockedThemes() {
    try {
        const raw = localStorage.getItem(UNLOCKED_THEMES_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch  {
    // localStorage unavailable or corrupt
    }
    return [];
}
/**
 * Persists the set of unlocked theme IDs to localStorage.
 *
 * @param themes - Array of unlocked theme ID strings
 */ function saveUnlockedThemes(themes) {
    try {
        localStorage.setItem(UNLOCKED_THEMES_KEY, JSON.stringify(themes));
    } catch  {
    // localStorage unavailable
    }
}
function AppearanceSection() {
    _s();
    const { colorTheme, setColorTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [unlockedThemes, setUnlockedThemes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [codeInput, setCodeInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [shaking, setShaking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load unlocked themes from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceSection.useEffect": ()=>{
            setUnlockedThemes(getUnlockedThemes());
        }
    }["AppearanceSection.useEffect"], []);
    /**
   * Attempts to unlock a locked theme with the entered code.
   * On success: unlocks, activates, and persists.
   * On failure: triggers shake animation and error message.
   *
   * @param themeId - The theme ID to unlock
   */ const handleUnlock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppearanceSection.useCallback[handleUnlock]": (themeId)=>{
            if (themeId === "miffy" && codeInput.trim().toUpperCase() === MIFFY_ACCESS_CODE) {
                const next = [
                    ...unlockedThemes,
                    themeId
                ];
                setUnlockedThemes(next);
                saveUnlockedThemes(next);
                setColorTheme(themeId);
                setCodeInput("");
                setError(false);
            } else {
                setError(true);
                setShaking(true);
                setTimeout({
                    "AppearanceSection.useCallback[handleUnlock]": ()=>setShaking(false)
                }["AppearanceSection.useCallback[handleUnlock]"], 400);
            }
        }
    }["AppearanceSection.useCallback[handleUnlock]"], [
        codeInput,
        unlockedThemes,
        setColorTheme
    ]);
    /**
   * Handles clicking a theme card. Toggles active theme, or shows unlock input for locked themes.
   *
   * @param theme - The theme option that was clicked
   */ const handleThemeClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppearanceSection.useCallback[handleThemeClick]": (theme)=>{
            const next = colorTheme === theme.id ? null : theme.id;
            setColorTheme(next);
        }
    }["AppearanceSection.useCallback[handleThemeClick]"], [
        colorTheme,
        setColorTheme
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-lg font-semibold text-foreground mb-1",
                children: "Appearance"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                lineNumber: 211,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-subtle-foreground mb-4",
                children: "Choose your preferred appearance."
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                lineNumber: 212,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$layout$2f$ThemeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                lineNumber: 215,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm font-medium text-secondary-foreground mb-3",
                        children: "Themes"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setColorTheme(null),
                                "aria-label": colorTheme === null ? "Default theme active" : "Switch to default theme",
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex flex-col items-start gap-2 rounded-xl border p-3 transition-all duration-200 cursor-pointer text-left", "hover:border-input-border", colorTheme === null ? "border-ring bg-accent ring-1 ring-ring" : "border-border bg-card"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-4 h-4 rounded-full border border-black/10 dark:border-white/10 bg-[#3B82F6]"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                lineNumber: 238,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-4 h-4 rounded-full border border-black/10 dark:border-white/10 bg-[#f3f4f6] dark:bg-[#404040]"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                lineNumber: 239,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-4 h-4 rounded-full border border-black/10 dark:border-white/10 bg-[#1f2937] dark:bg-[#f3f4f6]"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                lineNumber: 240,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-4 h-4 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#111111]"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                lineNumber: 241,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                        lineNumber: 237,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-medium text-foreground",
                                                children: "caltodo"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                lineNumber: 244,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-muted-foreground leading-tight",
                                                children: "Default theme"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                lineNumber: 245,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                        lineNumber: 243,
                                        columnNumber: 13
                                    }, this),
                                    colorTheme === null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-2 right-2 w-5 h-5 rounded-full bg-ring flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                            size: 12,
                                            className: "text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                            lineNumber: 249,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                        lineNumber: 248,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, this),
                            THEME_OPTIONS.filter((theme)=>!theme.locked || unlockedThemes.includes(theme.id)).map((theme)=>{
                                const isActive = colorTheme === theme.id;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>handleThemeClick(theme),
                                    "aria-label": isActive ? `Deactivate ${theme.name} theme` : `Activate ${theme.name} theme`,
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex flex-col items-start gap-2 rounded-xl border p-3 transition-all duration-200 cursor-pointer text-left", "hover:border-input-border", isActive ? "border-ring bg-accent ring-1 ring-ring" : "border-border bg-card"),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1.5",
                                            children: theme.swatches.map((color, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-4 h-4 rounded-full border border-black/10 dark:border-white/10",
                                                    style: {
                                                        backgroundColor: color
                                                    }
                                                }, i, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                    lineNumber: 273,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                            lineNumber: 271,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-medium text-foreground",
                                                    children: theme.name
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                    lineNumber: 281,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-muted-foreground leading-tight",
                                                    children: theme.description
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                            lineNumber: 280,
                                            columnNumber: 17
                                        }, this),
                                        isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute top-2 right-2 w-5 h-5 rounded-full bg-ring flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                size: 12,
                                                className: "text-white"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                                lineNumber: 286,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                            lineNumber: 285,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, theme.id, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                    lineNumber: 258,
                                    columnNumber: 15
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                        lineNumber: 223,
                        columnNumber: 9
                    }, this),
                    THEME_OPTIONS.some((t)=>t.locked && !unlockedThemes.includes(t.id)) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-2", shaking && "animate-shake"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        ref: inputRef,
                                        type: "text",
                                        value: codeInput,
                                        onChange: (e)=>{
                                            setCodeInput(e.target.value);
                                            if (error) setError(false);
                                        },
                                        onKeyDown: (e)=>{
                                            if (e.key === "Enter") {
                                                const locked = THEME_OPTIONS.find((t)=>t.locked && !unlockedThemes.includes(t.id));
                                                if (locked) handleUnlock(locked.id);
                                            }
                                        },
                                        placeholder: "Have a theme code?",
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-8 flex-1 min-w-0 rounded-lg border px-3 text-xs bg-background text-foreground", "placeholder:text-muted-foreground", "focus:outline-none focus:ring-1 focus:ring-ring", error ? "border-red-400 dark:border-red-500" : "border-input-border")
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                        lineNumber: 298,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            const locked = THEME_OPTIONS.find((t)=>t.locked && !unlockedThemes.includes(t.id));
                                            if (locked) handleUnlock(locked.id);
                                        },
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-8 px-4 shrink-0 rounded-lg text-xs font-medium", "bg-accent text-foreground hover:bg-muted border border-input-border", "transition-colors duration-150"),
                                        children: "Redeem"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                        lineNumber: 320,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                lineNumber: 297,
                                columnNumber: 13
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-red-500 dark:text-red-400 mt-1.5 pl-1",
                                children: "Invalid code. Try again."
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                                lineNumber: 336,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                        lineNumber: 296,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx",
        lineNumber: 210,
        columnNumber: 5
    }, this);
}
_s(AppearanceSection, "XfG4XygflnmFmtr5zOPNtmp/CNs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = AppearanceSection;
var _c;
__turbopack_context__.k.register(_c, "AppearanceSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdvancedSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserX$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-x.js [app-client] (ecmascript) <export default as UserX>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/TaskContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function AdvancedSection() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { tasks, deleteAllTasks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const [confirmDelete, setConfirmDelete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmRedo, setConfirmRedo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmSignOut, setConfirmSignOut] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmDeleteAccount, setConfirmDeleteAccount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deletingAccount, setDeletingAccount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdvancedSection.useEffect": ()=>{
            router.prefetch("/app/inbox");
        }
    }["AdvancedSection.useEffect"], [
        router
    ]);
    /**
   * Handles redo setup wizard with double-click confirmation.
   * Clears onboarding/tour/sync dismissal flags so the WelcomeModal
   * appears again on inbox — recreating the first-login experience.
   * First click shows confirmation text, second click executes.
   * Resets after 3 seconds if not confirmed.
   */ function handleRedoSetup() {
        if (!confirmRedo) {
            setConfirmRedo(true);
            setTimeout(()=>setConfirmRedo(false), 3000);
            return;
        }
        setConfirmRedo(false);
        try {
            localStorage.removeItem("caltodo_sync_dismissed");
            localStorage.removeItem("caltodo_sync_badge_dismissed");
            localStorage.removeItem("caltodo_tour_completed");
            localStorage.removeItem("caltodo_tour_pending");
            localStorage.removeItem("caltodo_welcome_resume_tour");
            localStorage.removeItem("caltodo_getting_started_visible");
            localStorage.removeItem("caltodo_getting_started_collapsed");
            localStorage.removeItem("caltodo_integrations_welcome_seen");
            sessionStorage.removeItem("caltodo_onboarding_status");
        } catch  {}
        // Clear server-side modal dismissals
        fetch("/api/credentials", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                dismissed_modals: {}
            })
        }).catch(()=>{});
        // Notify mounted hooks to clear cached modal state
        window.dispatchEvent(new CustomEvent("caltodo-reset-modals"));
        // Set redo flag so SyncClassesModal shows without overriding onboarding status
        // (keeps CalChat unlocked and prevents re-triggering announcements)
        localStorage.setItem("caltodo_redo_active", "true");
        // Reset the SyncClassesModal redo path
        window.dispatchEvent(new CustomEvent("caltodo-redo-setup"));
        router.push("/app/inbox");
    }
    /** Restarts the tour immediately — dispatches event, tour handles navigation. */ function handleRestartTour() {
        try {
            localStorage.removeItem("caltodo_tour_completed");
            localStorage.removeItem("caltodo_tour_pending");
        } catch  {}
        window.dispatchEvent(new CustomEvent("caltodo-restart-tour"));
    }
    /**
   * Handles delete all tasks with double-click confirmation.
   * First click shows confirmation text, second click executes.
   * Resets after 3 seconds if not confirmed.
   */ async function handleDeleteAll() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(()=>setConfirmDelete(false), 3000);
            return;
        }
        setConfirmDelete(false);
        await deleteAllTasks();
        showToast("All tasks deleted.");
    }
    /**
   * Signs the user out with double-click confirmation.
   * First click shows confirmation, second click executes.
   * Resets after 3 seconds if not confirmed.
   */ async function handleSignOut() {
        if (!confirmSignOut) {
            setConfirmSignOut(true);
            setTimeout(()=>setConfirmSignOut(false), 3000);
            return;
        }
        setConfirmSignOut(false);
        await fetch("/auth/signout", {
            method: "POST"
        });
        router.push("/");
    }
    /**
   * Handles account deletion with double-click confirmation.
   * First click shows confirmation, second click executes.
   * Resets after 3 seconds if not confirmed.
   */ async function handleDeleteAccount() {
        if (!confirmDeleteAccount) {
            setConfirmDeleteAccount(true);
            setTimeout(()=>setConfirmDeleteAccount(false), 3000);
            return;
        }
        setConfirmDeleteAccount(false);
        setDeletingAccount(true);
        try {
            const res = await fetch("/api/account/delete", {
                method: "POST"
            });
            if (res.ok) {
                showToast("Account deleted. Redirecting...");
                router.push("/");
            } else {
                const data = await res.json().catch(()=>({}));
                showToast(data.error || "Failed to delete account.");
            }
        } catch  {
            showToast("Failed to delete account.");
        } finally{
            setDeletingAccount(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-lg font-semibold text-foreground mb-1",
                children: "Advanced"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-subtle-foreground mb-4",
                children: "Data management and setup options."
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                lineNumber: 143,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleRestartTour,
                        className: "w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-border bg-card hover:bg-accent transition-colors text-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                size: 15
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                                lineNumber: 151,
                                columnNumber: 11
                            }, this),
                            "Restart Tutorial"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleRedoSetup,
                        className: `w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors ${confirmRedo ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50" : "border-border bg-card hover:bg-accent text-foreground"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                size: 15
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this),
                            confirmRedo ? "Click again to redo setup" : "Redo Setup Wizard"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleDeleteAll,
                        disabled: tasks.length === 0,
                        className: `w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${confirmDelete ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" : "border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                size: 15
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this),
                            confirmDelete ? `Click again to delete all ${tasks.length} tasks` : `Delete All Tasks (${tasks.length})`
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t border-border my-2"
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSignOut,
                        className: `w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors ${confirmSignOut ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" : "border-border bg-card hover:bg-accent text-foreground"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                size: 15
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this),
                            confirmSignOut ? "Click again to sign out" : "Sign Out"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                        lineNumber: 185,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleDeleteAccount,
                        disabled: deletingAccount,
                        className: `w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl border transition-colors disabled:opacity-40 ${confirmDeleteAccount ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" : "border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserX$3e$__["UserX"], {
                                size: 15
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                                lineNumber: 205,
                                columnNumber: 11
                            }, this),
                            deletingAccount ? "Deleting..." : confirmDeleteAccount ? "Click again to permanently delete your account" : "Delete Account"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx",
        lineNumber: 141,
        columnNumber: 5
    }, this);
}
_s(AdvancedSection, "O6j9+e2Pz0XRpDxxAJK9kBPMt0c=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$TaskContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTaskContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = AdvancedSection;
var _c;
__turbopack_context__.k.register(_c, "AdvancedSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SettingsContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/IntegrationSettings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/PageTransition.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$sections$2f$IntegrationsSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/sections/IntegrationsSection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$sections$2f$ClassesSectionWrapper$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/sections/ClassesSectionWrapper.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$sections$2f$AppearanceSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/sections/AppearanceSection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$sections$2f$AdvancedSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/settings/sections/AdvancedSection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/settingsConfig.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
 * Renders the correct section component for a given section ID.
 *
 * @param sectionId - The active settings section identifier
 * @returns The corresponding React section component
 */ function renderSection(sectionId) {
    switch(sectionId){
        case "integrations":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$sections$2f$IntegrationsSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                lineNumber: 29,
                columnNumber: 14
            }, this);
        case "classes":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$sections$2f$ClassesSectionWrapper$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                lineNumber: 31,
                columnNumber: 14
            }, this);
        case "appearance":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$sections$2f$AppearanceSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                lineNumber: 33,
                columnNumber: 14
            }, this);
        case "advanced":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$sections$2f$AdvancedSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                lineNumber: 35,
                columnNumber: 14
            }, this);
    }
}
/** Valid section IDs for type-guarding search params. */ const VALID_SECTIONS = new Set(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS_SECTIONS"].map((s)=>s.id));
function SettingsContent() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const rawSection = searchParams.get("section");
    const activeSection = rawSection && VALID_SECTIONS.has(rawSection) ? rawSection : null;
    // GCal OAuth redirect fix: if ?gcal= is present but no ?section=, redirect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SettingsContent.useEffect": ()=>{
            const gcalParam = searchParams.get("gcal");
            if (gcalParam && !searchParams.get("section")) {
                const url = new URL(window.location.href);
                url.searchParams.set("section", "integrations");
                router.replace(url.pathname + url.search);
            }
        }
    }["SettingsContent.useEffect"], [
        searchParams,
        router
    ]);
    /** Navigate to a specific section (used by mobile list). */ function goToSection(id) {
        router.push(`/app/settings?section=${id}`);
    }
    /** Navigate back from section detail (mobile). */ function goBackToList() {
        router.push("/app/settings");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$PageTransition$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$settings$2f$IntegrationSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IntegrationProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-full -m-4 md:-m-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex flex-col overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:hidden flex flex-col h-full",
                            children: activeSection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 pt-4 pb-2 animate-stagger stagger-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: goBackToList,
                                            className: "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer active:scale-[0.98]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                    lineNumber: 92,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Settings"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                    lineNumber: 93,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                            lineNumber: 88,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                        lineNumber: 87,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 overflow-auto px-4 pt-2 pb-8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "max-w-2xl mx-auto animate-page-in",
                                            children: renderSection(activeSection)
                                        }, activeSection, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                            lineNumber: 97,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                        lineNumber: 96,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 pt-4 pb-2 animate-stagger stagger-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>router.push("/app/inbox"),
                                            className: "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer active:scale-[0.98]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                    lineNumber: 110,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Settings"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                    lineNumber: 111,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                            lineNumber: 106,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                        lineNumber: 105,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 overflow-auto px-4 pt-2 pb-8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "max-w-2xl mx-auto space-y-6 animate-stagger stagger-2",
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS_GROUPS"].map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "cv-auto-section",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[11px] font-semibold tracking-wider text-muted-foreground px-1 mb-2",
                                                            children: group
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                            lineNumber: 118,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col gap-1",
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS_SECTIONS"].filter((s)=>s.group === group).map((section)=>{
                                                                const Icon = section.icon;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>goToSection(section.id),
                                                                    className: "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors text-foreground hover:bg-accent cursor-pointer active:scale-[0.98]",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                            size: 16,
                                                                            className: "text-foreground/70 shrink-0"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                                            lineNumber: 130,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "flex-1 text-left",
                                                                            children: section.label
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                                            lineNumber: 131,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                            size: 16,
                                                                            className: "text-muted-foreground"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                                            lineNumber: 132,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, section.id, true, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                                    lineNumber: 125,
                                                                    columnNumber: 33
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                            lineNumber: 121,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, group, true, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                                    lineNumber: 117,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                            lineNumber: 115,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                        lineNumber: 114,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                            lineNumber: 83,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden md:flex flex-col h-full",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-auto px-8 pt-20 pb-8",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "max-w-2xl mx-auto mr-auto ml-[15%] animate-page-in",
                                    children: renderSection(activeSection ?? __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_SECTION"])
                                }, activeSection ?? __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$settingsConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_SECTION"], false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                    lineNumber: 148,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                                lineNumber: 147,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                            lineNumber: 146,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                    lineNumber: 81,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
            lineNumber: 79,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
_s(SettingsContent, "8i1PHtDhDf9NMpKTkROQKKwA/RI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = SettingsContent;
var _c;
__turbopack_context__.k.register(_c, "SettingsContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/app/app/settings/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SettingsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$app$2f$app$2f$settings$2f$SettingsContent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/app/app/settings/SettingsContent.tsx [app-client] (ecmascript)");
"use client";
;
;
;
function SettingsPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: null,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$app$2f$app$2f$settings$2f$SettingsContent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/page.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/app/app/settings/page.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = SettingsPage;
var _c;
__turbopack_context__.k.register(_c, "SettingsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_claude_worktrees_claude-work_src_59afe1ea._.js.map