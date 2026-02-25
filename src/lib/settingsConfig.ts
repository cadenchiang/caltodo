import { User, Plug, GraduationCap, Palette, Wrench, type LucideIcon } from "lucide-react";

/** Valid settings section identifiers. */
export type SettingsSectionId = "profile" | "integrations" | "classes" | "appearance" | "advanced";

/** Group labels for organising settings sections. */
export const SETTINGS_GROUPS = ["GENERAL", "SYSTEM"] as const;

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
  { id: "profile", label: "Profile", icon: User, group: "GENERAL" },
  { id: "integrations", label: "Integrations", icon: Plug, group: "GENERAL" },
  { id: "classes", label: "Classes", icon: GraduationCap, group: "GENERAL" },
  { id: "appearance", label: "Appearance", icon: Palette, group: "SYSTEM" },
  { id: "advanced", label: "Advanced", icon: Wrench, group: "SYSTEM" },
];

/** Default section shown when no search param is provided (desktop). */
export const DEFAULT_SECTION: SettingsSectionId = "profile";
