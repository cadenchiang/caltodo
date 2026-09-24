"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** Gap between columns in px (matches gap-4). */
const GAP = 16;

export interface BoardPaging {
  /** Zero-based page currently in view. */
  currentPage: number;
  /** Total pages given the column count and the measured columns per page. */
  totalPages: number;
  /** Scrolls one page left (-1) or right (1). */
  scrollByPage: (direction: 1 | -1) => void;
  /** Attach to the row's onScroll. */
  onScroll: () => void;
}

/**
 * Page indicator and arrow scrolling for the horizontal column row. Columns
 * per page is measured from the first column's width (1 / 2 / 4 by
 * breakpoint), so the dots stay right on every screen size. The scroll
 * position is remembered per groupBy in localStorage.
 *
 * @param rowRef - The scrolling row
 * @param columnCount - Number of rendered columns
 * @param memoryKey - localStorage key for the remembered scrollLeft
 * @returns Paging state and handlers
 */
export function useBoardPaging(rowRef: RefObject<HTMLDivElement | null>, columnCount: number, memoryKey: string): BoardPaging {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const restoredRef = useRef(false);

  /** Measures how many columns fit across the row and the width of one page. */
  const measure = useCallback(() => {
    const el = rowRef.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return { perPage: 1, step: 0 };
    const colWidth = first.offsetWidth + GAP;
    const perPage = Math.max(1, Math.round((el.clientWidth + GAP) / colWidth));
    return { perPage, step: perPage * colWidth };
  }, [rowRef]);

  const onScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const { perPage, step } = measure();
    if (!step) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const pages = Math.max(1, Math.ceil(columnCount / perPage));
    setTotalPages(pages);
    setCurrentPage(el.scrollLeft >= maxScroll - 1 ? pages - 1 : Math.round(el.scrollLeft / step));
    if (restoredRef.current) {
      try {
        localStorage.setItem(memoryKey, String(el.scrollLeft));
      } catch { /* localStorage unavailable */ }
    }
  }, [rowRef, measure, columnCount, memoryKey]);

  const scrollByPage = useCallback(
    (direction: 1 | -1) => {
      const el = rowRef.current;
      if (!el) return;
      const { step } = measure();
      if (!step) return;
      const maxPage = Math.max(0, totalPages - 1);
      const nextPage = Math.max(0, Math.min(maxPage, currentPage + direction));
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      el.scrollTo({ left: nextPage === maxPage ? maxScroll : nextPage * step, behavior: "smooth" });
    },
    [rowRef, measure, currentPage, totalPages]
  );

  // Recompute on resize (breakpoint changes alter columns per page).
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    onScroll();
    const ro = new ResizeObserver(() => onScroll());
    ro.observe(el);
    return () => ro.disconnect();
  }, [rowRef, onScroll]);

  // Restore the remembered position once the columns have laid out.
  useEffect(() => {
    if (restoredRef.current) return;
    const el = rowRef.current;
    if (!el || columnCount === 0) return;
    try {
      const raw = localStorage.getItem(memoryKey);
      if (raw !== null) {
        const target = Number(raw);
        if (Number.isFinite(target)) {
          const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
          el.scrollLeft = Math.min(Math.max(0, target), maxScroll);
        }
      }
    } catch { /* localStorage unavailable */ }
    restoredRef.current = true;
    onScroll();
  }, [rowRef, columnCount, memoryKey, onScroll]);

  return { currentPage, totalPages, scrollByPage, onScroll };
}
