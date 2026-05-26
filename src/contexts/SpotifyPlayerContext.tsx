"use client";

/**
 * Persistent Spotify iframe. Owns a single iframe DOM node that is moved
 * between a widget host element (on the home board) and a hidden parking
 * container. The node is never removed from the document, so Spotify
 * playback continues across route changes and tab switches inside caltodo.
 *
 * Why this exists: mounting the iframe directly inside SpotifyWidget tore
 * audio down whenever the home route unmounted (navigating to Inbox,
 * Today, Calendar, etc.). React doesn't keep route subtrees mounted, so
 * the iframe needs to live above the router.
 *
 * @module SpotifyPlayerContext
 */

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";

interface SpotifyPlayerContextValue {
  /**
   * Update the Spotify embed URL. No-ops if the URL hasn't changed so
   * re-renders don't tear the iframe down. Pass an empty string to skip.
   */
  setUrl: (url: string) => void;
  /**
   * Attach the iframe to a host element. Idempotent — repeated calls
   * with the same host are no-ops.
   */
  attach: (host: HTMLElement) => void;
  /**
   * Detach the iframe FROM a specific host, moving it back to the
   * hidden parking container. No-op if the iframe is no longer attached
   * to that host (e.g., another widget already took ownership), which
   * avoids breaking multi-widget setups when the previous widget's
   * useEffect cleanup runs after the new widget's effect.
   */
  detach: (prevHost: HTMLElement) => void;
}

const SpotifyPlayerCtx = createContext<SpotifyPlayerContextValue | null>(null);

/**
 * Returns the persistent Spotify player context. Returns null outside the
 * provider (no-op for components that mount outside /app).
 */
export function useSpotifyPlayer(): SpotifyPlayerContextValue | null {
  return useContext(SpotifyPlayerCtx);
}

interface SpotifyPlayerProviderProps {
  children: ReactNode;
}

/**
 * Provider that creates and keeps alive a single Spotify embed iframe.
 * Mount once at the authenticated app layout level so it survives route
 * transitions for every signed-in user.
 *
 * The iframe is created lazily on first attach/setUrl so the provider
 * doesn't need to race with consumer effects (child effects fire before
 * parent effects in React).
 *
 * @param children - Subtree rendered inside the provider
 */
export function SpotifyPlayerProvider({ children }: SpotifyPlayerProviderProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const parkingRef = useRef<HTMLDivElement | null>(null);
  const currentSrcRef = useRef<string>("");

  const ensureIframe = useCallback((): HTMLIFrameElement | null => {
    if (iframeRef.current) return iframeRef.current;
    if (typeof document === "undefined") return null;
    const iframe = document.createElement("iframe");
    iframe.title = "Spotify Player";
    iframe.setAttribute(
      "allow",
      "encrypted-media; autoplay; clipboard-write; picture-in-picture",
    );
    iframe.setAttribute("loading", "eager");
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.width = "100%";
    iframe.style.height = "152px";
    iframeRef.current = iframe;
    if (parkingRef.current && !iframe.parentElement) {
      parkingRef.current.appendChild(iframe);
    }
    return iframe;
  }, []);

  const setUrl = useCallback(
    (url: string) => {
      if (!url) return;
      if (currentSrcRef.current === url) return;
      const iframe = ensureIframe();
      if (!iframe) return;
      currentSrcRef.current = url;
      iframe.src = url;
    },
    [ensureIframe],
  );

  const attach = useCallback(
    (host: HTMLElement) => {
      const iframe = ensureIframe();
      if (!iframe) return;
      if (iframe.parentElement !== host) {
        host.appendChild(iframe);
      }
    },
    [ensureIframe],
  );

  const detach = useCallback((prevHost: HTMLElement) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    // Only detach if we still own the iframe in this host. Another widget
    // may have taken it; in that case leave it where it is.
    if (iframe.parentElement !== prevHost) return;
    const parking = parkingRef.current;
    if (parking) {
      parking.appendChild(iframe);
    }
  }, []);

  return (
    <SpotifyPlayerCtx.Provider value={{ setUrl, attach, detach }}>
      {children}
      <div
        ref={(el) => {
          parkingRef.current = el;
          // If the iframe was created before the parking div mounted,
          // move it into the parking lot now.
          if (el && iframeRef.current && !iframeRef.current.parentElement) {
            el.appendChild(iframeRef.current);
          }
        }}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          width: "320px",
          height: "152px",
          pointerEvents: "none",
          opacity: 0,
        }}
      />
    </SpotifyPlayerCtx.Provider>
  );
}
