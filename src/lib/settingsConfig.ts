import { Plug, Palette, Wrench, LayoutList, type LucideIcon } from "lucide-react";

/** Valid settings section identifiers. */
export type SettingsSectionId =
  | "integrations"
  | "appearance"
  | "navigation"
  | "advanced";

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
 *
 * Classes used to be a section of its own, listing every platform's classes in
 * one flat list. Choosing classes now happens inside the account that syncs
 * them, under Integrations, which is the only place that can say which account
 * a class came from. The class list itself still exists: the calendar's
 * classes popover renders it.
 */
export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: "integrations", label: "Integrations", icon: Plug, group: "General" },
  { id: "appearance", label: "Appearance", icon: Palette, group: "System" },
  { id: "navigation", label: "Navigation", icon: LayoutList, group: "System" },
  { id: "advanced", label: "Advanced", icon: Wrench, group: "System" },
];

/** Default section shown when no search param is provided (desktop). */
export const DEFAULT_SECTION: SettingsSectionId = "integrations";
