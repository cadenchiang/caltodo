import SwiftUI

/// Settings tab with integrations, appearance, and account sections.
/// Clean grouped layout matching the web app's settings page.
struct SettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var taskStore: TaskStore
    @AppStorage("appearance") private var appearance = "system"

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Integrations section
                settingsSection(title: "integrations") {
                    VStack(spacing: 0) {
                        integrationRow(
                            logoName: "CanvasLogo",
                            label: "bcourses",
                            isConnected: taskStore.integrations?.canvasConnected ?? false
                        )

                        sectionDivider

                        integrationRow(
                            logoName: "GradescopeLogo",
                            label: "gradescope",
                            isConnected: taskStore.integrations?.gradescopeConnected ?? false
                        )

                        sectionDivider

                        integrationRow(
                            logoName: "GCalLogo",
                            label: "google calendar",
                            isConnected: taskStore.integrations?.googleCalendarConnected ?? false
                        )
                    }
                }

                // Appearance section
                settingsSection(title: "appearance") {
                    VStack(spacing: 0) {
                        appearanceRow(label: "system", value: "system")
                        sectionDivider
                        appearanceRow(label: "light", value: "light")
                        sectionDivider
                        appearanceRow(label: "dark", value: "dark")
                    }
                }

                // Account section
                settingsSection(title: "account") {
                    VStack(spacing: 0) {
                        // Email row
                        HStack {
                            Text("email")
                                .font(.system(size: 15))
                                .foregroundStyle(AppColors.foreground)

                            Spacer()

                            Text((authManager.userEmail ?? "").lowercased())
                                .font(.system(size: 14))
                                .foregroundStyle(AppColors.mutedForeground)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)

                        sectionDivider

                        // Sign out row
                        Button {
                            HapticManager.medium()
                            Task { await authManager.signOut() }
                        } label: {
                            HStack {
                                Text("sign out")
                                    .font(.system(size: 15))
                                    .foregroundStyle(AppColors.red500)
                                Spacer()
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                        }
                    }
                }
            }
            .padding(.vertical, 16)
        }
        .background(AppColors.background)
    }

    // MARK: - Section Builder

    /// Renders a settings section with an uppercase title and card content.
    ///
    /// - Parameters:
    ///   - title: Section title displayed as uppercase tracking text.
    ///   - content: The section content view.
    private func settingsSection<Content: View>(
        title: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title.uppercased())
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(AppColors.secondaryForeground)
                .tracking(0.8)
                .padding(.horizontal, 20)

            content()
                .background(AppColors.card)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(AppColors.border, lineWidth: 1)
                )
                .padding(.horizontal, 16)
        }
    }

    // MARK: - Integration Row

    /// Single integration row with logo image, label, and status.
    private func integrationRow(
        logoName: String,
        label: String,
        isConnected: Bool
    ) -> some View {
        HStack(spacing: 12) {
            Image(logoName)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 20, height: 20)

            Text(label)
                .font(.system(size: 15))
                .foregroundStyle(AppColors.foreground)

            Spacer()

            Circle()
                .fill(isConnected ? AppColors.green500 : AppColors.subtleForeground)
                .frame(width: 6, height: 6)

            Text(isConnected ? "connected" : "not connected")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.mutedForeground)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    // MARK: - Appearance Row

    /// Appearance option row with checkmark for selected option.
    private func appearanceRow(label: String, value: String) -> some View {
        Button {
            HapticManager.light()
            appearance = value
        } label: {
            HStack {
                Text(label)
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.foreground)

                Spacer()

                if appearance == value {
                    Image(systemName: "checkmark")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(AppColors.blue500)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
    }

    // MARK: - Divider

    /// Thin divider for section rows.
    private var sectionDivider: some View {
        Rectangle()
            .fill(AppColors.separator)
            .frame(height: 1)
            .padding(.leading, 52)
    }
}
