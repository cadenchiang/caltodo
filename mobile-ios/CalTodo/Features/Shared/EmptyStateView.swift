import SwiftUI

/// Empty state placeholder with an SF Symbol icon and message.
/// Centered layout with generous vertical padding.
///
/// - Parameters:
///   - icon: SF Symbol name to display.
///   - message: Descriptive text shown below the icon.
struct EmptyStateView: View {
    let icon: String
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 32, weight: .light))
                .foregroundStyle(AppColors.subtleForeground)

            Text(message.lowercased())
                .font(.system(size: 14))
                .foregroundStyle(AppColors.mutedForeground)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }
}
