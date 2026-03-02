"use client";

/**
 * Live clock widget — thin dispatcher that delegates to a clock face component.
 * Manages the 1-second timer and resolves the active face from config.
 *
 * @param config - Widget configuration (clockFace, clockFormat, clockTimezone, clockFontWeight)
 */

import { useState, useEffect } from "react";
import { CLOCK_FACE_MAP, DigitalFace } from "./clock-faces";

interface ClockWidgetProps {
  config?: Record<string, string>;
}

export default function ClockWidget({ config }: ClockWidgetProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  const faceId = config?.clockFace || "digital";
  const Face = CLOCK_FACE_MAP[faceId] || DigitalFace;

  return (
    <Face
      now={now}
      is24h={config?.clockFormat === "24"}
      timezone={config?.clockTimezone || undefined}
      fontWeight={config?.clockFontWeight || "300"}
    />
  );
}
