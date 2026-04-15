import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
    apple: [{ url: "/apple-icon-miffy.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CalTodo",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=Manrope:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&family=Outfit:wght@200;300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&family=Sora:wght@200;300;400;500;600;700&family=Source+Serif+4:wght@300;400;500;600;700&family=Urbanist:wght@200;300;400;500;600;700&family=Varela+Round&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
        <Analytics />
      </body>
    </html>
  );
}
