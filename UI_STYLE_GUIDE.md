# caltodo UI style guide

The rules for new UI. Reach for a primitive in `src/components/ui/` before writing
classes by hand; the recipes below are what those primitives render, so a hand-written
element and a primitive should be indistinguishable. `DESIGN_SYSTEM.md` holds the
concrete token values and file citations; this guide holds the decisions.

## Primitives first

| Need | Use | Not |
|------|-----|-----|
| Any text button | `Button` (`variant`, `size`, `loading`) | hand-written `<button className="px-4 ...">` |
| Icon-only button | `IconButton` (`aria-label` is required) | `<button><X /></button>` |
| Dialog | `Modal` (title, description, footer, size) | `createPortal` + `fixed inset-0` by hand |
| Yes/no prompt | `ConfirmDialog` (`destructive`, `loading`) | `window.confirm`, custom two-button modals |
| Floating panel | `Popover` (`role`, `anchorRef`) | absolutely positioned `div` with its own click-outside |
| Status chip, count | `Badge` | 26 chip recipes |
| Due date chip | `DueDatePill` / `getRelativeDateLabel` | per-file date math |
| Nothing to show | `EmptyState` | ad hoc centered text |
| Loading | `Skeleton`, `Spinner`, `Button loading` | bare `animate-pulse` divs, raw `Loader2` |
| Form control | `TextField`, `TextArea` | unlabeled `<input>` |
| Page / section title | `PageHeader`, `SectionHeading` | 11 heading styles |
| Provider mark | `IntegrationLogo` | `<img src="/canvas-logo.png">` |
| Words | `src/lib/copy.ts` | retyped labels |

## Color

Use the CSS-variable tokens. Never hardcode a hex or a `gray-*` for themed UI.

| Token | Usage |
|-------|-------|
| `bg-background` | Page background |
| `bg-card` | Cards, widgets |
| `bg-popover` | Modals, dropdowns, popovers. Always solid, never translucent |
| `bg-muted` | Hover fills, secondary surfaces |
| `bg-accent` | Subtle hover fill on bordered controls |
| `text-foreground` | Headings, labels, body |
| `text-muted-foreground` | Descriptions, captions, timestamps |
| `text-subtle-foreground` | Placeholders, far-future dates |
| `border-border` | Card borders, dividers |
| `border-input-border` | Form control borders |
| `border-hairline` | Translucent divider on any surface (black/10, white/10 in dark) |
| `ring-ring` | Focus ring |
| `bg-blue-500` / `text-blue-500` | The accent. `hover:bg-blue-600` for hover, `bg-accent-hover` where a token is needed |
| `text-success` `text-warning` `text-danger` | Status text; `bg-*-tint` for the 10% fill |
| `bg-backdrop` | Modal scrim |

Rules

- The accent ramp is one hue: 400 lighter, 500 brand, 600 hover, 700 pressed. `#3D8FE8` is retired.
- Status colors do not follow the theme; they mean the same thing in every theme.
- Elevated buttons add `dark:shadow-none`. Shadows on dark surfaces read as a double border.
- Light-mode status chips use the 600 text step (`text-red-600`, `text-blue-600`) and `dark:text-*-400`, so they pass 4.5:1.

## Typography

| Element | Classes | Primitive |
|---------|---------|-----------|
| Page title | `text-xl font-bold text-foreground` (h1) | `PageHeader` |
| Section title | `text-lg font-semibold text-foreground` (h2) | `SectionHeading` |
| Modal title | `text-base font-semibold text-foreground` (h2) | `Modal title` |
| Section label (inside cards, pickers) | `text-xs font-medium text-foreground` | |
| Body | `text-sm text-foreground` | |
| Caption / secondary | `text-xs text-muted-foreground` | |
| Caption step (11px) | `text-2xs` | `DueDatePill` |
| Badge step (10px) | `text-3xs` | `Badge` |

Rules

- `text-[11px]` and `text-[10px]` are `text-2xs` and `text-3xs`. Nothing readable goes smaller.
- No uppercase labels. Not for section headers, not for buttons, not for badges. Sentence case, `text-foreground`.
- Fonts: Geist by default; the user-selectable list lives in `src/lib/font-options.ts` and applies to board titles and widgets only.

## Buttons

Every variant is `rounded-lg`, `font-medium`, `transition-colors`, with a `focus-visible` ring
and `disabled:opacity-50`. Sizes: `sm` `px-3 py-1.5 text-xs`, `md` `px-4 py-2 text-sm`,
`lg` `px-5 py-3 text-sm`.

| Variant | Recipe | Use |
|---------|--------|-----|
| `primary` | `bg-blue-500 text-white hover:bg-blue-600` | The one affirmative action |
| `inverted` | `bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-sm dark:shadow-none` | A single dominant CTA (start, send, go to settings) |
| `secondary` | `border border-border bg-card text-foreground hover:bg-accent` | Cancel, neutral choices |
| `ghost` | `text-muted-foreground hover:text-foreground hover:bg-muted` | Tertiary actions, dismiss |
| `destructive` | `text-red-500 hover:bg-red-500/10` | Delete inside a menu or row |
| `destructive-filled` | `bg-red-500 text-white hover:bg-red-600` | Confirm button in a destructive dialog |
| `pill` | `rounded-full border border-border bg-card hover:bg-accent shadow-sm dark:shadow-none active:scale-[0.97]` | Toolbar actions |

Rules

- The inverted idiom is explicit `bg-gray-900 text-white dark:bg-white dark:text-gray-900`. Do not use `bg-foreground text-background`.
- `loading` shows a `Loader2` spinner, sets `aria-busy`, and disables the button. Keep the label so the width holds.
- `active:scale-[0.97]` belongs to pills only.
- Icon-only buttons are `IconButton`: `w-8 h-8 rounded-full` by default, `aria-label` required, 44px hit area on touch.

## Modals

Use `Modal`. It renders:

```
wrapper   fixed inset-0 z-overlay flex items-center justify-center p-4
backdrop  absolute inset-0 bg-backdrop backdrop-blur-sm animate-announce-backdrop-in
card      relative bg-popover rounded-2xl border border-border shadow-2xl p-6 max-h-[85vh]
          animate-announce-card-in  role="dialog" aria-modal aria-labelledby
title     h2 text-base font-semibold text-foreground
close     IconButton w-8 h-8 rounded-full, X size 16, aria-label="Close", top-4 right-4
footer    flex justify-end gap-2 mt-6
```

and handles: portal to `document.body`, focus trap, initial focus, focus restore to the
opener, Escape, backdrop click (target check), body scroll lock. Sizes: `sm` (confirms),
`md` (forms, default), `lg`, `xl` (lists).

Rules

- Modal padding is `p-6`. Header, body and footer are stacked inside that padding.
- `bg-popover` only. Never `bg-card/95`, never glass.
- Entrance is `animate-announce-*`. No other modal timing.
- Confirmations are `ConfirmDialog`: title, body, confirm label, `destructive`, `loading`, cancel. Initial focus lands on Cancel when destructive.
- Nested dialogs must sit on `z-overlay` too; DOM order puts the later one on top.

## Popovers and dropdowns

Use `Popover`. It always paints `bg-popover rounded-xl border border-border shadow-lg`, closes on
Escape and outside click, moves focus in, traps Tab, restores focus to `triggerRef`, and takes
`role="dialog"` (pickers, forms) or `role="menu"` (command lists). Pass `anchorRef` for a
`position: fixed` panel that follows its anchor through scroll and resize; otherwise position it
with `className` (`absolute left-0 top-full mt-1 z-dropdown`).

## Form controls

`TextField` and `TextArea` render the canonical recipe:

```
w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm
focus:outline-none focus:ring-2 focus:ring-ring
```

with a label (visible or `hideLabel` for sr-only), a generated `id`, `hint`, and `error`
(sets `aria-invalid` and links the message with `aria-describedby`). Inputs are `rounded-lg`, the
same as buttons.

Slider: `w-full h-1.5 rounded-full appearance-none bg-muted accent-blue-500 cursor-pointer`.

## Badges and chips

`Badge` is `rounded-md px-1.5 py-0.5 text-3xs font-medium`. Variants `info` and `beta` share one
blue tint (`bg-blue-50 text-blue-600 dark:bg-blue-600/40 dark:text-blue-400`); `success`,
`warning`, `danger` use the `bg-*-tint` tokens; `neutral` is `bg-muted text-muted-foreground`;
`count` is the only `rounded-full` one (`bg-red-500 text-white min-w-[18px] h-[18px]`).

`DueDatePill` renders "Today", "Tomorrow", "In 3 days", "Overdue 2 days", or "Sep 3" from
`getRelativeDateLabel` with `getUrgencyClass` colors.

## Empty and loading states

- `EmptyState`: icon in a `w-10 h-10 bg-muted` circle, `text-sm font-medium` title,
  `text-sm text-muted-foreground` description, optional action, `py-12 px-6`.
- `Skeleton`: `bg-muted animate-pulse` with `text`, `title`, `circle`, `block`, `pill` shapes.
- `Spinner`: `Loader2 animate-spin` with `role="status"` and an `aria-label`.

## Focus and motion

- A global `:focus-visible` rule draws `outline: 2px solid var(--ring)` with a 2px offset. Do not
  add `focus:outline-none` without a `ring` replacement.
- `prefers-reduced-motion` collapses every animation and transition globally. `animate-spin` is
  exempt; add `.motion-essential` to anything else that must keep moving.
- Standard transitions: `transition-colors` (150ms); `transition-all duration-200` when a transform
  is involved.
- Modal entrance `animate-announce-card-in` / `-backdrop-in`; popover `animate-popover-in`; toast
  `animate-toast-in`. Do not invent new modal timings.

## Z-index ladder

| Utility | Value | Holds |
|---------|-------|-------|
| `z-sticky` | 40 | Sticky headers, tab bars |
| `z-dropdown` | 50 | Popovers, menus, anchored pickers |
| `z-overlay` | 100 | Modals and their backdrops |
| `z-toast` | 200 | Toasts (above modals so Undo stays reachable) |
| `z-tooltip` | 300 | Tooltips |

Arbitrary values (`z-[9999]`) are legacy and should migrate to the ladder.

## Toasts

`useToast().showToast(message, { action, duration, progress, variant })`. Up to three stack;
a toast with an action is never evicted. Messages wrap to three lines. `role="status"`,
`aria-live="polite"`. Toasts are never the only place critical information appears.

## Icons

Lucide. `size={16}` inline, `14` compact, `24` in empty states. `text-muted-foreground` by
default. Decorative icons are `aria-hidden`; icon-only controls carry `aria-label`.

## Spacing

- Modal padding `p-6`. Card padding `p-4` or `px-6 py-4`.
- Section gaps `space-y-4` or `space-y-5`; button gaps `gap-2`; icon-to-label `gap-1.5`.
- Page gutters `px-4 md:px-10`.

## Copy

- Sentence case everywhere: "Skip for now", "Sign out", "Go to settings".
- Brand is lowercase `caltodo`. Never "CalTodo".
- No em dashes in UI text, code comments, or docs. Use commas, periods, or parentheses.
- Glossary (`src/lib/copy.ts`): a course is a "class"; providers are "Canvas" (bCourses only in
  Berkeley help text), "Gradescope", "Pensive", "Brightspace", "Blackboard",
  "Google Classroom", "Google Calendar" (never "GCal"); auth verbs are "Sign in" / "Sign out".

## Do not

- Hardcode `text-gray-*`, `bg-white`, or hex colors for themed elements.
- Use uppercase for labels, headers, buttons, or badges.
- Use translucent or glass backgrounds on popovers, dropdowns, or modals.
- Use `bg-foreground text-background` for an inverted button.
- Leave a shadow on an elevated button in dark mode.
- Use `alert()` or `confirm()`.
- Skip the entrance animation on a modal, or use a timing other than `animate-announce-*`.
- Mix radii: controls and inputs `rounded-lg`, cards and modals `rounded-2xl`, pills, badges (count only) and icon buttons `rounded-full`, badges `rounded-md`.
- Ship an icon-only button without `aria-label`, or a form control without a label.
