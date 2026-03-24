import SwiftUI

/// Color constants matching the CalTodo web app's CSS variable tokens.
/// Reads from ThemeManager.shared for theme-aware colors, with static
/// fallbacks for semantic colors that don't change across themes.
///
/// - SeeAlso: `ThemeManager` for the theme engine.
/// - SeeAlso: `ThemeDefinitions.swift` for per-theme hex values.
enum AppColors {
    // MARK: - Theme-Aware Backgrounds

    /// Primary background — reads from the active theme.
    static var background: Color { ThemeManager.shared.background }

    /// Card/elevated surface background.
    static var card: Color { ThemeManager.shared.card }

    /// Secondary background for grouped content (maps to muted).
    static var secondaryBackground: Color { ThemeManager.shared.muted }

    /// Tertiary background for badges and chips.
    static let tertiaryBackground = Color(
        light: Color(hex: "#F3F4F6"),
        dark: Color(hex: "#3A3A3C")
    )

    /// Popover/dropdown background — always solid.
    static var popover: Color { ThemeManager.shared.popover }

    /// Muted background for empty states and hover.
    static var muted: Color { ThemeManager.shared.muted }

    // MARK: - Theme-Aware Foregrounds

    /// Primary text color.
    static var foreground: Color { ThemeManager.shared.foreground }

    /// Secondary text — section headers, subtitles.
    static var secondaryForeground: Color { ThemeManager.shared.secondaryForeground }

    /// Muted text — descriptions, captions.
    static var mutedForeground: Color { ThemeManager.shared.mutedForeground }

    /// Subtle text — fine print, disabled states.
    static var subtleForeground: Color { ThemeManager.shared.subtleForeground }

    // MARK: - Theme-Aware Borders

    /// Primary border color.
    static var border: Color { ThemeManager.shared.border }

    /// Input field border — slightly heavier.
    static var inputBorder: Color { ThemeManager.shared.inputBorder }

    /// Thin divider/separator color.
    static var separator: Color { ThemeManager.shared.separator }

    // MARK: - Theme-Aware Accent (replaces blue500/blue400)

    /// Primary accent — default task color, links, CTAs.
    /// Replaces the hardcoded blue500 with the theme's accent color.
    static var accent: Color { ThemeManager.shared.accent }

    /// Lighter accent variant. Replaces the hardcoded blue400.
    static var accentLight: Color { ThemeManager.shared.accentLight }

    // MARK: - Legacy Aliases (for backward compatibility)

    /// Primary blue — alias for accent. Existing code references this.
    static var blue500: Color { ThemeManager.shared.accent }

    /// Light blue — alias for accentLight. Existing code references this.
    static var blue400: Color { ThemeManager.shared.accentLight }

    // MARK: - Semantic Colors (theme-independent)

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

    /// Converts a Color to a hex string (e.g. "#3B82F6").
    func toHex() -> String {
        let uiColor = UIColor(self)
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        uiColor.getRed(&r, green: &g, blue: &b, alpha: &a)
        return String(format: "#%02X%02X%02X", Int(r * 255), Int(g * 255), Int(b * 255))
    }
}
