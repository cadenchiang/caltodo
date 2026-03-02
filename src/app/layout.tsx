import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import PostHogProvider from "@/components/PostHogProvider";
import PostHogPageView from "@/components/PostHogPageView";
import ChunkErrorRecovery from "@/components/ChunkErrorRecovery";
import "./globals.css";

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
    default: "CalTodo — Assignment Tracker for UC Berkeley Students",
    template: "%s | CalTodo",
  },
  description: "CalTodo syncs your bCourses, Gradescope, and Pensieve assignments into one dashboard. Free assignment tracker built for UC Berkeley students — never miss a deadline again.",
  keywords: ["caltodo", "cal todo", "UC Berkeley", "assignment tracker", "bCourses", "Gradescope", "Pensieve", "deadline tracker", "student planner", "Berkeley"],
  metadataBase: new URL("https://caltodo.me"),
  alternates: { canonical: "/" },
  applicationName: "CalTodo",
  openGraph: {
    title: "CalTodo — Assignment Tracker for UC Berkeley Students",
    description: "Sync bCourses, Gradescope, and Pensieve assignments into one dashboard. Free for UC Berkeley students.",
    url: "https://caltodo.me",
    siteName: "CalTodo",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CalTodo — assignment tracker for UC Berkeley students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CalTodo — Assignment Tracker for UC Berkeley",
    description: "Sync bCourses, Gradescope, and Pensieve into one dashboard. Free for Cal students.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
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
          <PostHogPageView />
          <ChunkErrorRecovery />
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
