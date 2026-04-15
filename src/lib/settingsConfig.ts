import { Plug, GraduationCap, Palette, Wrench, LayoutList, Bell, type LucideIcon } from "lucide-react";

/** Valid settings section identifiers. */
export type SettingsSectionId = "integrations" | "classes" | "appearance" | "navigation" | "notifications" | "advanced";

/** Group labels for organising settings sections. */
export const SETTINGS_GROUPS = ["General", "System"] as const;

export type SettingsGroup = (typeof SETTINGS_GROUPS)[number];

export interface SettingsSection {
  id: SettingsSectionId;
  label: string;
  icon: LucideIcon;
  group: SettingsGroup;
}

/**
 * All settings sections with their display metadata.
 * Used by the Sidebar nav and the Settings page orchestrator.
 */
export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: "integrations", label: "Integrations", icon: Plug, group: "General" },
  { id: "classes", label: "Classes", icon: GraduationCap, group: "General" },
  { id: "appearance", label: "Appearance", icon: Palette, group: "System" },
  { id: "navigation", label: "Navigation", icon: LayoutList, group: "System" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "System" },
  { id: "advanced", label: "Advanced", icon: Wrench, group: "System" },
];

/** Default section shown when no search param is provided (desktop). */
export const DEFAULT_SECTION: SettingsSectionId = "integrations";
