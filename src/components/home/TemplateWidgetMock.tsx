/**
 * Mock widget content for board template previews.
 * Renders visually recognizable miniature versions of each widget type.
 *
 * @param type - The widget type string
 * @param w - Grid width in columns
 * @param h - Grid height in rows
 */

import { WIDGET_REGISTRY } from "@/lib/widget-types";

export default function TemplateWidgetMock({ type, w, h }: { type: string; w: number; h: number }) {
  const tall = h >= 2;
  const wide = w >= 2;

  switch (type) {
    case "tasks-today":
      return (
        <div className="p-2 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[7px] font-bold text-foreground">Today</span>
            <span className="text-[6px] text-foreground">0/3</span>
          </div>
          {["Math HW 5", "Read Ch. 12", "Lab Report"].slice(0, tall ? 3 : 2).map((t, i) => (
            <div key={i} className="flex items-center gap-1 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-sm border border-muted-foreground/40 shrink-0" />
              <span className="text-[6px] text-foreground truncate">{t}</span>
            </div>
          ))}
        </div>
      );
    case "google-calendar":
      return (
        <div className="p-2 flex flex-col h-full">
          <span className="text-[7px] font-bold text-foreground mb-1">Google Calendar</span>
          <span className="text-[6px] text-blue-500 font-semibold mb-1">Today</span>
          {["CS 61B", "Office Hours", "Study Group", "Gym"].slice(0, tall ? 4 : 2).map((e, i) => (
            <div key={i} className="flex items-center gap-1 mb-0.5">
              <div className="w-0.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[6px] text-foreground block truncate">{e}</span>
                <span className="text-[5px] text-foreground">{`${9 + i * 2}:00 AM`}</span>
              </div>
            </div>
          ))}
        </div>
      );
    case "weather":
      return (
        <div className="p-2 flex flex-col justify-between h-full">
          <span className="text-[6px] text-foreground">Berkeley, CA</span>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-extralight text-foreground leading-none">60°</span>
              <p className="text-[5px] text-foreground mt-0.5">Clear</p>
            </div>
            <span className="text-sm">☀️</span>
          </div>
          {!tall ? null : (
            <div className="flex gap-1 text-[5px] text-foreground">
              <span>Feels 58°</span>
              <span>·</span>
              <span>45%</span>
            </div>
          )}
        </div>
      );
    case "pomodoro":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <span className="text-[7px] font-semibold text-foreground tracking-wider">FOCUS</span>
          <span className="text-xl font-light text-foreground tabular-nums">25:00</span>
          <div className="flex gap-1.5 mt-0.5">
            {["\u21BA", "\u25B6", "\u23ED"].map((icon, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-muted flex items-center justify-center">
                <span className="text-[5px] text-foreground">{icon}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "image":
      return (
        <div className="h-full w-full bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
          <span className="text-[8px] text-white/60">{"\u{1F3D4}\u{FE0F}"}</span>
        </div>
      );
    case "notes":
      return (
        <div className="p-2 flex flex-col h-full gap-0.5">
          <span className="text-[7px] font-bold text-foreground mb-0.5">Notes</span>
          {["Remember to review...", "Meeting at 3pm", "Buy groceries"].slice(0, tall ? 3 : 2).map((t, i) => (
            <span key={i} className="text-[5px] text-foreground truncate">{t}</span>
          ))}
        </div>
      );
    case "quote":
      return (
        <div className="p-2 flex items-center justify-center h-full">
          <p className="text-[6px] italic text-foreground text-center leading-relaxed">
            &ldquo;The only way to do great work is to love what you do.&rdquo;
          </p>
        </div>
      );
    case "countdown":
      return (
        <div className="flex items-center justify-center h-full gap-1">
          <span className="text-sm font-bold text-foreground">14</span>
          <span className="text-[6px] text-foreground">days left</span>
        </div>
      );
    case "habit-tracker":
      return (
        <div className="p-2 flex flex-col h-full">
          <span className="text-[7px] font-bold text-foreground mb-1">Habits</span>
          <div className="flex gap-px flex-wrap">
            {Array.from({ length: wide ? 28 : 14 }).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-[1px] ${i % 3 !== 0 ? "bg-green-400/60" : "bg-muted"}`} />
            ))}
          </div>
        </div>
      );
    case "quick-links":
      return (
        <div className="p-2 flex flex-col h-full">
          <span className="text-[7px] font-bold text-foreground mb-1">Links</span>
          {["bCourses", "Gradescope", "Piazza"].slice(0, tall ? 3 : 2).map((l, i) => (
            <div key={i} className="flex items-center gap-1 mb-0.5">
              <div className="w-2 h-2 rounded bg-muted shrink-0" />
              <span className="text-[5px] text-foreground">{l}</span>
            </div>
          ))}
        </div>
      );
    case "cal-chat":
      return (
        <div className="p-2 flex flex-col h-full">
          <span className="text-[7px] font-bold text-foreground mb-1">Cal Chat</span>
          <div className="flex flex-col gap-1 flex-1">
            <div className="bg-blue-500/10 rounded px-1 py-0.5 self-start">
              <span className="text-[5px] text-foreground">Hey, study tonight?</span>
            </div>
            <div className="bg-muted rounded px-1 py-0.5 self-end">
              <span className="text-[5px] text-foreground">Sure! 8pm?</span>
            </div>
          </div>
        </div>
      );
    case "spotify":
      return (
        <div className="p-2 flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-500/10 to-green-600/5">
          <span className="text-[8px]">{"\u{1F3B5}"}</span>
          <span className="text-[6px] text-foreground mt-0.5">Spotify</span>
        </div>
      );
    case "class-progress":
      return (
        <div className="p-2 flex flex-col h-full">
          <span className="text-[7px] font-bold text-foreground mb-1">Progress</span>
          {["CS 61B", "UGBA 135"].map((c, i) => (
            <div key={i} className="mb-1">
              <span className="text-[5px] text-foreground">{c}</span>
              <div className="h-1 rounded-full bg-muted mt-0.5">
                <div className="h-full rounded-full bg-blue-400" style={{ width: `${50 + i * 25}%` }} />
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <span className="text-[7px] text-foreground">
            {WIDGET_REGISTRY[type as keyof typeof WIDGET_REGISTRY]?.label || type}
          </span>
        </div>
      );
  }
}
