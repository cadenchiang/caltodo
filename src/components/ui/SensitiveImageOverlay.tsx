"use client";

import { useState, useEffect } from "react";
import { EyeOff } from "lucide-react";

/**
 * Props for SensitiveImageOverlay.
 *
 * @property src - The image URL to display
 * @property alt - Alt text for the image
 * @property className - Additional CSS classes for the outer container
 * @property onImageClick - Callback when a revealed image is clicked (e.g. lightbox)
 */
interface SensitiveImageOverlayProps {
  src: string;
  alt?: string;
  className?: string;
  onImageClick?: () => void;
}

/**
 * Renders a blurred image with a "click to reveal" overlay for sensitive content.
 * Once revealed, clicking the image passes through to onImageClick (e.g. for lightbox).
 * The revealed state resets when the src prop changes.
 *
 * @param src - Image source URL
 * @param alt - Image alt text
 * @param className - Additional CSS classes
 * @param onImageClick - Click handler for revealed image
 */
export default function SensitiveImageOverlay({
  src,
  alt = "Sensitive content",
  className = "",
  onImageClick,
}: SensitiveImageOverlayProps) {
  const [revealed, setRevealed] = useState(false);

  // Reset revealed state when src changes
  useEffect(() => {
    setRevealed(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl cursor-pointer ${className}`}
      onClick={() => {
        if (revealed) {
          onImageClick?.();
        } else {
          setRevealed(true);
        }
      }}
    >
      <img
        src={src}
        alt={alt}
        className={`max-w-[240px] max-h-[320px] object-cover transition-all duration-300 ${
          revealed ? "" : "blur-[20px] scale-110"
        }`}
        loading="lazy"
      />

      {/* Overlay — semi-transparent backdrop with icon and text */}
      {!revealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 transition-opacity duration-300">
          <EyeOff size={24} className="text-white/80 mb-1.5" />
          <span className="text-white/90 text-xs font-medium">
            Sensitive content
          </span>
          <span className="text-white/60 text-[10px] mt-0.5">
            Click to reveal
          </span>
        </div>
      )}
    </div>
  );
}
