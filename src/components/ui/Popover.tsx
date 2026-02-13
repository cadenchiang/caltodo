"use client";

import { useRef, useEffect, useState } from "react";
import useClickOutside from "@/hooks/useClickOutside";

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Animated popover wrapper with fade+scale transition and click-outside-to-close.
 * Mounts children when open, animates in/out with CSS transitions.
 *
 * @param open - Whether the popover is visible
 * @param onClose - Callback to close the popover
 * @param children - Popover content
 * @param className - Additional CSS classes for positioning
 */
export default function Popover({ open, onClose, children, className = "" }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useClickOutside(ref, onClose, open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Delay to allow mount before triggering CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      // Wait for exit transition before unmounting
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      className={`transition-all duration-150 ease-out ${
        visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1"
      } ${className}`}
    >
      {children}
    </div>
  );
}
