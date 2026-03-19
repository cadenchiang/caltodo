import SwiftUI

/// Home dashboard showing greeting, today's tasks, and upcoming tasks.
/// Card-based layout inspired by Sleep Tracker's StatisticsView.
struct HomeView: View {
    @EnvironmentObject var taskStore: TaskStore
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                greetingCard
                dueTodayCard
                upcomingCard
                statsRow
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
        .background(AppColors.secondaryBackground)
        .refreshable {
            await taskStore.fetchTasks()
        }
        .navigationTitle("home")
        .navigationBarTitleDisplayMode(.large)
        .onChange(of: scenePhase) { newPhase in
            if newPhase == .active {
                Task { await taskStore.fetchTasks() }
            }
        }
    }

    // MARK: - Greeting Card

    private var greetingCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("\(DateFormatting.greeting()),")
                .font(.system(size: 24, weight: .light, design: .rounded))
                .foregroundStyle(AppColors.foreground)

            if let name = authManager.userName {
                let firstName = name.components(separatedBy: " ").first ?? name
                Text(firstName.lowercased())
                    .font(.system(size: 24, weight: .semibold, design: .rounded))
                    .foregroundStyle(AppColors.blue500)
            }

            let todayCount = taskStore.todayTasks.count
            let upcomingCount = taskStore.upcomingTasks.count
            Text(summaryText(today: todayCount, upcoming: upcomingCount))
                .font(.caption)
                .foregroundStyle(AppColors.mutedForeground)
                .padding(.top, 4)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func summaryText(today: Int, upcoming: Int) -> String {
        if today == 0 && upcoming == 0 { return "you're all caught up!" }
        var parts: [String] = []
        if today > 0 { parts.append("\(today) due today") }
        if upcoming > 0 { parts.append("\(upcoming) upcoming") }
        return parts.joined(separator: " · ")
    }

    // MARK: - Due Today Card

    private var dueTodayCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionHeaderView(title: "due today", count: taskStore.todayTasks.count)

            if taskStore.todayTasks.isEmpty {
                EmptyStateView(icon: "checkmark.circle", message: "nothing due today")
            } else {
                ForEach(taskStore.todayTasks) { task in
                    TaskItemView(task: task) { id in
                        Task { await taskStore.toggleComplete(taskId: id) }
                    }
                    if task.id != taskStore.todayTasks.last?.id {
                        Divider().padding(.leading, 42)
                    }
                }
            }
        }
        .padding(.vertical, 4)
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Upcoming Card

    private var upcomingCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionHeaderView(title: "upcoming", count: taskStore.upcomingTasks.count)

            if taskStore.upcomingTasks.isEmpty {
                EmptyStateView(icon: "calendar", message: "no upcoming tasks this week")
            } else {
                let displayTasks = Array(taskStore.upcomingTasks.prefix(5))
                ForEach(displayTasks) { task in
                    TaskItemView(task: task) { id in
                        Task { await taskStore.toggleComplete(taskId: id) }
                    }
                    if task.id != displayTasks.last?.id {
                        Divider().padding(.leading, 42)
                    }
                }

                if taskStore.upcomingTasks.count > 5 {
                    HStack {
                        Spacer()
                        Text("view all →")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundStyle(AppColors.blue500)
                            .padding(.trailing, 16)
                            .padding(.vertical, 10)
                    }
                }
            }
        }
        .padding(.vertical, 4)
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Quick Stats Row

    private var statsRow: some View {
        HStack(spacing: 12) {
            statCard(icon: "checkmark.circle.fill", value: "\(taskStore.completedTasks.count)", label: "completed", color: AppColors.green500)
            statCard(icon: "clock.fill", value: "\(taskStore.activeTasks.count)", label: "active", color: AppColors.blue500)
            statCard(icon: "exclamationmark.triangle.fill", value: "\(overdueTasks.count)", label: "overdue", color: AppColors.red400)
        }
    }

    private var overdueTasks: [CalTask] {
        let today = DateFormatting.todayString()
        return taskStore.activeTasks.filter { task in
            guard let due = task.dueDate else { return false }
            return due < today
        }
    }

    private func statCard(icon: String, value: String, label: String, color: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon).font(.system(size: 16)).foregroundStyle(color)
            Text(value).font(.system(size: 20, weight: .bold, design: .rounded)).foregroundStyle(AppColors.foreground)
            Text(label).font(.caption2).foregroundStyle(AppColors.mutedForeground)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
