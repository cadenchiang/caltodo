"use client";

import type { TypingUser } from "@/hooks/useTypingIndicator";

/**
 * Displays an animated "X is typing..." indicator below the message list.
 * Always renders a fixed-height container to prevent layout shift.
 * Uses opacity transitions to fade in/out instead of mount/unmount.
 *
 * @param typingUsers - Array of users currently typing (self excluded)
 * @returns A fixed-height container that fades between visible/hidden
 */
export default function TypingIndicator({
  typingUsers,
}: {
  typingUsers: TypingUser[];
}) {
  const active = typingUsers.length > 0;
  const label = active ? formatTypingLabel(typingUsers) : "";

  return (
    <div
      className={`flex items-center gap-1 pl-10 mt-2 h-4 overflow-hidden transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}
    >
      {active && (
        <>
          <span className="flex gap-[2px]">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[4px] h-[4px] rounded-full bg-muted-foreground/50"
                style={{
                  animation: "typing-bounce 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </span>
          <span className="text-[10px] text-muted-foreground/50">{label}</span>
        </>
      )}

      {/* Keyframes injected once via inline style tag */}
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

/**
 * Formats the typing label based on number of typing users.
 *
 * @param users - Array of currently typing users
 * @returns Human-readable label like "Alice is typing..." or "3 people are typing..."
 */
function formatTypingLabel(users: TypingUser[]): string {
  const name = (u: TypingUser) => u.userName ?? "Someone";

  if (users.length === 1) {
    return `${name(users[0])} is typing…`;
  }
  if (users.length === 2) {
    return `${name(users[0])} and ${name(users[1])} are typing…`;
  }
  return `${users.length} people are typing…`;
}
