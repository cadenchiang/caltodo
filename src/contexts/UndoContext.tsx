"use client";

/**
 * A stack of recent edits, each with the action that takes it back.
 *
 * Every edit in the detail panel lands on a real assignment the moment it is
 * saved. Pushing it here gives the user two ways back: the Undo button on the
 * toast that announces the edit, and Cmd+Z (Ctrl+Z on Windows) for the one
 * they have already dismissed.
 *
 * The stack holds closures rather than a diff, so an entry can restore
 * whatever its author needs to - a field, a set of fields, a deletion - and
 * this file needs to know nothing about tasks.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Undo2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/** How many edits can be stepped back through. */
const MAX_ENTRIES = 25;

/** One reversible edit. */
export interface UndoEntry {
  /** What the toast says, e.g. "Due date changed". */
  label: string;
  /** Puts the edit back. May be async; failures are logged, not thrown. */
  undo: () => void | Promise<void>;
}

interface UndoContextValue {
  /**
   * Records an edit and announces it with an Undo toast.
   *
   * @param entry - The edit and how to reverse it
   */
  pushUndo: (entry: UndoEntry) => void;
  /**
   * Reverses the most recent edit, if there is one.
   *
   * @returns True when something was undone
   */
  undoLast: () => boolean;
}

const UndoContext = createContext<UndoContextValue | null>(null);

/**
 * Reports whether a key event came from somewhere with its own undo.
 *
 * @param target - The event's target
 * @returns True when the keystroke belongs to a text field
 * @remarks Cmd+Z inside a title or description must step back through what
 *          was typed, not reach past the field and revert the last saved
 *          edit. The browser already does the former; this keeps out of its
 *          way.
 */
function isTextEntry(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * Provides the undo stack and binds Cmd+Z to it.
 *
 * @param children - The app subtree that can record and reverse edits
 * @remarks The stack lives in a ref, not state: nothing renders from it, and
 *          keeping it out of state means recording an edit does not re-render
 *          the tree under a panel the user is still typing in.
 */
export function UndoProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const stackRef = useRef<UndoEntry[]>([]);

  const undoLast = useCallback((): boolean => {
    const entry = stackRef.current.pop();
    if (!entry) {
      console.info("UndoProvider: nothing to undo");
      return false;
    }
    try {
      const result = entry.undo();
      if (result instanceof Promise) {
        result.catch((error: unknown) => {
          console.error("UndoProvider: undo failed", {
            label: entry.label,
            error: error instanceof Error ? error.message : String(error),
          });
          showToast("Couldn't undo that change", { variant: "error" });
        });
      }
      console.info("UndoProvider: undid edit", { label: entry.label });
      showToast(`Undid: ${entry.label.toLowerCase()}`);
      return true;
    } catch (error: unknown) {
      // A synchronous throw must not take the stack down with it; the entry
      // is already popped, so a retry cannot loop on the same bad closure.
      console.error("UndoProvider: undo threw", {
        label: entry.label,
        error: error instanceof Error ? error.message : String(error),
      });
      showToast("Couldn't undo that change", { variant: "error" });
      return false;
    }
  }, [showToast]);

  const pushUndo = useCallback(
    (entry: UndoEntry) => {
      stackRef.current.push(entry);
      // Oldest first out. The cap is about memory, not about how far back a
      // user may reasonably want to go.
      if (stackRef.current.length > MAX_ENTRIES) stackRef.current.shift();

      console.info("UndoProvider: recorded edit", {
        label: entry.label,
        depth: stackRef.current.length,
      });

      showToast(entry.label, {
        action: {
          label: "Undo",
          icon: <Undo2 size={14} />,
          // Undo the entry this toast is for, which is the top of the stack
          // until something else is pushed - and if something has been, the
          // most recent edit is the one the user means to take back.
          onClick: () => undoLast(),
        },
      });
    },
    [showToast, undoLast],
  );

  // Cmd+Z / Ctrl+Z anywhere outside a text field.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "z") return;
      if (!(e.metaKey || e.ctrlKey)) return;
      // Shift+Cmd+Z is redo, which this stack does not offer. Swallowing it
      // would be worse than leaving it to the browser.
      if (e.shiftKey) return;
      if (isTextEntry(e.target)) return;
      if (stackRef.current.length === 0) return;

      e.preventDefault();
      undoLast();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undoLast]);

  const value = useMemo(() => ({ pushUndo, undoLast }), [pushUndo, undoLast]);
  return <UndoContext.Provider value={value}>{children}</UndoContext.Provider>;
}

/**
 * Reads the undo stack.
 *
 * @returns The push and undo callbacks
 * @throws When called outside {@link UndoProvider}
 */
export function useUndo(): UndoContextValue {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error("useUndo must be used within an UndoProvider");
  return ctx;
}
