import SwiftUI

/// Main tab navigation with 5 icon-only tabs.
/// Top bar: avatar button (left) for profile, ellipsis menu (right) for filter/sort/sync.
struct MainTabView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var taskStore: TaskStore

    @State private var selectedTab = 0
    @State private var showProfile = false
    @State private var filterMode = "all"
    @State private var sortMode = "date"

    var body: some View {
        NavigationView {
            TabView(selection: $selectedTab) {
                HomeView()
                    .tag(0)
                    .tabItem {
                        Image(systemName: "house.fill")
                    }

                InboxView()
                    .tag(1)
                    .tabItem {
                        Image(systemName: "tray.fill")
                    }

                CalendarView()
                    .tag(2)
                    .tabItem {
                        Image(systemName: "calendar")
                    }

                NotesView()
                    .tag(3)
                    .tabItem {
                        Image(systemName: "note.text")
                    }

                SettingsView()
                    .tag(4)
                    .tabItem {
                        Image(systemName: "gearshape.fill")
                    }
            }
            .tint(AppColors.blue500)
            .onChange(of: selectedTab) { _ in
                HapticManager.selection()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    avatarButton
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    // Only show menu on Home (0) and Inbox (1)
                    if selectedTab == 0 || selectedTab == 1 {
                        menuButton
                    }
                }
            }
        }
        .navigationViewStyle(.stack)
        .task {
            if taskStore.tasks.isEmpty {
                await taskStore.fetchTasks()
            }
            if taskStore.integrations == nil {
                await taskStore.fetchCredentials()
            }
        }
        .sheet(isPresented: $showProfile) {
            ProfileSheetView()
                .presentationDetents([.medium, .large])
        }
    }

    // MARK: - Avatar Button

    /// 28pt circle avatar that opens the profile sheet.
    private var avatarButton: some View {
        Button {
            HapticManager.light()
            showProfile = true
        } label: {
            if let url = authManager.avatarURL {
                AsyncImage(url: url) { image in
                    image.resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    avatarPlaceholder
                }
                .frame(width: 28, height: 28)
                .clipShape(Circle())
            } else {
                avatarPlaceholder
            }
        }
    }

    /// Fallback avatar with initials.
    private var avatarPlaceholder: some View {
        Circle()
            .fill(AppColors.tertiaryBackground)
            .frame(width: 28, height: 28)
            .overlay(
                Text(initials)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(AppColors.mutedForeground)
            )
    }

    // MARK: - Three-dot Menu

    /// Ellipsis menu with filter, sort, and sync options.
    private var menuButton: some View {
        Menu {
            // Filter section
            Section("filter") {
                Button {
                    filterMode = "all"
                } label: {
                    Label("all tasks", systemImage: filterMode == "all" ? "checkmark" : "")
                }

                Button {
                    filterMode = "today"
                } label: {
                    Label("due today", systemImage: filterMode == "today" ? "checkmark" : "")
                }

                Button {
                    filterMode = "7days"
                } label: {
                    Label("next 7 days", systemImage: filterMode == "7days" ? "checkmark" : "")
                }
            }

            // Sort section
            Section("sort") {
                Button {
                    sortMode = "date"
                } label: {
                    Label("by date", systemImage: sortMode == "date" ? "checkmark" : "")
                }

                Button {
                    sortMode = "class"
                } label: {
                    Label("by class", systemImage: sortMode == "class" ? "checkmark" : "")
                }
            }

            Divider()

            // Sync
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
