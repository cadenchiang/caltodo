"use client";

import { useEffect } from "react";

/** Google Fonts stylesheet for the customization font pickers (12 families). */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=Manrope:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&family=Outfit:wght@200;300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&family=Sora:wght@200;300;400;500;600;700&family=Source+Serif+4:wght@300;400;500;600;700&family=Urbanist:wght@200;300;400;500;600;700&family=Varela+Round&display=swap";

/**
 * Loads the customization fonts after first paint instead of as a
 * render-blocking stylesheet in <head>. These fonts only matter for the
 * board font pickers and custom board titles; blocking initial render of
 * every app page on a 12-family stylesheet made fresh tabs feel hung.
 * display=swap means any custom-font text renders with a fallback first.
 */
export default function DeferredFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  return null;
}
