import SwiftUI

/// Empty state placeholder with an SF Symbol icon and message.
/// Vertically centered with generous padding, matching Sleep Tracker's empty states.
///
/// - Parameters:
///   - icon: SF Symbol name for the icon.
///   - message: Descriptive message shown below the icon.
struct EmptyStateView: View {
    let icon: String
    let message: String

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 28, weight: .light))
                .foregroundStyle(AppColors.subtleForeground)

            Text(message)
                .font(.caption)
                .foregroundStyle(AppColors.mutedForeground)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
    }
}
