(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.claude/worktrees/claude-work/src/components/notes/FontSizeExtension.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
/**
 * TipTap extension for inline font-size via the style attribute.
 * Works with TextStyle to apply font-size as a mark.
 *
 * Usage: editor.chain().focus().setFontSize("18px").run()
 *        editor.chain().focus().unsetFontSize().run()
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/core/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$text$2d$style$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-text-style/dist/index.js [app-client] (ecmascript)");
;
;
const FontSize = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Extension"].create({
    name: "fontSize",
    addOptions () {
        return {
            types: [
                "textStyle"
            ]
        };
    },
    addGlobalAttributes () {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element)=>element.style.fontSize?.replace(/['"]+/g, "") || null,
                        renderHTML: (attributes)=>{
                            if (!attributes.fontSize) return {};
                            return {
                                style: `font-size: ${attributes.fontSize}`
                            };
                        }
                    }
                }
            }
        ];
    },
    addCommands () {
        return {
            setFontSize: (fontSize)=>({ chain })=>{
                    if (!/^\d+(\.\d+)?(px|em|rem|pt)$/.test(fontSize)) return false;
                    return chain().setMark("textStyle", {
                        fontSize
                    }).run();
                },
            unsetFontSize: ()=>({ chain })=>chain().setMark("textStyle", {
                        fontSize: null
                    }).removeEmptyTextStyle().run()
        };
    }
});
const __TURBOPACK__default__export__ = FontSize;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NoteEditorToolbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bold$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bold$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bold.js [app-client] (ecmascript) <export default as Bold>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$italic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Italic$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/italic.js [app-client] (ecmascript) <export default as Italic>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$underline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Underline$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/underline.js [app-client] (ecmascript) <export default as Underline>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$strikethrough$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Strikethrough$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/strikethrough.js [app-client] (ecmascript) <export default as Strikethrough>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heading$2d$1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heading1$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heading-1.js [app-client] (ecmascript) <export default as Heading1>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heading$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heading2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heading-2.js [app-client] (ecmascript) <export default as Heading2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$ordered$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListOrdered$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list-ordered.js [app-client] (ecmascript) <export default as ListOrdered>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list-checks.js [app-client] (ecmascript) <export default as ListChecks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$quote$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Quote$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/quote.js [app-client] (ecmascript) <export default as Quote>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/code.js [app-client] (ecmascript) <export default as Code>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImagePlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image-plus.js [app-client] (ecmascript) <export default as ImagePlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/undo-2.js [app-client] (ecmascript) <export default as Undo2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$redo$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Redo2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/redo-2.js [app-client] (ecmascript) <export default as Redo2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-start.js [app-client] (ecmascript) <export default as AlignLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$center$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignCenter$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-center.js [app-client] (ecmascript) <export default as AlignCenter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$end$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-end.js [app-client] (ecmascript) <export default as AlignRight>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function NoteEditorToolbar({ editor, onInsertImage, titleFocused, titleStyle, onTitleStyleChange }) {
    _s();
    // Force re-render on every editor transaction so isActive() stays accurate
    const [, setTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const bump = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NoteEditorToolbar.useCallback[bump]": ()=>setTick({
                "NoteEditorToolbar.useCallback[bump]": (t)=>t + 1
            }["NoteEditorToolbar.useCallback[bump]"])
    }["NoteEditorToolbar.useCallback[bump]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NoteEditorToolbar.useEffect": ()=>{
            if (!editor) return;
            editor.on("transaction", bump);
            return ({
                "NoteEditorToolbar.useEffect": ()=>{
                    editor.off("transaction", bump);
                }
            })["NoteEditorToolbar.useEffect"];
        }
    }["NoteEditorToolbar.useEffect"], [
        editor,
        bump
    ]);
    if (!editor) return null;
    const mod = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "\u2318" : "Ctrl+";
    const fontFamilies = [
        {
            label: "Sans",
            value: ""
        },
        {
            label: "Serif",
            value: "Georgia, serif"
        },
        {
            label: "Mono",
            value: "monospace"
        }
    ];
    const fontSizes = [
        "10px",
        "12px",
        "13px",
        "14px",
        "16px",
        "18px",
        "24px",
        "30px",
        "36px"
    ];
    const editorFamily = editor.getAttributes("textStyle").fontFamily || "";
    const explicitSize = editor.getAttributes("textStyle").fontSize || "";
    /** Derive effective font size from node type when no explicit fontSize mark is set. */ const editorSize = explicitSize || (editor.isActive("heading", {
        level: 1
    }) ? "30px" : editor.isActive("heading", {
        level: 2
    }) ? "24px" : editor.isActive("heading", {
        level: 3
    }) ? "18px" : "14px");
    const currentFamily = titleFocused ? titleStyle?.fontFamily || "" : editorFamily;
    const currentSize = titleFocused ? titleStyle?.fontSize || "24px" : editorSize;
    const buttons = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bold$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bold$3e$__["Bold"],
            label: `Bold (${mod}B)`,
            action: ()=>editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive("bold")
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$italic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Italic$3e$__["Italic"],
            label: `Italic (${mod}I)`,
            action: ()=>editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive("italic")
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$underline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Underline$3e$__["Underline"],
            label: `Underline (${mod}U)`,
            action: ()=>editor.chain().focus().toggleUnderline().run(),
            isActive: editor.isActive("underline")
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$strikethrough$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Strikethrough$3e$__["Strikethrough"],
            label: `Strikethrough (${mod}Shift+X)`,
            action: ()=>editor.chain().focus().toggleStrike().run(),
            isActive: editor.isActive("strike")
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heading$2d$1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heading1$3e$__["Heading1"],
            label: "Heading 1",
            action: ()=>editor.chain().focus().toggleHeading({
                    level: 1
                }).run(),
            isActive: editor.isActive("heading", {
                level: 1
            })
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heading$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heading2$3e$__["Heading2"],
            label: "Heading 2",
            action: ()=>editor.chain().focus().toggleHeading({
                    level: 2
                }).run(),
            isActive: editor.isActive("heading", {
                level: 2
            })
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"],
            label: "Bullet list",
            action: ()=>editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive("bulletList")
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$ordered$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListOrdered$3e$__["ListOrdered"],
            label: "Ordered list",
            action: ()=>editor.chain().focus().toggleOrderedList().run(),
            isActive: editor.isActive("orderedList")
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__["ListChecks"],
            label: "Checklist",
            action: ()=>editor.chain().focus().toggleTaskList().run(),
            isActive: editor.isActive("taskList")
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$quote$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Quote$3e$__["Quote"],
            label: "Blockquote",
            action: ()=>editor.chain().focus().toggleBlockquote().run(),
            isActive: editor.isActive("blockquote")
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__["Code"],
            label: "Code block",
            action: ()=>editor.chain().focus().toggleCodeBlock().run(),
            isActive: editor.isActive("codeBlock")
        }
    ];
    const alignButtons = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__["AlignLeft"],
            label: "Align left",
            action: ()=>editor.chain().focus().setTextAlign("left").run(),
            isActive: editor.isActive({
                textAlign: "left"
            })
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$center$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignCenter$3e$__["AlignCenter"],
            label: "Align center",
            action: ()=>editor.chain().focus().setTextAlign("center").run(),
            isActive: editor.isActive({
                textAlign: "center"
            })
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$end$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignRight$3e$__["AlignRight"],
            label: "Align right",
            action: ()=>editor.chain().focus().setTextAlign("right").run(),
            isActive: editor.isActive({
                textAlign: "right"
            })
        }
    ];
    const miscButtons = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImagePlus$3e$__["ImagePlus"],
            label: "Image (drag, paste, or click)",
            action: ()=>onInsertImage?.(),
            isActive: false
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-0.5 py-1.5 overflow-x-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: currentFamily,
                onChange: (e)=>{
                    const val = e.target.value;
                    if (titleFocused && onTitleStyleChange && titleStyle) {
                        onTitleStyleChange({
                            ...titleStyle,
                            fontFamily: val
                        });
                    } else if (val) {
                        editor.chain().focus().setFontFamily(val).run();
                    } else {
                        editor.chain().focus().unsetFontFamily().run();
                    }
                },
                title: "Font family",
                className: "h-7 px-1.5 text-xs rounded border border-border/50 bg-transparent text-foreground hover:bg-accent transition-colors cursor-pointer outline-none max-w-[80px]",
                children: fontFamilies.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: f.value,
                        children: f.label
                    }, f.label, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                        lineNumber: 213,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                lineNumber: 197,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: currentSize,
                onChange: (e)=>{
                    const val = e.target.value;
                    if (titleFocused && onTitleStyleChange && titleStyle) {
                        onTitleStyleChange({
                            ...titleStyle,
                            fontSize: val
                        });
                    } else if (val) {
                        editor.chain().focus().setFontSize(val).run();
                    } else {
                        editor.chain().focus().unsetFontSize().run();
                    }
                },
                title: "Font size",
                className: "h-7 px-1.5 text-xs rounded border border-border/50 bg-transparent text-foreground hover:bg-accent transition-colors cursor-pointer outline-none w-[52px]",
                children: fontSizes.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: s,
                        children: parseInt(s)
                    }, s, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                        lineNumber: 234,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-px h-5 bg-border mx-1"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            buttons.map((btn)=>{
                const Icon = btn.icon;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: btn.action,
                    title: btn.label,
                    "aria-label": btn.label,
                    className: `p-2 rounded transition-colors active:scale-95 ${btn.isActive ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                        lineNumber: 254,
                        columnNumber: 13
                    }, this)
                }, btn.label, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                    lineNumber: 243,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-px h-5 bg-border mx-1"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                lineNumber: 259,
                columnNumber: 7
            }, this),
            alignButtons.map((btn)=>{
                const Icon = btn.icon;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: btn.action,
                    title: btn.label,
                    "aria-label": btn.label,
                    className: `p-2 rounded transition-colors active:scale-95 ${btn.isActive ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                        lineNumber: 275,
                        columnNumber: 13
                    }, this)
                }, btn.label, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                    lineNumber: 264,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-px h-5 bg-border mx-1"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                lineNumber: 280,
                columnNumber: 7
            }, this),
            miscButtons.map((btn)=>{
                const Icon = btn.icon;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: btn.action,
                    title: btn.label,
                    "aria-label": btn.label,
                    className: `p-2 rounded transition-colors active:scale-95 ${btn.isActive ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                        lineNumber: 296,
                        columnNumber: 13
                    }, this)
                }, btn.label, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                    lineNumber: 285,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-px h-5 bg-border mx-1"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                lineNumber: 301,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>editor.chain().focus().undo().run(),
                disabled: !editor.can().undo(),
                title: "Undo",
                "aria-label": "Undo",
                className: "p-2 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__["Undo2"], {
                    size: 16
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                    lineNumber: 310,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                lineNumber: 303,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>editor.chain().focus().redo().run(),
                disabled: !editor.can().redo(),
                title: "Redo",
                "aria-label": "Redo",
                className: "p-2 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$redo$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Redo2$3e$__["Redo2"], {
                    size: 16
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                    lineNumber: 319,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
                lineNumber: 312,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx",
        lineNumber: 195,
        columnNumber: 5
    }, this);
}
_s(NoteEditorToolbar, "GKwsjekrVSc+tI4i3mPDoJLWVIw=");
_c = NoteEditorToolbar;
var _c;
__turbopack_context__.k.register(_c, "NoteEditorToolbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/notes/ImageBubbleMenu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ImageBubbleMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$menus$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/react/dist/menus/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-start.js [app-client] (ecmascript) <export default as AlignLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$center$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignCenter$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-center.js [app-client] (ecmascript) <export default as AlignCenter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$end$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-end.js [app-client] (ecmascript) <export default as AlignRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$wrap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WrapText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-wrap.js [app-client] (ecmascript) <export default as WrapText>");
"use client";
;
;
;
function ImageBubbleMenu({ editor }) {
    const buttons = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__["AlignLeft"],
            label: "Align left",
            action: ()=>editor.chain().focus().updateAttributes("image", {
                    textAlign: "left",
                    float: null
                }).run(),
            isActive: editor.getAttributes("image").textAlign === "left" && !editor.getAttributes("image").float
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$center$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignCenter$3e$__["AlignCenter"],
            label: "Center",
            action: ()=>editor.chain().focus().updateAttributes("image", {
                    textAlign: "center",
                    float: null
                }).run(),
            isActive: editor.getAttributes("image").textAlign === "center"
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$end$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignRight$3e$__["AlignRight"],
            label: "Align right",
            action: ()=>editor.chain().focus().updateAttributes("image", {
                    textAlign: "right",
                    float: null
                }).run(),
            isActive: editor.getAttributes("image").textAlign === "right" && !editor.getAttributes("image").float
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$wrap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WrapText$3e$__["WrapText"],
            label: "Wrap left",
            action: ()=>editor.chain().focus().updateAttributes("image", {
                    float: "left",
                    textAlign: null
                }).run(),
            isActive: editor.getAttributes("image").float === "left"
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$wrap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WrapText$3e$__["WrapText"],
            label: "Wrap right",
            action: ()=>editor.chain().focus().updateAttributes("image", {
                    float: "right",
                    textAlign: null
                }).run(),
            isActive: editor.getAttributes("image").float === "right"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$menus$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BubbleMenu"], {
        editor: editor,
        shouldShow: ({ editor: ed })=>ed.isActive("image"),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-0.5 rounded-xl border border-border bg-popover px-1.5 py-1 shadow-lg",
            children: buttons.map((btn)=>{
                const Icon = btn.icon;
                const mirrorClass = btn.label === "Wrap right" ? "scale-x-[-1]" : "";
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: btn.action,
                    title: btn.label,
                    className: `p-1.5 rounded transition-colors ${btn.isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        size: 16,
                        className: mirrorClass
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/ImageBubbleMenu.tsx",
                        lineNumber: 110,
                        columnNumber: 15
                    }, this)
                }, btn.label, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/ImageBubbleMenu.tsx",
                    lineNumber: 100,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/ImageBubbleMenu.tsx",
            lineNumber: 95,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/ImageBubbleMenu.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
_c = ImageBubbleMenu;
var _c;
__turbopack_context__.k.register(_c, "ImageBubbleMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/notes/ResizableImageView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ResizableImageView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/react/dist/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ResizableImageView({ node, updateAttributes, selected }) {
    _s();
    const { src, alt, width, float: floatVal, textAlign } = node.attrs;
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [resizing, setResizing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    /** Stores active resize handlers so cleanup can remove them on unmount. */ const handlersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Clean up document listeners on unmount to prevent leaks during active resize
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResizableImageView.useEffect": ()=>{
            return ({
                "ResizableImageView.useEffect": ()=>{
                    if (handlersRef.current) {
                        document.removeEventListener("mousemove", handlersRef.current.move);
                        document.removeEventListener("mouseup", handlersRef.current.up);
                        handlersRef.current = null;
                    }
                }
            })["ResizableImageView.useEffect"];
        }
    }["ResizableImageView.useEffect"], []);
    /**
   * Starts drag-to-resize on mousedown of the handle.
   * Tracks mousemove to compute new width as percentage of container parent.
   */ const onResizeStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ResizableImageView.useCallback[onResizeStart]": (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setResizing(true);
            const startX = e.clientX;
            const startWidth = containerRef.current?.offsetWidth ?? 200;
            const parentWidth = containerRef.current?.parentElement?.offsetWidth ?? 600;
            function onMouseMove(ev) {
                const delta = ev.clientX - startX;
                const newWidth = Math.max(80, Math.min(startWidth + delta, parentWidth));
                const pct = Math.round(newWidth / parentWidth * 100);
                updateAttributes({
                    width: `${pct}%`
                });
            }
            function onMouseUp() {
                setResizing(false);
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                handlersRef.current = null;
            }
            handlersRef.current = {
                move: onMouseMove,
                up: onMouseUp
            };
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }
    }["ResizableImageView.useCallback[onResizeStart]"], [
        updateAttributes
    ]);
    const wrapperStyle = {
        width: width || undefined,
        float: floatVal || undefined,
        ...floatVal === "left" && {
            marginRight: "1rem",
            marginBottom: "0.5rem"
        },
        ...floatVal === "right" && {
            marginLeft: "1rem",
            marginBottom: "0.5rem"
        },
        ...!floatVal && textAlign === "center" && {
            marginLeft: "auto",
            marginRight: "auto"
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["NodeViewWrapper"], {
        ref: containerRef,
        "data-float": floatVal || undefined,
        "data-text-align": textAlign || undefined,
        className: "relative inline-block max-w-full",
        style: wrapperStyle,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: src,
                alt: alt || "",
                className: `block max-w-full h-auto rounded-xl ${selected ? "ring-2 ring-blue-500" : ""}`,
                draggable: false
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/ResizableImageView.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            (selected || resizing) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onMouseDown: onResizeStart,
                className: "absolute bottom-1 right-1 w-3 h-3 bg-blue-500 rounded-sm cursor-se-resize hover:bg-blue-400 transition-colors",
                title: "Drag to resize"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/ResizableImageView.tsx",
                lineNumber: 98,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/ResizableImageView.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
_s(ResizableImageView, "RGiQRHYyfBBKo+3SxIHriRlbQBc=");
_c = ResizableImageView;
var _c;
__turbopack_context__.k.register(_c, "ResizableImageView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/notes/ResizableImageExtension.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-image/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$ResizableImageView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/notes/ResizableImageView.tsx [app-client] (ecmascript)");
;
;
;
/**
 * Extended Image extension with resizable width and text wrap attributes.
 * Renders via a React NodeView with drag-to-resize handles.
 *
 * Attributes:
 * - width: CSS width string (e.g. "50%", "300px")
 * - float: "left" | "right" | null for text wrap
 * - textAlign: "left" | "center" | "right" for block alignment
 */ const ResizableImage = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].extend({
    addAttributes () {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: (element)=>element.getAttribute("data-width"),
                renderHTML: (attributes)=>{
                    if (!attributes.width) return {};
                    return {
                        "data-width": attributes.width
                    };
                }
            },
            float: {
                default: null,
                parseHTML: (element)=>element.getAttribute("data-float"),
                renderHTML: (attributes)=>{
                    if (!attributes.float) return {};
                    return {
                        "data-float": attributes.float
                    };
                }
            },
            textAlign: {
                default: null,
                parseHTML: (element)=>element.getAttribute("data-text-align"),
                renderHTML: (attributes)=>{
                    if (!attributes.textAlign) return {};
                    return {
                        "data-text-align": attributes.textAlign
                    };
                }
            }
        };
    },
    addNodeView () {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactNodeViewRenderer"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$ResizableImageView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
    }
});
const __TURBOPACK__default__export__ = ResizableImage;
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
"[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EmojiPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Shared icon picker modal — 2-tab design: Icons (Lucide) and Emojis (curated).
 * Used by both the home board and notes folder icon pickers.
 * Supports optional palette color preview for Lucide icons.
 *
 * @param open - Whether the picker is visible
 * @param onSelect - Callback with the selected icon string (emoji or "lucide:name")
 * @param onClose - Callback to close the picker
 * @param paletteColors - Optional array of hex colors from banner palette
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$emoji$2d$mart$2f$data$2f$sets$2f$15$2f$native$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/node_modules/@emoji-mart/data/sets/15/native.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/ui/SegmentedControl.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/emoji-picker-data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
/**
 * Reverse lookup: native emoji string → searchable keywords.
 * Built once from emoji-mart data for keyword-based emoji search.
 */ const emojiKeywordMap = (()=>{
    const map = new Map();
    const emojis = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$emoji$2d$mart$2f$data$2f$sets$2f$15$2f$native$2e$json__$28$json$29$__["default"].emojis;
    for (const entry of Object.values(emojis)){
        for (const skin of entry.skins){
            map.set(skin.native, [
                entry.name.toLowerCase(),
                ...entry.keywords.map((k)=>k.toLowerCase())
            ]);
        }
    }
    return map;
})();
;
function EmojiPicker({ open, onSelect, onClose, paletteColors = [] }) {
    _s();
    const [previewColor, setPreviewColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("icons");
    const [iconSearch, setIconSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [emojiSearch, setEmojiSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    /** Flat list of all icons filtered by search query. */ const filteredIcons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EmojiPicker.useMemo[filteredIcons]": ()=>{
            const q = iconSearch.toLowerCase().trim();
            if (!q) return null;
            return __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LUCIDE_CATEGORIES"].flatMap({
                "EmojiPicker.useMemo[filteredIcons]": (cat)=>cat.icons.filter({
                        "EmojiPicker.useMemo[filteredIcons]": ({ name })=>name.includes(q) || cat.label.toLowerCase().includes(q)
                    }["EmojiPicker.useMemo[filteredIcons]"])
            }["EmojiPicker.useMemo[filteredIcons]"]);
        }
    }["EmojiPicker.useMemo[filteredIcons]"], [
        iconSearch
    ]);
    /** Filtered emoji categories by search query — matches individual emoji keywords. */ const filteredEmojiCategories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EmojiPicker.useMemo[filteredEmojiCategories]": ()=>{
            const q = emojiSearch.toLowerCase().trim();
            if (!q) return null;
            const results = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMOJI_CATEGORIES"].map({
                "EmojiPicker.useMemo[filteredEmojiCategories].results": (cat)=>{
                    const matchedEmojis = cat.emojis.filter({
                        "EmojiPicker.useMemo[filteredEmojiCategories].results.matchedEmojis": (emoji)=>{
                            if (cat.label.toLowerCase().includes(q)) return true;
                            const keywords = emojiKeywordMap.get(emoji);
                            return keywords?.some({
                                "EmojiPicker.useMemo[filteredEmojiCategories].results.matchedEmojis": (kw)=>kw.includes(q)
                            }["EmojiPicker.useMemo[filteredEmojiCategories].results.matchedEmojis"]) ?? false;
                        }
                    }["EmojiPicker.useMemo[filteredEmojiCategories].results.matchedEmojis"]);
                    return {
                        label: cat.label,
                        emojis: matchedEmojis
                    };
                }
            }["EmojiPicker.useMemo[filteredEmojiCategories].results"]).filter({
                "EmojiPicker.useMemo[filteredEmojiCategories].results": (cat)=>cat.emojis.length > 0
            }["EmojiPicker.useMemo[filteredEmojiCategories].results"]);
            return results;
        }
    }["EmojiPicker.useMemo[filteredEmojiCategories]"], [
        emojiSearch
    ]);
    if (!open) return null;
    /** Select a Lucide icon — store as "lucide:name" format. */ function selectLucide(name) {
        onSelect(`lucide:${name}`);
        onClose();
    }
    /** Select an emoji. */ function selectEmoji(emoji) {
        onSelect(emoji);
        onClose();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 animate-announce-backdrop-in",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-popover rounded-2xl shadow-xl border border-border w-full w-[calc(100%-2rem)] max-w-sm animate-announce-card-in overflow-hidden max-h-[80vh] flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shrink-0 border-b border-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between p-4 pb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-base font-semibold text-foreground",
                                        children: "Choose Icon"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 115,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onClose,
                                        className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                        "aria-label": "Close",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                            lineNumber: 123,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 118,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 pb-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$ui$2f$SegmentedControl$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    options: [
                                        {
                                            value: "icons",
                                            label: "Icons"
                                        },
                                        {
                                            value: "emojis",
                                            label: "Emojis"
                                        }
                                    ],
                                    value: activeTab,
                                    onChange: (v)=>setActiveTab(v)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 pb-3",
                                children: [
                                    activeTab === "icons" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: iconSearch,
                                        onChange: (e)=>setIconSearch(e.target.value),
                                        placeholder: "Search icons...",
                                        className: "w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors",
                                        autoFocus: true
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 142,
                                        columnNumber: 15
                                    }, this),
                                    activeTab === "emojis" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: emojiSearch,
                                        onChange: (e)=>setEmojiSearch(e.target.value),
                                        placeholder: "Search emojis...",
                                        className: "w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto px-4 py-3",
                        children: [
                            activeTab === "icons" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: filteredIcons ? filteredIcons.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-9 gap-0.5",
                                    children: filteredIcons.map(({ name, icon: Icon, filled })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>selectLucide(name),
                                            className: "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
                                            title: name,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                size: 20,
                                                fill: filled ? "currentColor" : "none",
                                                style: previewColor ? {
                                                    color: previewColor
                                                } : undefined
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 177,
                                                columnNumber: 25
                                            }, this)
                                        }, name, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                            lineNumber: 171,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                    lineNumber: 169,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground text-center py-6",
                                    children: "No icons found"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                    lineNumber: 186,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        paletteColors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-medium text-foreground mb-2 px-0.5",
                                                    children: "Banner Colors"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                    lineNumber: 192,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        paletteColors.slice(0, 5).map((color)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>setPreviewColor(previewColor === color ? null : color),
                                                                className: `w-7 h-7 rounded-full border-2 transition-all ${previewColor === color ? "border-blue-500 scale-110" : "border-transparent hover:scale-105"}`,
                                                                style: {
                                                                    backgroundColor: color
                                                                },
                                                                title: `Preview icons in ${color}`
                                                            }, color, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                                lineNumber: 197,
                                                                columnNumber: 23
                                                            }, this)),
                                                        previewColor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setPreviewColor(null),
                                                            className: "text-xs text-muted-foreground hover:text-foreground ml-1 transition-colors",
                                                            children: "Reset"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                            lineNumber: 212,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                    lineNumber: 195,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                            lineNumber: 191,
                                            columnNumber: 17
                                        }, this),
                                        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LUCIDE_CATEGORIES"].map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-medium text-foreground mb-2 px-0.5",
                                                        children: cat.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-9 gap-0.5",
                                                        children: cat.icons.map(({ name, icon: Icon, filled })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>selectLucide(name),
                                                                className: "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
                                                                title: name,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                    size: 20,
                                                                    fill: filled ? "currentColor" : "none",
                                                                    style: previewColor ? {
                                                                        color: previewColor
                                                                    } : undefined
                                                                }, void 0, false, {
                                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                                    lineNumber: 236,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, name, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                                lineNumber: 230,
                                                                columnNumber: 23
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                        lineNumber: 228,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, cat.label, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 224,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this),
                            activeTab === "emojis" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: filteredEmojiCategories ? filteredEmojiCategories.length > 0 ? filteredEmojiCategories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-medium text-foreground mb-2 px-0.5",
                                                children: cat.label
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 260,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-9 gap-0.5",
                                                children: cat.emojis.map((emoji, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>selectEmoji(emoji),
                                                        className: "w-9 h-9 flex items-center justify-center rounded-lg text-xl hover:bg-muted transition-colors",
                                                        children: emoji
                                                    }, `${cat.label}-${i}`, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                        lineNumber: 265,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 263,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, cat.label, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 259,
                                        columnNumber: 21
                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground text-center py-6",
                                    children: "No emojis found"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                    lineNumber: 277,
                                    columnNumber: 19
                                }, this) : __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMOJI_CATEGORIES"].map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-medium text-foreground mb-2 px-0.5",
                                                children: cat.label
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 282,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-9 gap-0.5",
                                                children: cat.emojis.map((emoji, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>selectEmoji(emoji),
                                                        className: "w-9 h-9 flex items-center justify-center rounded-lg text-xl hover:bg-muted transition-colors",
                                                        children: emoji
                                                    }, `${cat.label}-${i}`, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                                lineNumber: 285,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, cat.label, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                        lineNumber: 281,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                                lineNumber: 254,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
_s(EmojiPicker, "i2rO3w2ht7vxQeRZeJtwvBjWU/Y=");
_c = EmojiPicker;
var _c;
__turbopack_context__.k.register(_c, "EmojiPicker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/compress-image.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/lib/upload-note-image.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "uploadNoteImage",
    ()=>uploadNoteImage
]);
/**
 * Uploads an image file to Supabase storage for use in notes.
 * Compresses the image first, then uploads to the avatars bucket.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$compress$2d$image$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/compress-image.ts [app-client] (ecmascript)");
;
;
/** Maximum file size in bytes (10 MB). */ const MAX_FILE_SIZE = 10 * 1024 * 1024;
/** Allowed MIME types for note images. */ const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);
async function uploadNoteImage(file, noteId) {
    try {
        if (file.size > MAX_FILE_SIZE) {
            console.warn("[uploadNoteImage] File too large:", file.size, "bytes (max", MAX_FILE_SIZE, ")");
            return null;
        }
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            console.warn("[uploadNoteImage] Invalid MIME type:", file.type);
            return null;
        }
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("[uploadNoteImage] No authenticated user");
            return null;
        }
        const compressed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$compress$2d$image$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compressImage"])(file);
        const ext = compressed.type.split("/")[1] === "jpeg" ? "jpg" : compressed.type.split("/")[1];
        const path = `${user.id}/note-img-${noteId}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("avatars").upload(path, compressed, {
            cacheControl: "3600",
            upsert: true,
            contentType: compressed.type
        });
        if (error) {
            console.error("[uploadNoteImage] Upload failed:", error.message);
            return null;
        }
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        return `${urlData.publicUrl}?t=${Date.now()}`;
    } catch (err) {
        console.error("[uploadNoteImage] Unexpected error:", err);
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DeleteNoteConfirmModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function DeleteNoteConfirmModal({ open, noteCount, onConfirm, onCancel }) {
    _s();
    // Close on Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeleteNoteConfirmModal.useEffect": ()=>{
            if (!open) return;
            function handleKeyDown(e) {
                if (e.key === "Escape") onCancel();
            }
            document.addEventListener("keydown", handleKeyDown);
            return ({
                "DeleteNoteConfirmModal.useEffect": ()=>document.removeEventListener("keydown", handleKeyDown)
            })["DeleteNoteConfirmModal.useEffect"];
        }
    }["DeleteNoteConfirmModal.useEffect"], [
        open,
        onCancel
    ]);
    if (!open || typeof document === "undefined") return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in",
                onClick: onCancel
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-card rounded-2xl border border-border shadow-2xl w-[calc(100%-2rem)] max-w-sm p-6 animate-announce-card-in",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-semibold text-foreground mb-3",
                            children: [
                                "Delete ",
                                noteCount === 1 ? "note" : "notes",
                                "?"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground mb-6",
                            children: noteCount === 1 ? "This note will be moved to Recently Deleted." : `${noteCount} notes will be moved to Recently Deleted.`
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onConfirm,
                                    className: "w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer",
                                    children: "Delete"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx",
                                    lineNumber: 62,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onCancel,
                                    className: "w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx",
                                    lineNumber: 69,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this), document.body);
}
_s(DeleteNoteConfirmModal, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = DeleteNoteConfirmModal;
var _c;
__turbopack_context__.k.register(_c, "DeleteNoteConfirmModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NoteEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$starter$2d$kit$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/starter-kit/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$placeholder$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-placeholder/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$task$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-task-list/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$task$2d$item$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-task-item/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$underline$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-underline/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$text$2d$align$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-text-align/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$text$2d$style$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-text-style/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$font$2d$family$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-font-family/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$FontSizeExtension$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/notes/FontSizeExtension.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/printer.js [app-client] (ecmascript) <export default as Printer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/smile.js [app-client] (ecmascript) <export default as Smile>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$NoteEditorToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditorToolbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$ImageBubbleMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/notes/ImageBubbleMenu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$ResizableImageExtension$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/notes/ResizableImageExtension.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$EmojiPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/EmojiPicker.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/home/emoji-picker-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$upload$2d$note$2d$image$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/upload-note-image.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$notes$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/lib/notes-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$DeleteNoteConfirmModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/components/notes/DeleteNoteConfirmModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.claude/worktrees/claude-work/src/contexts/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
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
const SubmitToCanvasModal = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/.claude/worktrees/claude-work/src/components/notes/SubmitToCanvasModal.tsx [app-client] (ecmascript, async loader)"));
_c = SubmitToCanvasModal;
;
/** Skeleton shown while the SubmitToCanvasModal chunk loads. */ function CanvasModalSkeleton({ onClose }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-popover border border-border rounded-2xl w-full max-w-2xl mx-4 animate-announce-card-in overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-b border-border flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-5 w-48 bg-muted rounded animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                lineNumber: 36,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-5 w-5 bg-muted rounded animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-9 w-full bg-muted rounded-xl animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-4 w-32 bg-muted rounded animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-14 w-full bg-muted rounded-xl animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 43,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-14 w-full bg-muted rounded-xl animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 44,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-14 w-full bg-muted rounded-xl animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 45,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this), document.body);
}
_c1 = CanvasModalSkeleton;
/** Auto-save debounce delay in ms. */ const SAVE_DELAY = 500;
function NoteEditor({ note, folderLabel, folders, currentFolderId, onMoveToFolder, onUpdate, onDelete, onBack, saveError }) {
    _s();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const saveTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const pendingUpdatesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const titleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const noteIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(note.id);
    const [showIconPicker, setShowIconPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showCanvasSubmit, setShowCanvasSubmit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showFolderMenu, setShowFolderMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [titleFocused, setTitleFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [titleStyle, setTitleStyle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        fontFamily: "",
        fontSize: ""
    });
    const [extraPages, setExtraPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showHeading, setShowHeading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "NoteEditor.useState": ()=>!!note.content?.pageHeading
    }["NoteEditor.useState"]);
    const [headingText, setHeadingText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "NoteEditor.useState": ()=>note.content?.pageHeading || ""
    }["NoteEditor.useState"]);
    const [editingHeading, setEditingHeading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    /** Save indicator: "idle" = no indicator, "saving" = fade out, "saved" = show checkmark, "error" = save failed. */ const [saveState, setSaveState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const savedTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const headingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const pageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const folderMenuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Ref to track latest heading for merging into content saves. */ const headingTextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(headingText);
    headingTextRef.current = headingText;
    /**
   * Schedules a debounced save for content and title.
   * Merges pageHeading into the content JSON so it persists.
   */ const scheduleSave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NoteEditor.useCallback[scheduleSave]": (updates)=>{
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
            setSaveState("saving");
            // Merge heading into content if content is being saved
            if (updates.content) {
                const content = updates.content;
                if (headingTextRef.current) {
                    content.pageHeading = headingTextRef.current;
                } else {
                    delete content.pageHeading;
                }
            }
            pendingUpdatesRef.current = updates;
            saveTimerRef.current = setTimeout({
                "NoteEditor.useCallback[scheduleSave]": ()=>{
                    onUpdate(noteIdRef.current, updates);
                    pendingUpdatesRef.current = null;
                    setSaveState("saved");
                    savedTimerRef.current = setTimeout({
                        "NoteEditor.useCallback[scheduleSave]": ()=>setSaveState("idle")
                    }["NoteEditor.useCallback[scheduleSave]"], 2000);
                }
            }["NoteEditor.useCallback[scheduleSave]"], SAVE_DELAY);
        }
    }["NoteEditor.useCallback[scheduleSave]"], [
        onUpdate
    ]);
    const editor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEditor"])({
        extensions: [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$starter$2d$kit$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].configure({
                heading: {
                    levels: [
                        1,
                        2,
                        3
                    ]
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$placeholder$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].configure({
                placeholder: "Start writing..."
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$task$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$task$2d$item$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].configure({
                nested: true
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$underline$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$text$2d$align$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].configure({
                types: [
                    "heading",
                    "paragraph"
                ]
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$text$2d$style$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextStyle"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$font$2d$family$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"],
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$FontSizeExtension$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
            __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$ResizableImageExtension$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].configure({
                inline: false,
                allowBase64: false
            })
        ],
        content: note.content,
        onUpdate: {
            "NoteEditor.useEditor[editor]": ({ editor: ed })=>{
                const content = ed.getJSON();
                const updates = {
                    content
                };
                if (titleRef.current && !titleRef.current.value.trim()) {
                    const firstText = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$notes$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractFirstLine"])(content);
                    if (firstText) updates.title = firstText;
                }
                scheduleSave(updates);
            }
        }["NoteEditor.useEditor[editor]"],
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[40vh]",
                style: "font-size: 14px;"
            },
            handlePaste: {
                "NoteEditor.useEditor[editor]": (_view, event)=>{
                    const items = event.clipboardData?.items;
                    if (!items) return false;
                    for (const item of items){
                        if (item.type.startsWith("image/")) {
                            event.preventDefault();
                            const file = item.getAsFile();
                            if (file) handleImageUpload(file);
                            return true;
                        }
                    }
                    return false;
                }
            }["NoteEditor.useEditor[editor]"],
            handleDrop: {
                "NoteEditor.useEditor[editor]": (_view, event)=>{
                    const files = event.dataTransfer?.files;
                    if (!files?.length) return false;
                    for (const file of files){
                        if (file.type.startsWith("image/")) {
                            event.preventDefault();
                            handleImageUpload(file);
                            return true;
                        }
                    }
                    return false;
                }
            }["NoteEditor.useEditor[editor]"]
        },
        immediatelyRender: true
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NoteEditor.useEffect": ()=>{
            if (editor && note.id !== noteIdRef.current) {
                noteIdRef.current = note.id;
                editor.commands.setContent(note.content);
                if (titleRef.current) {
                    titleRef.current.value = note.title;
                    autoResizeTitle();
                }
            }
        }
    }["NoteEditor.useEffect"], [
        note.id,
        note.content,
        note.title,
        editor
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NoteEditor.useEffect": ()=>{
            if (titleRef.current) {
                titleRef.current.value = note.title;
                autoResizeTitle();
            }
        }
    }["NoteEditor.useEffect"], [
        note.title
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NoteEditor.useEffect": ()=>{
            return ({
                "NoteEditor.useEffect": ()=>{
                    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
                    if (pendingUpdatesRef.current) {
                        onUpdate(noteIdRef.current, pendingUpdatesRef.current);
                        pendingUpdatesRef.current = null;
                    }
                }
            })["NoteEditor.useEffect"];
        }
    }["NoteEditor.useEffect"], [
        onUpdate
    ]);
    // Watch external save error signal to flip indicator to error state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NoteEditor.useEffect": ()=>{
            if (saveError) setSaveState("error");
        }
    }["NoteEditor.useEffect"], [
        saveError
    ]);
    /** Intercept Cmd/Ctrl+P to use custom print instead of browser default. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NoteEditor.useEffect": ()=>{
            function onKeyDown(e) {
                if ((e.metaKey || e.ctrlKey) && e.key === "p") {
                    e.preventDefault();
                    handlePrint();
                }
            }
            window.addEventListener("keydown", onKeyDown);
            return ({
                "NoteEditor.useEffect": ()=>window.removeEventListener("keydown", onKeyDown)
            })["NoteEditor.useEffect"];
        }
    }["NoteEditor.useEffect"], [
        editor
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    /** Recalculate extra pages when content overflows the first page. */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NoteEditor.useEffect": ()=>{
            if (!editor || !pageRef.current) return;
            const PAGE_HEIGHT = 1056;
            function recalc() {
                if (!pageRef.current) return;
                const scrollH = pageRef.current.scrollHeight;
                const needed = Math.max(0, Math.ceil(scrollH / PAGE_HEIGHT) - 1);
                setExtraPages({
                    "NoteEditor.useEffect.recalc": (prev)=>prev !== needed ? needed : prev
                }["NoteEditor.useEffect.recalc"]);
            }
            recalc();
            editor.on("update", recalc);
            const observer = new ResizeObserver(recalc);
            observer.observe(pageRef.current);
            return ({
                "NoteEditor.useEffect": ()=>{
                    editor.off("update", recalc);
                    observer.disconnect();
                }
            })["NoteEditor.useEffect"];
        }
    }["NoteEditor.useEffect"], [
        editor
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NoteEditor.useEffect": ()=>{
            if (!showFolderMenu) return;
            function handleClick(e) {
                if (folderMenuRef.current && !folderMenuRef.current.contains(e.target)) {
                    setShowFolderMenu(false);
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "NoteEditor.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["NoteEditor.useEffect"];
        }
    }["NoteEditor.useEffect"], [
        showFolderMenu
    ]);
    async function handleImageUpload(file) {
        if (!editor) return;
        const src = await (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$lib$2f$upload$2d$note$2d$image$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadNoteImage"])(file, noteIdRef.current);
        if (src) {
            editor.chain().focus().setImage({
                src
            }).run();
        } else {
            showToast("Image upload failed");
        }
    }
    function handleInsertImageClick() {
        fileInputRef.current?.click();
    }
    function handleFileInputChange(e) {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
        e.target.value = "";
    }
    /** Save heading change by triggering a content save with the heading merged in. */ function handleHeadingChange(e) {
        const val = e.target.value;
        setHeadingText(val);
        headingTextRef.current = val;
        if (editor) {
            const content = editor.getJSON();
            if (val) {
                content.pageHeading = val;
            } else {
                delete content.pageHeading;
            }
            scheduleSave({
                content
            });
        }
    }
    /** Exit editing mode on blur. Remove heading if empty. */ function handleHeadingBlur() {
        setEditingHeading(false);
        if (!headingText.trim()) {
            setShowHeading(false);
            setHeadingText("");
            headingTextRef.current = "";
            if (editor) {
                const content = editor.getJSON();
                delete content.pageHeading;
                scheduleSave({
                    content
                });
            }
        }
    }
    function autoResizeTitle() {
        const el = titleRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }
    function handleTitleChange(e) {
        autoResizeTitle();
        scheduleSave({
            title: e.target.value
        });
    }
    function handleTitleKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            editor?.commands.focus("start");
        }
    }
    /** Click on empty page area focuses the editor at the end. */ function handlePageClick(e) {
        const target = e.target;
        if (target.closest(".ProseMirror") || target.closest("textarea") || target.closest("button") || target.closest("[data-heading]") || target.closest("input")) return;
        editor?.commands.focus("end");
    }
    /**
   * Prints note by injecting content at the body root and using window.print().
   * Content inside position:fixed containers doesn't print in browsers,
   * so we temporarily inject a plain div at <body> root level that the
   * browser can see, hide everything else via @media print, then clean up.
   */ function handlePrint() {
        if (!editor) return;
        const title = titleRef.current?.value || note.title || "Untitled";
        const editorHtml = editor.getHTML();
        const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // Clean up any previous print artifacts
        document.getElementById("note-print-container")?.remove();
        document.getElementById("note-print-style")?.remove();
        // 1. Inject print-only content at body root (outside all fixed containers)
        const container = document.createElement("div");
        container.id = "note-print-container";
        const escapedHeading = headingTextRef.current ? headingTextRef.current.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
        container.innerHTML = `
      ${escapedHeading ? `<div style="font-size:10px;color:#888;margin:0 0 12px 0;padding-bottom:8px;border-bottom:1px dashed #ddd;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${escapedHeading}</div>` : ""}
      <h1 style="font-size:24px;font-weight:700;margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">${escapedTitle}</h1>
      <div style="font-size:14px;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">${editorHtml}</div>
    `;
        // Hidden on screen, visible only in print
        container.style.cssText = "display:none;";
        document.body.appendChild(container);
        // 2. Inject print styles that hide everything except our container
        const style = document.createElement("style");
        style.id = "note-print-style";
        style.textContent = `
      @media print {
        @page { margin: 0; }
        body > *:not(#note-print-container) { display: none !important; }
        #note-print-container {
          display: block !important;
          position: static !important;
          width: 100% !important;
          overflow: visible !important;
          padding: 0.75in;
        }
        #note-print-container h1, #note-print-container h2, #note-print-container h3,
        #note-print-container p, #note-print-container ul, #note-print-container ol,
        #note-print-container blockquote, #note-print-container pre,
        #note-print-container div, #note-print-container img, #note-print-container hr,
        #note-print-container li, #note-print-container span, #note-print-container a,
        #note-print-container code, #note-print-container label, #note-print-container input {
          visibility: visible !important;
          color: inherit;
        }
        #note-print-container ul:not([data-type="taskList"]) { list-style: disc; padding-left: 1.5em; }
        #note-print-container ol { list-style: decimal; padding-left: 1.5em; }
        #note-print-container ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        #note-print-container blockquote { border-left: 3px solid #333; padding-left: 1em; margin-left: 0; }
        #note-print-container pre { background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
        #note-print-container code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 0.875em; }
        #note-print-container pre code { background: none; padding: 0; }
        #note-print-container img { max-width: 100%; page-break-inside: avoid; }
        #note-print-container hr { border: none; border-top: 1px solid #ccc; margin: 1.5em 0; }
      }
    `;
        document.head.appendChild(style);
        // 3. Print, then clean up
        window.print();
        // Cleanup after print dialog closes
        container.remove();
        style.remove();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "note-editor-root fixed top-0 right-0 bottom-0 left-0 md:left-52 z-[35] flex flex-col overflow-hidden bg-muted/50 dark:bg-neutral-900/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: fileInputRef,
                type: "file",
                accept: "image/*",
                onChange: handleFileInputChange,
                className: "hidden"
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                lineNumber: 434,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "note-top-bar shrink-0 bg-background border-b border-border/40",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-4 md:px-6 py-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 text-sm text-foreground",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onBack,
                                        className: "flex items-center gap-1 hover:text-foreground/70 transition-colors",
                                        "aria-label": "Back to notes",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                lineNumber: 452,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hidden sm:inline font-medium",
                                                children: "Back"
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                lineNumber: 453,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 447,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-foreground/30 mx-1",
                                        children: "/"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 455,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        ref: folderMenuRef,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setShowFolderMenu((v)=>!v),
                                                className: "flex items-center gap-1.5 text-foreground hover:text-foreground/70 transition-colors max-w-[200px] cursor-pointer",
                                                "aria-label": "Move to folder",
                                                title: "Move to folder",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                                                        size: 14,
                                                        fill: "currentColor",
                                                        className: "shrink-0 text-foreground"
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                        lineNumber: 463,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate font-medium",
                                                        title: folderLabel,
                                                        children: folderLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                        lineNumber: 464,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                lineNumber: 457,
                                                columnNumber: 15
                                            }, this),
                                            showFolderMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-popover border border-border rounded-xl shadow-lg z-50 py-1",
                                                children: folders.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            if (f.id !== currentFolderId) onMoveToFolder(f.id);
                                                            setShowFolderMenu(false);
                                                        },
                                                        className: "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                                                                size: 14,
                                                                fill: "currentColor",
                                                                className: "shrink-0 text-muted-foreground"
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                                lineNumber: 477,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "truncate flex-1",
                                                                children: f.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                                lineNumber: 478,
                                                                columnNumber: 23
                                                            }, this),
                                                            f.id === currentFolderId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                size: 14,
                                                                className: "shrink-0 text-blue-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                                lineNumber: 480,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, f.id, true, {
                                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                        lineNumber: 469,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                lineNumber: 467,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 456,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                lineNumber: 446,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-0.5",
                                children: [
                                    saveState === "error" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] text-red-500 flex items-center gap-1 mr-1",
                                        children: "Not saved"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 492,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-[11px] text-muted-foreground/60 flex items-center gap-1 mr-1 transition-opacity duration-300 ${saveState === "saved" ? "opacity-100" : "opacity-0"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "12",
                                                height: "12",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2.5",
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M5 13l4 4L19 7"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                    lineNumber: 502,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                lineNumber: 501,
                                                columnNumber: 17
                                            }, this),
                                            "Saved"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 496,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowCanvasSubmit(true),
                                        title: "Submit to Canvas",
                                        "aria-label": "Submit to Canvas",
                                        className: "p-1.5 text-foreground hover:text-foreground/70 transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 513,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 507,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handlePrint,
                                        title: "Print",
                                        "aria-label": "Print note",
                                        className: "p-1.5 text-foreground hover:text-foreground/70 transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__["Printer"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 521,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 515,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowDeleteConfirm(true),
                                        title: "Delete note",
                                        "aria-label": "Delete note",
                                        className: "p-1.5 text-foreground hover:text-red-500 transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 529,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 523,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                lineNumber: 489,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                        lineNumber: 445,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "note-toolbar px-4 md:px-6 border-t border-border/20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$NoteEditorToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            editor: editor,
                            onInsertImage: handleInsertImageClick,
                            titleFocused: titleFocused,
                            titleStyle: titleStyle,
                            onTitleStyleChange: setTitleStyle
                        }, void 0, false, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                            lineNumber: 536,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                        lineNumber: 535,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                lineNumber: 443,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "note-editor-scroll flex-1 overflow-y-auto px-4 md:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-3xl my-6 mx-auto md:-translate-x-[104px]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: pageRef,
                            className: "note-page bg-background rounded-sm shadow-sm border border-border/30 px-8 md:px-14 py-12 min-h-[1056px] cursor-text",
                            onClick: handlePageClick,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    "data-heading": true,
                                    className: "-mt-8 h-6 flex items-center",
                                    children: showHeading ? editingHeading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        ref: headingRef,
                                        type: "text",
                                        value: headingText,
                                        onChange: handleHeadingChange,
                                        onBlur: handleHeadingBlur,
                                        onKeyDown: (e)=>{
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleHeadingBlur();
                                            }
                                        },
                                        placeholder: "Heading",
                                        autoFocus: true,
                                        className: "w-full text-xs text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40 h-6 leading-6"
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 559,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        onDoubleClick: ()=>{
                                            setEditingHeading(true);
                                            setTimeout(()=>headingRef.current?.focus(), 0);
                                        },
                                        className: "text-xs text-muted-foreground cursor-default select-none h-6 leading-6",
                                        title: "Double-click to edit",
                                        children: headingText
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 571,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        "data-print-hide": true,
                                        type: "button",
                                        className: "w-full flex items-center justify-center h-6 group/header cursor-pointer bg-transparent border-none outline-none",
                                        onClick: ()=>{
                                            setShowHeading(true);
                                            setEditingHeading(true);
                                            setTimeout(()=>headingRef.current?.focus(), 0);
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] text-transparent group-hover/header:text-muted-foreground/50 transition-colors pointer-events-none select-none",
                                            children: "+ Heading"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 593,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 583,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                    lineNumber: 556,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `group/title ${note.icon && showHeading ? "mt-6" : ""}`,
                                    children: [
                                        note.icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setShowIconPicker(true),
                                                    className: "note-icon-print text-5xl hover:opacity-80 transition-opacity cursor-pointer",
                                                    title: "Change icon",
                                                    children: note.icon.startsWith("lucide:") ? (()=>{
                                                        const name = note.icon.slice(7);
                                                        const IconComp = __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LUCIDE_ICON_MAP"][name];
                                                        if (!IconComp) return note.icon;
                                                        const filled = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$emoji$2d$picker$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isFilledIcon"])(name);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IconComp, {
                                                            size: 48,
                                                            fill: filled ? "currentColor" : "none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                            lineNumber: 614,
                                                            columnNumber: 30
                                                        }, this);
                                                    })() : note.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                    lineNumber: 604,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>onUpdate(noteIdRef.current, {
                                                            icon: null
                                                        }),
                                                    className: "note-icon-add text-xs text-muted-foreground/50 hover:text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity",
                                                    children: "Remove"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                    lineNumber: 617,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 603,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowIconPicker(true),
                                            className: "note-icon-add flex items-center gap-1.5 text-sm text-muted-foreground/50 hover:text-muted-foreground mb-2 opacity-0 group-hover/title:opacity-100 transition-opacity cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smile$3e$__["Smile"], {
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                    lineNumber: 629,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Add icon"
                                                }, void 0, false, {
                                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                                    lineNumber: 630,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 625,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            ref: titleRef,
                                            defaultValue: note.title,
                                            onChange: handleTitleChange,
                                            onKeyDown: handleTitleKeyDown,
                                            onFocus: ()=>setTitleFocused(true),
                                            onBlur: ()=>setTitleFocused(false),
                                            placeholder: "Untitled",
                                            rows: 1,
                                            className: "note-title-print w-full text-2xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 resize-none overflow-hidden leading-tight",
                                            style: {
                                                fontFamily: titleStyle.fontFamily || undefined,
                                                fontSize: titleStyle.fontSize || undefined
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 633,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                    lineNumber: 601,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EditorContent"], {
                                            editor: editor
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 651,
                                            columnNumber: 15
                                        }, this),
                                        editor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$ImageBubbleMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            editor: editor
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 652,
                                            columnNumber: 26
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                    lineNumber: 650,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                            lineNumber: 550,
                            columnNumber: 11
                        }, this),
                        Array.from({
                            length: extraPages
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                "data-print-hide": true,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center my-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 border-t border-dashed border-border/50"
                                        }, void 0, false, {
                                            fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                            lineNumber: 660,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 659,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "note-page bg-background rounded-sm shadow-sm border border-border/30 px-8 md:px-14 py-12 min-h-[1056px] cursor-text",
                                        onClick: handlePageClick
                                    }, void 0, false, {
                                        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                        lineNumber: 662,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                                lineNumber: 658,
                                columnNumber: 13
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                    lineNumber: 548,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                lineNumber: 547,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$notes$2f$DeleteNoteConfirmModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: showDeleteConfirm,
                noteCount: 1,
                onConfirm: ()=>{
                    setShowDeleteConfirm(false);
                    onDelete(note.id);
                },
                onCancel: ()=>setShowDeleteConfirm(false)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                lineNumber: 671,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$components$2f$home$2f$EmojiPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"], {
                open: showIconPicker,
                onSelect: (icon)=>{
                    onUpdate(noteIdRef.current, {
                        icon
                    });
                    setShowIconPicker(false);
                },
                onClose: ()=>setShowIconPicker(false)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                lineNumber: 681,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: showCanvasSubmit ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CanvasModalSkeleton, {
                    onClose: ()=>setShowCanvasSubmit(false)
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                    lineNumber: 690,
                    columnNumber: 46
                }, void 0) : null,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SubmitToCanvasModal, {
                    open: showCanvasSubmit,
                    onClose: ()=>setShowCanvasSubmit(false),
                    noteTitle: titleRef.current?.value || note.title || "Untitled",
                    editorHtml: editor?.getHTML() || ""
                }, void 0, false, {
                    fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                    lineNumber: 691,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
                lineNumber: 690,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.claude/worktrees/claude-work/src/components/notes/NoteEditor.tsx",
        lineNumber: 433,
        columnNumber: 5
    }, this);
}
_s(NoteEditor, "BvQ32roxL7YwJu5rcb58bv1Wd5E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$claude$2f$worktrees$2f$claude$2d$work$2f$src$2f$contexts$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEditor"]
    ];
});
_c2 = NoteEditor;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "SubmitToCanvasModal");
__turbopack_context__.k.register(_c1, "CanvasModalSkeleton");
__turbopack_context__.k.register(_c2, "NoteEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_claude_worktrees_claude-work_src_d114cae0._.js.map