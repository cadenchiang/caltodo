"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Renders the folder title with auto-shrinking font size.
 * Starts at 36px and shrinks until text fits within 3 lines.
 *
 * @param label - The folder name to display
 */
export function FolderTitle({ label }: { label: string }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(36);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    let size = 36;
    el.style.fontSize = `${size}px`;
    el.style.lineHeight = "1.2";
    const threeLineMax = () => Math.ceil(size * 1.2) * 3 + 2;
    while (el.scrollHeight > threeLineMax() && size > 14) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
    setFontSize(size);
  }, [label]);

  return (
    <h1
      ref={titleRef}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.2 }}
      className="font-bold text-foreground"
    >
      {label}
    </h1>
  );
}
