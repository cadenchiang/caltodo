"use client";

/**
 * Inline editor panel that appears beside a selected widget.
 * Supports live editing (auto-save on change with 150ms debounce).
 * Replaces the old centered WidgetSettingsModal.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Camera, Trash2 } from "lucide-react";
import type { WidgetInstance } from "@/lib/widget-types";
import type { GCalCalendarEntry } from "@/lib/types";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import FontPicker from "@/components/ui/FontPicker";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ColorPickerPopover from "@/components/ui/ColorPickerPopover";
import CalendarPicker from "@/components/home/CalendarPicker";
import ClockFacePicker from "@/components/home/ClockFacePicker";
import WeatherDisplayPicker from "@/components/home/WeatherDisplayPicker";
import NotesStylePicker from "@/components/home/NotesStylePicker";
import { IMAGE_WIDGET_PRESETS, IMAGE_WIDGET_PRESET_CATEGORIES } from "@/lib/image-widget-presets";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { createClient } from "@/lib/supabase/client";

export const PANEL_WIDTH = 340;
export const GAP = 16;
/** Minimum distance from any viewport edge. */
export const EDGE_PAD = 8;

/**
 * Computes the fixed position for the editor panel relative to a widget rect.
 * Ensures the panel never overflows any viewport edge.
 *
 * @param widgetRect - Bounding rect of the selected widget
 * @param viewportW - Viewport width (window.innerWidth)
 * @param viewportH - Viewport height (window.innerHeight)
 * @param panelH - Measured or estimated panel height
 * @returns { side, top, left } for the panel
 */
export function computePanelPosition(
  widgetRect: { top: number; left: number; right: number; bottom: number },
  viewportW: number,
  viewportH: number,
  panelH: number
): { side: "right" | "left"; top: number; left: number } {
  // Decide which side to place the panel
  const side: "right" | "left" =
    widgetRect.right + GAP + PANEL_WIDTH < viewportW ? "right"
    : widgetRect.left - GAP - PANEL_WIDTH > EDGE_PAD ? "left"
    : "right";

  // Horizontal position, clamped to viewport
  let left = side === "right"
    ? widgetRect.right + GAP
    : widgetRect.left - GAP - PANEL_WIDTH;
  left = Math.max(EDGE_PAD, Math.min(left, viewportW - PANEL_WIDTH - EDGE_PAD));

  // Vertical position: align to widget top, clamp to viewport
  let top = widgetRect.top;
  if (top + panelH > viewportH - EDGE_PAD) top = viewportH - panelH - EDGE_PAD;
  if (top < EDGE_PAD) top = EDGE_PAD;

  return { side, top, left };
}

/**
 * Default accent colors per widget type. Matches the fallback each widget
 * uses internally when no custom accentColor is set.
 */
const WIDGET_ACCENT_DEFAULTS: Record<string, string> = {
  "tasks-today": "#3b82f6",
  "class-progress": "#3b82f6",
  "google-calendar": "#039BE5",
  pomodoro: "#f97316",
};

const WIDGET_LABELS: Record<string, string> = {
  clock: "Clock", "tasks-today": "Tasks Widget", "class-progress": "Class Progress",
  "recent-chat": "Recent Chat", "google-calendar": "Google Calendar", image: "Image",
  notes: "Notes", weather: "Weather", "cal-chat": "Cal Chat", pomodoro: "Pomodoro",
};

const WEIGHT_OPTIONS = [
  { label: "Thin", value: "100" }, { label: "Light", value: "300" },
  { label: "Regular", value: "400" }, { label: "Medium", value: "500" }, { label: "Bold", value: "700" },
];

const TIMEZONE_OPTIONS = [
  { label: "Local (Auto)", value: "" }, { label: "New York (EST)", value: "America/New_York" },
  { label: "Chicago (CST)", value: "America/Chicago" }, { label: "Denver (MST)", value: "America/Denver" },
  { label: "Los Angeles (PST)", value: "America/Los_Angeles" }, { label: "London (GMT)", value: "Europe/London" },
  { label: "Paris (CET)", value: "Europe/Paris" }, { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Shanghai (CST)", value: "Asia/Shanghai" }, { label: "Sydney (AEST)", value: "Australia/Sydney" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
];

const SEL = "w-full px-3 py-2 rounded-lg border border-input-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

interface Props {
  widget: WidgetInstance;
  widgetRect: DOMRect;
  onClose: () => void;
  onUpdateConfig: (id: string, config: Record<string, string>) => void;
  onRemove: (id: string) => void;
  onApplyFontToAll?: (font: string) => void;
  onApplyBgResetToAll?: () => void;
  onApplyTextColorToAll?: (color: string) => void;
  savedImages: string[];
  onAddSavedImage: (url: string) => void;
}

export default function WidgetEditorPanel({
  widget, widgetRect, onClose, onUpdateConfig, onRemove,
  onApplyFontToAll, onApplyBgResetToAll, onApplyTextColorToAll,
  savedImages, onAddSavedImage,
}: Props) {
  const { boards } = useDiscussionBoards();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [side, setSide] = useState<"right" | "left">("right");
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [localConfig, setLocalConfig] = useState<Record<string, string>>({ ...widget.config });
  const initialConfigRef = useRef({ ...widget.config });
  const isFirstRender = useRef(true);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [calendars, setCalendars] = useState<GCalCalendarEntry[]>([]);
  const [calendarsLoading, setCalendarsLoading] = useState(false);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<Set<string>>(new Set(["primary"]));
  const [confirmOverlay, setConfirmOverlay] = useState<"bgReset" | "textColor" | "delete" | null>(null);
  const [expandedPresetCats, setExpandedPresetCats] = useState<Set<string>>(new Set());

  /** Toggles a preset category between collapsed (horizontal scroll) and expanded (full grid). */
  function togglePresetCat(key: string) {
    setExpandedPresetCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // Init calendar IDs from config
  useEffect(() => {
    let ids: string[] = ["primary"];
    if (widget.config.calendarIds) {
      try { ids = JSON.parse(widget.config.calendarIds); } catch { /* fallback */ }
    } else if (widget.config.calendarId) {
      ids = [widget.config.calendarId];
    }
    setSelectedCalendarIds(new Set(ids));
  }, [widget.config.calendarIds, widget.config.calendarId]);

  // Fetch calendars for google-calendar widget
  useEffect(() => {
    if (widget.type !== "google-calendar") return;
    setCalendarsLoading(true);
    fetch("/api/gcal/calendars?all=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.calendars) setCalendars(d.calendars); })
      .catch(() => {})
      .finally(() => setCalendarsLoading(false));
  }, [widget.type]);

  const updateField = useCallback((key: string, value: string) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Auto-save debounced 150ms (skip first render)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const t = setTimeout(() => onUpdateConfig(widget.id, localConfig), 150);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localConfig]);

  // Panel positioning — delegates to pure computePanelPosition()
  const updatePosition = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) return;
    const el = document.querySelector(`[data-widget-id="${widget.id}"]`);
    const rect = el ? el.getBoundingClientRect() : widgetRect;
    const pH = panelRef.current?.offsetHeight ?? 500;
    const { side: placeSide, top, left } = computePanelPosition(
      rect, window.innerWidth, window.innerHeight, pH
    );
    setSide(placeSide);
    setPanelPos({ top, left });
  }, [widget.id, widgetRect]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => { window.removeEventListener("scroll", updatePosition, true); window.removeEventListener("resize", updatePosition); };
  }, [updatePosition]);

  useEffect(() => { requestAnimationFrame(updatePosition); }, [updatePosition]);

  function handleDone() {
    const init = initialConfigRef.current;
    if (init.bgColor && !localConfig.bgColor && onApplyBgResetToAll) { setConfirmOverlay("bgReset"); return; }
    if ((localConfig.textColor || "") !== (init.textColor || "") && onApplyTextColorToAll) { setConfirmOverlay("textColor"); return; }
    triggerClose();
  }

  function triggerClose() { setIsClosing(true); }
  function handleAnimEnd() { if (isClosing) onClose(); }

  const handleCroppedUpload = useCallback(async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ext = blob.type.split("/")[1] === "jpeg" ? "jpg" : blob.type.split("/")[1];
      const path = `${user.id}/board-img-${widget.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, { cacheControl: "3600", upsert: true, contentType: blob.type });
      if (error) { console.error("Image upload failed:", error.message); return; }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      updateField("imageUrl", imageUrl);
      onAddSavedImage(imageUrl);
    } catch (err) { console.error("Image upload error:", err); }
    finally { setUploading(false); }
  }, [widget.id, updateField, onAddSavedImage]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setCropSrc(URL.createObjectURL(f));
    e.target.value = "";
  }

  function handleCalToggle(id: string) {
    setSelectedCalendarIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      updateField("calendarIds", JSON.stringify([...next]));
      const colorMap: Record<string, string> = {};
      for (const c of calendars) { if (next.has(c.id)) colorMap[c.id] = c.backgroundColor; }
      if (Object.keys(colorMap).length > 0) updateField("calendarColors", JSON.stringify(colorMap));
      return next;
    });
  }

  const label = WIDGET_LABELS[widget.type] || "Widget";
  const animClass = isClosing
    ? (isMobile ? "animate-editor-sheet-out" : `animate-editor-panel-out-${side}`)
    : (isMobile ? "animate-editor-sheet-in" : `animate-editor-panel-in-${side}`);

  const panelCls = isMobile
    ? `fixed bottom-0 left-0 right-0 z-[52] max-h-[60vh] bg-popover border-t border-border rounded-t-2xl shadow-2xl flex flex-col ${animClass}`
    : `fixed z-[52] bg-popover border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] ${animClass}`;

  const panelStyle = isMobile ? undefined : { top: panelPos.top, left: panelPos.left, width: PANEL_WIDTH };

  return (
    <div ref={panelRef} className={panelCls} style={panelStyle} onAnimationEnd={handleAnimEnd}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-foreground">{label} Settings</h2>
        <button onClick={handleDone} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      {/* Body — scrollable settings */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1 text-sm">
        {/* Clock */}
        {widget.type === "clock" && <>
          <ClockFacePicker value={localConfig.clockFace || "digital"} onChange={(v) => updateField("clockFace", v)} />
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Time Format</label><SegmentedControl options={[{ value: "12", label: "12h" }, { value: "24", label: "24h" }]} value={localConfig.clockFormat || "12"} onChange={(v) => updateField("clockFormat", v)} /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Timezone</label><select value={localConfig.clockTimezone || ""} onChange={(e) => updateField("clockTimezone", e.target.value)} className={SEL}>{TIMEZONE_OPTIONS.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Font Weight</label><select value={localConfig.clockFontWeight || "300"} onChange={(e) => updateField("clockFontWeight", e.target.value)} className={SEL}>{WEIGHT_OPTIONS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}</select></div>
        </>}

        {/* Tasks */}
        {widget.type === "tasks-today" && <>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">View Mode</label><SegmentedControl options={[{ value: "today", label: "Today" }, { value: "week", label: "Week" }, { value: "inbox", label: "All" }]} value={localConfig.viewMode || "today"} onChange={(v) => updateField("viewMode", v)} /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Show Completed</label><SegmentedControl options={[{ value: "true", label: "Show" }, { value: "false", label: "Hide" }]} value={localConfig.showCompleted ?? "true"} onChange={(v) => updateField("showCompleted", v)} /></div>
        </>}

        {/* Class Progress */}
        {widget.type === "class-progress" && <div><label className="block text-sm font-medium text-foreground mb-1.5">Sort Courses By</label><select value={localConfig.progressSort || "count"} onChange={(e) => updateField("progressSort", e.target.value)} className={SEL}><option value="count">Most tasks first</option><option value="alpha">Alphabetical</option><option value="completion">Completion % (highest first)</option></select></div>}

        {/* Recent Chat */}
        {widget.type === "recent-chat" && <div><label className="block text-sm font-medium text-foreground mb-1.5">Course</label>{boards.length === 0 ? <p className="text-sm text-muted-foreground">No courses available</p> : <select value={localConfig.courseId || ""} onChange={(e) => updateField("courseId", e.target.value)} className={SEL}><option value="">Auto (first course)</option>{boards.map((b) => <option key={b.course.id} value={b.course.id}>{b.course.name}</option>)}</select>}</div>}

        {/* Google Calendar */}
        {widget.type === "google-calendar" && <>
          <CalendarPicker calendars={calendars} selectedIds={selectedCalendarIds} onToggle={handleCalToggle} onSelectAll={() => { setSelectedCalendarIds(new Set(calendars.map((c) => c.id))); updateField("calendarIds", JSON.stringify(calendars.map((c) => c.id))); }} onDeselectAll={() => { setSelectedCalendarIds(new Set()); updateField("calendarIds", "[]"); }} loading={calendarsLoading} />
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Default View</label><select value={localConfig.viewMode || "week"} onChange={(e) => updateField("viewMode", e.target.value)} className={SEL}><option value="today">Today</option><option value="2day">2 Days</option><option value="3day">3 Days</option><option value="4day">4 Days</option><option value="5day">5 Days</option><option value="week">Week</option><option value="month">Month</option><option value="custom">Custom...</option></select></div>
          {localConfig.viewMode === "custom" && <div><label className="block text-sm font-medium text-foreground mb-1.5">Number of Days</label><input type="number" min={1} max={90} value={localConfig.customDays || "7"} onChange={(e) => updateField("customDays", e.target.value)} className={SEL} /></div>}
        </>}

        {/* Image */}
        {widget.type === "image" && <div className="space-y-6">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-foreground hover:border-foreground/30 transition-colors"><Camera size={14} />{uploading ? "Uploading\u2026" : "Upload Image"}</button>
          {savedImages.length > 0 && <>
            <label className="block text-xs font-medium text-foreground">Your Images</label>
            <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto">{savedImages.map((url) => <button key={url} type="button" onClick={() => updateField("imageUrl", url)} className={`rounded-md overflow-hidden aspect-[4/3] transition-all ${localConfig.imageUrl === url ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-400"}`}><img src={url} alt="" className="w-full h-full object-cover" loading="lazy" /></button>)}</div>
          </>}
          <label className="block text-xs font-medium text-foreground">Preset Images</label>
          {IMAGE_WIDGET_PRESET_CATEGORIES.map((cat) => {
            const catKey = `iwc-${cat.label}`;
            const isExpanded = expandedPresetCats.has(catKey);
            return (
              <div key={cat.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium text-foreground">{cat.label}</p>
                  {cat.presets.length > 4 && (
                    <button
                      type="button"
                      onClick={() => togglePresetCat(catKey)}
                      className="text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? "Show Less" : `Show All (${cat.presets.length})`}
                    </button>
                  )}
                </div>
                {isExpanded ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {cat.presets.map((p) => (
                      <button key={p.id} type="button" onClick={() => updateField("imageUrl", `preset:${p.id}`)} className={`rounded-md overflow-hidden aspect-[4/3] transition-all ${localConfig.imageUrl === `preset:${p.id}` ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-400"}`} title={p.label}>
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex overflow-x-auto gap-1.5 scrollbar-none">
                    {cat.presets.map((p) => (
                      <button key={p.id} type="button" onClick={() => updateField("imageUrl", `preset:${p.id}`)} className={`shrink-0 w-[72px] rounded-md overflow-hidden transition-all ${localConfig.imageUrl === `preset:${p.id}` ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-400"}`} title={p.label}>
                        <div className="aspect-[4/3]">
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {localConfig.imageUrl && <button type="button" onClick={() => updateField("imageUrl", "")} className="text-xs text-red-500 hover:text-red-600 transition-colors">Remove image</button>}
        </div>}

        {/* Weather */}
        {widget.type === "weather" && <>
          <WeatherDisplayPicker value={localConfig.weatherDisplay || "standard"} onChange={(v) => updateField("weatherDisplay", v)} />
          <div><label className="block text-sm font-medium text-foreground mb-1.5">View</label><SegmentedControl options={[{ value: "today", label: "Today" }, { value: "week", label: "7-Day" }]} value={localConfig.weatherView || "today"} onChange={(v) => updateField("weatherView", v)} /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Temperature</label><SegmentedControl options={[{ value: "F", label: "\u00b0F" }, { value: "C", label: "\u00b0C" }]} value={localConfig.tempUnit || "F"} onChange={(v) => updateField("tempUnit", v)} /></div>
        </>}

        {/* Notes */}
        {widget.type === "notes" && <>
          <NotesStylePicker value={localConfig.notesStyle || "blank"} onChange={(v) => updateField("notesStyle", v)} />
        </>}

        {/* Divider + Appearance */}
        <div className="border-t border-border" />
        <p className="text-xs font-medium text-foreground">Appearance</p>
        <div className="flex items-end justify-center gap-5">
          <ColorPickerPopover label="Text" value={localConfig.textColor || ""} onChange={(v) => updateField("textColor", v)} layout="compact" defaultValue="var(--foreground)" />
          <ColorPickerPopover label="Background" value={localConfig.bgColor || ""} onChange={(v) => updateField("bgColor", v)} layout="compact" />
          <ColorPickerPopover label="Accent" value={localConfig.accentColor || ""} onChange={(v) => updateField("accentColor", v)} layout="compact" defaultValue={WIDGET_ACCENT_DEFAULTS[widget.type]} />
        </div>
        <div><label className="block text-sm font-medium text-foreground mb-1.5">Font (all widgets)</label><FontPicker value={localConfig.fontFamily || ""} onChange={(v) => { updateField("fontFamily", v); onApplyFontToAll?.(v); }} /></div>

      </div>

      {/* Footer — Delete (left) & Done (right) */}
      <div className="flex items-center justify-between p-3 border-t border-border shrink-0">
        <button
          onClick={() => setConfirmOverlay("delete")}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
          aria-label="Remove Widget"
        >
          <Trash2 size={15} />
        </button>
        <button
          onClick={handleDone}
          className="px-5 py-2 text-sm font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm active:scale-[0.97] transition-all duration-200"
        >
          Done
        </button>
      </div>

      {cropSrc && <ImageCropModal open imageSrc={cropSrc} aspect={4 / 3} onCrop={handleCroppedUpload} onClose={() => setCropSrc(null)} />}

      {/* Confirm overlays */}
      {confirmOverlay === "bgReset" && <ConfirmPanel message="Reset background on all widgets?" onYes={() => { onApplyBgResetToAll?.(); setConfirmOverlay(null); triggerClose(); }} onNo={() => { setConfirmOverlay(null); triggerClose(); }} yesLabel="Reset all" noLabel="Just this one" />}
      {confirmOverlay === "textColor" && <ConfirmPanel message="Apply this text color to all widgets?" onYes={() => { onApplyTextColorToAll?.(localConfig.textColor || ""); setConfirmOverlay(null); triggerClose(); }} onNo={() => { setConfirmOverlay(null); triggerClose(); }} yesLabel="Apply to all" noLabel="Just this one" />}
      {confirmOverlay === "delete" && <ConfirmPanel message="Remove this widget?" subtitle="This action cannot be undone." onYes={() => { onRemove(widget.id); onClose(); }} onNo={() => setConfirmOverlay(null)} yesLabel="Remove" noLabel="Cancel" destructive />}
    </div>
  );
}

/** Inline confirmation overlay. */
function ConfirmPanel({ message, subtitle, onYes, onNo, yesLabel, noLabel, destructive }: {
  message: string; subtitle?: string; onYes: () => void; onNo: () => void;
  yesLabel: string; noLabel: string; destructive?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-10 bg-card/95 flex flex-col items-center justify-center p-6 text-center rounded-2xl">
      <p className="text-sm font-medium text-foreground mb-1">{message}</p>
      {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className="flex gap-2">
        <button onClick={onNo} className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:bg-muted transition-colors">{noLabel}</button>
        <button onClick={onYes} className={`px-4 py-2 text-sm rounded-xl text-white transition-colors ${destructive ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}>{yesLabel}</button>
      </div>
    </div>
  );
}
