"use client";

/**
 * The user's chosen colours for tags, classes and source badges.
 *
 * Every place that draws a coloured label asks this context, which answers
 * with the stored colour when there is one and the derived colour (from the
 * name) otherwise. Changing a colour updates the screen at once and writes
 * behind; a failed write puts the old colour back and says so.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { useToast } from "@/contexts/ToastContext";
import { labelColor } from "@/lib/label-colors";
import {
  fetchLabelColors,
  upsertLabelColor,
  deleteLabelColor,
  labelKey,
  type LabelKind,
} from "@/lib/label-colors-store";

interface LabelColorsValue {
  /**
   * The colour for a label.
   *
   * @param kind - Which list the name belongs to
   * @param name - The label as displayed
   * @param fallback - Colour to use when none is stored; defaults to the one
   *                   derived from the name
   */
  colorFor: (kind: LabelKind, name: string, fallback?: string) => string;
  /** Stores a colour, or clears it when null so the label reverts. */
  setColor: (kind: LabelKind, name: string, color: string | null) => Promise<void>;
  /** True when a colour has been chosen for the label, as opposed to derived. */
  hasStoredColor: (kind: LabelKind, name: string) => boolean;
}

const LabelColorsContext = createContext<LabelColorsValue | null>(null);

/**
 * Loads the user's colours and provides them to the tree.
 *
 * @param children - The app subtree that draws coloured labels
 * @remarks The Map is replaced, never mutated, so consumers re-render on a
 *          change. Loading is silent: until it completes every label shows
 *          its derived colour, which is what it showed before this existed.
 */
export function LabelColorsProvider({
  children,
  initialUserId = null,
  initialColors,
}: {
  children: ReactNode;
  /** The signed-in user, when the server already knows; skips a lookup. */
  initialUserId?: string | null;
  /** Colours loaded on the server, as [key, colour] pairs; skips the fetch. */
  initialColors?: [string, string][];
}) {
  const { showToast } = useToast();
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [colors, setColors] = useState<Map<string, string>>(() => new Map(initialColors ?? []));

  useEffect(() => {
    // Preloaded on the server: nothing to fetch, and the user is known.
    if (initialColors && initialUserId) return;
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const user = await getCurrentUser();
      if (!user || cancelled) return;
      const loaded = await fetchLabelColors(supabase, user.id);
      if (cancelled) return;
      setUserId(user.id);
      setColors(loaded);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialColors, initialUserId]);

  const colorFor = useCallback(
    (kind: LabelKind, name: string, fallback?: string) =>
      colors.get(labelKey(kind, name)) ?? fallback ?? labelColor(name),
    [colors],
  );

  const hasStoredColor = useCallback(
    (kind: LabelKind, name: string) => colors.has(labelKey(kind, name)),
    [colors],
  );

  const setColor = useCallback(
    async (kind: LabelKind, name: string, color: string | null) => {
      if (!userId) {
        showToast("Couldn't save the colour: not signed in", { variant: "error" });
        return;
      }
      const key = labelKey(kind, name);
      const previous = colors.get(key);

      // Optimistic: the swatch changes under the pointer, not a round trip later.
      setColors((prev) => {
        const next = new Map(prev);
        if (color) next.set(key, color);
        else next.delete(key);
        return next;
      });

      const supabase = createClient();
      const ok = color
        ? await upsertLabelColor(supabase, userId, kind, name, color)
        : await deleteLabelColor(supabase, userId, kind, name);

      if (!ok) {
        setColors((prev) => {
          const next = new Map(prev);
          if (previous) next.set(key, previous);
          else next.delete(key);
          return next;
        });
        showToast("Couldn't save the colour", { variant: "error" });
      }
    },
    [userId, colors, showToast],
  );

  const value = useMemo(
    () => ({ colorFor, setColor, hasStoredColor }),
    [colorFor, setColor, hasStoredColor],
  );
  return <LabelColorsContext.Provider value={value}>{children}</LabelColorsContext.Provider>;
}

/**
 * Reads the label colours.
 *
 * @returns colorFor, setColor and hasStoredColor
 * @throws When used outside {@link LabelColorsProvider}
 */
export function useLabelColors(): LabelColorsValue {
  const ctx = useContext(LabelColorsContext);
  if (!ctx) throw new Error("useLabelColors must be used within a LabelColorsProvider");
  return ctx;
}
