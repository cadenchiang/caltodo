import SwiftUI

/// Section header — title with subtle count, optional collapsible chevron.
struct SectionHeaderView: View {
    let title: String
    var count: Int?
    var isCollapsible: Bool = false
    var isExpanded: Binding<Bool>?

    var body: some View {
        HStack(spacing: 6) {
            Text(title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(AppColors.foreground)

            if let count {
                Text("\(count)")
                    .font(.system(size: 13, weight: .regular))
                    .foregroundStyle(AppColors.subtleForeground)
            }

            Spacer()

            if isCollapsible, let isExpanded {
                Image(systemName: "chevron.right")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(AppColors.subtleForeground)
                    .rotationEffect(.degrees(isExpanded.wrappedValue ? 90 : 0))
                    .animation(.spring(response: 0.25, dampingFraction: 0.7), value: isExpanded.wrappedValue)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
        .onTapGesture {
            if isCollapsible, let isExpanded {
                HapticManager.light()
                withAnimation(.easeInOut(duration: 0.2)) {
                    isExpanded.wrappedValue.toggle()
                }
            }
        }
    }
}
