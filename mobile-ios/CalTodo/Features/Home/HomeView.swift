import SwiftUI

/// Home dashboard showing greeting, today's tasks, upcoming tasks, and stats.
/// Flat layout with no card wrapping for greeting. Pull to refresh.
struct HomeView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var taskStore: TaskStore
    @Environment(\.scenePhase) private var scenePhase

    @State private var selectedTask: CalTask? = nil

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                greetingSection
                todaySection
                upcomingSection
                statsRow
            }
            .padding(.vertical, 16)
        }
        .background(AppColors.background)
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
    }

    // MARK: - Greeting

    /// "good morning," in light weight + first name in semibold blue.
    /// Summary line below.
    private var greetingSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 0) {
                Text("\(DateFormatting.greeting()), ")
                    .font(.system(size: 28, weight: .light, design: .rounded))
                    .foregroundStyle(AppColors.foreground)

                Text(firstName)
                    .font(.system(size: 28, weight: .semibold, design: .rounded))
                    .foregroundStyle(AppColors.blue500)
            }

            Text(summaryText)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.mutedForeground)
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Due Today

    /// Section header + task list for today's tasks.
    private var todaySection: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionHeaderView(title: "due today", count: taskStore.todayTasks.count)

            if taskStore.todayTasks.isEmpty {
                EmptyStateView(icon: "checkmark.circle", message: "nothing due today")
            } else {
                taskList(taskStore.todayTasks)
            }
        }
    }

    // MARK: - Upcoming

    /// Section header + max 5 upcoming tasks. "view all" link if more.
    private var upcomingSection: some View {
        let upcoming = taskStore.upcomingTasks
        let displayTasks = Array(upcoming.prefix(5))

        return VStack(alignment: .leading, spacing: 0) {
            SectionHeaderView(title: "upcoming", count: upcoming.count)

            if displayTasks.isEmpty {
                EmptyStateView(
                    icon: "calendar.badge.clock",
                    message: "no upcoming tasks"
                )
            } else {
                taskList(displayTasks)

                if upcoming.count > 5 {
                    HStack {
                        Spacer()
                        Text("view all \u{2192}")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(AppColors.blue500)
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }
            }
        }
    }

    // MARK: - Stats Row

    /// Three equal stat cards: completed, active, overdue.
    private var statsRow: some View {
        HStack(spacing: 12) {
            statCard(
                icon: "checkmark.circle.fill",
                iconColor: AppColors.green500,
                value: taskStore.completedTasks.count,
                label: "completed"
            )
            statCard(
                icon: "circle.dotted",
                iconColor: AppColors.blue500,
                value: taskStore.activeTasks.count,
                label: "active"
            )
            statCard(
                icon: "exclamationmark.circle.fill",
                iconColor: AppColors.red500,
                value: overdueTasks.count,
                label: "overdue"
            )
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Helpers

    /// Renders a list of tasks with dividers between them.
    ///
    /// - Parameter tasks: Tasks to render.
    /// - Returns: A VStack of TaskItemViews with dividers.
    private func taskList(_ tasks: [CalTask]) -> some View {
        VStack(spacing: 0) {
            ForEach(Array(tasks.enumerated()), id: \.element.id) { index, task in
                TaskItemView(
                    task: task,
                    onToggle: { id in
                        Task { await taskStore.toggleComplete(taskId: id) }
                    },
                    onTap: { selectedTask = task }
                )

                if index < tasks.count - 1 {
                    Rectangle()
                        .fill(AppColors.separator)
                        .frame(height: 1)
                        .padding(.leading, 52)
                }
            }
        }
    }

    /// Single stat card with icon, number, and label.
    private func statCard(
        icon: String,
        iconColor: Color,
        value: Int,
        label: String
    ) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundStyle(iconColor)

            Text("\(value)")
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(AppColors.foreground)

            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(AppColors.mutedForeground)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(AppColors.border, lineWidth: 1)
        )
    }

    /// The user's first name extracted from their full name, lowercased.
    private var firstName: String {
        let name = authManager.userName ?? ""
        let first = name.split(separator: " ").first.map(String.init) ?? name
        return first.lowercased()
    }

    /// Summary text describing today's task count.
    private var summaryText: String {
        let count = taskStore.todayTasks.count
        if count == 0 { return "you're all caught up!" }
        if count == 1 { return "you have 1 task due today" }
        return "you have \(count) tasks due today"
    }

    /// Tasks that are overdue (past due date, not completed).
    private var overdueTasks: [CalTask] {
        let today = DateFormatting.todayString()
        return taskStore.activeTasks.filter { task in
            guard let due = task.dueDate else { return false }
            return due < today
        }
    }
}
