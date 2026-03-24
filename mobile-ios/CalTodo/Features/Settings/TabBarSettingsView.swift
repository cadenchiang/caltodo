import SwiftUI

/// Settings for customizing which tabs appear in the bottom bar.
/// Inbox is always visible (primary tab).
struct TabBarSettingsView: View {
    @AppStorage("tab_calendar_visible") private var calendarVisible = true
    @AppStorage("tab_calchat_visible") private var calChatVisible = true

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Inbox — always on
                HStack(spacing: 12) {
                    Image(systemName: "tray")
                        .font(.system(size: 16))
                        .foregroundStyle(AppColors.mutedForeground)
                        .frame(width: 24)
                    Text("Inbox")
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.foreground)
                    Spacer()
                    Text("Always On")
                        .font(.system(size: 13))
                        .foregroundStyle(AppColors.subtleForeground)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                divider
                tabToggle(icon: "calendar", label: "Calendar", isOn: $calendarVisible)
                divider
                tabToggle(icon: "bubble.left", label: "CalChat", isOn: $calChatVisible)
            }
            .background(AppColors.card)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(AppColors.border, lineWidth: 1))
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(AppColors.background)
        .navigationTitle("Tab Bar")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func tabToggle(icon: String, label: String, isOn: Binding<Bool>) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(AppColors.mutedForeground)
                .frame(width: 24)
            Text(label)
                .font(.system(size: 15))
                .foregroundStyle(AppColors.foreground)
            Spacer()
            Toggle("", isOn: isOn)
                .labelsHidden()
                .tint(AppColors.accent)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private var divider: some View {
        Rectangle().fill(AppColors.separator).frame(height: 1).padding(.leading, 52)
    }
}
