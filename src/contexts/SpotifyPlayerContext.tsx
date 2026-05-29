"use client";

/**
 * Persistent Spotify iframe. Owns a single iframe DOM node that stays
 * in a fixed-position container and is NEVER moved between parents
 * (moving an iframe in the DOM causes the browser to reload it, which
 * kills audio playback). Instead, CSS positioning overlays the iframe
 * on the widget's bounding rect when visible, and hides it when not.
 *
 * @module SpotifyPlayerContext
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

interface SpotifyPlayerContextValue {
  setUrl: (url: string) => void;
  attach: (host: HTMLElement) => void;
  detach: (prevHost: HTMLElement) => void;
}

const SpotifyPlayerCtx = createContext<SpotifyPlayerContextValue | null>(null);

export function useSpotifyPlayer(): SpotifyPlayerContextValue | null {
  return useContext(SpotifyPlayerCtx);
}

interface SpotifyPlayerProviderProps {
  children: ReactNode;
}

export function SpotifyPlayerProvider({ children }: SpotifyPlayerProviderProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentSrcRef = useRef<string>("");
  const hostRef = useRef<HTMLElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

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
    iframe.style.height = "100%";
    iframe.style.borderRadius = "12px";
    iframeRef.current = iframe;
    if (containerRef.current && !iframe.parentElement) {
      containerRef.current.appendChild(iframe);
    }
    return iframe;
  }, []);

  const syncPosition = useCallback(() => {
    const host = hostRef.current;
    const container = containerRef.current;
    if (!container) return;

    if (host) {
      const rect = host.getBoundingClientRect();
      container.style.left = `${rect.left}px`;
      container.style.top = `${rect.top}px`;
      container.style.width = `${rect.width}px`;
      container.style.height = `${rect.height}px`;
      container.style.opacity = "1";
      container.style.pointerEvents = "auto";
      container.style.zIndex = "10";
    } else {
      container.style.left = "0px";
      container.style.top = "0px";
      container.style.width = "320px";
      container.style.height = "152px";
      container.style.opacity = "0";
      container.style.pointerEvents = "none";
      container.style.zIndex = "-1";
    }
  }, []);

  const startTracking = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;

    const host = hostRef.current;
    if (!host) {
      syncPosition();
      return;
    }

    syncPosition();

    const mainEl = host.closest("main");
    const onUpdate = () => syncPosition();

    mainEl?.addEventListener("scroll", onUpdate, { passive: true });
    window.addEventListener("resize", onUpdate, { passive: true });

    const ro = new ResizeObserver(onUpdate);
    ro.observe(host);

    const interval = setInterval(onUpdate, 400);

    cleanupRef.current = () => {
      mainEl?.removeEventListener("scroll", onUpdate);
      window.removeEventListener("resize", onUpdate);
      ro.disconnect();
      clearInterval(interval);
    };
  }, [syncPosition]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
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
      ensureIframe();
      hostRef.current = host;
      startTracking();
    },
    [ensureIframe, startTracking],
  );

  const detach = useCallback(
    (prevHost: HTMLElement) => {
      if (hostRef.current !== prevHost) return;
      hostRef.current = null;
      cleanupRef.current?.();
      cleanupRef.current = null;
      syncPosition();
    },
    [syncPosition],
  );

  return (
    <SpotifyPlayerCtx.Provider value={{ setUrl, attach, detach }}>
      {children}
      <div
        ref={(el) => {
          containerRef.current = el;
          if (el && iframeRef.current && !iframeRef.current.parentElement) {
            el.appendChild(iframeRef.current);
          }
        }}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "0px",
          top: "0px",
          width: "320px",
          height: "152px",
          pointerEvents: "none",
          opacity: 0,
          zIndex: -1,
          overflow: "hidden",
          borderRadius: "12px",
        }}
      />
    </SpotifyPlayerCtx.Provider>
  );
}
