"use client";

import type { DiscussionBoard } from "@/lib/types";
import BoardCard from "./BoardCard";
import EmptyBoardState from "./EmptyBoardState";

/**
 * Grid of enrolled course chat rooms.
 *
 * @param boards - Array of discussion boards to display
 * @param loading - Whether data is still loading
 */
interface BoardListProps {
  boards: DiscussionBoard[];
  loading: boolean;
}

export default function BoardList({ boards, loading }: BoardListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="h-4 bg-muted rounded w-3/4 mb-3" />
            <div className="h-3 bg-muted rounded w-1/2 mb-3" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (boards.length === 0) {
    return <EmptyBoardState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {boards.map((board) => (
        <div key={board.course.id}>
          <BoardCard board={board} />
        </div>
      ))}
    </div>
  );
}
