"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IntegrationProvider } from "@/components/settings/IntegrationSettings";
import PageTransition from "@/components/ui/PageTransition";
import ProfileSection from "@/components/settings/sections/ProfileSection";
import IntegrationsSection from "@/components/settings/sections/IntegrationsSection";
import ClassesSectionWrapper from "@/components/settings/sections/ClassesSectionWrapper";
import AppearanceSection from "@/components/settings/sections/AppearanceSection";
import AdvancedSection from "@/components/settings/sections/AdvancedSection";
import {
  SETTINGS_SECTIONS,
  SETTINGS_GROUPS,
  DEFAULT_SECTION,
  type SettingsSectionId,
} from "@/lib/settingsConfig";

/**
 * Renders the correct section component for a given section ID.
 *
 * @param sectionId - The active settings section identifier
 * @returns The corresponding React section component
 */
function renderSection(sectionId: SettingsSectionId) {
  switch (sectionId) {
    case "profile":
      return <ProfileSection />;
    case "integrations":
      return <IntegrationsSection />;
    case "classes":
      return <ClassesSectionWrapper />;
    case "appearance":
      return <AppearanceSection />;
    case "advanced":
      return <AdvancedSection />;
  }
}

/** Valid section IDs for type-guarding search params. */
const VALID_SECTIONS = new Set<string>(SETTINGS_SECTIONS.map((s) => s.id));

/**
 * Settings page orchestrator.
 * Desktop: sidebar handles nav, this renders the selected section.
 * Mobile: no section param shows list menu; with section param shows content + back.
 * Handles GCal OAuth redirect by auto-adding section=integrations.
 */
export default function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSection = searchParams.get("section");
  const activeSection: SettingsSectionId | null =
    rawSection && VALID_SECTIONS.has(rawSection)
      ? (rawSection as SettingsSectionId)
      : null;

  // GCal OAuth redirect fix: if ?gcal= is present but no ?section=, redirect
  useEffect(() => {
    const gcalParam = searchParams.get("gcal");
    if (gcalParam && !searchParams.get("section")) {
      const url = new URL(window.location.href);
      url.searchParams.set("section", "integrations");
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  /** Navigate to a specific section (used by mobile list). */
  function goToSection(id: SettingsSectionId) {
    router.push(`/app/settings?section=${id}`);
  }

  /** Navigate back from section detail (mobile). */
  function goBackToList() {
    router.push("/app/settings");
  }

  return (
    <PageTransition>
      <IntegrationProvider>
        <div className="flex h-full -m-4 md:-m-10">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* === MOBILE VIEW === */}
            <div className="md:hidden flex flex-col h-full">
              {activeSection ? (
                <>
                  {/* Mobile: section detail with back button */}
                  <div className="px-4 pt-4 pb-2 animate-stagger stagger-1">
                    <button
                      onClick={goBackToList}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer active:scale-[0.98]"
                    >
                      <ChevronLeft size={16} />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto px-4 pt-2 pb-8">
                    <div key={activeSection} className="max-w-xl animate-page-in">
                      {renderSection(activeSection)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile: section list menu */}
                  <div className="px-4 pt-4 pb-2 animate-stagger stagger-1">
                    <button
                      onClick={() => router.push("/app/inbox")}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer active:scale-[0.98]"
                    >
                      <ChevronLeft size={16} />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto px-4 pt-2 pb-8">
                    <div className="max-w-xl space-y-6 animate-stagger stagger-2">
                      {SETTINGS_GROUPS.map((group) => (
                        <div key={group}>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">
                            {group}
                          </p>
                          <div className="flex flex-col gap-1">
                            {SETTINGS_SECTIONS.filter((s) => s.group === group).map((section) => {
                              const Icon = section.icon;
                              return (
                                <button
                                  key={section.id}
                                  onClick={() => goToSection(section.id)}
                                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors text-foreground hover:bg-accent cursor-pointer active:scale-[0.98]"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 shadow-sm dark:shadow-none border border-border/50 flex items-center justify-center shrink-0">
                                    <Icon size={16} className="text-muted-foreground" />
                                  </div>
                                  <span className="flex-1 text-left">{section.label}</span>
                                  <ChevronRight size={16} className="text-muted-foreground" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* === DESKTOP VIEW === */}
            <div className="hidden md:flex flex-col h-full">
              <div className="flex-1 overflow-auto px-8 pt-8 pb-8">
                <div key={activeSection ?? DEFAULT_SECTION} className="max-w-xl animate-page-in">
                  {renderSection(activeSection ?? DEFAULT_SECTION)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </IntegrationProvider>
    </PageTransition>
  );
}
