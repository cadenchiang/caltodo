import SwiftUI

/// Compact empty state — icon + message. Minimal padding.
struct EmptyStateView: View {
    let icon: String
    let message: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 28, weight: .ultraLight))
                .foregroundStyle(AppColors.subtleForeground)

            Text(message)
                .font(.system(size: 13))
                .foregroundStyle(AppColors.mutedForeground)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
    }
}
