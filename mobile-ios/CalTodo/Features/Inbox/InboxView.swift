import SwiftUI

/// Inbox — tasks grouped by date or class. Native search. Pure black.
struct InboxView: View {
    @EnvironmentObject var taskStore: TaskStore

    @AppStorage("inbox_sort") private var sortMode = "date"
    @State private var showCompleted = false
    @State private var selectedTask: CalTask?
    @State private var showCreateSheet = false
    @State private var searchText = ""

    @State private var collapsed: Set<String> = []
    @State private var scrollOffset: CGFloat = 0

    private var today: String { DateFormatting.todayString() }
    private var weekEnd: String { DateFormatting.dateString(daysFromNow: 7) }

    private var filteredActive: [CalTask] {
        var tasks = taskStore.activeTasks
        if !searchText.isEmpty {
            tasks = tasks.filter { $0.title.localizedCaseInsensitiveContains(searchText) }
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
                    // Scroll offset tracker
                    GeometryReader { geo in
                        Color.clear.preference(key: ScrollOffsetKey.self, value: geo.frame(in: .named("scroll")).minY)
                    }
                    .frame(height: 0)

                    // Search — only at the very top
                    if scrollOffset >= -10 || !searchText.isEmpty {
                        HStack(spacing: 10) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 15))
                                .foregroundStyle(Color(hex: "#636366"))
                            TextField("Search", text: $searchText)
                                .font(.system(size: 16))
                                .foregroundStyle(.white)
                                .textInputAutocapitalization(.never)
                                .autocorrectionDisabled()
                            if !searchText.isEmpty {
                                Button { searchText = "" } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.system(size: 14))
                                        .foregroundStyle(Color(hex: "#636366"))
                                }
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 9)
                        .background(Color(hex: "#1C1C1E"))
                        .clipShape(Capsule())
                        .padding(.horizontal, 16)
                        .transition(.opacity.combined(with: .move(edge: .top)))
                    }
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
            .coordinateSpace(name: "scroll")
            .onPreferenceChange(ScrollOffsetKey.self) { value in
                scrollOffset = value
            }
            .animation(.easeOut(duration: 0.15), value: scrollOffset >= -10)
            .background(Color.black)
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
        return byClass.sorted { $0.key < $1.key }.map { ($0.key, $0.value.sorted { ($0.dueDate ?? "") < ($1.dueDate ?? "") }) }
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
                        .foregroundStyle(.white)
                    Spacer()
                    Text("\(tasks.count)")
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.2))
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.15))
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
        .background(Color(hex: "#1C1C1E"))
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
                        .foregroundStyle(.white)
                    Spacer()
                    Text("\(taskStore.completedTasks.count)")
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.2))
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.15))
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
        .background(Color(hex: "#1C1C1E"))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 12)
    }
}

private struct ScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}
