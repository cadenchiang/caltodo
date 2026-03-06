"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, ImageIcon, Trash2, X } from "lucide-react";
import { useMarqueeSelection } from "@/hooks/useMarqueeSelection";
import { useToast } from "@/contexts/ToastContext";
import DeleteFolderConfirmModal from "./DeleteFolderConfirmModal";
import RecentlyDeletedSection from "./RecentlyDeletedSection";
import FolderCard from "./FolderCard";
import FolderCardPreview from "./FolderCardPreview";
import NewFolderModal from "./NewFolderModal";
import FolderAppearanceModal from "./FolderAppearanceModal";
import type { FolderAppearance } from "./FolderAppearanceModal";
import type { FolderSetting, CustomImage } from "@/hooks/useFolderSettings";
import type { Course } from "@/lib/types";
import SidePanel, {
  computeSidePanelPosition,
  SIDE_PANEL_WIDTH,
} from "@/components/ui/SidePanel";

/**
 * A folder entry representing either "General" or a course.
 */
export interface FolderEntry {
  id: string;
  label: string;
}

/** Default light warm gray for folder headers (matches default banner). */
export const DEFAULT_APPEARANCE: FolderAppearance = {
  type: "color",
  value: "#d6d3d1",
};

/** Default appearance for the General folder — shows Campanile panorama. */
const GENERAL_DEFAULT_APPEARANCE: FolderAppearance = {
  type: "image",
  value: "/campanile-panorama.jpg",
};

/** State for the currently editing folder panel. */
interface EditingFolder {
  id: string;
  type: "appearance" | "rename";
  rect: DOMRect;
}

interface Props {
  initialCourses: Course[];
  initialNoteCounts: Record<string, number>;
  onSelectFolder: (folder: FolderEntry) => void;
  getFolderSetting: (folderId: string) => FolderSetting;
  updateSetting: <K extends keyof FolderSetting>(
    folderId: string,
    field: K,
    value: FolderSetting[K]
  ) => void;
  /** When true, skip the entrance animation (e.g. returning from editor). */
  skipAnimation?: boolean;
  /** Adjustments to note counts from create/delete operations in the modal. */
  noteCountAdjustments?: Record<string, number>;
  /** User's saved custom colors for the appearance picker. */
  customColors?: string[];
  /** Callback to persist a new custom color. */
  onAddCustomColor?: (hex: string) => void;
  /** User's saved custom uploaded images for the appearance picker. */
  customImages?: CustomImage[];
  /** Callback to persist a new custom image URL. */
  onAddCustomImage?: (url: string) => void;
}

/**
 * Grid of folder cards (General + user's synced courses).
 * Supports renaming, appearance customization, folder creation, and deletion.
 * When editing a folder, shows a side panel with a spotlight overlay.
 *
 * @param onSelectFolder - Callback when a folder card is clicked
 * @param getFolderSetting - Get a folder's settings (icon, description, appearance)
 * @param updateSetting - Update a folder setting field
 */
export default function NotesFolderGrid({
  initialCourses,
  initialNoteCounts,
  onSelectFolder,
  getFolderSetting,
  updateSetting,
  skipAnimation,
  noteCountAdjustments,
  customColors,
  onAddCustomColor,
  customImages,
  onAddCustomImage,
}: Props) {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>(initialNoteCounts);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const supabase = createClient();

  // Side-panel editing state
  const [editingFolder, setEditingFolder] = useState<EditingFolder | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<{
    top: number; left: number; width: number; height: number;
  } | null>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const [panelSide, setPanelSide] = useState<"right" | "left">("right");
  const spotlightRafRef = useRef(0);

  // Folder selection state
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  /** Tracks the last plain-clicked folder for shift+click range selection. */
  const folderAnchorRef = useRef<string | null>(null);
  const folderGridRef = useRef<HTMLDivElement>(null);

  // Animate floating bar exit
  const [barVisible, setBarVisible] = useState(false);
  const [barClosing, setBarClosing] = useState(false);
  const barTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** Caches the last non-zero count so the exit animation doesn't flash "0 selected". */
  const lastCountRef = useRef(0);
  if (selectedFolderIds.size > 0) lastCountRef.current = selectedFolderIds.size;

  useEffect(() => {
    if (selectedFolderIds.size > 0) {
      clearTimeout(barTimerRef.current);
      setBarClosing(false);
      setBarVisible(true);
    } else if (barVisible) {
      setBarClosing(true);
      barTimerRef.current = setTimeout(() => {
        setBarVisible(false);
        setBarClosing(false);
      }, 200);
    }
  }, [selectedFolderIds.size]);

  /** Tracks whether a marquee drag just finished to suppress the click-to-deselect. */
  const justMarqueedRef = useRef(false);

  const handleMarqueeSelection = useCallback((ids: Set<string>) => {
    setSelectedFolderIds(ids);
    if (ids.size > 0) justMarqueedRef.current = true;
  }, []);

  const { marqueeStyle, onMouseDown: onMarqueeMouseDown } = useMarqueeSelection({
    containerRef: folderGridRef,
    onSelectionChange: handleMarqueeSelection,
    existingSelection: selectedFolderIds,
    dataAttribute: "data-folder-id",
  });

  /**
   * Select a folder. Plain click selects only this one and sets anchor.
   * Shift+click selects the range between the anchor and the clicked folder.
   */
  function toggleFolderSelect(folderId: string, shiftKey: boolean) {
    if (shiftKey && folderAnchorRef.current) {
      const anchorIdx = folders.findIndex((f) => f.id === folderAnchorRef.current);
      const targetIdx = folders.findIndex((f) => f.id === folderId);
      if (anchorIdx !== -1 && targetIdx !== -1) {
        const start = Math.min(anchorIdx, targetIdx);
        const end = Math.max(anchorIdx, targetIdx);
        const rangeIds = folders.slice(start, end + 1).map((f) => f.id);
        setSelectedFolderIds(new Set(rangeIds));
        return;
      }
    }
    if (selectedFolderIds.size === 1 && selectedFolderIds.has(folderId)) {
      folderAnchorRef.current = null;
      setSelectedFolderIds(new Set());
    } else {
      folderAnchorRef.current = folderId;
      setSelectedFolderIds(new Set([folderId]));
    }
  }

  /** Delete all selected folders and clear selection. */
  async function handleDeleteSelected() {
    const ids = Array.from(selectedFolderIds).filter((id) => id !== "general");

    // Save state for undo
    const deletedCourseMap = new Map<string, Course>();
    const deletedNoteCountMap = new Map<string, number>();
    for (const id of ids) {
      const course = courses.find((c) => c.id === id);
      if (course) deletedCourseMap.set(id, course);
      deletedNoteCountMap.set(id, noteCounts[id] ?? 0);
    }

    const now = new Date().toISOString();
    const { data: { user } } = await supabase.auth.getUser();

    for (const id of ids) {
      await supabase.from("notes").update({ deleted_at: now }).eq("course_id", id);
      if (user) {
        await supabase
          .from("course_memberships")
          .update({ deleted_at: now })
          .eq("user_id", user.id)
          .eq("course_id", id);
      }
    }

    setCourses((prev) => prev.filter((c) => !ids.includes(c.id)));
    setNoteCounts((prev) => {
      const updated = { ...prev };
      for (const id of ids) delete updated[id];
      return updated;
    });
    setSelectedFolderIds(new Set());
    setShowBulkDeleteConfirm(false);

    showToast(`${ids.length} ${ids.length === 1 ? "folder" : "folders"} deleted`, {
      action: {
        label: "Undo",
        onClick: async () => {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (!currentUser) return;

          for (const id of ids) {
            await Promise.all([
              supabase
                .from("course_memberships")
                .update({ deleted_at: null })
                .eq("user_id", currentUser.id)
                .eq("course_id", id),
              supabase
                .from("notes")
                .update({ deleted_at: null })
                .eq("course_id", id),
            ]);
          }

          setCourses((prev) => {
            const restored = ids
              .map((id) => deletedCourseMap.get(id))
              .filter(Boolean) as Course[];
            return [...prev, ...restored].sort((a, b) => a.name.localeCompare(b.name));
          });
          setNoteCounts((prev) => {
            const updated = { ...prev };
            for (const id of ids) {
              updated[id] = deletedNoteCountMap.get(id) ?? 0;
            }
            return updated;
          });
        },
      },
    });
  }

  /** Open rename panel for the single selected folder. */
  function handleRenameSelected() {
    const id = Array.from(selectedFolderIds)[0];
    if (!id || id === "general") return;
    const el = document.querySelector(`[data-folder-id="${id}"]`);
    if (!el) return;
    openRename(id, el.getBoundingClientRect());
    setSelectedFolderIds(new Set());
  }

  /** Open appearance panel for the single selected folder. */
  function handleAppearanceSelected() {
    const id = Array.from(selectedFolderIds)[0];
    if (!id) return;
    const el = document.querySelector(`[data-folder-id="${id}"]`);
    if (!el) return;
    handleOpenAppearance(id, el.getBoundingClientRect());
    setSelectedFolderIds(new Set());
  }

  // Rename state (lifted from FolderCard)
  const [renameValue, setRenameValue] = useState("");

  // RAF-based spotlight tracking (mirrors home/page.tsx pattern)
  useEffect(() => {
    if (!editingFolder) {
      setSpotlightRect(null);
      return;
    }
    function updateSpotlight() {
      const el = document.querySelector(
        `[data-folder-id="${editingFolder!.id}"]`
      );
      if (el) {
        const r = el.getBoundingClientRect();
        setSpotlightRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
        const pH = 500;
        const pos = computeSidePanelPosition(
          r,
          window.innerWidth,
          window.innerHeight,
          pH
        );
        setPanelPos({ top: pos.top, left: pos.left });
        setPanelSide(pos.side);
      }
      spotlightRafRef.current = requestAnimationFrame(updateSpotlight);
    }
    updateSpotlight();
    return () => cancelAnimationFrame(spotlightRafRef.current);
  }, [editingFolder]);


  /**
   * Renames a course folder. Updates courses.name in DB and all
   * tasks.course_name matching the old name to stay in sync.
   */
  const handleRename = useCallback(async (folderId: string, newName: string) => {
    const course = courses.find((c) => c.id === folderId);
    if (!course) return;

    const oldName = course.name;
    setCourses((prev) =>
      prev.map((c) => (c.id === folderId ? { ...c, name: newName } : c))
    );

    const { error: courseError } = await supabase
      .from("courses")
      .update({ name: newName })
      .eq("id", folderId);

    if (courseError) {
      setCourses((prev) =>
        prev.map((c) => (c.id === folderId ? { ...c, name: oldName } : c))
      );
      return;
    }

    await supabase
      .from("tasks")
      .update({ course_name: newName })
      .eq("course_name", oldName);
  }, [courses, supabase]);

  /**
   * Changes a folder's appearance. Persisted via useFolderSettings.
   */
  const handleAppearanceChange = useCallback((folderId: string, appearance: FolderAppearance) => {
    updateSetting(folderId, "appearance", appearance);
  }, [updateSetting]);

  /**
   * Soft-deletes notes in a course folder, then removes course membership.
   * Notes go to "Recently Deleted" instead of being permanently removed.
   */
  const handleDelete = useCallback(async (folderId: string) => {
    const now = new Date().toISOString();

    // Save state for undo
    const deletedCourse = courses.find((c) => c.id === folderId);
    const deletedNoteCount = noteCounts[folderId] ?? 0;

    // Soft-delete all notes in this folder
    await supabase
      .from("notes")
      .update({ deleted_at: now })
      .eq("course_id", folderId);

    // Soft-delete course membership (folder goes to Recently Deleted)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("course_memberships")
        .update({ deleted_at: now })
        .eq("user_id", user.id)
        .eq("course_id", folderId);
    }

    setCourses((prev) => prev.filter((c) => c.id !== folderId));
    setNoteCounts((prev) => {
      const updated = { ...prev };
      delete updated[folderId];
      return updated;
    });
    showToast("Folder deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (!currentUser) return;

          await Promise.all([
            supabase
              .from("course_memberships")
              .update({ deleted_at: null })
              .eq("user_id", currentUser.id)
              .eq("course_id", folderId),
            supabase
              .from("notes")
              .update({ deleted_at: null })
              .eq("course_id", folderId),
          ]);

          if (deletedCourse) {
            setCourses((prev) =>
              [...prev, deletedCourse].sort((a, b) => a.name.localeCompare(b.name))
            );
          }
          setNoteCounts((prev) => ({ ...prev, [folderId]: deletedNoteCount }));
        },
      },
    });
  }, [supabase, showToast, courses, noteCounts]);

  /**
   * Creates a new course folder. Inserts into courses table and
   * auto-enrolls the user via course_memberships.
   */
  async function handleCreateFolder() {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        source: "notes",
        external_id: `notes-folder-${Date.now()}`,
        name: trimmed,
      })
      .select()
      .single();

    if (error || !course) {
      console.error("Failed to create folder:", error?.message);
      return;
    }

    await supabase
      .from("course_memberships")
      .insert({ user_id: user.id, course_id: course.id });

    setCourses((prev) => [...prev, course as Course].sort((a, b) => a.name.localeCompare(b.name)));
    setNewFolderName("");
    setShowNewFolder(false);
    showToast("Folder created");
  }

  /**
   * Opens the appearance side panel for a folder.
   */
  const handleOpenAppearance = useCallback((folderId: string, rect: DOMRect) => {
    setEditingFolder({ id: folderId, type: "appearance", rect });
  }, []);

  /**
   * Closes the editing panel.
   */
  function closePanel() {
    setEditingFolder(null);
  }

  /**
   * Commits rename from the side panel and closes it.
   */
  function commitRename() {
    const trimmed = renameValue.trim();
    if (editingFolder && trimmed && trimmed !== folders.find((f) => f.id === editingFolder.id)?.label) {
      handleRename(editingFolder.id, trimmed);
    }
    closePanel();
  }

  const folders: FolderEntry[] = [
    { id: "general", label: "General" },
    ...courses.map((c) => ({ id: c.id, label: c.name })),
  ];

  /**
   * Opens the rename side panel for a folder.
   * Defined after folders so it has access to the current list.
   */
  const openRename = (folderId: string, rect: DOMRect) => {
    const folder = folders.find((f) => f.id === folderId);
    setRenameValue(folder?.label ?? "");
    setEditingFolder({ id: folderId, type: "rename", rect });
  };

  /**
   * Returns the appearance for a folder from settings, falling back to default.
   */
  function getFolderAppearance(folderId: string): FolderAppearance {
    const custom = getFolderSetting(folderId).appearance;
    if (custom) return custom;
    return folderId === "general" ? GENERAL_DEFAULT_APPEARANCE : DEFAULT_APPEARANCE;
  }

  const panelPosition = { top: panelPos.top, left: panelPos.left, width: SIDE_PANEL_WIDTH };

  /** Clear selection when clicking empty space outside folder cards. */
  function handleBackgroundClick(e: React.MouseEvent) {
    if (justMarqueedRef.current) {
      justMarqueedRef.current = false;
      return;
    }
    const target = e.target as HTMLElement;
    if (!target.closest("[data-folder-id]") && !target.closest("[data-selection-bar]")) {
      folderAnchorRef.current = null;
      setSelectedFolderIds(new Set());
    }
  }

  return (
    <div ref={folderGridRef} className={`h-full overflow-y-auto px-1 -mx-1 pb-12 ${skipAnimation ? "" : "animate-page-in"} relative select-none`} onClick={handleBackgroundClick} onMouseDown={onMarqueeMouseDown}>
      {/* Header with New Folder button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {folders.length} {folders.length === 1 ? "folder" : "folders"}
          </p>
        </div>
        <button
          onClick={() => setShowNewFolder(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="New Folder"
          aria-label="New Folder"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* New folder modal */}
      {showNewFolder && (
        <NewFolderModal
          name={newFolderName}
          onChangeName={setNewFolderName}
          onCreate={handleCreateFolder}
          onClose={() => { setShowNewFolder(false); setNewFolderName(""); }}
        />
      )}

      {/* Folder grid — p-1 ensures box-shadow highlight isn't clipped at edges */}
      {/* Marquee selection overlay */}
      {marqueeStyle && (
        <div
          className="bg-blue-500/20 border border-blue-500/50 rounded-sm z-50 pointer-events-none"
          style={marqueeStyle}
        />
      )}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-1 -m-1"
      >
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            appearance={getFolderAppearance(folder.id)}
            noteCount={(noteCounts[folder.id] ?? 0) + (noteCountAdjustments?.[folder.id] ?? 0)}
            isGeneral={folder.id === "general"}
            hasCustomAppearance={folder.id === "general" || !!getFolderSetting(folder.id).appearance}
            highlighted={editingFolder?.id === folder.id}
            selected={selectedFolderIds.has(folder.id)}
            displayLabel={
              editingFolder?.id === folder.id && editingFolder.type === "rename"
                ? (renameValue || folder.label)
                : undefined
            }
            onSelect={toggleFolderSelect}
            onOpen={(folder) => {
              setSelectedFolderIds(new Set());
              onSelectFolder(folder);
            }}
          />
        ))}

        {/* Live preview placeholder while creating a new folder */}
        {showNewFolder && (
          <div className="relative z-[56]">
            <FolderCardPreview
              label={newFolderName || "New Folder"}
              appearance={DEFAULT_APPEARANCE}
              noteCount={0}
              highlighted
            />
          </div>
        )}
      </div>

      <RecentlyDeletedSection />

      {/* Spotlight overlay */}
      {editingFolder && (
        <>
          {/* Full-screen click catcher */}
          <div
            className="fixed inset-0 z-[39]"
            onClick={closePanel}
          />
          {/* Spotlight: dims everything except the selected card */}
          {spotlightRect && (
            <div
              className="fixed z-40 rounded-xl pointer-events-none"
              style={{
                top: spotlightRect.top,
                left: spotlightRect.left,
                width: spotlightRect.width,
                height: spotlightRect.height,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
              }}
            />
          )}
        </>
      )}

      {/* Appearance panel */}
      {editingFolder?.type === "appearance" && (
        <FolderAppearanceModal
          open
          currentAppearance={getFolderAppearance(editingFolder.id)}
          onApply={(a) => handleAppearanceChange(editingFolder.id, a)}
          onClose={closePanel}
          position={panelPosition}
          side={panelSide}
          customColors={customColors}
          onAddCustomColor={onAddCustomColor}
          customImages={customImages}
          onAddCustomImage={onAddCustomImage}
        />
      )}

      {/* Rename panel */}
      {editingFolder?.type === "rename" && (
        <SidePanel
          title="Rename Folder"
          icon={Pencil}
          side={panelSide}
          position={panelPosition}
          onClose={closePanel}
          footer={
            <div className="flex justify-end gap-2 p-3">
              <button
                onClick={closePanel}
                className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={commitRename}
                disabled={!renameValue.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40"
              >
                Save
              </button>
            </div>
          }
        >
          <div className="p-3">
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Folder name
            </label>
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameValue.trim()) commitRename();
                if (e.key === "Escape") closePanel();
              }}
              placeholder="Folder name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </SidePanel>
      )}

      {/* Floating selection bar */}
      {barVisible && (
        <div data-selection-bar className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground text-background shadow-lg ${barClosing ? "animate-announce-card-out" : "animate-announce-card-in"}`}>
          <span className="text-xs font-medium">
            {lastCountRef.current} selected
          </span>
          <div className="w-px h-3.5 bg-background/20" />
          {/* Rename — only when exactly 1 non-General folder is selected */}
          {selectedFolderIds.size === 1 && !selectedFolderIds.has("general") && (
            <button
              onClick={handleRenameSelected}
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-background/10 transition-colors"
              title="Rename"
              aria-label="Rename folder"
            >
              <Pencil size={14} />
            </button>
          )}
          {/* Appearance — when exactly 1 folder is selected */}
          {selectedFolderIds.size === 1 && (
            <button
              onClick={handleAppearanceSelected}
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-background/10 transition-colors"
              title="Appearance"
              aria-label="Change folder appearance"
            >
              <ImageIcon size={14} />
            </button>
          )}
          {/* Delete — hide if only "general" is selected */}
          {Array.from(selectedFolderIds).some((id) => id !== "general") && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-background/10 transition-colors"
              title="Delete"
              aria-label="Delete folders"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={() => setSelectedFolderIds(new Set())}
            className="w-7 h-7 rounded-md flex items-center justify-center text-background/60 hover:text-background hover:bg-background/10 transition-colors"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Bulk delete confirmation */}
      <DeleteFolderConfirmModal
        open={showBulkDeleteConfirm}
        folderName={
          selectedFolderIds.size === 1
            ? (folders.find((f) => f.id === Array.from(selectedFolderIds)[0])?.label ?? "folder")
            : `${Array.from(selectedFolderIds).filter((id) => id !== "general").length} folders`
        }
        noteCount={
          Array.from(selectedFolderIds)
            .filter((id) => id !== "general")
            .reduce((sum, id) => sum + (noteCounts[id] ?? 0), 0)
        }
        onConfirm={handleDeleteSelected}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />
    </div>
  );
}
