import Skeleton from "@/components/ui/Skeleton";
import TaskListSkeleton from "@/components/tasks/list/TaskListSkeleton";

/**
 * Instant skeleton for /app/inbox. Mirrors the page's wrapper exactly (the
 * same negative margins and toolbar padding) so the rows sit where the real
 * rows land and nothing jumps when content arrives.
 */
export default function InboxLoading() {
  return (
    <div className="flex flex-row -m-4 md:-m-10 h-[calc(100%+1rem)] md:h-[calc(100%+2.5rem)] overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="pl-4 pr-3 pt-4 pb-2 md:pl-8 md:pr-6 md:pt-5 md:pb-2 flex items-center justify-between">
          <Skeleton shape="title" className="h-7 w-28 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton shape="circle" />
            <Skeleton shape="circle" />
            <Skeleton shape="circle" />
          </div>
        </div>
        <div className="pl-4 md:pl-8 pr-4 md:pr-6">
          <TaskListSkeleton />
        </div>
      </div>
      <div className="hidden md:flex md:w-[42%] lg:w-[50%] shrink-0 border-l border-border h-full" />
    </div>
  );
}
