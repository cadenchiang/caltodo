import Skeleton from "@/components/ui/Skeleton";

interface TaskListSkeletonProps {
  /** Number of placeholder rows. Defaults to 8. */
  rows?: number;
}

/**
 * Row-shaped placeholder for the task list: a checkbox square, a title line
 * of varying width and a due-date pill, at the same height and gutter as a
 * real TaskItem row so the swap to content does not shift the layout.
 *
 * @param rows - How many rows to sketch
 * @remarks Used by TaskList while loading and by the inbox route's
 *          loading.tsx, so the two skeletons are one shape.
 */
export default function TaskListSkeleton({ rows = 8 }: TaskListSkeletonProps) {
  return (
    <div className="mt-1" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading tasks</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 -ml-3 pl-3 pr-3 py-2.5 md:-ml-4 md:pl-4 md:pr-4">
          <Skeleton className="w-3.5 h-3.5 rounded-[4px]" />
          <Skeleton className="h-4" style={{ width: `${40 + ((i * 17) % 40)}%` }} />
          <Skeleton shape="pill" className="ml-auto h-5 w-14" />
        </div>
      ))}
    </div>
  );
}
