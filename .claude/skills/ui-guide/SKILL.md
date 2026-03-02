---
name: ui-guide
description: UI consistency guide for CalTodo. Load when creating or modifying UI components, modals, buttons, widgets, or any visual elements. Ensures consistent styling across the app.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash(*)
---

# CalTodo UI Consistency Guide

When building or modifying any UI in CalTodo, follow these rules exactly. Reference `UI_STYLE_GUIDE.md` at the project root for the complete specification.

## Quick Reference

### Colors — Always Use CSS Variables

| Token | Usage |
|-------|-------|
| `bg-popover` | Modals, dropdowns, popovers (SOLID, never glass/transparent) |
| `bg-card` | Card surfaces, widget backgrounds |
| `bg-muted` | Hover states, secondary surfaces |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary/caption text |
| `border-border` | Card borders, dividers |
| `border-input-border` | Form input borders |

**NEVER** use hardcoded colors like `text-gray-500`, `bg-white`, `#6b7280` for themed elements.

### Typography — No Gray All-Caps

- Labels: `text-sm font-medium text-foreground` (not gray, not uppercase)
- Section dividers ONLY: `text-[10px] uppercase tracking-wider text-muted-foreground font-medium`
- Descriptions: `text-xs text-muted-foreground`
- Never use all-caps on buttons or primary labels

### Buttons

- Primary: `px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors`
- Secondary: `px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors`
- Destructive: `px-3 py-2 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-colors`
- Always `rounded-xl` for buttons, `rounded-2xl` for cards/modals
- Always include `transition-colors`

### Modals

- Background: `bg-popover` (solid)
- Border: `border border-border`
- Radius: `rounded-2xl`
- Width: `max-w-md mx-4`
- Portal to `document.body` via `createPortal`
- Entry: `animate-announce-card-in` on card, `animate-announce-backdrop-in` on backdrop
- Backdrop: `bg-black/50 backdrop-blur-sm`
- Close: X button top-right + backdrop click
- Header: `p-4 border-b border-border` with `text-base font-semibold text-foreground`
- Footer: `p-4 border-t border-border` with buttons right-aligned

### Widgets

- Container: `bg-card rounded-2xl border border-border`
- Custom text: CSS variable `--widget-text-color` with `widget-custom-text` class
- Config keys: `textColor`, `bgColor`, `fontFamily` (all strings in `widget.config`)

### Icons

- Library: Lucide React
- Default: `size={16}`, compact: `size={14}`
- Color: `text-muted-foreground`
- Always add `aria-label` on icon-only buttons

### Animations

| Animation | Usage |
|-----------|-------|
| `animate-announce-card-in` | Modal card entry |
| `animate-announce-backdrop-in` | Modal backdrop fade |
| `animate-chat-notif-in` | Notification slide-in |
| `animate-spin` | Loading spinners |
| `transition-colors` | Hover/focus color changes |
| `transition-all duration-200` | With transform changes |

## Anti-Patterns (NEVER Do These)

1. Hardcoded colors (`text-gray-500`, `bg-white`) for themed elements
2. ALL CAPS text on labels or buttons (exception: 10px section dividers)
3. Transparent/glass popover backgrounds
4. `bg-foreground text-background` for inverted buttons
5. Shadows on dark mode elevated buttons
6. Missing entry animations on modals
7. Inconsistent border radius
8. Missing `aria-label` on icon buttons
9. Using `alert()` or `confirm()` instead of in-app modals
10. Skipping `transition-colors` on interactive elements

## Before Submitting UI Changes

1. Check light AND dark mode appearance
2. Verify all text uses theme tokens (no hardcoded colors)
3. Ensure modals have backdrop, close button, and animations
4. Confirm buttons use the correct variant (primary/secondary/destructive)
5. Test that dropdowns/popovers have solid `bg-popover` backgrounds
