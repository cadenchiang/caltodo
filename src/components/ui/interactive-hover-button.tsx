import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

/**
 * Animated hover button with sliding text and expanding background.
 * On hover, a contrasting dot expands to fill the button and the text
 * slides to reveal an arrow. Text color inverts on hover for contrast.
 *
 * @param text - Button label text
 * @param className - Additional CSS classes for theming
 */
const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-40 cursor-pointer overflow-hidden rounded-full border py-1.5 px-2.5 text-center font-semibold",
        className,
      )}
      {...props}
    >
      <span className="inline-block translate-x-1 transition-all duration-200 group-hover:translate-x-12 group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-[#0071E3] opacity-0 transition-all duration-200 group-hover:-translate-x-1 group-hover:opacity-100">
        <span>{text}</span>
        <ArrowRight size={16} />
      </div>
      <div className="absolute left-[16%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-white transition-all duration-200 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]" />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
