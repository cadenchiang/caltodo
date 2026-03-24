import SwiftUI
import os.log

/// Singleton manager that provides the current theme's colors based on
/// the user's selected theme and the system color scheme.
///
/// Views read colors via `ThemeManager.shared` static properties or via
/// the `AppColors` enum which delegates to this manager. The selected theme
/// is persisted in `@AppStorage("selectedTheme")`.
///
/// - Important: iOS 16 compatible (uses ObservableObject, not @Observable).
final class ThemeManager: ObservableObject {
    /// Shared singleton instance used by AppColors and views.
    static let shared = ThemeManager()

    private static let logger = Logger(
        subsystem: Bundle.main.bundleIdentifier ?? "CalTodo",
        category: "ThemeManager"
    )

    /// The selected theme ID, persisted across app launches.
    @Published var currentTheme: String {
        didSet {
            UserDefaults.standard.set(currentTheme, forKey: "selectedTheme")
            updateColors()
            Self.logger.info("Theme changed to: \(self.currentTheme)")
        }
    }

    /// Whether the system is currently in dark mode.
    /// Updated by the root view via `onChange(of: colorScheme)`.
    @Published var isDarkMode: Bool = false {
        didSet { updateColors() }
    }

    // MARK: - Published Color Properties

    @Published private(set) var background: Color = Color(hex: "#FFFFFF")
    @Published private(set) var card: Color = Color(hex: "#FFFFFF")
    @Published private(set) var popover: Color = Color(hex: "#FFFFFF")
    @Published private(set) var muted: Color = Color(hex: "#F9FAFB")
    @Published private(set) var foreground: Color = Color(hex: "#1F2937")
    @Published private(set) var secondaryForeground: Color = Color(hex: "#4B5563")
    @Published private(set) var mutedForeground: Color = Color(hex: "#6B7280")
    @Published private(set) var subtleForeground: Color = Color(hex: "#9CA3AF")
    @Published private(set) var border: Color = Color(hex: "#F3F4F6")
    @Published private(set) var inputBorder: Color = Color(hex: "#E5E7EB")
    @Published private(set) var separator: Color = Color(hex: "#F3F4F6")
    @Published private(set) var accent: Color = Color(hex: "#3B82F6")
    @Published private(set) var accentLight: Color = Color(hex: "#60A5FA")

    /// Increments on every theme change to force view updates.
    @Published private(set) var themeVersion: Int = 0

    // MARK: - Init

    private init() {
        let stored = UserDefaults.standard.string(forKey: "selectedTheme") ?? "default"
        self.currentTheme = stored
        Self.logger.info("ThemeManager initialized with theme: \(stored)")
        updateColors()
    }

    // MARK: - Color Resolution

    /// Returns the current theme's mode-specific colors based on `isDarkMode`.
    ///
    /// - Returns: The ThemeModeColors for the active theme and color scheme.
    var currentColors: ThemeModeColors {
        let definition = ThemeCatalog.theme(for: currentTheme)
        return isDarkMode ? definition.dark : definition.light
    }

    /// Refreshes all published color properties from the current theme definition.
    ///
    /// Called whenever `currentTheme` or `isDarkMode` changes.
    private func updateColors() {
        let colors = currentColors
        background = colors.background
        card = colors.card
        popover = colors.popover
        muted = colors.muted
        foreground = colors.foreground
        secondaryForeground = colors.secondaryForeground
        mutedForeground = colors.mutedForeground
        subtleForeground = colors.subtleForeground
        border = colors.border
        inputBorder = colors.inputBorder
        separator = colors.separator
        accent = colors.accent
        accentLight = colors.accentLight
        themeVersion += 1
    }
}

// MARK: - Color Scheme Observer Modifier

/// View modifier that syncs the system color scheme into ThemeManager.
///
/// Attach this at the root of the app so ThemeManager stays
/// in sync with light/dark mode changes.
struct ThemeColorSchemeObserver: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme
    @ObservedObject private var themeManager = ThemeManager.shared

    func body(content: Content) -> some View {
        content
            .onAppear {
                themeManager.isDarkMode = colorScheme == .dark
            }
            .onChange(of: colorScheme) { newValue in
                themeManager.isDarkMode = newValue == .dark
            }
    }
}

extension View {
    /// Attaches the theme color scheme observer to sync system appearance
    /// with ThemeManager.
    ///
    /// - Returns: A view that keeps ThemeManager.shared.isDarkMode in sync.
    func observeThemeColorScheme() -> some View {
        modifier(ThemeColorSchemeObserver())
    }
}
