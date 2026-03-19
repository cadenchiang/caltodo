import SwiftUI

/// Section header with title and optional count badge.
/// Uses caption weight and size matching Sleep Tracker's section titles.
///
/// - Parameters:
///   - title: Section title text (lowercase, matches web app convention).
///   - count: Optional task count displayed as a capsule badge.
struct SectionHeaderView: View {
    let title: String
    var count: Int?

    var body: some View {
        HStack(spacing: 8) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundStyle(AppColors.secondaryForeground)
                .textCase(.none)

            if let count, count > 0 {
                Text("\(count)")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(AppColors.mutedForeground)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(AppColors.tertiaryBackground)
                    .clipShape(Capsule())
            }

            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}
