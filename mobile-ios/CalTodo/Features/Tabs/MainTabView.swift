import SwiftUI

/// Main tab navigation with 4 tabs: Home, Inbox, Calendar, Notes.
/// Profile avatar shown as a toolbar button that opens a sheet.
///
/// Matches the web app's navigation (no redundant "Today" tab).
/// Haptic feedback on tab switches (matches Sleep Tracker pattern).
struct MainTabView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var taskStore: TaskStore
    @State private var selectedTab = 0
    @State private var showProfile = false

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                HomeView()
                    .toolbar { ToolbarItem(placement: .topBarTrailing) { profileButton } }
            }
            .tabItem { Label("Home", systemImage: "house.fill") }
            .tag(0)

            NavigationStack {
                InboxView()
                    .toolbar { ToolbarItem(placement: .topBarTrailing) { profileButton } }
            }
            .tabItem { Label("Inbox", systemImage: "tray.fill") }
            .tag(1)

            NavigationStack {
                CalendarView()
                    .toolbar { ToolbarItem(placement: .topBarTrailing) { profileButton } }
            }
            .tabItem { Label("Calendar", systemImage: "calendar") }
            .tag(2)

            NavigationStack {
                NotesView()
                    .toolbar { ToolbarItem(placement: .topBarTrailing) { profileButton } }
            }
            .tabItem { Label("Notes", systemImage: "note.text") }
            .tag(3)
        }
        .tint(AppColors.blue500)
        .onChange(of: selectedTab) { _ in HapticManager.selection() }
        .sheet(isPresented: $showProfile) {
            ProfileSheetView()
        }
    }

    // MARK: - Profile Button

    private var profileButton: some View {
        Button {
            HapticManager.light()
            showProfile = true
        } label: {
            if let avatarURL = authManager.avatarURL {
                AsyncImage(url: avatarURL) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    profilePlaceholder
                }
                .frame(width: 28, height: 28)
                .clipShape(Circle())
            } else {
                profilePlaceholder
            }
        }
        .accessibilityLabel("Profile")
    }

    private var profilePlaceholder: some View {
        Image(systemName: "person.circle.fill")
            .font(.system(size: 24))
            .foregroundStyle(AppColors.mutedForeground)
    }
}
