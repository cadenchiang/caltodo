import SwiftUI

/// Task color palette matching the web app's TASK_COLORS constant.
/// 9 colors available for task customization.
///
/// - SeeAlso: `mobile/src/lib/colors.ts` TASK_COLORS array.
enum TaskColors {
    /// All available task colors as hex strings.
    static let all: [String] = [
        "#9CA3AF", // gray
        "#3B82F6", // blue (default)
        "#EF4444", // red
        "#10B981", // green
        "#F59E0B", // amber
        "#8B5CF6", // violet
        "#EC4899", // pink
        "#06B6D4", // cyan
        "#F97316", // orange
    ]

    /// Default task color (blue).
    static let defaultColor = "#3B82F6"

    /// Source badge display info matching the web app's getSourceBadges.
    ///
    /// - Parameter source: The task source type.
    /// - Returns: Tuple of (label, bgColor, textColor) for the badge.
    static func sourceBadge(for source: TaskSource) -> (label: String, bg: Color, text: Color) {
        switch source {
        case .canvas:
            return ("bCourses", Color(hex: "#EFF6FF"), Color(hex: "#2563EB"))
        case .gradescope:
            return ("Gradescope", Color(hex: "#ECFDF5"), Color(hex: "#059669"))
        case .pensieve:
            return ("Pensive", Color(hex: "#FAF5FF"), Color(hex: "#9333EA"))
        case .syllabus:
            return ("Syllabus", Color(hex: "#FFF7ED"), Color(hex: "#EA580C"))
        }
    }
}
