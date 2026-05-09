"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IntegrationProvider } from "@/components/settings/IntegrationSettings";
import PageTransition from "@/components/ui/PageTransition";
import IntegrationsSection from "@/components/settings/sections/IntegrationsSection";
import ClassesSectionWrapper from "@/components/settings/sections/ClassesSectionWrapper";
import AppearanceSection from "@/components/settings/sections/AppearanceSection";
import NavigationSection from "@/components/settings/sections/NavigationSection";

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
    case "integrations":
      return <IntegrationsSection />;
    case "classes":
      return <ClassesSectionWrapper />;
    case "appearance":
      return <AppearanceSection />;
    case "navigation":
      return <NavigationSection />;
    case "advanced":
      return <AdvancedSection />;
  }
}

/**
 * Renders only sections the user has visited so far, keeping them
 * mounted (hidden via display:none) when not active. After a section
 * is visited once, switching back is instant — no remount cost.
 *
 * @param activeSection - The currently selected section ID
 * @param visited - Set of section IDs that have been mounted at least once
 */
function StickyMountedSections({ activeSection, visited }: { activeSection: SettingsSectionId; visited: ReadonlySet<SettingsSectionId> }) {
  return (
    <>
      {SETTINGS_SECTIONS.map((section) => {
        if (!visited.has(section.id)) return null;
        const isActive = section.id === activeSection;
        return (
          <div key={section.id} style={{ display: isActive ? "block" : "none" }}>
            {renderSection(section.id)}
          </div>
        );
      })}
    </>
  );
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

  // Track which sections the user has actually opened so we can keep them
  // mounted after first visit. Switching back to a previously-visited section
  // is then instant (no remount/refetch). Initial set seeds with the section
  // we are about to render so first paint isn't a blank flicker.
  const initialSection = activeSection ?? DEFAULT_SECTION;
  const [visitedSections, setVisitedSections] = useState<Set<SettingsSectionId>>(() => new Set([initialSection]));
  useEffect(() => {
    if (!activeSection) return;
    setVisitedSections((prev) => {
      if (prev.has(activeSection)) return prev;
      const next = new Set(prev);
      next.add(activeSection);
      return next;
    });
  }, [activeSection]);

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
                    <div className="max-w-2xl mx-auto animate-section-in">
                      <StickyMountedSections activeSection={activeSection} visited={visitedSections} />
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
                    <div className="max-w-2xl mx-auto space-y-6 animate-stagger stagger-2">
                      {SETTINGS_GROUPS.map((group) => (
                        <div key={group} className="cv-auto-section">
                          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground px-1 mb-2">
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
                                  <Icon size={16} className="text-foreground/70 shrink-0" />
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
              <div className="flex-1 overflow-auto px-8 pt-20 pb-8">
                <div className="max-w-2xl mx-auto mr-auto ml-[15%]">
                  <StickyMountedSections activeSection={activeSection ?? DEFAULT_SECTION} visited={visitedSections} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </IntegrationProvider>
    </PageTransition>
  );
}
