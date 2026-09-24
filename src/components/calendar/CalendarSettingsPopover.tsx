"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Settings2, Palette } from "lucide-react";
import type { CalendarMode } from "./CalendarHeader";

/** Preset colors for the calendar color picker. */
const COLOR_PRESETS = [
  "#8B8FE8", "#4285F4", "#7986CB", "#33B679",
  "#E67C73", "#F6BF26", "#F4511E", "#039BE5",
  "#616161", "#D50000", "#F09300", "#0B8043",
];

/** localStorage key for user color overrides per calendar. */
const CAL_COLORS_KEY = "caltodo_cal_color_overrides";

/**
 * Loads saved calendar color overrides from localStorage.
 *
 * @returns Record mapping calendar ID to hex color
 */
function loadColorOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CAL_COLORS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/**
 * Saves a calendar color override to localStorage.
 *
 * @param calId - Google Calendar ID
 * @param color - Hex color string
 */
function saveColorOverride(calId: string, color: string) {
  const overrides = loadColorOverrides();
  overrides[calId] = color;
  try { localStorage.setItem(CAL_COLORS_KEY, JSON.stringify(overrides)); } catch { /* ignore */ }
}

interface CalendarSettingsPopoverProps {
  calendarMode: CalendarMode;
  onCalendarModeChange: (mode: CalendarMode) => void;
  onCalendarsChange?: () => void;
}

/**
 * Calendar settings popover: mode toggle + calendar picker with hover actions.
 * Each calendar row shows eye (toggle), palette (color), and link (open) icons on hover.
 *
 * @param calendarMode - Current mode ("assignments" or "calendar")
 * @param onCalendarModeChange - Callback when mode changes
 * @param onCalendarsChange - Callback when calendar selection/colors change
 */
export default function CalendarSettingsPopover({
  calendarMode,
  onCalendarModeChange,
  onCalendarsChange,
}: CalendarSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [calendars, setCalendars] = useState<
    Array<{ id: string; summary: string; backgroundColor: string; selected: boolean }>
  >([]);
  const [loadingCals, setLoadingCals] = useState(false);
  const [hoveredCal, setHoveredCal] = useState<string | null>(null);
  const [colorPickerCal, setColorPickerCal] = useState<string | null>(null);
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({});

  useEffect(() => { setColorOverrides(loadColorOverrides()); }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popRef.current && !popRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) { setOpen(false); setColorPickerCal(null); }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open || calendars.length > 0) return;
    setLoadingCals(true);
    fetch("/api/gcal/calendars")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.calendars) {
          const selectedIds: string[] = data.selectedCalendarIds ?? [];
          setCalendars(
            data.calendars.map((c: { id: string; summary: string; backgroundColor: string }) => ({
              ...c,
              selected: selectedIds.length === 0 || selectedIds.includes(c.id),
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCals(false));
  }, [open, calendars.length]);

  /** Toggles a calendar's visibility. */
  function toggleCalendar(id: string) {
    const updated = calendars.map((c) =>
      c.id === id ? { ...c, selected: !c.selected } : c
    );
    setCalendars(updated);
    onCalendarsChange?.();
    const selectedIds = updated.filter((c) => c.selected).map((c) => c.id);
    fetch("/api/gcal/select-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarIds: selectedIds }),
    }).then(() => onCalendarsChange?.()).catch(() => {});
  }

  /** Sets all calendars selected or deselected. */
  function setAllCalendars(selected: boolean) {
    const updated = calendars.map((c) => ({ ...c, selected }));
    setCalendars(updated);
    onCalendarsChange?.();
    const selectedIds = updated.filter((c) => c.selected).map((c) => c.id);
    fetch("/api/gcal/select-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarIds: selectedIds }),
    }).then(() => onCalendarsChange?.()).catch(() => {});
  }

  /** Changes a calendar's display color and persists to localStorage. */
  function changeCalendarColor(calId: string, color: string) {
    setColorOverrides((prev) => ({ ...prev, [calId]: color }));
    saveColorOverride(calId, color);
    setColorPickerCal(null);
    onCalendarsChange?.();
  }

  function getPopStyle(): React.CSSProperties {
    if (!btnRef.current) return {};
    const r = btnRef.current.getBoundingClientRect();
    return { position: "fixed", top: r.bottom + 8, right: Math.max(8, window.innerWidth - r.right) };
  }

  /** Returns the display color for a calendar (override or original). */
  function getCalColor(cal: { id: string; backgroundColor: string }): string {
    return colorOverrides[cal.id] || cal.backgroundColor;
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="p-1.5 md:p-2 rounded-lg text-foreground hover:bg-accent transition-all"
        title="Calendar settings"
      >
        <Settings2 size={18} />
      </button>
      {open && createPortal(
        <div ref={popRef} style={getPopStyle()} className="z-[9999] bg-popover border border-border rounded-xl shadow-xl dark:shadow-black/40 p-4 min-w-[260px] max-w-[320px] animate-popover-in">
          {/* Mode toggle */}
          <p className="text-xs font-bold text-foreground uppercase mb-2">View Mode</p>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
            <button
              onClick={() => onCalendarModeChange("assignments")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium transition-all ${
                calendarMode === "assignments"
                  ? "bg-white dark:bg-gray-700 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Assignments
            </button>
            <button
              onClick={() => onCalendarModeChange("calendar")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium transition-all ${
                calendarMode === "calendar"
                  ? "bg-white dark:bg-gray-700 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Calendar
            </button>
          </div>

          {/* Calendar picker */}
          {calendarMode === "calendar" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-foreground uppercase">Calendars</p>
                {calendars.length > 0 && (() => {
                  const allSelected = calendars.every((c) => c.selected);
                  return (
                    <button
                      onClick={() => setAllCalendars(!allSelected)}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                  );
                })()}
              </div>
              {loadingCals ? (
                <p className="text-xs text-muted-foreground">Loading...</p>
              ) : calendars.length === 0 ? (
                <p className="text-xs text-muted-foreground">No calendars found. Connect Google Calendar in Settings.</p>
              ) : (
                <div className="flex flex-col gap-0.5 max-h-[240px] overflow-y-auto">
                  {calendars.map((cal) => {
                    const displayColor = getCalColor(cal);
                    const isHovered = hoveredCal === cal.id;
                    return (
                      <div key={cal.id} className="relative">
                        <div
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => toggleCalendar(cal.id)}
                          onMouseEnter={() => setHoveredCal(cal.id)}
                          onMouseLeave={() => { if (colorPickerCal !== cal.id) setHoveredCal(null); }}
                        >
                          {/* Color dot — filled when selected, hollow when deselected */}
                          <span
                            className="block w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-colors"
                            style={{
                              borderColor: displayColor,
                              backgroundColor: cal.selected ? displayColor : "transparent",
                            }}
                          />
                          <span className={`text-xs truncate flex-1 transition-opacity ${cal.selected ? "text-foreground" : "text-muted-foreground/40"}`}>
                            {cal.summary}
                          </span>
                          {/* Color picker button — only icon on hover */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setColorPickerCal(colorPickerCal === cal.id ? null : cal.id); }}
                            className={`w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all shrink-0 ${isHovered || colorPickerCal === cal.id ? "opacity-100" : "opacity-0"}`}
                            title="Change color"
                          >
                            <Palette size={12} />
                          </button>
                        </div>
                        {/* Color picker dropdown */}
                        {colorPickerCal === cal.id && (
                          <div className="absolute right-2 top-full mt-1 z-10 bg-popover border border-border rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1.5 w-[140px]">
                            {COLOR_PRESETS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => changeCalendarColor(cal.id, c)}
                                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                                  displayColor === c ? "border-white dark:border-white scale-110" : "border-transparent"
                                }`}
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
