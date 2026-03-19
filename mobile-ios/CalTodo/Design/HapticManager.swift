import UIKit

/// Wrapper around UIFeedbackGenerator for consistent haptic feedback.
/// Matches the Sleep Tracker's Haptics helper — named methods for
/// common interaction patterns.
///
/// All haptics fire synchronously on the calling thread.
enum HapticManager {

    /// Light impact — checkbox toggles, list selections, card taps.
    static func light() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }

    /// Medium impact — button presses, navigation, modal presentations.
    static func medium() {
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.impactOccurred()
    }

    /// Soft impact — subtle feedback on card selections, swipes.
    static func soft() {
        let generator = UIImpactFeedbackGenerator(style: .soft)
        generator.impactOccurred()
    }

    /// Success notification — task completion, onboarding finish.
    static func success() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }

    /// Error notification — failed operations, invalid input.
    static func error() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.error)
    }

    /// Selection changed — tab switches, picker changes.
    static func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
}
