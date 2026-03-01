"use client";

/**
 * Per-widget settings modal. Opens when clicking a widget in edit mode.
 * Every widget type has its own settings section.
 * Universal style settings (text color, background color, font) for all widgets.
 * "Apply font to all" confirmation when changing font.
 *
 * @param open - Whether the modal is visible
 * @param widget - The widget instance being configured (null if closed)
 * @param onClose - Callback to close the modal
 * @param onSave - Callback with updated config when saved
 * @param onRemove - Callback to remove this widget
 * @param onApplyFontToAll - Callback to apply a font to all widgets
 */

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { WidgetInstance } from "@/lib/widget-types";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import FontPicker from "@/components/ui/FontPicker";

/** Available font weights for clock widget. */
const WEIGHT_OPTIONS: { label: string; value: string }[] = [
  { label: "Thin", value: "100" },
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Bold", value: "700" },
];

/** Common timezone options. */
const TIMEZONE_OPTIONS: { label: string; value: string }[] = [
  { label: "Local (Auto)", value: "" },
  { label: "New York (EST)", value: "America/New_York" },
  { label: "Chicago (CST)", value: "America/Chicago" },
  { label: "Denver (MST)", value: "America/Denver" },
  { label: "Los Angeles (PST)", value: "America/Los_Angeles" },
  { label: "London (GMT)", value: "Europe/London" },
  { label: "Paris (CET)", value: "Europe/Paris" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Shanghai (CST)", value: "Asia/Shanghai" },
  { label: "Sydney (AEST)", value: "Australia/Sydney" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
];


interface WidgetSettingsModalProps {
  open: boolean;
  widget: WidgetInstance | null;
  onClose: () => void;
  onSave: (id: string, config: Record<string, string>) => void;
  onRemove?: (id: string) => void;
  onApplyFontToAll?: (font: string) => void;
  onApplyBgResetToAll?: () => void;
}

/** Human-readable labels per widget type. */
const WIDGET_LABELS: Record<string, string> = {
  clock: "Clock",
  "tasks-today": "Tasks",
  "class-progress": "Class Progress",
  "recent-chat": "Recent Chat",
  "google-calendar": "Google Calendar",
  image: "Image",
  notes: "Notes",
  weather: "Weather",
  "cal-chat": "Cal Chat",
};

/** Shared select element classes. */
const SELECT_CLS = "w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function WidgetSettingsModal({
  open,
  widget,
  onClose,
  onSave,
  onRemove,
  onApplyFontToAll,
  onApplyBgResetToAll,
}: WidgetSettingsModalProps) {
  const { boards } = useDiscussionBoards();

  // Per-widget config state
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCalendarId, setSelectedCalendarId] = useState("");
  const [selectedViewMode, setSelectedViewMode] = useState("week");
  const [clockFormat, setClockFormat] = useState("12");
  const [clockTimezone, setClockTimezone] = useState("");
  const [clockFontWeight, setClockFontWeight] = useState("300");
  const [showCompleted, setShowCompleted] = useState("true");
  const [taskViewMode, setTaskViewMode] = useState("today");
  const [progressSort, setProgressSort] = useState("count");
  const [removeImage, setRemoveImage] = useState(false);
  const [weatherView, setWeatherView] = useState("today");
  const [tempUnit, setTempUnit] = useState("F");

  // Universal style state
  const [textColor, setTextColor] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [fontFamily, setFontFamily] = useState("");

  // Apply-to-all confirmations
  const [showFontConfirm, setShowFontConfirm] = useState(false);
  const [pendingFont, setPendingFont] = useState("");
  const [showBgResetConfirm, setShowBgResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize from widget config when modal opens
  useEffect(() => {
    if (widget) {
      setSelectedCourseId(widget.config.courseId || "");
      setSelectedCalendarId(widget.config.calendarId || "");
      setSelectedViewMode(widget.config.viewMode || "week");
      setClockFormat(widget.config.clockFormat || "12");
      setClockTimezone(widget.config.clockTimezone || "");
      setClockFontWeight(widget.config.clockFontWeight || "300");
      setShowCompleted(widget.config.showCompleted ?? "true");
      setTaskViewMode(widget.config.viewMode || "today");
      setProgressSort(widget.config.progressSort || "count");
      setRemoveImage(false);
      setWeatherView(widget.config.weatherView || "today");
      setTempUnit(widget.config.tempUnit || "F");
      // Universal style
      setTextColor(widget.config.textColor || "");
      setBgColor(widget.config.bgColor || "");
      setFontFamily(widget.config.fontFamily || "");
      setShowFontConfirm(false);
      setShowBgResetConfirm(false);
      setShowDeleteConfirm(false);
    }
  }, [widget]);

  if (!open || !widget) return null;

  const label = WIDGET_LABELS[widget.type] || "Widget";

  /** Collects config for the current widget type + universal style and saves. */
  function handleSave() {
    const config: Record<string, string> = {};

    // Universal style
    config.textColor = textColor;
    config.bgColor = bgColor;
    config.fontFamily = fontFamily;

    // Type-specific
    switch (widget!.type) {
      case "clock":
        config.clockFormat = clockFormat;
        config.clockTimezone = clockTimezone;
        config.clockFontWeight = clockFontWeight;
        break;
      case "tasks-today":
        config.showCompleted = showCompleted;
        config.viewMode = taskViewMode;
        break;
      case "class-progress":
        config.progressSort = progressSort;
        break;
      case "recent-chat":
        if (selectedCourseId) config.courseId = selectedCourseId;
        break;
      case "google-calendar":
        if (selectedCalendarId) config.calendarId = selectedCalendarId;
        config.viewMode = selectedViewMode;
        break;
      case "image":
        if (removeImage) config.imageUrl = "";
        break;
      case "weather":
        config.weatherView = weatherView;
        config.tempUnit = tempUnit;
        break;
    }

    onSave(widget!.id, config);

    // Check if background was reset — offer to reset all
    const hadBg = !!(widget!.config.bgColor);
    if (hadBg && !bgColor && onApplyBgResetToAll) {
      setShowBgResetConfirm(true);
      return;
    }

    // Check if font changed — offer to apply to all
    if (fontFamily && fontFamily !== (widget!.config.fontFamily || "") && onApplyFontToAll) {
      setPendingFont(fontFamily);
      setShowFontConfirm(true);
      return;
    }

    onClose();
  }

  /**
   * Renders a compact color input with a native color wheel and reset button.
   *
   * @param value - Current hex color value (empty string = default)
   * @param onChange - Callback with new hex value
   * @param labelText - Label displayed beside the input
   */
  function ColorInput({
    value,
    onChange,
    labelText,
  }: {
    value: string;
    onChange: (v: string) => void;
    labelText: string;
  }) {
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm text-foreground">{labelText}</label>
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-border cursor-pointer">
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            />
            <div
              className="w-full h-full"
              style={{ backgroundColor: value || "var(--muted)" }}
            />
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-popover rounded-2xl shadow-2xl border border-border w-full max-w-md mx-4 animate-announce-card-in overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">
            {label} Settings
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Settings content — scrollable */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1">

          {/* ── Clock settings ── */}
          {widget.type === "clock" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Time Format</label>
                <select value={clockFormat} onChange={(e) => setClockFormat(e.target.value)} className={SELECT_CLS}>
                  <option value="12">12-hour (2:30 PM)</option>
                  <option value="24">24-hour (14:30)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                <select value={clockTimezone} onChange={(e) => setClockTimezone(e.target.value)} className={SELECT_CLS}>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Font Weight</label>
                <select value={clockFontWeight} onChange={(e) => setClockFontWeight(e.target.value)} className={SELECT_CLS}>
                  {WEIGHT_OPTIONS.map((w) => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* ── Tasks settings ── */}
          {widget.type === "tasks-today" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">View Mode</label>
                <select value={taskViewMode} onChange={(e) => setTaskViewMode(e.target.value)} className={SELECT_CLS}>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="inbox">All Inbox</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Show Completed Tasks</label>
                <select value={showCompleted} onChange={(e) => setShowCompleted(e.target.value)} className={SELECT_CLS}>
                  <option value="true">Show completed</option>
                  <option value="false">Hide completed</option>
                </select>
              </div>
            </>
          )}

          {/* ── Class Progress settings ── */}
          {widget.type === "class-progress" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort Courses By</label>
              <select value={progressSort} onChange={(e) => setProgressSort(e.target.value)} className={SELECT_CLS}>
                <option value="count">Most tasks first</option>
                <option value="alpha">Alphabetical</option>
                <option value="completion">Completion % (highest first)</option>
              </select>
            </div>
          )}

          {/* ── Recent Chat settings ── */}
          {widget.type === "recent-chat" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Course</label>
              {boards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses available</p>
              ) : (
                <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className={SELECT_CLS}>
                  <option value="">Auto (first course)</option>
                  {boards.map((b) => (
                    <option key={b.course.id} value={b.course.id}>{b.course.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* ── Google Calendar settings ── */}
          {widget.type === "google-calendar" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Calendar ID</label>
                <input
                  type="text"
                  value={selectedCalendarId}
                  onChange={(e) => setSelectedCalendarId(e.target.value)}
                  placeholder="primary"
                  className={SELECT_CLS}
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty for primary calendar</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Default View</label>
                <select value={selectedViewMode} onChange={(e) => setSelectedViewMode(e.target.value)} className={SELECT_CLS}>
                  <option value="today">Today</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
            </>
          )}

          {/* ── Image settings ── */}
          {widget.type === "image" && (
            <div>
              {widget.config.imageUrl ? (
                <div className="space-y-3">
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                    <img src={widget.config.imageUrl} alt="Current image" className="w-full h-full object-cover" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} className="rounded" />
                    Remove image
                  </label>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No image set. Drag an image onto the widget.</p>
              )}
            </div>
          )}

          {/* ── Weather settings ── */}
          {widget.type === "weather" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">View</label>
                <select value={weatherView} onChange={(e) => setWeatherView(e.target.value)} className={SELECT_CLS}>
                  <option value="today">Today</option>
                  <option value="week">7-Day Forecast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Temperature Unit</label>
                <select value={tempUnit} onChange={(e) => setTempUnit(e.target.value)} className={SELECT_CLS}>
                  <option value="F">Fahrenheit (°F)</option>
                  <option value="C">Celsius (°C)</option>
                </select>
              </div>
            </>
          )}

          {/* ── Divider ── */}
          <div className="border-t border-border" />

          {/* ── Universal Style Settings ── */}
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Style</p>

          <ColorInput labelText="Text Color" value={textColor} onChange={setTextColor} />
          <ColorInput labelText="Background" value={bgColor} onChange={setBgColor} />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Font</label>
            <FontPicker value={fontFamily} onChange={setFontFamily} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border shrink-0">
          {onRemove ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Remove Widget
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Apply font to all confirmation */}
        {showFontConfirm && (
          <div className="absolute inset-0 z-10 bg-card/95 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-medium text-foreground mb-4">
              Apply this font to all widgets?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowFontConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                Just this one
              </button>
              <button
                onClick={() => {
                  onApplyFontToAll?.(pendingFont);
                  setShowFontConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Apply to all
              </button>
            </div>
          </div>
        )}

        {/* Reset background for all confirmation */}
        {showBgResetConfirm && (
          <div className="absolute inset-0 z-10 bg-card/95 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-medium text-foreground mb-4">
              Reset background on all widgets?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowBgResetConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                Just this one
              </button>
              <button
                onClick={() => {
                  onApplyBgResetToAll?.();
                  setShowBgResetConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Reset all
              </button>
            </div>
          </div>
        )}

        {/* Confirm delete widget */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-10 bg-card/95 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              Remove this widget?
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRemove?.(widget!.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
