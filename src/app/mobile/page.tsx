import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Desktop Only - caltodo",
};

/**
 * Mobile landing page shown when users tap "Get Started" on a mobile device.
 * Informs them that caltodo is currently desktop-only.
 */
export default function MobilePage() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center px-6 bg-white text-center">
      <img src="/logo.png" alt="caltodo" className="h-12 mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Only available on desktop
      </h1>
      <p className="text-gray-400 text-sm mb-6">App coming soon.</p>
      <p className="text-gray-500 text-[15px] leading-relaxed max-w-xs mb-4">
        Visit on your laptop or computer:
      </p>
      <p className="text-2xl font-bold text-gray-900 mb-8">caltodo.me</p>
    </div>
  );
}
