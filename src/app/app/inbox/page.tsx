"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTaskContext } from "@/contexts/TaskContext";
import { pushBatchDeleteToGCal } from "@/lib/gcal/client-push";
import { getRealTaskId } from "@/lib/expand-repeating-tasks";
import TaskList from "@/components/tasks/TaskList";
import TaskBoardView from "@/components/tasks/TaskBoardView";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import TaskCreateModal from "@/components/tasks/TaskCreateModal";
import SyncClassesModal from "@/components/calendar/SyncClassesModal";
import { ADD_TASK_EVENT } from "@/components/layout/MobileTabBar";
import PageTransition from "@/components/ui/PageTransition";
import type { Task } from "@/lib/types";
import InboxToolbar from "./InboxToolbar";
import InboxTaskOverlays from "./InboxTaskOverlays";
import { useInboxPreferences } from "./useInboxPreferences";
import { useInviteResponses } from "./useInviteResponses";
import { filterTasksByDate, sortByClass, sortByDate } from "./inbox-helpers";

/**
 * Inbox page: toolbar, task list or board on the left, detail panel on the
 * right (list view, md and up). Mobile and the board use a preview popover
 * that hands off to the full edit modal.
 */
export default function InboxPage() {
  const {
    tasks, loading, error, addTask, toggleComplete: rawToggle, deleteTask: rawDelete, updateTask: rawUpdate,
    recolorTasks, deleteTasks, syncing, reorderTasks, fetchTasks, lastSyncedAt,
  } = useTaskContext();
  const prefs = useInboxPreferences();
  const { invites, respond, acceptAll } = useInviteResponses(fetchTasks);
  const router = useRouter();
  const searchParams = useSearchParams();

  /** Wraps toggleComplete to resolve virtual repeat instance IDs to real task IDs. */
  const toggleComplete = useCallback((id: string) => rawToggle(getRealTaskId(id)), [rawToggle]);
  /** Wraps deleteTask to resolve virtual repeat instance IDs to real task IDs. */
  const deleteTask = useCallback((id: string) => rawDelete(getRealTaskId(id)), [rawDelete]);
  /** Wraps updateTask to resolve virtual repeat instance IDs to real task IDs. */
  const updateTask = useCallback(
    (id: string, updates: Parameters<typeof rawUpdate>[1]) => rawUpdate(getRealTaskId(id), updates),
    [rawUpdate],
  );

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalCourseName, setAddModalCourseName] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  /**
   * Row activation. Below md the list shows the preview popover anchored at
   * the row; otherwise the detail panel. Memoized so memo'd rows stay memo'd.
   */
  const handleListSelect = useCallback((task: Task, anchorRect?: DOMRect) => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && anchorRect) {
      setPreviewTask(task);
      setPreviewRect(anchorRect);
    } else {
      setSelectedTask(task);
    }
  }, []);

  /** Board cards always open the preview popover. */
  const handleBoardSelect = useCallback((task: Task, anchorRect?: DOMRect) => {
    setPreviewTask(task);
    setPreviewRect(anchorRect ?? null);
  }, []);

  const closePreview = useCallback(() => { setPreviewTask(null); setPreviewRect(null); }, []);

  // The mobile tab bar's Add button: an event when already here, ?add=1
  // when it navigated here first.
  useEffect(() => {
    const open = () => setShowAddModal(true);
    window.addEventListener(ADD_TASK_EVENT, open);
    if (new URLSearchParams(window.location.search).get("add") === "1") {
      open();
      window.history.replaceState(null, "", "/app/inbox");
    }
    return () => window.removeEventListener(ADD_TASK_EVENT, open);
  }, []);

  // Auto-select task from ?task= (notification click-through, /app/today redirect).
  const taskParamHandled = useRef(false);
  useEffect(() => {
    if (taskParamHandled.current || loading || tasks.length === 0) return;
    const taskId = searchParams.get("task");
    if (!taskId) return;
    taskParamHandled.current = true;
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      if (typeof window !== "undefined" && window.innerWidth < 768) setModalTask(target);
      else setSelectedTask(target);
    } else {
      console.warn("[InboxPage] ?task= did not match a loaded task", { taskId });
    }
    router.replace("/app/inbox", { scroll: false });
  }, [searchParams, tasks, loading, router]);

  // Keep the open task in sync with context after updates.
  const currentSelectedTask = selectedTask ? tasks.find((t) => t.id === selectedTask.id) ?? null : null;
  const currentPreviewTask = previewTask ? tasks.find((t) => t.id === previewTask.id) ?? null : null;

  const filteredTasks = useMemo(() => filterTasksByDate(tasks, prefs.filter), [tasks, prefs.filter]);
  const sortedTasks = useMemo(
    () => (prefs.sortMode === "class" ? sortByClass(filteredTasks) : sortByDate(filteredTasks)),
    [filteredTasks, prefs.sortMode]
  );

  /** Recolors every task in a class with one request. */
  const handleColorChange = useCallback(
    (courseName: string, color: string) => {
      const ids = tasks.filter((t) => (t.course_name || "General") === courseName).map((t) => getRealTaskId(t.id));
      return recolorTasks([...new Set(ids)], color);
    },
    [tasks, recolorTasks]
  );

  /** Deletes every task in a class: one calendar batch, two row requests, one Undo. */
  const handleDeleteClass = useCallback(
    async (courseName: string) => {
      const ids = [...new Set(tasks.filter((t) => (t.course_name || "General") === courseName).map((t) => getRealTaskId(t.id)))];
      if (ids.length === 0) return;
      await pushBatchDeleteToGCal(ids);
      await deleteTasks(ids);
    },
    [tasks, deleteTasks]
  );

  const isList = prefs.viewMode === "list";

  return (
    <PageTransition>
      {/* Height cancels exactly the negative top margin so the page fills
          <main> without overflowing it; the list owns the only scroll area. */}
      <div className="flex flex-row -m-4 md:-m-10 h-[calc(100%+1rem)] md:h-[calc(100%+2.5rem)] overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0 md:min-w-[320px] min-h-0">
          <InboxToolbar
            filter={prefs.filter}
            onFilterChange={prefs.setFilter}
            viewMode={prefs.viewMode}
            onViewModeChange={prefs.setViewMode}
            sortValue={isList ? prefs.sortMode : prefs.boardGroupBy}
            onSortChange={isList ? prefs.setSortMode : prefs.setBoardGroupBy}
            onAddTask={() => setShowAddModal(true)}
            onSync={() => setShowSyncModal(true)}
            syncing={syncing}
            lastSyncedAt={lastSyncedAt}
          />

          <TaskCreateModal
            open={showAddModal}
            onClose={() => { setShowAddModal(false); setAddModalCourseName(null); }}
            onAdd={(task) => {
              setShowAddModal(false);
              setAddModalCourseName(null);
              return addTask(task);
            }}
            defaultCourseName={addModalCourseName}
          />

          <div id="tour-task-list" className={`flex-1 min-h-0 overflow-y-auto pl-4 md:pl-8 pr-4 ${isList ? "md:pr-6" : "md:pr-8"}`}>
            <div className="h-full">
              {isList ? (
                <TaskList
                  tasks={sortedTasks}
                  loading={loading}
                  error={error}
                  selectedTaskId={selectedTask?.id}
                  sortMode={prefs.sortMode}
                  filter={prefs.filter}
                  onAddClick={() => setShowAddModal(true)}
                  onAdd={addTask}
                  onToggle={toggleComplete}
                  onSelect={handleListSelect}
                  onDelete={deleteTask}
                  onReorder={prefs.sortMode === "date" ? reorderTasks : undefined}
                  onColorChange={handleColorChange}
                  onDeleteClass={handleDeleteClass}
                  onAddTaskToClass={(courseName) => { setAddModalCourseName(courseName); setShowAddModal(true); }}
                  pendingInvites={invites}
                  onRespondInvite={respond}
                  onAcceptAllInvites={acceptAll}
                  onDeselect={() => setSelectedTask(null)}
                />
              ) : (
                <TaskBoardView
                  tasks={filteredTasks}
                  loading={loading}
                  error={error}
                  selectedTaskId={previewTask?.id}
                  groupBy={prefs.boardGroupBy}
                  onAdd={addTask}
                  onToggle={toggleComplete}
                  onSelect={handleBoardSelect}
                  onDelete={deleteTask}
                  onColorChange={handleColorChange}
                  onDeleteClass={handleDeleteClass}
                />
              )}
            </div>
          </div>
        </div>

        {/* Detail panel: list view, md and up. 42% at md leaves the list a
            usable width beside it; 50% from lg. Clicking the empty wrapper
            deselects; clicks inside the panel do not. */}
        {isList && (
          <div
            className="hidden md:flex md:w-[42%] lg:w-[50%] shrink-0 border-l border-border h-full"
            onClick={(e) => {
              if (e.target !== e.currentTarget) return;
              setSelectedTask(null);
            }}
          >
            <TaskDetailPanel task={currentSelectedTask} onClose={() => setSelectedTask(null)} onSave={updateTask} onDelete={deleteTask} />
          </div>
        )}
      </div>

      <InboxTaskOverlays
        previewTask={currentPreviewTask}
        previewRect={previewRect}
        modalTask={modalTask}
        onClosePreview={closePreview}
        onOpenModal={setModalTask}
        onCloseModal={() => setModalTask(null)}
        onToggle={toggleComplete}
        onDelete={deleteTask}
        onSave={updateTask}
        onSaveColorForClass={handleColorChange}
      />

      <SyncClassesModal open={showSyncModal} onClose={() => setShowSyncModal(false)} />
    </PageTransition>
  );
}
