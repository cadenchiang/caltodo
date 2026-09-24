import { ChatPageSkeleton } from "@/components/discussions/ChatSkeleton";

/**
 * Instant skeleton for /app/discussions. Renders the same ChatPageSkeleton
 * the page and the room use post-mount, so there is no second skeleton
 * flash when the route-level loading.tsx hands off to the page itself.
 */
export default function DiscussionsLoading() {
  return <ChatPageSkeleton />;
}
