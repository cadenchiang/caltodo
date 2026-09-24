"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { isInboxFilter, type InboxFilter, type SortMode, type ViewMode } from "./inbox-helpers";

export interface InboxPreferences {
  filter: InboxFilter;
  setFilter: (f: InboxFilter) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  sortMode: SortMode;
  setSortMode: (s: SortMode) => void;
  boardGroupBy: SortMode;
  setBoardGroupBy: (g: SortMode) => void;
}

/**
 * The inbox's persisted view preferences: date filter, list/board, sort
 * mode and board grouping. Hydrates from localStorage after mount (so SSR
 * and client agree), honours a ?filter= query (the /app/today redirect),
 * and listens for the guided tour's view-mode event.
 *
 * @returns Current values and setters that also persist
 */
export function useInboxPreferences(): InboxPreferences {
  const [filter, setFilterRaw] = useState<InboxFilter>("all");
  const [viewMode, setViewModeRaw] = useState<ViewMode>("list");
  const [sortMode, setSortModeRaw] = useState<SortMode>("date");
  const [boardGroupBy, setBoardGroupByRaw] = useState<SortMode>("class");
  /** Guards persist effects from running on mount (which would overwrite hydrated values). */
  const hydratedRef = useRef(false);

  /** Sets the filter, persists it, and tells the sidebar. */
  const setFilter = useCallback((f: InboxFilter) => {
    trackEvent("filter_changed", { filter: f });
    setFilterRaw(f);
    try { localStorage.setItem("inbox-filter", f); } catch { /* non-critical */ }
    window.dispatchEvent(new CustomEvent("inbox-filter-change", { detail: f }));
  }, []);

  /** Sets the view and persists it inline so hydration cannot clobber it. */
  const setViewMode = useCallback((next: ViewMode) => {
    setViewModeRaw(next);
    try { localStorage.setItem("inbox-view-mode", next); } catch { /* non-critical */ }
  }, []);

  const setSortMode = useCallback((s: SortMode) => setSortModeRaw(s), []);
  const setBoardGroupBy = useCallback((g: SortMode) => setBoardGroupByRaw(g), []);

  useEffect(() => {
    const savedFilter = localStorage.getItem("inbox-filter");
    if (isInboxFilter(savedFilter)) setFilterRaw(savedFilter);
    // /app/today redirects here with ?filter=today; an explicit query wins
    // over the remembered filter and is persisted like a click would be.
    const urlParams = new URLSearchParams(window.location.search);
    const urlFilter = urlParams.get("filter");
    if (isInboxFilter(urlFilter)) {
      setFilter(urlFilter);
      // Drop the query once applied; the ?task= handling owns the URL when
      // a task deep link is present.
      if (!urlParams.get("task")) window.history.replaceState(null, "", "/app/inbox");
    }
    const savedView = localStorage.getItem("inbox-view-mode");
    if (savedView === "list" || savedView === "board") setViewModeRaw(savedView);
    const savedSort = localStorage.getItem("inbox-sort-mode");
    if (savedSort === "date" || savedSort === "class") setSortModeRaw(savedSort);
    const savedGroup = localStorage.getItem("inbox-board-group");
    if (savedGroup === "date" || savedGroup === "class") setBoardGroupByRaw(savedGroup);
    hydratedRef.current = true;
  }, [setFilter]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try { localStorage.setItem("inbox-sort-mode", sortMode); } catch { /* non-critical */ }
  }, [sortMode]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try { localStorage.setItem("inbox-board-group", boardGroupBy); } catch { /* non-critical */ }
  }, [boardGroupBy]);

  // Board grouped by date already buckets by time, so the date filter is reset.
  useEffect(() => {
    if (viewMode === "board" && boardGroupBy === "date" && filter !== "all") setFilter("all");
  }, [viewMode, boardGroupBy, filter, setFilter]);

  // The guided tour switches the view for the user.
  useEffect(() => {
    function handleTourViewChange(e: Event) {
      const mode = (e as CustomEvent).detail;
      if (mode === "list" || mode === "board") setViewMode(mode);
    }
    window.addEventListener("tour-set-view-mode", handleTourViewChange);
    return () => window.removeEventListener("tour-set-view-mode", handleTourViewChange);
  }, [setViewMode]);

  return { filter, setFilter, viewMode, setViewMode, sortMode, setSortMode, boardGroupBy, setBoardGroupBy };
}
