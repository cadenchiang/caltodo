import SwiftUI

/// Additional theme definitions (rosewood through tokyo-night).
///
/// Split from ThemeDefinitions.swift to keep files under 300 lines.
/// All hex values match the web app's globals.css exactly.
extension ThemeCatalog {

    // MARK: - Rosewood

    static let rosewood = ThemeDefinition(
        id: "rosewood", displayName: "rosewood",
        light: ThemeModeColors(
            background: Color(hex: "#F8F0F0"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#F0E0E0"),
            foreground: Color(hex: "#2A1418"), secondaryForeground: Color(hex: "#5A2830"),
            mutedForeground: Color(hex: "#804050"), subtleForeground: Color(hex: "#A87080"),
            border: Color(hex: "#E0B8B8"), inputBorder: Color(hex: "#D09898"),
            separator: Color(hex: "#E0B8B8"),
            accent: Color(hex: "#A03040"), accentLight: Color(hex: "#C87070")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#1A0E10"), card: Color(hex: "#261418"),
            popover: Color(hex: "#301A20"), muted: Color(hex: "#301A20"),
            foreground: Color(hex: "#F0D0D0"), secondaryForeground: Color(hex: "#D0A0A0"),
            mutedForeground: Color(hex: "#906868"), subtleForeground: Color(hex: "#604040"),
            border: Color(hex: "#402020"), inputBorder: Color(hex: "#503030"),
            separator: Color(hex: "#402020"),
            accent: Color(hex: "#A03040"), accentLight: Color(hex: "#C87070")
        )
    )

    // MARK: - Midnight

    static let midnight = ThemeDefinition(
        id: "midnight", displayName: "midnight",
        light: ThemeModeColors(
            background: Color(hex: "#EEF0F5"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#DCE0EA"),
            foreground: Color(hex: "#0E1420"), secondaryForeground: Color(hex: "#283040"),
            mutedForeground: Color(hex: "#4A5568"), subtleForeground: Color(hex: "#7A8598"),
            border: Color(hex: "#B8C0D0"), inputBorder: Color(hex: "#98A4B8"),
            separator: Color(hex: "#B8C0D0"),
            accent: Color(hex: "#3A6CF0"), accentLight: Color(hex: "#708CD8")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#0A0E18"), card: Color(hex: "#101828"),
            popover: Color(hex: "#182030"), muted: Color(hex: "#182030"),
            foreground: Color(hex: "#D0D8E8"), secondaryForeground: Color(hex: "#A0B0C8"),
            mutedForeground: Color(hex: "#607090"), subtleForeground: Color(hex: "#3A4A60"),
            border: Color(hex: "#1E2A40"), inputBorder: Color(hex: "#2A3A55"),
            separator: Color(hex: "#1E2A40"),
            accent: Color(hex: "#3A6CF0"), accentLight: Color(hex: "#708CD8")
        )
    )

    // MARK: - Matcha

    static let matcha = ThemeDefinition(
        id: "matcha", displayName: "matcha",
        light: ThemeModeColors(
            background: Color(hex: "#F7F5F0"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#EDEAE2"),
            foreground: Color(hex: "#2A2A22"), secondaryForeground: Color(hex: "#4A4A38"),
            mutedForeground: Color(hex: "#6A6A55"), subtleForeground: Color(hex: "#9A9A85"),
            border: Color(hex: "#D4D0C4"), inputBorder: Color(hex: "#C0BAA8"),
            separator: Color(hex: "#D4D0C4"),
            accent: Color(hex: "#7C9A6E"), accentLight: Color(hex: "#9CB880")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#1A2118"), card: Color(hex: "#222C1F"),
            popover: Color(hex: "#2A3526"), muted: Color(hex: "#2A3526"),
            foreground: Color(hex: "#D8E0D0"), secondaryForeground: Color(hex: "#B0C0A0"),
            mutedForeground: Color(hex: "#7A9068"), subtleForeground: Color(hex: "#4A5E40"),
            border: Color(hex: "#324028"), inputBorder: Color(hex: "#3E5034"),
            separator: Color(hex: "#324028"),
            accent: Color(hex: "#7C9A6E"), accentLight: Color(hex: "#9CB880")
        )
    )

    // MARK: - Dracula

    static let dracula = ThemeDefinition(
        id: "dracula", displayName: "dracula",
        light: ThemeModeColors(
            background: Color(hex: "#F8F8F2"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#EEEEE8"),
            foreground: Color(hex: "#282A36"), secondaryForeground: Color(hex: "#44475A"),
            mutedForeground: Color(hex: "#6272A4"), subtleForeground: Color(hex: "#8892B8"),
            border: Color(hex: "#D0D0E0"), inputBorder: Color(hex: "#B8B8D0"),
            separator: Color(hex: "#D0D0E0"),
            accent: Color(hex: "#BD93F9"), accentLight: Color(hex: "#D4B8FC")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#282A36"), card: Color(hex: "#343746"),
            popover: Color(hex: "#3C3F58"), muted: Color(hex: "#3C3F58"),
            foreground: Color(hex: "#F8F8F2"), secondaryForeground: Color(hex: "#D0D0C8"),
            mutedForeground: Color(hex: "#6272A4"), subtleForeground: Color(hex: "#4A5480"),
            border: Color(hex: "#44475A"), inputBorder: Color(hex: "#555870"),
            separator: Color(hex: "#44475A"),
            accent: Color(hex: "#BD93F9"), accentLight: Color(hex: "#D4B8FC")
        )
    )

    // MARK: - Cyber

    static let cyber = ThemeDefinition(
        id: "cyber", displayName: "cyber",
        light: ThemeModeColors(
            background: Color(hex: "#E8F4F5"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#D8EEF0"),
            foreground: Color(hex: "#0A1A1C"), secondaryForeground: Color(hex: "#1A3A3E"),
            mutedForeground: Color(hex: "#3A6068"), subtleForeground: Color(hex: "#6A9098"),
            border: Color(hex: "#B0D8DC"), inputBorder: Color(hex: "#88C0C8"),
            separator: Color(hex: "#B0D8DC"),
            accent: Color(hex: "#0ABDC6"), accentLight: Color(hex: "#40D0DA")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#0B0C10"), card: Color(hex: "#12141C"),
            popover: Color(hex: "#1A1C28"), muted: Color(hex: "#1A1C28"),
            foreground: Color(hex: "#C8F0F2"), secondaryForeground: Color(hex: "#88D0D4"),
            mutedForeground: Color(hex: "#4A8A90"), subtleForeground: Color(hex: "#2A5558"),
            border: Color(hex: "#1A2E30"), inputBorder: Color(hex: "#264042"),
            separator: Color(hex: "#1A2E30"),
            accent: Color(hex: "#0ABDC6"), accentLight: Color(hex: "#40D0DA")
        )
    )

    // MARK: - Sandstone

    static let sandstone = ThemeDefinition(
        id: "sandstone", displayName: "sandstone",
        light: ThemeModeColors(
            background: Color(hex: "#FAF6F1"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#F0EBE2"),
            foreground: Color(hex: "#2A2218"), secondaryForeground: Color(hex: "#4A3E30"),
            mutedForeground: Color(hex: "#7A6A55"), subtleForeground: Color(hex: "#A09480"),
            border: Color(hex: "#DDD4C4"), inputBorder: Color(hex: "#C8BAA4"),
            separator: Color(hex: "#DDD4C4"),
            accent: Color(hex: "#C4956A"), accentLight: Color(hex: "#D0AE80")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#1F1A15"), card: Color(hex: "#28221C"),
            popover: Color(hex: "#322A22"), muted: Color(hex: "#322A22"),
            foreground: Color(hex: "#E8DDD0"), secondaryForeground: Color(hex: "#C4B09A"),
            mutedForeground: Color(hex: "#8A7460"), subtleForeground: Color(hex: "#5A4A38"),
            border: Color(hex: "#3A3028"), inputBorder: Color(hex: "#4A3E32"),
            separator: Color(hex: "#3A3028"),
            accent: Color(hex: "#C4956A"), accentLight: Color(hex: "#D0AE80")
        )
    )

    // MARK: - Tokyo Night

    static let tokyoNight = ThemeDefinition(
        id: "tokyo-night", displayName: "tokyo night",
        light: ThemeModeColors(
            background: Color(hex: "#D5D6DB"), card: Color(hex: "#E0E2E8"),
            popover: Color(hex: "#E0E2E8"), muted: Color(hex: "#CBCED8"),
            foreground: Color(hex: "#1A1B26"), secondaryForeground: Color(hex: "#2A2C3A"),
            mutedForeground: Color(hex: "#4A4E68"), subtleForeground: Color(hex: "#7A7E98"),
            border: Color(hex: "#B8BCC8"), inputBorder: Color(hex: "#A0A4B4"),
            separator: Color(hex: "#B8BCC8"),
            accent: Color(hex: "#7AA2F7"), accentLight: Color(hex: "#A8C0F0")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#1A1B26"), card: Color(hex: "#24283B"),
            popover: Color(hex: "#2A2E48"), muted: Color(hex: "#2A2E48"),
            foreground: Color(hex: "#C0CAF5"), secondaryForeground: Color(hex: "#A9B1D6"),
            mutedForeground: Color(hex: "#565F89"), subtleForeground: Color(hex: "#3B4261"),
            border: Color(hex: "#33385A"), inputBorder: Color(hex: "#414868"),
            separator: Color(hex: "#33385A"),
            accent: Color(hex: "#7AA2F7"), accentLight: Color(hex: "#A8C0F0")
        )
    )
}
