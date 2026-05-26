"use client";

/**
 * Inline editor panel that appears beside a selected widget.
 * Supports live editing (auto-save on change with 150ms debounce).
 * Replaces the old centered WidgetSettingsModal.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Camera, Trash2, CheckSquare, ImageIcon, GraduationCap,
  Calendar, FileText, CloudSun, MessagesSquare, Timer,
  Hourglass, Link, Flame, Quote, BarChart3, Grid3X3, Smile, Music,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WidgetInstance } from "@/lib/widget-types";
import type { GCalCalendarEntry } from "@/lib/types";
import { useDiscussionBoards } from "@/hooks/useDiscussionBoards";
import FontPicker from "@/components/ui/FontPicker";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ColorPickerPopover from "@/components/ui/ColorPickerPopover";
import { useTheme } from "@/contexts/ThemeContext";
import CalendarPicker from "@/components/home/CalendarPicker";
import CollapsibleSection from "@/components/home/CollapsibleSection";
import WeatherDisplayPicker from "@/components/home/WeatherDisplayPicker";
import GCalDisplayPicker from "@/components/home/GCalDisplayPicker";
import NotesStylePicker from "@/components/home/NotesStylePicker";
import { IMAGE_WIDGET_PRESETS, IMAGE_WIDGET_PRESET_CATEGORIES } from "@/lib/image-widget-presets";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { createClient } from "@/lib/supabase/client";
import {
  SIDE_PANEL_WIDTH,
  SIDE_PANEL_GAP,
  SIDE_PANEL_EDGE_PAD,
  computeSidePanelPosition,
} from "@/components/ui/SidePanel";

/** @deprecated Use SIDE_PANEL_WIDTH from SidePanel instead. */
export const PANEL_WIDTH = SIDE_PANEL_WIDTH;
/** @deprecated Use SIDE_PANEL_GAP from SidePanel instead. */
export const GAP = SIDE_PANEL_GAP;
/** @deprecated Use SIDE_PANEL_EDGE_PAD from SidePanel instead. */
export const EDGE_PAD = SIDE_PANEL_EDGE_PAD;

/**
 * Computes the fixed position for the editor panel relative to a widget rect.
 * Delegates to the shared computeSidePanelPosition utility.
 *
 * @deprecated Use computeSidePanelPosition from SidePanel instead.
 */
export const computePanelPosition = computeSidePanelPosition;

/**
 * Default accent colors per widget type. Matches the fallback each widget
 * uses internally when no custom accentColor is set.
 */
const WIDGET_ACCENT_DEFAULTS: Record<string, string> = {
  "tasks-today": "#0e89d6",
  "class-progress": "#0e89d6",
  "google-calendar": "#4285F4",
  pomodoro: "#4285F4",
  quote: "#4285F4",
  stats: "#4285F4",
  countdown: "#4285F4",
};

const WIDGET_LABELS: Record<string, string> = {
  "tasks-today": "Tasks Widget", "class-progress": "Class Progress",
  "google-calendar": "Google Calendar", image: "Image",
  notes: "Notes", weather: "Weather", "cal-chat": "Cal Chat", pomodoro: "Pomodoro",
  countdown: "Countdown", "quick-links": "Quick Links", "habit-tracker": "Habit Tracker",
  quote: "Quote", stats: "Stats", "weekly-heatmap": "Activity", sticker: "Sticker", spotify: "Spotify",
  courses: "Courses",
};

/** Maps widget type to its lucide-react icon component for the editor header. */
const WIDGET_ICONS: Record<string, LucideIcon> = {
  "tasks-today": CheckSquare, "class-progress": GraduationCap,
  "google-calendar": Calendar, image: ImageIcon,
  notes: FileText, weather: CloudSun, "cal-chat": MessagesSquare, pomodoro: Timer,
  countdown: Hourglass, "quick-links": Link, "habit-tracker": Flame,
  quote: Quote, stats: BarChart3, "weekly-heatmap": Grid3X3, sticker: Smile, spotify: Music,
  courses: GraduationCap,
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

/**
 * Widget types whose only edit affordance is *inside* the widget itself
 * (click-to-edit text, plus buttons, etc.). The editor panel shows a
 * gentle hint pointing the user back at the widget instead of an empty
 * settings list.
 */
const INLINE_EDIT_WIDGETS = new Set<string>([
  "notes",
  "pomodoro",
  "quick-links",
  "daily-reminders",
]);

/**
 * Widget types that have no settings at all — they render purely from
 * the user's data (auth profile, tasks, courses). The editor panel
 * shows a message acknowledging that.
 */
const DISPLAY_ONLY_WIDGETS = new Set<string>([
  "profile",
  "intro",
  "cal-chat",
  "weekly-heatmap",
  "mini-calendar",
  "courses",
]);

interface Props {
  widget: WidgetInstance;
  widgetRect: DOMRect;
  onClose: () => void;
  onUpdateConfig: (id: string, config: Record<string, string>) => void;
  onRemove: (id: string) => void;
  onApplyFontToAll?: (font: string) => void;
  onApplyBgResetToAll?: () => void;
  onApplyTextColorToAll?: (color: string) => void;
  onApplyBorderToAll?: (value: string) => void;
  onApplyAccentToAll?: (color: string) => void;
  savedImages: string[];
  onAddSavedImage: (url: string) => void;
}

export default function WidgetEditorPanel({
  widget, widgetRect, onClose, onUpdateConfig, onRemove,
  onApplyFontToAll, onApplyBgResetToAll, onApplyTextColorToAll, onApplyBorderToAll, onApplyAccentToAll,
  savedImages, onAddSavedImage,
}: Props) {
  const { boards } = useDiscussionBoards();
  const { colorTheme } = useTheme();
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
  const [confirmOverlay, setConfirmOverlay] = useState<"bgReset" | "textColor" | "border" | "delete" | null>(null);
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

  // Reposition when async content loads (e.g. calendar list) changes panel height
  useEffect(() => { requestAnimationFrame(updatePosition); }, [calendars, updatePosition]);

  function handleDone() {
    const init = initialConfigRef.current;
    if (!colorTheme) {
      if (init.bgColor && !localConfig.bgColor && onApplyBgResetToAll) { setConfirmOverlay("bgReset"); return; }
      if ((localConfig.textColor || "") !== (init.textColor || "") && onApplyTextColorToAll) { setConfirmOverlay("textColor"); return; }
    }
    if ((localConfig.widgetBorder || "true") !== (init.widgetBorder || "true") && onApplyBorderToAll) { setConfirmOverlay("border"); return; }
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
  const IconComponent = WIDGET_ICONS[widget.type];
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
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          {IconComponent && <IconComponent size={15} className="text-foreground shrink-0" />}
          {label} Settings
        </h2>
        <button onClick={handleDone} className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      {/* Body — scrollable settings */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1 text-sm">
        {/* Tasks — single view, only the show-completed toggle remains. */}
        {widget.type === "tasks-today" && (
          <CollapsibleSection title="Show Completed"><SegmentedControl options={[{ value: "true", label: "Show" }, { value: "false", label: "Hide" }]} value={localConfig.showCompleted ?? "true"} onChange={(v) => updateField("showCompleted", v)} /></CollapsibleSection>
        )}

        {/* Class Progress */}
        {widget.type === "class-progress" && <CollapsibleSection title="Sort Courses By"><select value={localConfig.progressSort || "count"} onChange={(e) => updateField("progressSort", e.target.value)} className={SEL}><option value="count">Most tasks first</option><option value="alpha">Alphabetical</option><option value="completion">Completion % (highest first)</option></select></CollapsibleSection>}

        {/* Google Calendar — single view, only the calendar picker remains. */}
        {widget.type === "google-calendar" && (
          <CollapsibleSection title="Calendars" hint={`${selectedCalendarIds.size} of ${calendars.length}`}><CalendarPicker calendars={calendars} selectedIds={selectedCalendarIds} onToggle={handleCalToggle} onSelectAll={() => { setSelectedCalendarIds(new Set(calendars.map((c) => c.id))); updateField("calendarIds", JSON.stringify(calendars.map((c) => c.id))); }} onDeselectAll={() => { setSelectedCalendarIds(new Set()); updateField("calendarIds", "[]"); }} loading={calendarsLoading} /></CollapsibleSection>
        )}

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
                      className="text-[9px] text-foreground hover:text-foreground transition-colors"
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

        {/* Weather \u2014 single view, only temperature unit remains. */}
        {widget.type === "weather" && (
          <CollapsibleSection title="Temperature" hint={localConfig.tempUnit === "C" ? "\u00b0C" : "\u00b0F"}><SegmentedControl options={[{ value: "F", label: "\u00b0F" }, { value: "C", label: "\u00b0C" }]} value={localConfig.tempUnit || "F"} onChange={(v) => updateField("tempUnit", v)} /></CollapsibleSection>
        )}

        {/* Notes \u2014 single default style, no picker. */}

        {/* Countdown */}
        {widget.type === "countdown" && <>
          <CollapsibleSection title="Mode" hint={localConfig.countdownMode || "auto"}>
            <SegmentedControl options={[{ value: "auto", label: "Auto" }, { value: "custom", label: "Custom" }]} value={localConfig.countdownMode || "auto"} onChange={(v) => updateField("countdownMode", v)} />
            {(localConfig.countdownMode || "auto") === "auto" && <p className="text-xs text-foreground mt-2">Automatically shows your next upcoming deadline.</p>}
          </CollapsibleSection>
          {localConfig.countdownMode === "custom" && <>
            <CollapsibleSection title="Target Date"><input type="date" value={localConfig.countdownDate || ""} onChange={(e) => updateField("countdownDate", e.target.value)} className={SEL} /></CollapsibleSection>
            <CollapsibleSection title="Label"><input type="text" placeholder="e.g. Spring Break" value={localConfig.countdownLabel || ""} onChange={(e) => updateField("countdownLabel", e.target.value)} className={SEL} /></CollapsibleSection>
          </>}
        </>}

        {/* Habit Tracker */}
        {widget.type === "habit-tracker" && (
          <CollapsibleSection title="Habit Name"><input type="text" placeholder="e.g. Study 2 hours" value={localConfig.habitName || ""} onChange={(e) => updateField("habitName", e.target.value)} className={SEL} /></CollapsibleSection>
        )}

        {/* Quote */}
        {widget.type === "quote" && (
          <CollapsibleSection title="Category" hint={localConfig.quoteCategory || "all"}><select value={localConfig.quoteCategory || "all"} onChange={(e) => updateField("quoteCategory", e.target.value)} className={SEL}><option value="all">All</option><option value="motivation">Motivation</option><option value="study">Study</option><option value="productivity">Productivity</option></select></CollapsibleSection>
        )}

        {/* Stats */}
        {widget.type === "stats" && (
          <CollapsibleSection title="Metric"><select value={localConfig.statsMetric || "completion"} onChange={(e) => updateField("statsMetric", e.target.value)} className={SEL}><option value="completion">Completion Rate</option><option value="completed-week">Completed This Week</option><option value="streak">Day Streak</option><option value="pending">Tasks Remaining</option></select></CollapsibleSection>
        )}

        {/* Sticker */}
        {widget.type === "sticker" && <>
          <CollapsibleSection title="Emoji" hint={localConfig.stickerEmoji || ""}><input type="text" value={localConfig.stickerEmoji || "✨"} onChange={(e) => updateField("stickerEmoji", e.target.value)} className={SEL} maxLength={4} /></CollapsibleSection>
          <CollapsibleSection title="Caption"><input type="text" placeholder="Optional text" value={localConfig.stickerText || ""} onChange={(e) => updateField("stickerText", e.target.value)} className={SEL} /></CollapsibleSection>
        </>}

        {/* Spotify — only the URL remains; the player uses one default theme. */}
        {widget.type === "spotify" && (
          <CollapsibleSection title="Spotify URL"><input type="text" placeholder="https://open.spotify.com/track/..." value={localConfig.spotifyUrl || ""} onChange={(e) => updateField("spotifyUrl", e.target.value)} className={SEL} /><p className="text-[10px] text-foreground mt-1">Paste a link to a track, album, playlist, or podcast from Spotify.</p></CollapsibleSection>
        )}

        {/* Empty-state messages for widgets that have no panel settings:
            click-to-edit widgets get pointed back at the widget itself,
            pure-display widgets get a short note explaining there's
            nothing to configure. Keeps the panel from opening onto a
            blank screen and turning the delete button into the only
            visible action. */}
        {INLINE_EDIT_WIDGETS.has(widget.type) && (
          <p className="text-xs text-muted-foreground px-1 py-2 leading-relaxed">
            Click into the widget itself to edit its contents.
          </p>
        )}
        {DISPLAY_ONLY_WIDGETS.has(widget.type) && (
          <p className="text-xs text-muted-foreground px-1 py-2 leading-relaxed">
            This widget renders automatically from your data. Nothing to configure here.
          </p>
        )}

      </div>

      {/* Footer — Delete (left) & Done (right) */}
      <div className="flex items-center justify-between p-3 border-t border-border shrink-0">
        <button
          onClick={() => setConfirmOverlay("delete")}
          className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
          aria-label="Remove Widget"
        >
          <Trash2 size={15} />
        </button>
        <button
          onClick={handleDone}
          style={{ height: 30 }}
          className="px-4 text-sm font-semibold rounded-xl bg-blue-500 text-white hover:bg-blue-500/90 shadow-sm active:scale-[0.97] transition-all"
        >
          Done
        </button>
      </div>

      {cropSrc && <ImageCropModal open imageSrc={cropSrc} aspect={4 / 3} onCrop={handleCroppedUpload} onClose={() => setCropSrc(null)} />}

      {/* Confirm overlays */}
      {confirmOverlay === "bgReset" && <ConfirmPanel message="Reset background on all widgets?" onYes={() => { onApplyBgResetToAll?.(); setConfirmOverlay(null); triggerClose(); }} onNo={() => { setConfirmOverlay(null); triggerClose(); }} yesLabel="Reset all" noLabel="Just this one" />}
      {confirmOverlay === "textColor" && <ConfirmPanel message="Apply this text color to all widgets?" onYes={() => { onApplyTextColorToAll?.(localConfig.textColor || ""); setConfirmOverlay(null); triggerClose(); }} onNo={() => { setConfirmOverlay(null); triggerClose(); }} yesLabel="Apply to all" noLabel="Just this one" />}
      {confirmOverlay === "border" && <ConfirmPanel message={`${localConfig.widgetBorder === "false" ? "Hide" : "Show"} border on all widgets?`} onYes={() => { onApplyBorderToAll?.(localConfig.widgetBorder || "true"); setConfirmOverlay(null); triggerClose(); }} onNo={() => { setConfirmOverlay(null); triggerClose(); }} yesLabel="Apply to all" noLabel="Just this one" />}
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
      {subtitle && <p className="text-xs text-foreground mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className="flex gap-2">
        <button onClick={onNo} className="px-4 py-2 text-sm rounded-xl text-foreground hover:bg-muted transition-colors">{noLabel}</button>
        <button onClick={onYes} className={`px-4 py-2 text-sm rounded-xl text-white transition-colors ${destructive ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}>{yesLabel}</button>
      </div>
    </div>
  );
}
