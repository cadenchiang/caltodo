import SwiftUI

/// Inbox — tasks grouped by date or class. Native search. Pure black.
struct InboxView: View {
    @EnvironmentObject var taskStore: TaskStore
    @ObservedObject private var theme = ThemeManager.shared
    @Binding var searchText: String

    @AppStorage("inbox_sort") private var sortMode = "date"
    @State private var showCompleted = false
    @State private var selectedTask: CalTask?
    @State private var showCreateSheet = false

    @State private var collapsed: Set<String> = []

    private var today: String { DateFormatting.todayString() }
    private var weekEnd: String { DateFormatting.dateString(daysFromNow: 7) }

    private var filteredActive: [CalTask] {
        var tasks = taskStore.activeTasks
        if !searchText.isEmpty {
            let words = searchText.lowercased().split(separator: " ").map(String.init)
            tasks = tasks.filter { task in
                let haystack = [
                    task.title,
                    task.courseName ?? "",
                    task.description ?? "",
                    task.tagList.joined(separator: " "),
                    task.dueDate ?? ""
                ].joined(separator: " ").lowercased()
                return words.allSatisfy { haystack.contains($0) }
            }
        }
        return tasks
    }

    /// Groups based on sort mode.
    private var groups: [(title: String, tasks: [CalTask])] {
        let tasks = filteredActive
        if sortMode == "class" {
            return groupByClass(tasks)
        } else {
            return groupByDate(tasks)
        }
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            ScrollView {
                LazyVStack(spacing: 16) {
                    if filteredActive.isEmpty && !taskStore.isLoading {
                        EmptyStateView(icon: "tray", message: "No Tasks")
                            .padding(.top, 40)
                    } else {
                        ForEach(groups, id: \.title) { group in
                            taskGroup(title: group.title, tasks: group.tasks)
                        }
                    }

                    // Completed
                    if !taskStore.completedTasks.isEmpty {
                        completedSection
                    }
                }
                .padding(.bottom, 80)
            }
            .background(AppColors.background)
            .refreshable { await taskStore.fetchTasks() }
            .overlay {
                if taskStore.isLoading && taskStore.tasks.isEmpty {
                    ProgressView()
                }
            }

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
        .sheet(item: $selectedTask) { task in
            TaskDetailSheet(
                task: task,
                onToggle: { id in Task { await taskStore.toggleComplete(taskId: id) } },
                onDismiss: { selectedTask = nil }
            )
            .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showCreateSheet) {
            TaskCreateSheet().environmentObject(taskStore)
        }
    }

    // MARK: - Grouping Logic

    private func groupByDate(_ tasks: [CalTask]) -> [(title: String, tasks: [CalTask])] {
        let overdue = tasks.filter { ($0.dueDate ?? "") < today && $0.dueDate != nil }
            .sorted { ($0.dueDate ?? "") < ($1.dueDate ?? "") }
        let todayT = tasks.filter { $0.dueDate == today }
        let week = tasks.filter { guard let d = $0.dueDate else { return false }; return d > today && d <= weekEnd }
            .sorted { ($0.dueDate ?? "") < ($1.dueDate ?? "") }
        let later = tasks.filter { guard let d = $0.dueDate else { return $0.dueDate == nil }; return d > weekEnd }
            .sorted { ($0.dueDate ?? "") < ($1.dueDate ?? "") }

        var result: [(String, [CalTask])] = []
        if !overdue.isEmpty { result.append(("Overdue", overdue)) }
        if !todayT.isEmpty { result.append(("Today", todayT)) }
        if !week.isEmpty { result.append(("Next 7 Days", week)) }
        if !later.isEmpty { result.append(("Later", later)) }
        return result
    }

    private func groupByClass(_ tasks: [CalTask]) -> [(title: String, tasks: [CalTask])] {
        var byClass: [String: [CalTask]] = [:]
        for task in tasks {
            let cls = task.courseName ?? "No Class"
            byClass[cls, default: []].append(task)
        }
        return byClass.sorted { a, b in
            if a.key == "No Class" { return true }
            if b.key == "No Class" { return false }
            return a.key < b.key
        }.map { ($0.key, $0.value.sorted { ($0.dueDate ?? "") < ($1.dueDate ?? "") }) }
    }

    // MARK: - Task Group Card

    private func taskGroup(title: String, tasks: [CalTask]) -> some View {
        let isCollapsed = collapsed.contains(title)

        return VStack(alignment: .leading, spacing: 0) {
            Button {
                HapticManager.light()
                withAnimation(.easeInOut(duration: 0.2)) {
                    if isCollapsed { collapsed.remove(title) } else { collapsed.insert(title) }
                }
            } label: {
                HStack {
                    Text(title)
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(AppColors.foreground)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                    Spacer(minLength: 8)
                    Text("\(tasks.count)")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.subtleForeground)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(AppColors.subtleForeground.opacity(0.5))
                        .rotationEffect(.degrees(isCollapsed ? 0 : 90))
                }
                .padding(.horizontal, 16)
                .padding(.top, 16)
                .padding(.bottom, isCollapsed ? 16 : 10)
            }

            if !isCollapsed {
                VStack(spacing: 15) {
                    ForEach(tasks) { task in
                        TaskItemView(
                            task: task,
                            onToggle: { id in Task { await taskStore.toggleComplete(taskId: id) } },
                            onTap: { selectedTask = task }
                        )
                    }
                }
                .padding(.bottom, 10)
            }
        }
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 12)
    }

    // MARK: - Completed Section

    private var completedSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                HapticManager.light()
                withAnimation(.easeInOut(duration: 0.2)) { showCompleted.toggle() }
            } label: {
                HStack {
                    Text("Completed")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(AppColors.foreground)
                    Spacer()
                    Text("\(taskStore.completedTasks.count)")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.subtleForeground)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(AppColors.subtleForeground.opacity(0.5))
                        .rotationEffect(.degrees(showCompleted ? 90 : 0))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 16)
            }

            if showCompleted {
                VStack(spacing: 15) {
                    ForEach(taskStore.completedTasks) { task in
                        TaskItemView(
                            task: task,
                            onToggle: { id in Task { await taskStore.toggleComplete(taskId: id) } },
                            onTap: { selectedTask = task }
                        )
                    }
                }
                .padding(.bottom, 10)
            }
        }
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 12)
    }
}
