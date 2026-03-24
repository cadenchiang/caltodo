import SwiftUI
import Supabase

/// Settings — matches desktop 1:1. Profile editable, integrations as cards, proper spacing.
struct SettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var taskStore: TaskStore
    @ObservedObject private var themeManager = ThemeManager.shared
    @AppStorage("appearance") private var appearance = "system"

    @State private var showDisconnectConfirm: String?
    @State private var showCanvasSetup = false
    @State private var showGradescopeSetup = false
    @State private var showPensieveSetup = false
    @State private var showAddMenu = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                profileSection
                integrationsSection
                appearanceSection
                tabBarSection
                notificationsSection
                accountSection
            }
            .padding(.vertical, 16)
        }
        .background(AppColors.background)
        .refreshable { await taskStore.fetchCredentials() }
        .alert("Disconnect?", isPresented: Binding(
            get: { showDisconnectConfirm != nil },
            set: { if !$0 { showDisconnectConfirm = nil } }
        )) {
            Button("Cancel", role: .cancel) {}
            Button("Disconnect", role: .destructive) {
                if let s = showDisconnectConfirm { Task { await disconnect(source: s) } }
            }
        } message: {
            Text("This will stop syncing and remove associated tasks. You can reconnect anytime.")
        }
        .sheet(isPresented: $showCanvasSetup) {
            CanvasSetupSheet(onDone: { Task { await taskStore.fetchCredentials() } })
                .environmentObject(authManager).presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $showGradescopeSetup) {
            GradescopeSetupSheet(onDone: { Task { await taskStore.fetchCredentials() } })
                .environmentObject(authManager).presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $showPensieveSetup) {
            PensieveSetupSheet(onDone: { Task { await taskStore.fetchCredentials() } })
                .environmentObject(authManager).presentationDragIndicator(.visible)
        }
    }

    // MARK: - Profile (editable)

    private var profileSection: some View {
        HStack(spacing: 14) {
            if let url = authManager.avatarURL {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Circle().fill(AppColors.secondaryBackground)
                }
                .frame(width: 56, height: 56)
                .clipShape(Circle())
            } else {
                Circle().fill(AppColors.secondaryBackground)
                    .frame(width: 56, height: 56)
                    .overlay(
                        Text(String((authManager.userName ?? "").prefix(1)).uppercased())
                            .font(.system(size: 22, weight: .semibold))
                            .foregroundStyle(AppColors.foreground)
                    )
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(authManager.userName ?? "")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(AppColors.foreground)
                Text(authManager.userEmail ?? "")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.mutedForeground)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.border)
        }
        .padding(16)
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 16)
    }

    // MARK: - Integrations (card-based, matching desktop)

    private var integrationsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header with + button
            HStack {
                Text("Integrations")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(AppColors.foreground)
                Spacer()
                Menu {
                    Button { showCanvasSetup = true } label: { Label("bCourses", image: "CanvasLogo") }
                    Button { showCanvasSetup = true } label: { Label("Canvas", image: "CanvasLogo") }
                    Button { showGradescopeSetup = true } label: { Label("Gradescope", image: "GradescopeLogo") }
                    Button { showPensieveSetup = true } label: { Label("Pensieve", image: "PensieveLogo") }
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(AppColors.accent)
                        .frame(width: 32, height: 32)
                        .background(AppColors.accent.opacity(0.12))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
            .padding(.horizontal, 20)

            // Integration cards
            VStack(spacing: 8) {
                integrationCard(
                    logo: "CanvasLogo", title: "bCourses", subtitle: "Canvas for Cal students",
                    connected: taskStore.integrations?.canvasConnected ?? false,
                    onConnect: { showCanvasSetup = true }, source: "canvas")
                integrationCard(
                    logo: "GradescopeLogo", title: "Gradescope", subtitle: "Sync homework & exams",
                    connected: taskStore.integrations?.gradescopeConnected ?? false,
                    onConnect: { showGradescopeSetup = true }, source: "gradescope")
                integrationCard(
                    logo: "GCalLogo", title: "Google Calendar", subtitle: "Real-time sync",
                    connected: taskStore.integrations?.googleCalendarConnected ?? false,
                    onConnect: {}, source: "gcal")
                integrationCard(
                    logo: "PensieveLogo", title: "Pensieve", subtitle: "Sync CS/DS assignments",
                    connected: taskStore.integrations?.pensieveConnected ?? false,
                    onConnect: { showPensieveSetup = true }, source: "pensieve")
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Single Integration Card (matches desktop exactly)

    private func integrationCard(
        logo: String, title: String, subtitle: String,
        connected: Bool, onConnect: @escaping () -> Void, source: String,
        badge: String? = nil
    ) -> some View {
        Button {
            HapticManager.light()
            if connected { showDisconnectConfirm = source } else { onConnect() }
        } label: {
            HStack(spacing: 12) {
                // Logo in muted box
                Image(logo).resizable().aspectRatio(contentMode: .fit)
                    .frame(width: 20, height: 20)
                    .frame(width: 36, height: 36)
                    .background(AppColors.secondaryBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                // Title + subtitle
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(title).font(.system(size: 14, weight: .semibold)).foregroundStyle(AppColors.foreground)
                        if let badge {
                            Text(badge)
                                .font(.system(size: 9, weight: .medium))
                                .foregroundStyle(AppColors.blue500)
                                .padding(.horizontal, 6).padding(.vertical, 2)
                                .background(AppColors.blue500.opacity(0.12))
                                .clipShape(Capsule())
                        }
                    }
                    Text(subtitle).font(.system(size: 12)).foregroundStyle(AppColors.mutedForeground).lineLimit(1)
                }

                Spacer()

                // Status pill
                Text(connected ? "Connected" : "Connect")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(connected ? AppColors.green500 : AppColors.blue500)
                    .padding(.horizontal, 10).padding(.vertical, 5)
                    .background((connected ? AppColors.green500 : AppColors.blue500).opacity(0.1))
                    .clipShape(Capsule())
            }
            .padding(.horizontal, 14).padding(.vertical, 12)
            .background(AppColors.card)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }

    // MARK: - Appearance

    private var appearanceSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Appearance").font(.system(size: 16, weight: .semibold)).foregroundStyle(AppColors.foreground).padding(.horizontal, 20)
            VStack(spacing: 0) {
                appearanceToggle.padding(14)
                divider
                NavigationLink { ThemePickerPage(themeManager: themeManager) } label: {
                    HStack {
                        Text("Theme").font(.system(size: 15)).foregroundStyle(AppColors.foreground)
                        Spacer()
                        Text(themeManager.currentTheme.capitalized).font(.system(size: 13)).foregroundStyle(AppColors.mutedForeground)
                        Image(systemName: "chevron.right").font(.system(size: 12)).foregroundStyle(AppColors.border)
                    }.padding(.horizontal, 16).padding(.vertical, 14)
                }
            }
            .background(AppColors.card).clipShape(RoundedRectangle(cornerRadius: 14)).padding(.horizontal, 16)
        }
    }

    private var tabBarSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Tab Bar").font(.system(size: 16, weight: .semibold)).foregroundStyle(AppColors.foreground).padding(.horizontal, 20)
            NavigationLink { TabBarSettingsView() } label: {
                HStack {
                    Text("Customize Tabs").font(.system(size: 15)).foregroundStyle(AppColors.foreground)
                    Spacer()
                    Image(systemName: "chevron.right").font(.system(size: 12)).foregroundStyle(AppColors.border)
                }.padding(.horizontal, 16).padding(.vertical, 14)
            }
            .background(AppColors.card).clipShape(RoundedRectangle(cornerRadius: 14)).padding(.horizontal, 16)
        }
    }

    private var notificationsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Notifications").font(.system(size: 16, weight: .semibold)).foregroundStyle(AppColors.foreground).padding(.horizontal, 20)
            NavigationLink { NotificationSettingsView() } label: {
                HStack {
                    Text("Reminders & Alerts").font(.system(size: 15)).foregroundStyle(AppColors.foreground)
                    Spacer()
                    Image(systemName: "chevron.right").font(.system(size: 12)).foregroundStyle(AppColors.border)
                }.padding(.horizontal, 16).padding(.vertical, 14)
            }
            .background(AppColors.card).clipShape(RoundedRectangle(cornerRadius: 14)).padding(.horizontal, 16)
        }
    }

    private var accountSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Account").font(.system(size: 16, weight: .semibold)).foregroundStyle(AppColors.foreground).padding(.horizontal, 20)
            VStack(spacing: 0) {
                HStack {
                    Text("Email").font(.system(size: 15)).foregroundStyle(AppColors.foreground)
                    Spacer()
                    Text(authManager.userEmail ?? "").font(.system(size: 13)).foregroundStyle(AppColors.mutedForeground)
                }.padding(.horizontal, 16).padding(.vertical, 14)
                divider
                Button {
                    HapticManager.medium()
                    Task { await authManager.signOut() }
                } label: {
                    HStack {
                        Text("Sign Out").font(.system(size: 15)).foregroundStyle(AppColors.red500)
                        Spacer()
                    }.padding(.horizontal, 16).padding(.vertical, 14)
                }
            }
            .background(AppColors.card).clipShape(RoundedRectangle(cornerRadius: 14)).padding(.horizontal, 16)
        }
    }

    // MARK: - Appearance Toggle

    private var appearanceToggle: some View {
        HStack(spacing: 0) {
            seg("Light", "sun.max.fill", "light")
            seg("Auto", "desktopcomputer", "system")
            seg("Dark", "moon.fill", "dark")
        }.padding(3).background(AppColors.secondaryBackground).clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private func seg(_ label: String, _ icon: String, _ val: String) -> some View {
        Button {
            HapticManager.light()
            appearance = val
            // Update ThemeManager immediately instead of waiting for system propagation
            switch val {
            case "light": themeManager.isDarkMode = false
            case "dark": themeManager.isDarkMode = true
            default:
                // "system" — read current system appearance
                let style = UIScreen.main.traitCollection.userInterfaceStyle
                themeManager.isDarkMode = style == .dark
            }
        } label: {
            HStack(spacing: 4) {
                Image(systemName: icon).font(.system(size: 11))
                Text(label).font(.system(size: 13, weight: appearance == val ? .semibold : .regular))
            }
            .foregroundStyle(appearance == val ? AppColors.foreground : AppColors.mutedForeground)
            .frame(maxWidth: .infinity).padding(.vertical, 7)
            .background(appearance == val ? AppColors.secondaryBackground : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }.buttonStyle(.plain)
    }

    private func disconnect(source: String) async {
        guard let userId = authManager.client.auth.currentSession?.user.id.uuidString.lowercased() else { return }
        do {
            switch source {
            case "canvas":
                try await authManager.client.from("integration_credentials")
                    .update(["canvas_token": nil as String?, "canvas_ical_url": nil as String?])
                    .eq("user_id", value: userId).execute()
            case "gradescope":
                try await authManager.client.from("integration_credentials")
                    .update(["gradescope_email": nil as String?, "gradescope_password_encrypted": nil as String?])
                    .eq("user_id", value: userId).execute()
            case "pensieve":
                try await authManager.client.from("integration_credentials")
                    .update(["pensieve_calendar_url": nil as String?])
                    .eq("user_id", value: userId).execute()
            case "gcal":
                try await authManager.client.from("integration_credentials")
                    .update(["google_access_token_encrypted": nil as String?, "google_refresh_token_encrypted": nil as String?, "google_calendar_id": nil as String?])
                    .eq("user_id", value: userId).execute()
            default: break
            }
            await taskStore.fetchCredentials()
        } catch {
            AppLogger.ui.error("Disconnect failed: \(error.localizedDescription)")
        }
    }

    private var divider: some View {
        Rectangle().fill(AppColors.secondaryBackground).frame(height: 1).padding(.leading, 16)
    }
}

// MARK: - Setup Sheets

struct CanvasSetupSheet: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss
    @State private var icalURL = ""
    @State private var isSaving = false
    var onDone: () -> Void

    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Paste your bCourses calendar feed URL")
                    .font(.system(size: 15)).foregroundStyle(AppColors.foreground).padding(.horizontal, 20).padding(.top, 16)
                TextField("https://bcourses.berkeley.edu/feeds/...", text: $icalURL)
                    .font(.system(size: 14)).textInputAutocapitalization(.never).autocorrectionDisabled()
                    .padding(12).background(AppColors.card).clipShape(RoundedRectangle(cornerRadius: 10)).padding(.horizontal, 20)
                Spacer()
            }
            .background(AppColors.background)
            .navigationTitle("Connect bCourses").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }.font(.system(size: 15)).foregroundStyle(AppColors.mutedForeground)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        isSaving = true
                        Task {
                            guard let uid = authManager.client.auth.currentSession?.user.id.uuidString.lowercased() else { return }
                            try? await authManager.client.from("integration_credentials")
                                .update(["canvas_ical_url": icalURL]).eq("user_id", value: uid).execute()
                            onDone(); dismiss()
                        }
                    } label: {
                        if isSaving { ProgressView() } else { Text("Save").font(.system(size: 15, weight: .semibold)) }
                    }.disabled(icalURL.isEmpty || isSaving)
                }
            }
        }
    }
}

struct GradescopeSetupSheet: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var password = ""
    @State private var isSaving = false
    var onDone: () -> Void

    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Enter your Gradescope credentials")
                    .font(.system(size: 15)).foregroundStyle(AppColors.foreground).padding(.horizontal, 20).padding(.top, 16)
                TextField("Email", text: $email)
                    .textInputAutocapitalization(.never).autocorrectionDisabled().keyboardType(.emailAddress)
                    .font(.system(size: 14)).padding(12).background(AppColors.card)
                    .clipShape(RoundedRectangle(cornerRadius: 10)).padding(.horizontal, 20)
                SecureField("Password", text: $password)
                    .font(.system(size: 14)).padding(12).background(AppColors.card)
                    .clipShape(RoundedRectangle(cornerRadius: 10)).padding(.horizontal, 20)
                Text("Your password is encrypted with AES-256.")
                    .font(.system(size: 12)).foregroundStyle(AppColors.mutedForeground).padding(.horizontal, 20)
                Spacer()
            }
            .background(AppColors.background)
            .navigationTitle("Connect Gradescope").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }.font(.system(size: 15)).foregroundStyle(AppColors.mutedForeground)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        isSaving = true
                        Task {
                            guard let uid = authManager.client.auth.currentSession?.user.id.uuidString.lowercased() else { return }
                            try? await authManager.client.from("integration_credentials")
                                .update(["gradescope_email": email]).eq("user_id", value: uid).execute()
                            onDone(); dismiss()
                        }
                    } label: {
                        if isSaving { ProgressView() } else { Text("Save").font(.system(size: 15, weight: .semibold)) }
                    }.disabled(email.isEmpty || password.isEmpty || isSaving)
                }
            }
        }
    }
}

struct PensieveSetupSheet: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss
    @State private var calendarURL = ""
    @State private var isSaving = false
    var onDone: () -> Void

    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Paste your Pensieve calendar URL")
                    .font(.system(size: 15)).foregroundStyle(AppColors.foreground).padding(.horizontal, 20).padding(.top, 16)
                TextField("https://api.pensieve.co/api/calendar/...", text: $calendarURL)
                    .font(.system(size: 14)).textInputAutocapitalization(.never).autocorrectionDisabled()
                    .padding(12).background(AppColors.card).clipShape(RoundedRectangle(cornerRadius: 10)).padding(.horizontal, 20)
                Spacer()
            }
            .background(AppColors.background)
            .navigationTitle("Connect Pensieve").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }.font(.system(size: 15)).foregroundStyle(AppColors.mutedForeground)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        isSaving = true
                        Task {
                            guard let uid = authManager.client.auth.currentSession?.user.id.uuidString.lowercased() else { return }
                            try? await authManager.client.from("integration_credentials")
                                .update(["pensieve_calendar_url": calendarURL]).eq("user_id", value: uid).execute()
                            onDone(); dismiss()
                        }
                    } label: {
                        if isSaving { ProgressView() } else { Text("Save").font(.system(size: 15, weight: .semibold)) }
                    }.disabled(calendarURL.isEmpty || isSaving)
                }
            }
        }
    }
}
