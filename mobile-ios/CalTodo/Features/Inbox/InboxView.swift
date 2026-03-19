import SwiftUI

/// Inbox screen showing active and completed tasks.
/// Card-based layout with pull-to-refresh, collapsible completed section.
struct InboxView: View {
    @EnvironmentObject var taskStore: TaskStore
    @State private var showCompleted = false

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                if let error = taskStore.errorMessage {
                    errorBanner(error)
                }
                activeCard
                completedCard
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
        .background(AppColors.secondaryBackground)
        .refreshable {
            await taskStore.fetchTasks()
        }
        .navigationTitle("inbox")
        .navigationBarTitleDisplayMode(.large)
        .overlay {
            if taskStore.isLoading && taskStore.tasks.isEmpty {
                ProgressView().scaleEffect(1.2)
            }
        }
    }

    // MARK: - Active Card

    private var activeCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionHeaderView(title: "active", count: taskStore.activeTasks.count)

            if taskStore.activeTasks.isEmpty && !taskStore.isLoading {
                EmptyStateView(icon: "tray", message: "no active tasks")
            } else {
                ForEach(taskStore.activeTasks) { task in
                    TaskItemView(task: task) { id in
                        Task { await taskStore.toggleComplete(taskId: id) }
                    }
                    if task.id != taskStore.activeTasks.last?.id {
                        Divider().padding(.leading, 42)
                    }
                }
            }
        }
        .padding(.vertical, 4)
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Completed Card

    private var completedCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                HapticManager.light()
                withAnimation(.easeInOut(duration: 0.2)) {
                    showCompleted.toggle()
                }
            } label: {
                HStack(spacing: 8) {
                    Text("completed")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(AppColors.secondaryForeground)

                    Text("\(taskStore.completedTasks.count)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(AppColors.mutedForeground)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(AppColors.tertiaryBackground)
                        .clipShape(Capsule())

                    Spacer()

                    Image(systemName: showCompleted ? "chevron.up" : "chevron.down")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(AppColors.mutedForeground)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            if showCompleted {
                ForEach(taskStore.completedTasks) { task in
                    TaskItemView(task: task) { id in
                        Task { await taskStore.toggleComplete(taskId: id) }
                    }
                    if task.id != taskStore.completedTasks.last?.id {
                        Divider().padding(.leading, 42)
                    }
                }
            }
        }
        .padding(.vertical, 4)
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Error Banner

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle").font(.caption).foregroundStyle(AppColors.red400)
            Text(message).font(.caption).foregroundStyle(AppColors.red400)
            Spacer()
        }
        .padding(12)
        .background(AppColors.red500.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}
