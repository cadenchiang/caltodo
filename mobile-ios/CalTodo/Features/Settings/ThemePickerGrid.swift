import SwiftUI

/// Full-page theme picker — pushed from Settings via NavigationLink.
/// Two-column grid of all themes with color preview and checkmark.
struct ThemePickerPage: View {
    @ObservedObject var themeManager: ThemeManager

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 10) {
                ForEach(ThemeCatalog.all, id: \.id) { theme in
                    themeCell(theme)
                }
            }
            .padding(16)
        }
        .background(AppColors.background)
        .navigationTitle("Theme")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func themeCell(_ theme: ThemeDefinition) -> some View {
        let isSelected = themeManager.currentTheme == theme.id
        let colors = themeManager.isDarkMode ? theme.dark : theme.light

        return Button {
            HapticManager.light()
            themeManager.currentTheme = theme.id
        } label: {
            VStack(spacing: 8) {
                // Color preview circles
                HStack(spacing: -4) {
                    Circle().fill(colors.accent).frame(width: 18, height: 18)
                        .overlay(Circle().stroke(AppColors.border, lineWidth: 0.5))
                    Circle().fill(colors.background).frame(width: 18, height: 18)
                        .overlay(Circle().stroke(AppColors.border, lineWidth: 0.5))
                    Circle().fill(colors.foreground).frame(width: 18, height: 18)
                        .overlay(Circle().stroke(AppColors.border, lineWidth: 0.5))
                }

                Text(theme.displayName)
                    .font(.system(size: 12, weight: isSelected ? .semibold : .regular))
                    .foregroundStyle(AppColors.foreground)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(isSelected ? AppColors.accent.opacity(0.08) : AppColors.card)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? AppColors.accent : AppColors.border, lineWidth: isSelected ? 1.5 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}
