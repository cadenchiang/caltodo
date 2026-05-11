import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SWRProvider from "@/components/SWRProvider";
import PostHogProvider from "@/components/PostHogProvider";
import ChunkErrorRecovery from "@/components/ChunkErrorRecovery";
import { validateEnv } from "@/lib/env-check";
import "./globals.css";

// Run env validation once at module load (server-side only)
validateEnv();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "caltodo",
    template: "%s | caltodo",
  },
  description: "sync your classes, upload your syllabus, and manage every deadline in one place. free for students.",
  keywords: ["caltodo", "cal todo", "assignment management", "deadline tracker", "student planner", "syllabus upload", "class sync"],
  metadataBase: new URL("https://caltodo.me"),
  alternates: { canonical: "/" },
  applicationName: "caltodo",
  openGraph: {
    title: "caltodo",
    description: "sync your classes, upload your syllabus, and manage every deadline in one place. free for students.",
    url: "https://caltodo.me",
    siteName: "caltodo",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "caltodo — manage every deadline in one place",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "caltodo",
    description: "sync your classes, upload your syllabus, and manage every deadline in one place. free for students.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    // "default" = white status bar with system-reserved space, so the
    // app content sits below it instead of sliding under. Avoids the
    // "page shifts up into the status bar" problem on installed PWAs.
    statusBarStyle: "default",
    title: "caltodo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1c1e" },
  ],
};

/**
 * Inline script that runs before paint to prevent flash of wrong theme.
 * Reads from localStorage and uses sunset/sunrise calculation for "auto" mode.
 * The solar math is inlined (same NOAA formula as src/lib/solar.ts).
 */
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem("caltodo_theme");
    var isDark;
    if (t === "dark") {
      isDark = true;
    } else if (t === "light") {
      isDark = false;
    } else {
      // Auto mode: compute sunset/sunrise
      var c = { lat: 37.87, lng: -122.27 };
      try {
        var s = localStorage.getItem("caltodo_coords");
        if (s) { var p = JSON.parse(s); if (typeof p.lat === "number") c = p; }
      } catch(e) {}
      var now = new Date();
      var D = Math.PI / 180;
      var m = now.getMonth() + 1, d = now.getDate(), y = now.getFullYear();
      var n1 = Math.floor(275 * m / 9);
      var n2 = Math.floor((m + 9) / 12);
      var n3 = 1 + Math.floor((y - 4 * Math.floor(y / 4) + 2) / 3);
      var doy = n1 - n2 * n3 + d - 30;
      var dec = -23.45 * D * Math.cos(D * (360 / 365) * (doy + 10));
      var lat = c.lat * D;
      var cosH = (Math.cos(90.833 * D) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec));
      if (cosH >= 1 || cosH <= -1) {
        isDark = false;
      } else {
        var ha = Math.acos(cosH) * (180 / Math.PI);
        var tz = -now.getTimezoneOffset() / 60;
        var noon = 12 - c.lng / 15 + tz;
        var srMin = Math.round((noon - ha / 15) * 60);
        var ssMin = Math.round((noon + ha / 15) * 60);
        var nowMin = now.getHours() * 60 + now.getMinutes();
        isDark = nowMin < srMin || nowMin > ssMin;
      }
    }
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
    var ct = localStorage.getItem("caltodo_color_theme");
    if (ct && /^[a-z]+$/.test(ct)) {
      document.documentElement.classList.add("theme-" + ct);
    }
    var link = document.querySelector('link[rel="icon"]');
    if (link) {
      if (ct === "miffy") {
        link.href = isDark ? "/favicon-miffy-dark.png" : "/favicon-miffy.png";
      } else {
        link.href = isDark ? "/icon-dark.png" : "/icon-light.png";
      }
    }
  } catch(e) {}
})();
`;

/**
 * Inline script that runs before paint to prevent flash of hidden nav items.
 * Reads the user's hidden-nav-href list from localStorage and injects a
 * synchronous <style> rule that hides matching nav links via their
 * data-nav-href attribute. Without this, SSR renders all nav items and they
 * briefly flash visible before React hydrates and filters them out.
 *
 * The injected <style id="caltodo-hidden-nav-style"> tag is removed by
 * useHiddenNavItems on mount, after which React's filter is the sole
 * source of truth for nav visibility (so toggling a hidden item back on
 * actually shows it).
 */
const hiddenNavScript = `
(function() {
  try {
    var raw = localStorage.getItem("caltodo_hidden_nav_items");
    if (!raw) return;
    var arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return;
    var sels = [];
    for (var i = 0; i < arr.length; i++) {
      var v = arr[i];
      if (typeof v !== "string") continue;
      // Only allow nav-style hrefs to prevent CSS injection via crafted localStorage values.
      if (!/^\\/[A-Za-z0-9/_-]+$/.test(v)) continue;
      sels.push('[data-nav-href="' + v + '"]');
    }
    if (!sels.length) return;
    var style = document.createElement("style");
    style.id = "caltodo-hidden-nav-style";
    style.textContent = sels.join(",") + "{display:none !important;}";
    document.head.appendChild(style);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          The customization fonts (DM Sans, Manrope, Playfair, etc.) are only
          used inside the authenticated /app section by the FontPicker. They
          are loaded in src/app/app/layout.tsx so landing visitors don't pay
          the render-blocking cost of a 12-family Google Fonts stylesheet.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: hiddenNavScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        <PostHogProvider>
          <ChunkErrorRecovery />
          <ThemeProvider>
            <SWRProvider>
              {children}
            </SWRProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
