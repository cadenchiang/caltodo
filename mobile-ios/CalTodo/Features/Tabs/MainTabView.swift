import SwiftUI

/// Main tab navigation — each tab has its own NavigationStack.
/// Inbox: large bold title + three-dot menu. Calendar/Settings: centered inline title. No profile in nav bar.
struct MainTabView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var taskStore: TaskStore

    @State private var selectedTab = 0
    @AppStorage("inbox_filter") private var filterMode = "all"
    @AppStorage("inbox_sort") private var sortMode = "date"

    var body: some View {
        TabView(selection: $selectedTab) {
            // Home — no toolbar buttons
            NavigationStack {
                HomeView()
            }
            .tag(0)
            .tabItem { Image(systemName: "house") }

            // Inbox
            NavigationStack {
                InboxView()
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) { inboxTitleMenu }
                        ToolbarItem(placement: .navigationBarTrailing) { sortMenuButton }
                    }
            }
            .tag(1)
            .tabItem { Image(systemName: "tray") }

            // Calendar
            NavigationStack {
                CalendarView()
            }
            .tag(2)
            .tabItem { Image(systemName: "tablecells") }

            // Notes
            NavigationStack {
                NotesView()
                    .navigationTitle("notes")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .tag(3)
            .tabItem { Image(systemName: "note.text") }

            // Settings
            NavigationStack {
                SettingsView()
                    .navigationTitle("settings")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .tag(4)
            .tabItem { Image(systemName: "gearshape") }
        }
        .tint(AppColors.accent)
        .onChange(of: selectedTab) { _ in HapticManager.selection() }
        .task {
            if taskStore.tasks.isEmpty { await taskStore.fetchTasks() }
            if taskStore.integrations == nil { await taskStore.fetchCredentials() }
        }
    }

    // MARK: - Inbox Title Dropdown

    private var filterLabel: String {
        switch filterMode {
        case "today": return "due today"
        case "7days": return "7 days"
        default: return "inbox"
        }
    }

    /// Top-left dropdown title for Inbox — shows current filter, tap to change.
    private var inboxTitleMenu: some View {
        Menu {
            filterButton("all tasks", icon: "tray.fill", value: "all")
            filterButton("due today", icon: "sun.max.fill", value: "today")
            filterButton("next 7 days", icon: "calendar", value: "7days")
        } label: {
            HStack(spacing: 5) {
                Text(filterLabel)
                    .font(.system(size: 17, weight: .bold))
                Text("\(taskStore.filteredTasks(filter: filterMode, sort: sortMode).count)")
                    .font(.system(size: 13, weight: .regular))
                    .foregroundColor(.secondary)
                Image(systemName: "chevron.down")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.secondary)
            }
            .foregroundColor(.primary)
        }
        .menuStyle(.borderlessButton)
    }

    /// Sort button for Inbox — top right.
    private var sortMenuButton: some View {
        Menu {
            sortButton("by date", icon: "calendar.badge.clock", value: "date")
            sortButton("by class", icon: "graduationcap.fill", value: "class")
            Divider()
            Button {
                HapticManager.medium()
                Task { await taskStore.fetchTasks() }
            } label: {
                Label("sync now", systemImage: "arrow.triangle.2.circlepath")
            }
        } label: {
            Image(systemName: "ellipsis")
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(AppColors.foreground)
                .frame(width: 28, height: 28)
        }
    }

    // MARK: - Home Menu

    private var menuButton: some View {
        Menu {
            Section("filter") {
                filterButton("all tasks", icon: "tray.fill", value: "all")
                filterButton("due today", icon: "sun.max.fill", value: "today")
                filterButton("next 7 days", icon: "calendar", value: "7days")
            }
            Section("sort") {
                sortButton("by date", icon: "calendar.badge.clock", value: "date")
                sortButton("by class", icon: "graduationcap.fill", value: "class")
            }
            Divider()
            Button {
                HapticManager.medium()
                Task { await taskStore.fetchTasks() }
            } label: {
                Label("sync now", systemImage: "arrow.triangle.2.circlepath")
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
