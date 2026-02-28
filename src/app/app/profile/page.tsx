"use client";

import ProfileSection from "@/components/settings/sections/ProfileSection";
import PageTransition from "@/components/ui/PageTransition";

/**
 * Standalone profile page.
 * Renders the ProfileSection (avatar, name, friends) outside of settings.
 */
export default function ProfilePage() {
  return (
    <PageTransition>
      <div className="flex flex-col h-full -m-4 md:-m-10">
        <div className="flex-1 overflow-auto px-4 pt-6 pb-8 md:px-8 md:pt-20">
          <div className="max-w-2xl mx-auto md:mr-auto md:ml-[15%]">
            <ProfileSection />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
