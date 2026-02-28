"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { hsvToRgb, rgbToHsv, hexToRgb, rgbToHex } from "@/lib/color-utils";

const RECENT_COLORS_KEY = "caltodo_recent_colors";
const MAX_RECENT = 6;

/** Wheel layout constants. */
const WHEEL_SIZE = 160;
const RING_WIDTH = 20;
const OUTER_R = WHEEL_SIZE / 2;
const INNER_R = OUTER_R - RING_WIDTH;
const CENTER = WHEEL_SIZE / 2;
const SV_SIZE = Math.floor(INNER_R * Math.SQRT2) - 6;
const SV_OFFSET = (WHEEL_SIZE - SV_SIZE) / 2;

interface ColorWheelProps {
  /** Current selected hex color. */
  value: string;
  /** Callback fired on every color change (live during drag). */
  onChange: (color: string) => void;
}

function loadRecentColors(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_COLORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch { return []; }
}

function saveRecentColor(color: string) {
  try {
    const existing = loadRecentColors();
    const upper = color.toUpperCase();
    const filtered = existing.filter(c => c.toUpperCase() !== upper);
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify([color, ...filtered].slice(0, MAX_RECENT)));
  } catch { /* storage unavailable */ }
}

/**
 * Circular hue wheel with an embedded saturation/value square picker.
 * Outer ring selects hue (0-360), inner square selects saturation (x) and brightness (y).
 */
export default function ColorWheel({ value, onChange }: ColorWheelProps) {
  const [rgb_r, rgb_g, rgb_b] = hexToRgb(value);
  const [initH, initS, initV] = rgbToHsv(rgb_r, rgb_g, rgb_b);

  const [hue, setHue] = useState(initH);
  const [sat, setSat] = useState(initS);
  const [val, setVal] = useState(initV);
  const [hexInput, setHexInput] = useState(value);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [dragging, setDragging] = useState<"hue" | "sv" | null>(null);

  const wheelRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setRecentColors(loadRecentColors()); }, []);

  // Sync from external value changes (skip during drag)
  useEffect(() => {
    if (dragging) return;
    const [r2, g2, b2] = hexToRgb(value);
    const [h2, s2, v2] = rgbToHsv(r2, g2, b2);
    if (s2 > 0.01) setHue(h2);
    setSat(s2);
    setVal(v2);
    setHexInput(value);
  }, [value, dragging]);

  const emitColor = useCallback((h: number, s: number, v: number) => {
    const [r, g, b] = hsvToRgb(h, s, v);
    onChange(rgbToHex(r, g, b));
  }, [onChange]);

  /** Ref tracks the latest value so the cleanup effect can save it on unmount. */
  const latestValueRef = useRef(value);
  useEffect(() => { latestValueRef.current = value; }, [value]);

  /** Save the selected color to recent colors when the wheel closes (unmounts). */
  useEffect(() => {
    return () => {
      saveRecentColor(latestValueRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Hue ring interaction ──

  /**
   * Converts screen coordinates to hue angle (0-360).
   * CSS conic-gradient starts at top (0deg), atan2 starts at right (0rad).
   * Conversion: hue = (atan2_deg + 90) % 360.
   */
  const getHueFromPointer = useCallback((clientX: number, clientY: number): number | null => {
    if (!wheelRef.current) return null;
    const rect = wheelRef.current.getBoundingClientRect();
    const scale = rect.width / WHEEL_SIZE;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dragging !== "hue" && (dist < INNER_R * scale - 2 || dist > OUTER_R * scale + 4)) return null;
    const atan2Deg = Math.atan2(dy, dx) * (180 / Math.PI);
    return ((atan2Deg + 90) % 360 + 360) % 360;
  }, [dragging]);

  const handleWheelPointerDown = useCallback((e: React.PointerEvent) => {
    const h = getHueFromPointer(e.clientX, e.clientY);
    if (h === null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging("hue");
    setHue(h);
    emitColor(h, sat, val);
  }, [getHueFromPointer, sat, val, emitColor]);

  const handleWheelPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging !== "hue" || !wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const atan2Deg = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const h = ((atan2Deg + 90) % 360 + 360) % 360;
    setHue(h);
    emitColor(h, sat, val);
  }, [dragging, sat, val, emitColor]);

  // ── SV square interaction ──

  const getSVFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!svRef.current) return null;
    const rect = svRef.current.getBoundingClientRect();
    return {
      s: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      v: Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height)),
    };
  }, []);

  const handleSVPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    const sv = getSVFromPointer(e.clientX, e.clientY);
    if (!sv) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging("sv");
    setSat(sv.s);
    setVal(sv.v);
    emitColor(hue, sv.s, sv.v);
  }, [getSVFromPointer, hue, emitColor]);

  const handleSVPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging !== "sv") return;
    const sv = getSVFromPointer(e.clientX, e.clientY);
    if (!sv) return;
    setSat(sv.s);
    setVal(sv.v);
    emitColor(hue, sv.s, sv.v);
  }, [dragging, getSVFromPointer, hue, emitColor]);

  const handlePointerUp = useCallback(() => {
    if (dragging) {
      setDragging(null);
    }
  }, [dragging]);

  // ── Indicator positions ──

  // Hue indicator on the ring: convert hue back to atan2 angle
  const atan2Rad = ((hue - 90) * Math.PI) / 180;
  const midR = (OUTER_R + INNER_R) / 2;
  const hueX = CENTER + midR * Math.cos(atan2Rad);
  const hueY = CENTER + midR * Math.sin(atan2Rad);

  // Pure hue color for SV square background
  const [pureR, pureG, pureB] = hsvToRgb(hue, 1, 1);
  const pureHue = `rgb(${pureR},${pureG},${pureB})`;

  return (
    <div className="flex flex-col items-center gap-3" style={{ width: WHEEL_SIZE + 20 }}>
      {/* Hue wheel + SV picker */}
      <div
        ref={wheelRef}
        className="relative touch-none cursor-crosshair"
        style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
        onPointerDown={handleWheelPointerDown}
        onPointerMove={handleWheelPointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Hue ring via conic-gradient + radial mask */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
            mask: `radial-gradient(circle, transparent ${INNER_R - 1}px, black ${INNER_R}px, black ${OUTER_R}px, transparent ${OUTER_R}px)`,
            WebkitMask: `radial-gradient(circle, transparent ${INNER_R - 1}px, black ${INNER_R}px, black ${OUTER_R}px, transparent ${OUTER_R}px)`,
          }}
        />

        {/* Hue indicator dot on ring */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
          style={{
            left: hueX - 8,
            top: hueY - 8,
            backgroundColor: pureHue,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)",
          }}
        />

        {/* SV square inside the ring */}
        <div
          ref={svRef}
          className="absolute touch-none cursor-crosshair rounded-sm overflow-hidden"
          style={{ left: SV_OFFSET, top: SV_OFFSET, width: SV_SIZE, height: SV_SIZE }}
          onPointerDown={handleSVPointerDown}
          onPointerMove={handleSVPointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Saturation gradient: white → pure hue (left to right) */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, white, ${pureHue})` }} />
          {/* Value gradient: transparent → black (top to bottom) */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, black)" }} />
          {/* SV indicator */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none"
            style={{
              left: `calc(${sat * 100}% - 7px)`,
              top: `calc(${(1 - val) * 100}% - 7px)`,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      </div>

      {/* Color preview + hex input */}
      <div className="flex items-center gap-2 w-full px-2 overflow-hidden">
        <div
          className="w-8 h-8 rounded-lg border border-border shrink-0 transition-colors"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={() => {
            let h = hexInput.trim();
            if (!h.startsWith("#")) h = "#" + h;
            if (/^#[0-9a-f]{6}$/i.test(h)) {
              onChange(h);
            } else {
              setHexInput(value);
            }
          }}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          className="flex-1 min-w-0 text-xs font-mono text-foreground bg-transparent border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
          maxLength={7}
        />
      </div>

      {/* Recent colors */}
      {recentColors.length > 0 && (
        <div className="w-full px-2 pt-1 border-t border-gray-200 dark:border-gray-500">
          <p className="text-[10px] text-muted-foreground dark:text-gray-300 mb-1.5">Recent</p>
          <div className="flex gap-2">
            {recentColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  saveRecentColor(c);
                  setRecentColors(loadRecentColors());
                }}
                className={`w-5 h-5 rounded-full transition-all duration-150 cursor-pointer ${
                  value.toUpperCase() === c.toUpperCase()
                    ? "ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900 scale-110"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Recent color ${c}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
