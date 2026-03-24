import SwiftUI

/// Main tab navigation matching the web's MobileTabBar.
/// 6 tabs: Home, Inbox (dynamic label), Calendar, Notes, CalChat, Settings.
/// Each tab shows an icon (20pt) with a text label (10pt) below.
/// Active tab highlighted in blue-500.
struct MainTabView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var taskStore: TaskStore

    @State private var selectedTab = 0
    @State private var inboxSearchText = ""
    @AppStorage("inbox_filter") private var filterMode = "all"
    @AppStorage("inbox_sort") private var sortMode = "date"

    @AppStorage("tab_calendar_visible") private var calendarVisible = true
    @AppStorage("tab_calchat_visible") private var calChatVisible = false

    /// Dynamic inbox tab label based on active filter (Title Case, matching web).
    private var inboxLabel: String {
        switch filterMode {
        case "today": return "Today"
        case "7days": return "7 Days"
        default: return "Inbox"
        }
    }

    /// Dynamic inbox tab icon based on active filter.
    private var inboxIcon: String {
        switch filterMode {
        case "today": return "sun.max"
        case "7days": return "calendar.badge.clock"
        default: return "tray"
        }
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                InboxView(searchText: $inboxSearchText)
                    .navigationTitle("Inbox")
                    .navigationBarTitleDisplayMode(.large)

                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) { menuButton }
                        ToolbarItem(placement: .navigationBarTrailing) { profileButton }
                    }
            }
            .tag(0)
            .tabItem { Image(systemName: "tray") }

            if calendarVisible {
                NavigationStack { CalendarView() }
                    .tag(1)
                    .tabItem { Image(systemName: "calendar") }
            }

            if calChatVisible {
                NavigationStack {
                    CalChatView()
                        .navigationTitle("CalChat")
                        .navigationBarTitleDisplayMode(.large)
                }
                .tag(2)
                .tabItem { Image(systemName: "bubble.left.circle") }
            }
        }
        .tint(AppColors.accent)
        .onChange(of: selectedTab) { _ in HapticManager.selection() }
    }

    // MARK: - Inbox Title Dropdown

    private var filterLabel: String {
        switch filterMode {
        case "today": return "Today"
        case "7days": return "Next 7 Days"
        default: return "Inbox"
        }
    }

    @State private var showSettings = false

    /// Hamburger menu — top left. Picker shows checkmark on active sort.
    private var menuButton: some View {
        Menu {
            Picker(selection: $sortMode) {
                Text("By Date").tag("date")
                Text("By Class").tag("class")
            } label: { Text("Sort By") }
            Button {
                HapticManager.medium()
                Task { await taskStore.fetchTasks() }
            } label: { Text("Sync Now") }
        } label: {
            Image(systemName: "line.3.horizontal")
                .font(.system(size: 18, weight: .medium))
                .foregroundStyle(AppColors.foreground)
        }
    }

    /// Profile picture — top right, opens settings. No background bubble.
    private var profileButton: some View {
        Button { showSettings = true } label: {
            Group {
                if let url = authManager.avatarURL {
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 32))
                            .foregroundStyle(AppColors.mutedForeground)
                    }
                    .frame(width: 32, height: 32)
                    .clipShape(Circle())
                } else {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 32))
                        .foregroundStyle(AppColors.mutedForeground)
                }
            }
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $showSettings) {
            NavigationStack {
                SettingsView()
                    .navigationTitle("Settings")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .presentationDetents([.large])
            .presentationDragIndicator(.visible)
        }
    }

    /// Sort button for Inbox — top right.
    private var sortMenuButton: some View {
        Menu {
            sortButton("By Date", icon: "calendar.badge.clock", value: "date")
            sortButton("By Class", icon: "graduationcap.fill", value: "class")
            Divider()
            Button {
                HapticManager.medium()
                Task { await taskStore.fetchTasks() }
            } label: {
                Label("Sync Now", systemImage: "arrow.triangle.2.circlepath")
            }
        } label: {
            Image(systemName: "ellipsis")
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(AppColors.foreground)
                .frame(width: 28, height: 28)
        }
    }

    private func filterButton(_ title: String, icon: String, value: String) -> some View {
        Button {
            filterMode = value
        } label: {
            HStack {
                Label(title, systemImage: icon)
                Spacer()
                if filterMode == value { Image(systemName: "checkmark") }
            }
        }
    }

    private func sortButton(_ title: String, icon: String, value: String) -> some View {
        Button {
            sortMode = value
        } label: {
            HStack {
                Label(title, systemImage: icon)
                Spacer()
                if sortMode == value { Image(systemName: "checkmark") }
            }
        }
    }
}
