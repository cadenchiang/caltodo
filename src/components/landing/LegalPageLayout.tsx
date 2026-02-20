"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Shared layout for legal pages (privacy, terms) with fade-in animation
 * and a back button in the top-left corner.
 *
 * @param children - Page content to render inside the layout
 */
export default function LegalPageLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black animate-fade-in">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-black/40 hover:text-black transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
            <path d="M10 12L6 8L10 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="caltodo" className="h-6" />
          <span className="text-lg font-bold tracking-tight text-black">caltodo</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-12">
        {children}
      </main>
    </div>
  );
}
