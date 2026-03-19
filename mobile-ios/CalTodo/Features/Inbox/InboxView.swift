import SwiftUI

/// Inbox screen showing active and completed tasks.
/// Flat list style matching Apple Reminders — no card wrapping.
/// Collapsible completed section with chevron animation.
struct InboxView: View {
    @EnvironmentObject var taskStore: TaskStore

    @State private var showCompleted = false
    @State private var selectedTask: CalTask? = nil

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                errorBanner

                // Active section
                SectionHeaderView(
                    title: "active",
                    count: taskStore.activeTasks.count
                )

                if taskStore.activeTasks.isEmpty {
                    EmptyStateView(
                        icon: "tray",
                        message: "no active tasks"
                    )
                } else {
                    activeTaskList
                }

                // Completed section (collapsible)
                if !taskStore.completedTasks.isEmpty {
                    SectionHeaderView(
                        title: "completed",
                        count: taskStore.completedTasks.count,
                        isCollapsible: true,
                        isExpanded: $showCompleted
                    )

                    if showCompleted {
                        completedTaskList
                    }
                }
            }
            .padding(.vertical, 8)
        }
        .background(AppColors.background)
        .refreshable { await taskStore.fetchTasks() }
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

    // MARK: - Error Banner

    /// Subtle red error banner shown when taskStore has an error.
    @ViewBuilder
    private var errorBanner: some View {
        if let error = taskStore.errorMessage {
            HStack(spacing: 8) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.red500)

                Text(error.lowercased())
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.red500)

                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(AppColors.red500.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
        }
    }

    // MARK: - Active Task List

    /// Flat list of active tasks with thin dividers aligned past the checkbox.
    private var activeTaskList: some View {
        VStack(spacing: 0) {
            ForEach(
                Array(taskStore.activeTasks.enumerated()),
                id: \.element.id
            ) { index, task in
                TaskItemView(
                    task: task,
                    onToggle: { id in
                        Task { await taskStore.toggleComplete(taskId: id) }
                    },
                    onTap: { selectedTask = task }
                )

                if index < taskStore.activeTasks.count - 1 {
                    Rectangle()
                        .fill(AppColors.separator)
                        .frame(height: 1)
                        .padding(.leading, 52)
                }
            }
        }
    }

    // MARK: - Completed Task List

    /// Flat list of completed tasks with thin dividers.
    private var completedTaskList: some View {
        VStack(spacing: 0) {
            ForEach(
                Array(taskStore.completedTasks.enumerated()),
                id: \.element.id
            ) { index, task in
                TaskItemView(
                    task: task,
                    onToggle: { id in
                        Task { await taskStore.toggleComplete(taskId: id) }
                    },
                    onTap: { selectedTask = task }
                )

                if index < taskStore.completedTasks.count - 1 {
                    Rectangle()
                        .fill(AppColors.separator)
                        .frame(height: 1)
                        .padding(.leading, 52)
                }
            }
        }
    }
}
