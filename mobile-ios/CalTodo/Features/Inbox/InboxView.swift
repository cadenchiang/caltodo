import SwiftUI

/// Inbox — active and completed tasks. Flat list, minimal whitespace.
struct InboxView: View {
    @EnvironmentObject var taskStore: TaskStore

    @AppStorage("inbox_filter") private var filterMode = "all"
    @AppStorage("inbox_sort") private var sortMode = "date"
    @State private var showCompleted = false
    @State private var selectedTask: CalTask?
    @State private var showCreateSheet = false

    /// Active tasks filtered and sorted by user-selected modes.
    private var displayedTasks: [CalTask] {
        taskStore.filteredTasks(filter: filterMode, sort: sortMode)
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    errorBanner

                    if displayedTasks.isEmpty && !taskStore.isLoading {
                        EmptyStateView(icon: "tray", message: "no active tasks")
                    } else {
                        taskList(displayedTasks)
                    }

                    if !taskStore.completedTasks.isEmpty {
                        SectionHeaderView(
                            title: "completed",
                            count: taskStore.completedTasks.count,
                            isCollapsible: true,
                            isExpanded: $showCompleted
                        )
                        if showCompleted {
                            taskList(taskStore.completedTasks)
                        }
                    }
                }
                .padding(.vertical, 4)
            }
            .background(AppColors.background)
            .refreshable { await taskStore.fetchTasks() }
            .overlay {
                if taskStore.isLoading && taskStore.tasks.isEmpty {
                    ProgressView()
                }
            }

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
        .sheet(item: $selectedTask) { task in
            TaskDetailSheet(
                task: task,
                onToggle: { id in Task { await taskStore.toggleComplete(taskId: id) } },
                onDismiss: { selectedTask = nil }
            )
            .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showCreateSheet) {
            TaskCreateSheet()
                .environmentObject(taskStore)
        }
    }

    @ViewBuilder
    private var errorBanner: some View {
        if let error = taskStore.errorMessage {
            HStack(spacing: 6) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 11))
                    .foregroundStyle(AppColors.red500)
                Text(error.lowercased())
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.red500)
                Spacer()
            }
            .padding(10)
            .background(AppColors.red500.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .padding(.horizontal, 16)
            .padding(.bottom, 4)
        }
    }

    private func taskList(_ tasks: [CalTask]) -> some View {
        VStack(spacing: 0) {
            ForEach(Array(tasks.enumerated()), id: \.element.id) { index, task in
                TaskItemView(
                    task: task,
                    onToggle: { id in Task { await taskStore.toggleComplete(taskId: id) } },
                    onTap: { selectedTask = task }
                )
                if index < tasks.count - 1 {
                    Rectangle().fill(AppColors.separator).frame(height: 0.5).padding(.leading, 54)
                }
            }
        }
    }
}
