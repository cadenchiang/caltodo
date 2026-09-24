"use client";

import { useRef, useState } from "react";
import { ArrowUpDown, CalendarDays, ChevronDown, GraduationCap, LayoutGrid, List, MoreHorizontal, Plus, RefreshCw } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import Popover from "@/components/ui/Popover";
import { MENU_ITEM } from "@/components/tasks/shared/SnoozeMenu";
import { useNow } from "@/hooks/useNow";
import { trackEvent } from "@/lib/analytics";
import { FILTER_OPTIONS, formatSyncedAgo, type InboxFilter, type SortMode, type ViewMode } from "./inbox-helpers";

interface InboxToolbarProps {
  filter: InboxFilter;
  onFilterChange: (f: InboxFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  /** Sort (list) or group-by (board), whichever the view uses. */
  sortValue: SortMode;
  onSortChange: (s: SortMode) => void;
  onAddTask: () => void;
  /** Opens the sync classes dialog. */
  onSync: () => void;
  syncing: boolean;
  lastSyncedAt: string | null;
}

/** Active-state classes for a chosen menu entry. */
const ACTIVE_ITEM = "bg-foreground/[0.06] font-semibold";

/**
 * Inbox header: the filter title (Inbox / Today / Next 7 days) that opens a
 * menu, then view, add, sort and an overflow menu with Sync classes. Every
 * menu is a Popover (Escape, outside click, focus return, aria-expanded),
 * every icon control is an IconButton with a label and a 44px hit area on
 * touch, and the overflow shows when the classes last synced.
 */
export default function InboxToolbar({
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  sortValue,
  onSortChange,
  onAddTask,
  onSync,
  syncing,
  lastSyncedAt,
}: InboxToolbarProps) {
  const [openMenu, setOpenMenu] = useState<"filter" | "view" | "sort" | "more" | null>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const viewBtnRef = useRef<HTMLButtonElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const now = useNow();
  const active = FILTER_OPTIONS.find((o) => o.key === filter) ?? FILTER_OPTIONS[0];
  const ActiveIcon = active.icon;
  const syncedAgo = formatSyncedAgo(lastSyncedAt, now.getTime());
  const close = () => setOpenMenu(null);

  return (
    <div className="pl-4 pr-3 pt-4 pb-2 md:pl-8 md:pr-6 md:pt-5 md:pb-2 flex items-center justify-between">
      <div className="relative">
        <button
          ref={filterBtnRef}
          type="button"
          onClick={() => setOpenMenu(openMenu === "filter" ? null : "filter")}
          aria-haspopup="menu"
          aria-expanded={openMenu === "filter"}
          className="flex items-center gap-2 px-2 py-1.5 -ml-2 min-h-11 rounded-lg hover:bg-foreground/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ActiveIcon size={18} className="text-foreground" aria-hidden="true" />
          <h1 className="text-lg font-bold text-foreground tracking-tight">{active.label}</h1>
          <ChevronDown size={16} className={`text-foreground transition-transform ${openMenu === "filter" ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
        <Popover open={openMenu === "filter"} onClose={close} anchorRef={filterBtnRef} triggerRef={filterBtnRef} role="menu" aria-label="Filter tasks" className="min-w-[180px] py-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              role="menuitemradio"
              aria-checked={opt.key === filter}
              onClick={() => { onFilterChange(opt.key); close(); }}
              className={`${MENU_ITEM} ${opt.key === filter ? ACTIVE_ITEM : ""}`}
            >
              <opt.icon size={14} className="text-foreground" aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </Popover>
      </div>

      <div className="flex items-center gap-0.5">
        {syncedAgo && (
          <span className="hidden md:inline text-2xs text-muted-foreground mr-1.5 whitespace-nowrap" aria-live="polite">
            {syncing ? "Syncing..." : syncedAgo}
          </span>
        )}
        <IconButton ref={viewBtnRef} aria-label="Switch view" aria-haspopup="menu" aria-expanded={openMenu === "view"} title={viewMode === "list" ? "List view" : "Board view"} className="text-foreground" onClick={() => setOpenMenu(openMenu === "view" ? null : "view")}>
          {viewMode === "list" ? <List size={18} /> : <LayoutGrid size={18} />}
        </IconButton>
        <Popover open={openMenu === "view"} onClose={close} anchorRef={viewBtnRef} triggerRef={viewBtnRef} placement="bottom-end" role="menu" aria-label="View" className="min-w-[150px] py-1">
          {([
            { key: "list" as const, label: "List", Icon: List },
            { key: "board" as const, label: "Board", Icon: LayoutGrid },
          ]).map((opt) => (
            <button
              key={opt.key}
              type="button"
              role="menuitemradio"
              aria-checked={opt.key === viewMode}
              onClick={() => { trackEvent("view_mode_changed", { mode: opt.key }); onViewModeChange(opt.key); close(); }}
              className={`${MENU_ITEM} ${opt.key === viewMode ? ACTIVE_ITEM : ""}`}
            >
              <opt.Icon size={14} className="text-foreground" aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </Popover>

        <IconButton id="tour-add-task" aria-label="Add task" title="Add task" className="text-foreground" onClick={onAddTask}>
          <Plus size={18} />
        </IconButton>

        <IconButton ref={sortBtnRef} aria-label={viewMode === "list" ? "Sort tasks" : "Group by"} aria-haspopup="menu" aria-expanded={openMenu === "sort"} title={viewMode === "list" ? "Sort tasks" : "Group by"} className="text-foreground" onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")}>
          <ArrowUpDown size={18} />
        </IconButton>
        <Popover open={openMenu === "sort"} onClose={close} anchorRef={sortBtnRef} triggerRef={sortBtnRef} placement="bottom-end" role="menu" aria-label={viewMode === "list" ? "Sort tasks" : "Group by"} className="min-w-[130px] py-1">
          {([
            { key: "date" as const, label: "Date", Icon: CalendarDays },
            { key: "class" as const, label: "Class", Icon: GraduationCap },
          ]).map((opt) => (
            <button
              key={opt.key}
              type="button"
              role="menuitemradio"
              aria-checked={sortValue === opt.key}
              onClick={() => { trackEvent("sort_mode_changed", { sort: opt.key }); onSortChange(opt.key); close(); }}
              className={`${MENU_ITEM} ${sortValue === opt.key ? ACTIVE_ITEM : ""}`}
            >
              <opt.Icon size={14} aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </Popover>

        <IconButton ref={moreBtnRef} aria-label="More" aria-haspopup="menu" aria-expanded={openMenu === "more"} title="More" className="text-foreground" onClick={() => setOpenMenu(openMenu === "more" ? null : "more")}>
          <MoreHorizontal size={18} />
        </IconButton>
        <Popover open={openMenu === "more"} onClose={close} anchorRef={moreBtnRef} triggerRef={moreBtnRef} placement="bottom-end" role="menu" aria-label="More" className="min-w-[180px] py-1">
          <button type="button" role="menuitem" disabled={syncing} onClick={() => { onSync(); close(); }} className={`${MENU_ITEM} disabled:opacity-50`}>
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} aria-hidden="true" />
            {syncing ? "Syncing..." : "Sync classes"}
          </button>
        </Popover>
      </div>
    </div>
  );
}
