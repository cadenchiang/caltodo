"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Full-screen image lightbox with smooth scale-up animation.
 * Renders as a portal to avoid overflow/clipping from parent containers.
 *
 * @param src - The image URL to display
 * @param onClose - Callback to close the lightbox
 */
interface ImageLightboxProps {
  src: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  /** Close on Escape key. */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /** Close when clicking the backdrop (not the image). */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose]
  );

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-[lightboxIn_200ms_ease-out] cursor-zoom-out"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer z-10"
        aria-label="Close"
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt="Enlarged attachment"
        className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain animate-[lightboxScale_250ms_cubic-bezier(0.16,1,0.3,1)]"
        draggable={false}
      />
    </div>,
    document.body
  );
}
