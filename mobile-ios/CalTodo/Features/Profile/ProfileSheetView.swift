import SwiftUI

/// Profile sheet showing user info, integrations, and sign-out.
/// Presented as a detented sheet from the profile avatar.
struct ProfileSheetView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var taskStore: TaskStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    avatarSection
                    integrationsSection
                    signOutButton
                }
                .padding(.top, 24)
                .padding(.horizontal, 20)
            }
            .background(AppColors.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("done") { dismiss() }
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(AppColors.blue500)
                }
            }
        }
    }

    // MARK: - Avatar Section

    /// Centered avatar circle with name and email below.
    private var avatarSection: some View {
        VStack(spacing: 8) {
            if let url = authManager.avatarURL {
                AsyncImage(url: url) { image in
                    image.resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    avatarPlaceholder
                }
                .frame(width: 72, height: 72)
                .clipShape(Circle())
            } else {
                avatarPlaceholder
            }

            Text((authManager.userName ?? "").lowercased())
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(AppColors.foreground)

            Text((authManager.userEmail ?? "").lowercased())
                .font(.system(size: 14))
                .foregroundStyle(AppColors.mutedForeground)
        }
        .frame(maxWidth: .infinity)
    }

    /// Fallback avatar with initials.
    private var avatarPlaceholder: some View {
        Circle()
            .fill(AppColors.tertiaryBackground)
            .frame(width: 72, height: 72)
            .overlay(
                Text(initials)
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundStyle(AppColors.mutedForeground)
            )
    }

    // MARK: - Integrations Section

    /// Integration rows with logo images and status dots.
    private var integrationsSection: some View {
        VStack(spacing: 0) {
            integrationRow(
                logoName: "CanvasLogo",
                label: "bcourses",
                isConnected: taskStore.integrations?.canvasConnected ?? false
            )

            Rectangle()
                .fill(AppColors.separator)
                .frame(height: 1)
                .padding(.leading, 36)

            integrationRow(
                logoName: "GradescopeLogo",
                label: "gradescope",
                isConnected: taskStore.integrations?.gradescopeConnected ?? false
            )

            Rectangle()
                .fill(AppColors.separator)
                .frame(height: 1)
                .padding(.leading, 36)

            integrationRow(
                logoName: "GCalLogo",
                label: "google calendar",
                isConnected: taskStore.integrations?.googleCalendarConnected ?? false
            )
        }
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(AppColors.border, lineWidth: 1)
        )
    }

    /// Single integration row with logo, label, status dot, and status text.
    ///
    /// - Parameters:
    ///   - logoName: Asset catalog image name for the logo.
    ///   - label: Integration display name.
    ///   - isConnected: Whether the integration is connected.
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

    // MARK: - Sign Out

    /// Full-width red sign-out button.
    private var signOutButton: some View {
        Button {
            HapticManager.medium()
            Task {
                await authManager.signOut()
                dismiss()
            }
        } label: {
            Text("sign out")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(AppColors.red500)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    // MARK: - Helpers

    /// User initials for the avatar placeholder.
    private var initials: String {
        let name = authManager.userName ?? ""
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}
