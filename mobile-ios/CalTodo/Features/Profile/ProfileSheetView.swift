import SwiftUI

/// Profile sheet showing user info, integrations, and sign-out.
/// Presented as a detented sheet from the profile avatar.
struct ProfileSheetView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    avatarSection
                    userInfoSection
                    integrationsCard
                    preferencesCard
                    signOutButton
                }
                .padding(.horizontal, 20)
                .padding(.top, 24)
                .padding(.bottom, 24)
            }
            .background(AppColors.secondaryBackground)
            .navigationTitle("profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(.subheadline).fontWeight(.medium)
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    // MARK: - Avatar

    private var avatarSection: some View {
        Group {
            if let url = authManager.avatarURL {
                AsyncImage(url: url) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: { avatarPlaceholder }
                .frame(width: 72, height: 72).clipShape(Circle())
            } else { avatarPlaceholder }
        }
    }

    private var avatarPlaceholder: some View {
        Image(systemName: "person.circle.fill")
            .font(.system(size: 72)).foregroundStyle(AppColors.mutedForeground)
    }

    // MARK: - User Info

    private var userInfoSection: some View {
        VStack(spacing: 4) {
            if let name = authManager.userName {
                Text(name).font(.system(size: 18, weight: .semibold)).foregroundStyle(AppColors.foreground)
            }
            if let email = authManager.userEmail {
                Text(email).font(.caption).foregroundStyle(AppColors.mutedForeground)
            }
        }
    }

    // MARK: - Integrations Card

    private var integrationsCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("integrations")
                .font(.caption).fontWeight(.medium).foregroundStyle(AppColors.secondaryForeground)
                .padding(.horizontal, 14).padding(.top, 14).padding(.bottom, 10)

            integrationRow(icon: "book.closed", label: "bCourses / Canvas", connected: false)
            Divider().padding(.leading, 48)
            integrationRow(icon: "doc.text.magnifyingglass", label: "Gradescope", connected: false)
            Divider().padding(.leading, 48)
            integrationRow(icon: "calendar", label: "Google Calendar", connected: false)

            Text("set up integrations on the web app")
                .font(.caption2).foregroundStyle(AppColors.subtleForeground)
                .padding(.horizontal, 14).padding(.vertical, 10)
        }
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func integrationRow(icon: String, label: String, connected: Bool) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 14)).foregroundStyle(AppColors.mutedForeground).frame(width: 20)
            Text(label).font(.caption).fontWeight(.medium).foregroundStyle(AppColors.foreground)
            Spacer()
            HStack(spacing: 4) {
                Circle().fill(connected ? AppColors.green500 : AppColors.subtleForeground.opacity(0.5)).frame(width: 6, height: 6)
                Text(connected ? "connected" : "not set up").font(.caption2).foregroundStyle(connected ? AppColors.green500 : AppColors.subtleForeground)
            }
        }
        .padding(.vertical, 10).padding(.horizontal, 14)
    }

    // MARK: - Preferences Card

    private var preferencesCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("preferences")
                .font(.caption).fontWeight(.medium).foregroundStyle(AppColors.secondaryForeground)
                .padding(.horizontal, 14).padding(.top, 14).padding(.bottom, 10)

            prefRow(icon: "envelope.fill", label: "email digest", value: "manage on web")
            Divider().padding(.leading, 48)
            prefRow(icon: "paintbrush.fill", label: "theme", value: "manage on web")
        }
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func prefRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 14)).foregroundStyle(AppColors.mutedForeground).frame(width: 20)
            Text(label).font(.caption).fontWeight(.medium).foregroundStyle(AppColors.foreground)
            Spacer()
            Text(value).font(.caption2).foregroundStyle(AppColors.subtleForeground)
        }
        .padding(.vertical, 10).padding(.horizontal, 14)
    }

    // MARK: - Sign Out

    private var signOutButton: some View {
        Button {
            HapticManager.medium()
            Task { await authManager.signOut(); dismiss() }
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "rectangle.portrait.and.arrow.right").font(.caption)
                Text("sign out").font(.subheadline).fontWeight(.semibold)
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity).frame(height: 44)
            .background(AppColors.red500)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}
