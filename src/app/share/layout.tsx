import type { Metadata } from "next";

/**
 * Layout for the /share route.
 *
 * Adds noindex metadata since this is a redirect-only page (opens SMS)
 * with no meaningful content for search engines to index.
 *
 * @param children - Child page components to render.
 * @returns Passthrough layout rendering children directly.
 */
export const metadata: Metadata = {
  title: "Share caltodo",
  robots: { index: false, follow: false },
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
