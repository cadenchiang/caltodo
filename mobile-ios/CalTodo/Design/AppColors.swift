import SwiftUI

/// Color constants matching the CalTodo web app's CSS variable tokens.
/// Uses adaptive light/dark pairs inspired by the Sleep Tracker's warm theme.
///
/// - SeeAlso: `mobile/src/lib/colors.ts` for the React Native equivalent.
enum AppColors {
    // MARK: - Backgrounds (Warm-tinted, matching Sleep Tracker pattern)

    /// Primary background — warm-tinted white/near-black.
    static let background = Color(light: Color(hex: "#FFFFFF"), dark: Color(hex: "#1C1C1E"))

    /// Card/elevated surface background.
    static let card = Color(light: Color(hex: "#FFFFFF"), dark: Color(hex: "#2C2C2E"))

    /// Secondary background for grouped content.
    static let secondaryBackground = Color(light: Color(hex: "#F9FAFB"), dark: Color(hex: "#1C1C1E"))

    /// Tertiary background for badges and chips.
    static let tertiaryBackground = Color(light: Color(hex: "#F3F4F6"), dark: Color(hex: "#3A3A3C"))

    /// Popover/dropdown background — always solid.
    static let popover = Color(light: Color(hex: "#FFFFFF"), dark: Color(hex: "#262626"))

    /// Muted background for empty states and hover.
    static let muted = Color(light: Color(hex: "#F9FAFB"), dark: Color(hex: "#262626"))

    // MARK: - Foregrounds

    /// Primary text color.
    static let foreground = Color(light: Color(hex: "#1F2937"), dark: Color(hex: "#F3F4F6"))

    /// Secondary text — section headers, subtitles.
    static let secondaryForeground = Color(light: Color(hex: "#4B5563"), dark: Color(hex: "#D1D5DB"))

    /// Muted text — descriptions, captions.
    static let mutedForeground = Color(light: Color(hex: "#6B7280"), dark: Color(hex: "#9CA3AF"))

    /// Subtle text — fine print, disabled states.
    static let subtleForeground = Color(light: Color(hex: "#9CA3AF"), dark: Color(hex: "#6B7280"))

    // MARK: - Borders

    /// Primary border color.
    static let border = Color(light: Color(hex: "#F3F4F6"), dark: Color(hex: "#404040"))

    /// Input field border — slightly heavier.
    static let inputBorder = Color(light: Color(hex: "#E5E7EB"), dark: Color(hex: "#525252"))

    // MARK: - Semantic Colors

    /// Primary blue — default task color, links, CTAs.
    static let blue500 = Color(hex: "#3B82F6")
    static let blue400 = Color(hex: "#60A5FA")

    /// Red — overdue, errors, destructive actions.
    static let red400 = Color(hex: "#F87171")
    static let red500 = Color(hex: "#EF4444")

    /// Green — success, connected states.
    static let green500 = Color(hex: "#10B981")

    /// Purple — repeat indicators, special features.
    static let purple400 = Color(hex: "#A78BFA")

    /// Amber — warnings, pending states.
    static let amber500 = Color(hex: "#F59E0B")
}

// MARK: - Hex Color Initializer

extension Color {
    /// Creates a Color from a hex string (e.g. "#3B82F6" or "3B82F6").
    ///
    /// - Parameter hex: A hex color string, with or without the "#" prefix.
    /// - Returns: The corresponding Color. Falls back to clear if parsing fails.
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&rgb)

        let r = Double((rgb >> 16) & 0xFF) / 255.0
        let g = Double((rgb >> 8) & 0xFF) / 255.0
        let b = Double(rgb & 0xFF) / 255.0

        self.init(red: r, green: g, blue: b)
    }

    /// Creates an adaptive color with separate light and dark values.
    /// Matches the Sleep Tracker's `Color(light:dark:)` pattern.
    ///
    /// - Parameters:
    ///   - light: Color to use in light mode.
    ///   - dark: Color to use in dark mode.
    init(light: Color, dark: Color) {
        self.init(uiColor: UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(dark)
                : UIColor(light)
        })
    }
}
