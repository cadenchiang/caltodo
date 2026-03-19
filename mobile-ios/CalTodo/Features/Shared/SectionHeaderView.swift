import SwiftUI

/// Section header with bold title, optional count badge, and optional collapsible chevron.
///
/// - Parameters:
///   - title: Section title, displayed in 14pt bold lowercase.
///   - count: Optional count shown in a capsule badge.
///   - isCollapsible: Whether to show a chevron for collapsing.
///   - isExpanded: Binding to the expanded state (only used when isCollapsible is true).
struct SectionHeaderView: View {
    let title: String
    var count: Int? = nil
    var isCollapsible: Bool = false
    var isExpanded: Binding<Bool>? = nil

    var body: some View {
        HStack(spacing: 8) {
            Text(title.lowercased())
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(AppColors.foreground)

            if let count = count {
                Text("\(count)")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(AppColors.mutedForeground)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(AppColors.tertiaryBackground)
                    .clipShape(Capsule())
            }

            Spacer()

            if isCollapsible, let isExpanded = isExpanded {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(AppColors.subtleForeground)
                    .rotationEffect(.degrees(isExpanded.wrappedValue ? 90 : 0))
                    .animation(.easeInOut(duration: 0.2), value: isExpanded.wrappedValue)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
        .onTapGesture {
            if isCollapsible, let isExpanded = isExpanded {
                HapticManager.light()
                withAnimation(.easeInOut(duration: 0.2)) {
                    isExpanded.wrappedValue.toggle()
                }
            }
        }
    }
}
