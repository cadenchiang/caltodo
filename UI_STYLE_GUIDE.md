# CalTodo UI Style Guide

Reference for all new UI development. Follow these patterns exactly to maintain visual consistency.

## Color System

Use CSS custom properties (not hardcoded hex). All colors adapt to light/dark/pink themes automatically.

| Token | Usage |
|-------|-------|
| `bg-background` | Page background |
| `bg-card` | Card surfaces, widget backgrounds |
| `bg-popover` | Modals, dropdowns, popovers (always solid, never transparent) |
| `bg-muted` | Hover states, secondary surfaces |
| `text-foreground` | Primary text (headings, labels, body) |
| `text-muted-foreground` | Secondary text (descriptions, timestamps, captions) |
| `text-secondary-foreground` | Tertiary text (subtle labels) |
| `border-border` | Card borders, dividers, separators |
| `border-input-border` | Form input borders (slightly darker than border) |
| `ring-ring` | Focus ring color |

### Rules

- **Never use hardcoded colors** like `text-gray-500` or `bg-white` for themed elements. Use the CSS variable tokens above.
- **NEVER use all-caps gray text for section labels or headings.** Do not use `uppercase tracking-wider text-muted-foreground` for labels. Instead use `text-xs font-medium text-foreground` (normal case, foreground color). This applies to ALL section headers, category labels, and divider text throughout the app.
- **Dark mode shadows**: Add `box-shadow: none` in dark variants for elevated buttons to avoid double-border artifacts.

## Typography

| Element | Classes |
|---------|---------|
| Page title | `text-base font-semibold text-foreground` |
| Section header | `text-sm font-medium text-foreground` |
| Section label (in cards/pickers) | `text-xs font-medium text-foreground` |
| Body text | `text-sm text-foreground` |
| Caption / secondary | `text-xs text-muted-foreground` |
| Tiny label | `text-[10px] text-muted-foreground` |

### Font Stack

- Default: system fonts (no custom web fonts loaded by default)
- User-configurable fonts: Inter, DM Sans, Plus Jakarta Sans, Outfit, Manrope, Urbanist, Sora, Nunito, Quicksand, Varela Round, Instrument Serif, Playfair Display, DM Serif Display, Source Serif 4

## Buttons

### Primary (action)
```
px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors
```

### Secondary (cancel/neutral)
```
px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors
```

### Destructive
```
px-3 py-2 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-colors
```

### Pill button (toolbar actions)
```
flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-border bg-white dark:bg-gray-800 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all active:scale-[0.97]
```

### Icon button (small circular)
```
w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors
```

### Rules

- Border radius: `rounded-xl` (12px) for buttons, `rounded-2xl` (16px) for cards/modals
- Always include `transition-colors` or `transition-all`
- Use `active:scale-[0.97]` sparingly (only for primary actions)
- Never use all-caps text on buttons

## Modals

### Structure
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in" onClick={onClose} />
  {/* Card */}
  <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full max-w-md mx-4 animate-announce-card-in overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-border">
      <h2 className="text-base font-semibold text-foreground">Title</h2>
      <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close">
        <X size={16} />
      </button>
    </div>
    {/* Content */}
    <div className="p-4 space-y-4">...</div>
    {/* Footer */}
    <div className="flex justify-end gap-2 p-4 border-t border-border">
      <button className="[secondary]">Cancel</button>
      <button className="[primary]">Save</button>
    </div>
  </div>
</div>
```

### Rules

- Always use `bg-popover` (solid) for modal background, never transparent/glass
- Portal to `document.body` via `createPortal`
- Include backdrop blur: `backdrop-blur-sm`
- Include entry animations: `animate-announce-card-in`, `animate-announce-backdrop-in`
- Max width: `max-w-md` (28rem) for standard modals, `max-w-sm` for compact
- Close button: top-right X icon, always present
- Close on backdrop click: always
- `max-h-[85vh]` with `overflow-y-auto` on content for long modals

## Confirmation Overlays (in-modal)

For "Apply to all?" style prompts that appear inside an existing modal:

```tsx
<div className="absolute inset-0 z-10 bg-card/95 flex flex-col items-center justify-center p-6 text-center">
  <p className="text-sm font-medium text-foreground mb-4">
    Apply this to all widgets?
  </p>
  <div className="flex gap-2">
    <button className="[secondary]">Just this one</button>
    <button className="[primary]">Apply to all</button>
  </div>
</div>
```

## Form Inputs

### Select / Text Input
```
w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring
```

### Slider
```
w-full h-1.5 rounded-full appearance-none bg-muted accent-blue-500 cursor-pointer
```

## Widgets

- Container: `bg-card rounded-2xl border border-border`
- Custom text color: applied via CSS variable `--widget-text-color` with `widget-custom-text` class
- Background color: inline `style={{ backgroundColor }}`
- Font family: inline `style={{ fontFamily }}`
- All style config stored in `widget.config` as strings: `textColor`, `bgColor`, `fontFamily`

## Notifications & Badges

### Toast / Banner
```
max-w-sm rounded-2xl shadow-lg border border-border bg-popover
```

### Badge (count)
```
min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1
```

### Badge (text, e.g. "NEW")
```
px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-500 text-white
```

## Animations

Available CSS animations (defined in globals.css):

| Name | Usage |
|------|-------|
| `animate-announce-card-in` | Modal card entry (scale + fade) |
| `animate-announce-backdrop-in` | Modal backdrop fade |
| `animate-chat-notif-in` | Notification banner slide-in |
| `animate-spin` | Loading spinners |

### Transitions

- Standard: `transition-colors` (150ms default)
- With transform: `transition-all duration-200`
- Exit animations: opacity + translate, 300ms duration

## Icons

- Library: Lucide React
- Default size: `size={16}` for inline, `size={14}` for compact
- Color: `className="text-muted-foreground"` (or `text-foreground` for emphasis)
- Never use icon-only buttons without `aria-label`

## Spacing

- Modal padding: `p-4`
- Card padding: `p-4` or `px-6 py-4`
- Section gaps: `space-y-4` or `space-y-5`
- Button gaps: `gap-2`
- Grid containers: `px-6 md:px-10`

## Anti-Patterns (Do NOT)

- Do not use `text-gray-*` hardcoded colors — use `text-foreground` / `text-muted-foreground`
- Do not use ALL CAPS (`uppercase`) for ANY labels, section headers, or buttons — no exceptions. Use normal case with `text-foreground`
- Do not use transparent/glass backgrounds on popovers or dropdowns
- Do not use `bg-foreground text-background` for inverted buttons — use explicit `bg-gray-900 text-white dark:bg-white dark:text-gray-900`
- Do not create shadows on dark mode elevated buttons
- Do not use `alert()` or `confirm()` — use in-app modals
- Do not skip entry animations on modals
- Do not use inconsistent border radius (stick to `rounded-xl` for buttons, `rounded-2xl` for cards)
