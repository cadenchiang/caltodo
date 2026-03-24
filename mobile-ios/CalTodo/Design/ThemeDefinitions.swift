import SwiftUI

/// All color properties for a single theme mode (light or dark).
///
/// Maps 1:1 with the CSS variables in globals.css on the web app.
/// Each theme provides a light and dark instance of this struct.
struct ThemeModeColors {
    let background: Color
    let card: Color
    let popover: Color
    let muted: Color
    let foreground: Color
    let secondaryForeground: Color
    let mutedForeground: Color
    let subtleForeground: Color
    let border: Color
    let inputBorder: Color
    let separator: Color
    let accent: Color
    let accentLight: Color
}

/// A complete theme with light and dark color sets plus metadata.
///
/// - Parameters:
///   - id: Unique identifier matching the web CSS class (e.g. "miffy", "ocean").
///   - displayName: Human-readable name for the theme picker UI.
///   - light: Colors used in light mode.
///   - dark: Colors used in dark mode.
struct ThemeDefinition {
    let id: String
    let displayName: String
    let light: ThemeModeColors
    let dark: ThemeModeColors
}

/// Static catalog of all 14 themes with exact hex values from the web app's CSS.
///
/// Each theme's colors are extracted from globals.css `:root`, `.dark`,
/// and `.theme-*` / `.dark.theme-*` selectors.
enum ThemeCatalog {
    /// All available themes in display order.
    static let all: [ThemeDefinition] = [
        defaultTheme, miffy, ocean, forest, sunset, lavender, nord,
        rosewood, midnight, matcha, dracula, cyber, sandstone, tokyoNight
    ]

    /// Finds a theme by its string ID.
    ///
    /// - Parameter id: The theme identifier (e.g. "miffy", "default").
    /// - Returns: The matching ThemeDefinition, or the default theme if not found.
    static func theme(for id: String) -> ThemeDefinition {
        all.first { $0.id == id } ?? defaultTheme
    }

    // MARK: - Default

    static let defaultTheme = ThemeDefinition(
        id: "default", displayName: "default",
        light: ThemeModeColors(
            background: Color(hex: "#F2F2F7"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#F9FAFB"),
            foreground: Color(hex: "#1F2937"), secondaryForeground: Color(hex: "#4B5563"),
            mutedForeground: Color(hex: "#6B7280"), subtleForeground: Color(hex: "#9CA3AF"),
            border: Color(hex: "#F3F4F6"), inputBorder: Color(hex: "#E5E7EB"),
            separator: Color(hex: "#F3F4F6"),
            accent: Color(hex: "#3B82F6"), accentLight: Color(hex: "#60A5FA")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#1C1C1E"), card: Color(hex: "#2C2C2E"),
            popover: Color(hex: "#262626"), muted: Color(hex: "#262626"),
            foreground: Color(hex: "#F3F4F6"), secondaryForeground: Color(hex: "#D1D5DB"),
            mutedForeground: Color(hex: "#9CA3AF"), subtleForeground: Color(hex: "#6B7280"),
            border: Color(hex: "#404040"), inputBorder: Color(hex: "#525252"),
            separator: Color(hex: "#2C2C2E"),
            accent: Color(hex: "#3B82F6"), accentLight: Color(hex: "#60A5FA")
        )
    )

    // MARK: - Miffy

    static let miffy = ThemeDefinition(
        id: "miffy", displayName: "miffy",
        light: ThemeModeColors(
            background: Color(hex: "#FDF2F5"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#FCE8EF"),
            foreground: Color(hex: "#1F2937"), secondaryForeground: Color(hex: "#4B5563"),
            mutedForeground: Color(hex: "#6B7280"), subtleForeground: Color(hex: "#9CA3AF"),
            border: Color(hex: "#F9D5E0"), inputBorder: Color(hex: "#F0B8CC"),
            separator: Color(hex: "#F9D5E0"),
            accent: Color(hex: "#E8729A"), accentLight: Color(hex: "#ED7AA2")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#1A1118"), card: Color(hex: "#231920"),
            popover: Color(hex: "#2A1F26"), muted: Color(hex: "#2A1F26"),
            foreground: Color(hex: "#F3E8EE"), secondaryForeground: Color(hex: "#D4B8C8"),
            mutedForeground: Color(hex: "#9A7E8E"), subtleForeground: Color(hex: "#6B5A64"),
            border: Color(hex: "#3D2E36"), inputBorder: Color(hex: "#4A3542"),
            separator: Color(hex: "#3D2E36"),
            accent: Color(hex: "#E8729A"), accentLight: Color(hex: "#ED7AA2")
        )
    )

    // MARK: - Ocean

    static let ocean = ThemeDefinition(
        id: "ocean", displayName: "ocean",
        light: ThemeModeColors(
            background: Color(hex: "#F0F7FA"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#E0EFF5"),
            foreground: Color(hex: "#1A2C3A"), secondaryForeground: Color(hex: "#3A5568"),
            mutedForeground: Color(hex: "#5A7A8A"), subtleForeground: Color(hex: "#8AA0B0"),
            border: Color(hex: "#C8DDE8"), inputBorder: Color(hex: "#A8C8D8"),
            separator: Color(hex: "#C8DDE8"),
            accent: Color(hex: "#5BA4C8"), accentLight: Color(hex: "#4AA0C0")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#0F1A22"), card: Color(hex: "#162530"),
            popover: Color(hex: "#1C2E3C"), muted: Color(hex: "#1C2E3C"),
            foreground: Color(hex: "#D0E8F2"), secondaryForeground: Color(hex: "#A0C4D8"),
            mutedForeground: Color(hex: "#6A94AA"), subtleForeground: Color(hex: "#4A6A7A"),
            border: Color(hex: "#2A4050"), inputBorder: Color(hex: "#3A5565"),
            separator: Color(hex: "#2A4050"),
            accent: Color(hex: "#5BA4C8"), accentLight: Color(hex: "#4AA0C0")
        )
    )

    // MARK: - Forest

    static let forest = ThemeDefinition(
        id: "forest", displayName: "forest",
        light: ThemeModeColors(
            background: Color(hex: "#F2F7F0"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#E4F0E0"),
            foreground: Color(hex: "#1A2E1A"), secondaryForeground: Color(hex: "#3A5A3A"),
            mutedForeground: Color(hex: "#5A7A5A"), subtleForeground: Color(hex: "#8AA08A"),
            border: Color(hex: "#C0D8B8"), inputBorder: Color(hex: "#A0C498"),
            separator: Color(hex: "#C0D8B8"),
            accent: Color(hex: "#4A9A4A"), accentLight: Color(hex: "#78C078")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#111A11"), card: Color(hex: "#1A2A1A"),
            popover: Color(hex: "#203020"), muted: Color(hex: "#203020"),
            foreground: Color(hex: "#D0E8D0"), secondaryForeground: Color(hex: "#A0C8A0"),
            mutedForeground: Color(hex: "#6A946A"), subtleForeground: Color(hex: "#4A684A"),
            border: Color(hex: "#2A4028"), inputBorder: Color(hex: "#3A5538"),
            separator: Color(hex: "#2A4028"),
            accent: Color(hex: "#4A9A4A"), accentLight: Color(hex: "#78C078")
        )
    )

    // MARK: - Sunset

    static let sunset = ThemeDefinition(
        id: "sunset", displayName: "sunset",
        light: ThemeModeColors(
            background: Color(hex: "#FDF5F0"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#FCE8DC"),
            foreground: Color(hex: "#2C1A10"), secondaryForeground: Color(hex: "#5A3A28"),
            mutedForeground: Color(hex: "#8A6050"), subtleForeground: Color(hex: "#B08878"),
            border: Color(hex: "#F0C8B0"), inputBorder: Color(hex: "#E8A888"),
            separator: Color(hex: "#F0C8B0"),
            accent: Color(hex: "#E87040"), accentLight: Color(hex: "#F0A070")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#1A110E"), card: Color(hex: "#261A14"),
            popover: Color(hex: "#30201A"), muted: Color(hex: "#30201A"),
            foreground: Color(hex: "#F0D8C8"), secondaryForeground: Color(hex: "#D0A890"),
            mutedForeground: Color(hex: "#A07060"), subtleForeground: Color(hex: "#6A4A3A"),
            border: Color(hex: "#402A20"), inputBorder: Color(hex: "#503830"),
            separator: Color(hex: "#402A20"),
            accent: Color(hex: "#E87040"), accentLight: Color(hex: "#F0A070")
        )
    )

    // MARK: - Lavender

    static let lavender = ThemeDefinition(
        id: "lavender", displayName: "lavender",
        light: ThemeModeColors(
            background: Color(hex: "#F5F0FA"), card: Color(hex: "#FFFFFF"),
            popover: Color(hex: "#FFFFFF"), muted: Color(hex: "#EBE0F5"),
            foreground: Color(hex: "#1E1A2E"), secondaryForeground: Color(hex: "#403A58"),
            mutedForeground: Color(hex: "#685E80"), subtleForeground: Color(hex: "#9A90A8"),
            border: Color(hex: "#D0C0E0"), inputBorder: Color(hex: "#B8A0D0"),
            separator: Color(hex: "#D0C0E0"),
            accent: Color(hex: "#8A60C0"), accentLight: Color(hex: "#B08AD8")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#14101E"), card: Color(hex: "#1E1828"),
            popover: Color(hex: "#261E34"), muted: Color(hex: "#261E34"),
            foreground: Color(hex: "#E0D4F0"), secondaryForeground: Color(hex: "#B8A0D0"),
            mutedForeground: Color(hex: "#7A6898"), subtleForeground: Color(hex: "#504468"),
            border: Color(hex: "#342A48"), inputBorder: Color(hex: "#443858"),
            separator: Color(hex: "#342A48"),
            accent: Color(hex: "#8A60C0"), accentLight: Color(hex: "#B08AD8")
        )
    )

    // MARK: - Nord

    static let nord = ThemeDefinition(
        id: "nord", displayName: "nord",
        light: ThemeModeColors(
            background: Color(hex: "#ECEFF4"), card: Color(hex: "#E5E9F0"),
            popover: Color(hex: "#E5E9F0"), muted: Color(hex: "#D8DEE9"),
            foreground: Color(hex: "#2E3440"), secondaryForeground: Color(hex: "#3B4252"),
            mutedForeground: Color(hex: "#4C566A"), subtleForeground: Color(hex: "#7B88A0"),
            border: Color(hex: "#C8CFD8"), inputBorder: Color(hex: "#B0BAC4"),
            separator: Color(hex: "#C8CFD8"),
            accent: Color(hex: "#5E81AC"), accentLight: Color(hex: "#81A1C1")
        ),
        dark: ThemeModeColors(
            background: Color(hex: "#2E3440"), card: Color(hex: "#3B4252"),
            popover: Color(hex: "#434C5E"), muted: Color(hex: "#434C5E"),
            foreground: Color(hex: "#ECEFF4"), secondaryForeground: Color(hex: "#D8DEE9"),
            mutedForeground: Color(hex: "#8890A0"), subtleForeground: Color(hex: "#616E80"),
            border: Color(hex: "#4C566A"), inputBorder: Color(hex: "#5A657A"),
            separator: Color(hex: "#4C566A"),
            accent: Color(hex: "#5E81AC"), accentLight: Color(hex: "#81A1C1")
        )
    )
}
