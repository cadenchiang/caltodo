import SwiftUI

/// Home dashboard — today's tasks and upcoming, with profile avatar in nav bar.
struct HomeView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var taskStore: TaskStore
    @Environment(\.scenePhase) private var scenePhase

    @State private var selectedTask: CalTask?
    @State private var showSettings = false
    @State private var showCreateSheet = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    todaySection
                    upcomingSection
                }
                .padding(.top, 8)
                .padding(.bottom, 80)
            }
            .background(AppColors.background)

            // FAB
            Button {
                HapticManager.medium()
                showCreateSheet = true
            } label: {
                Image(systemName: "plus")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 56, height: 56)
                    .background(AppColors.accent)
                    .clipShape(Circle())
                    .shadow(color: AppColors.accent.opacity(0.3), radius: 8, x: 0, y: 4)
            }
            .padding(.trailing, 20)
            .padding(.bottom, 20)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button { showSettings = true } label: {
                    profileAvatar
                }
            }
        }
        .refreshable { await taskStore.fetchTasks() }
        .onChange(of: scenePhase) { newPhase in
            if newPhase == .active {
                Task { await taskStore.fetchTasks() }
            }
        }
        .sheet(item: $selectedTask) { task in
            TaskDetailSheet(
                task: task,
                onToggle: { id in
                    Task { await taskStore.toggleComplete(taskId: id) }
                },
                onDismiss: { selectedTask = nil }
            )
            .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showCreateSheet) {
            TaskCreateSheet()
                .environmentObject(taskStore)
        }
        .sheet(isPresented: $showSettings) {
            NavigationStack {
                SettingsView()
                    .navigationTitle("Settings")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .presentationDragIndicator(.visible)
        }
    }

    // MARK: - Profile Avatar

    private var profileAvatar: some View {
        ZStack {
            if let url = authManager.avatarURL {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    initialCircle
                }
            } else {
                initialCircle
            }
        }
        .frame(width: 32, height: 32)
        .clipShape(Circle())
    }

    private var initialCircle: some View {
        AppColors.muted
            .overlay(
                Text(String((authManager.userName ?? "").prefix(1)).uppercased())
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(AppColors.mutedForeground)
            )
    }

    // MARK: - Due Today

    private var todaySection: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionHeaderView(title: "Due Today", count: taskStore.todayTasks.count)

            if taskStore.todayTasks.isEmpty {
                EmptyStateView(icon: "checkmark.circle", message: "Nothing due today")
            } else {
                taskList(taskStore.todayTasks)
            }
        }
    }

    // MARK: - Upcoming

    private var upcomingSection: some View {
        let upcoming = taskStore.upcomingTasks
        let display = Array(upcoming.prefix(5))

        return VStack(alignment: .leading, spacing: 0) {
            SectionHeaderView(title: "Upcoming", count: upcoming.count)

            if display.isEmpty {
                EmptyStateView(icon: "calendar.badge.clock", message: "No upcoming tasks")
            } else {
                taskList(display)

                if upcoming.count > 5 {
                    HStack {
                        Spacer()
                        Text("View All →")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(AppColors.blue500)
                        Spacer()
                    }
                    .padding(.vertical, 6)
                }
            }
        }
    }

    // MARK: - Helpers

    private func taskList(_ tasks: [CalTask]) -> some View {
        VStack(spacing: 0) {
            ForEach(tasks) { task in
                TaskItemView(
                    task: task,
                    onToggle: { id in Task { await taskStore.toggleComplete(taskId: id) } },
                    onTap: { selectedTask = task }
                )
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) {
                        Task { await taskStore.deleteTask(taskId: task.id) }
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
                Rectangle()
                    .fill(AppColors.separator)
                    .frame(height: 0.5)
                    .padding(.leading, 56)
            }
        }
    }
}
