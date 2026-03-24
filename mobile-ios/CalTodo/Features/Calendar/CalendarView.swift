import SwiftUI

/// TickTick-style calendar — gridlines, circle day indicator, inline expandable task panel.
struct CalendarView: View {
    @EnvironmentObject var taskStore: TaskStore
    @AppStorage("cal_view_mode") private var viewMode = "month"
    @State private var selectedDate = Date()
    @State private var selectedTask: CalTask? = nil
    @State private var showCreateSheet = false
    @State private var monthId = UUID()
    @State private var swipeDirection: Edge = .trailing

    private var titleText: String {
        let fmt = DateFormatter()
        fmt.dateFormat = "MMMM yyyy"
        return fmt.string(from: selectedDate)
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            VStack(spacing: 0) {
                // Header: title + nav arrows
                calendarHeader

                // View mode tabs
                viewModeTabs
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)

                switch viewMode {
                case "week":
                    WeekView(selectedDate: $selectedDate, selectedTask: $selectedTask,
                             tasks: taskStore.activeTasks, onToggle: toggleTask)
                case "day":
                    DayView(selectedDate: $selectedDate, selectedTask: $selectedTask,
                            tasks: taskStore.activeTasks, onToggle: toggleTask)
                default:
                    TickTickMonthView(selectedDate: $selectedDate, selectedTask: $selectedTask,
                                     tasks: taskStore.activeTasks, onToggle: toggleTask)
                        .id(monthId)
                        .transition(.asymmetric(
                            insertion: .move(edge: swipeDirection),
                            removal: .move(edge: swipeDirection == .trailing ? .leading : .trailing)
                        ))
                }
            }
            .gesture(
                DragGesture(minimumDistance: 10).onEnded { value in
                    if abs(value.translation.width) > abs(value.translation.height) && abs(value.translation.width) > 15 {
                        if value.translation.width < 0 {
                            swipeDirection = .trailing
                            withAnimation(.easeInOut(duration: 0.3)) { goToMonth(1) }
                        } else {
                            swipeDirection = .leading
                            withAnimation(.easeInOut(duration: 0.3)) { goToMonth(-1) }
                        }
                    }
                }
            )

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
        .background(AppColors.background)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $selectedTask) { task in
            TaskDetailSheet(
                task: task,
                onToggle: { id in Task { await taskStore.toggleComplete(taskId: id) } },
                onDismiss: { selectedTask = nil }
            )
            .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showCreateSheet) {
            TaskCreateSheet(prefillDate: selectedDate)
                .environmentObject(taskStore)
        }
    }

    // MARK: - Header

    private var calendarHeader: some View {
        HStack {
            Button {
                HapticManager.light()
                goToMonth(-1)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.foreground)
            }

            Spacer()

            Text(titleText)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(AppColors.foreground)

            Spacer()

            Button {
                HapticManager.light()
                goToMonth(1)
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.foreground)
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 16)
    }

    // MARK: - View Mode Tabs

    private var viewModeTabs: some View {
        HStack(spacing: 0) {
            tabButton("Month", mode: "month")
            tabButton("Week", mode: "week")
            tabButton("Day", mode: "day")
        }
        .padding(3)
        .background(AppColors.secondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private func tabButton(_ label: String, mode: String) -> some View {
        Button {
            HapticManager.light()
            withAnimation(.easeInOut(duration: 0.15)) { viewMode = mode }
        } label: {
            Text(label)
                .font(.system(size: 13, weight: viewMode == mode ? .semibold : .regular))
                .foregroundStyle(viewMode == mode ? AppColors.foreground : AppColors.mutedForeground)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 7)
                .background(viewMode == mode ? AppColors.card : Color.clear)
                .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
    }

    /// Navigate to month, reset to 1st of that month.
    private func goToMonth(_ offset: Int) {
        let cal = Calendar.current
        if let newMonth = cal.date(byAdding: .month, value: offset, to: selectedDate) {
            let comps = cal.dateComponents([.year, .month], from: newMonth)
            selectedDate = cal.date(from: comps) ?? newMonth
            monthId = UUID()
        }
    }

    private func toggleTask(_ id: String) {
        Task { await taskStore.toggleComplete(taskId: id) }
    }
}

// MARK: - TickTick-Style Month View

private struct TickTickMonthView: View {
    @Binding var selectedDate: Date
    @Binding var selectedTask: CalTask?
    let tasks: [CalTask]
    let onToggle: (String) -> Void

    private let weekdays = ["S", "M", "T", "W", "T", "F", "S"]
    private let cal = Calendar.current

    /// Which week row (0-5) the selected date falls in.
    private var selectedWeekRow: Int {
        let days = daysInMonth()
        guard let idx = days.firstIndex(where: { cal.isDate($0, inSameDayAs: selectedDate) }) else { return -1 }
        return idx / 7
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Weekday headers
                weekdayHeader

                // Calendar grid with inline expansion
                let days = daysInMonth()
                let weeks = stride(from: 0, to: days.count, by: 7).map { Array(days[$0..<min($0+7, days.count)]) }

                ForEach(Array(weeks.enumerated()), id: \.offset) { weekIdx, week in
                    // Week row
                    weekRow(week)

                    // Expandable task panel below selected week
                    if weekIdx == selectedWeekRow {
                        selectedDayPanel
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }
                }
            }
            .padding(.horizontal, 0)
            .animation(.easeInOut(duration: 0.2), value: selectedDate)
        }
    }

    // MARK: - Weekday Header

    private var weekdayHeader: some View {
        HStack(spacing: 0) {
            ForEach(weekdays, id: \.self) { day in
                Text(day)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(AppColors.mutedForeground)
                    .frame(maxWidth: .infinity)
                    .frame(height: 32)
            }
        }
        .padding(.horizontal, 12)
    }

    // MARK: - Week Row

    private func weekRow(_ week: [Date]) -> some View {
        HStack(spacing: 0) {
            ForEach(week, id: \.self) { date in
                dayCell(date)
                    .onTapGesture {
                        HapticManager.light()
                        selectedDate = date
                    }
            }
        }
        .padding(.horizontal, 12)
    }

    // MARK: - Day Cell (spacious, clean)

    private func dayCell(_ date: Date) -> some View {
        let isToday = cal.isDateInToday(date)
        let isSelected = cal.isDate(date, inSameDayAs: selectedDate)
        let isCurrentMonth = cal.isDate(date, equalTo: selectedDate, toGranularity: .month)
        let dayTasks = tasksOnDate(date)

        return VStack(spacing: 6) {
            // Day number with circle indicator
            ZStack {
                if isToday {
                    Circle()
                        .fill(AppColors.accent)
                        .frame(width: 32, height: 32)
                } else if isSelected {
                    Circle()
                        .fill(AppColors.card)
                        .frame(width: 32, height: 32)
                }
                Text("\(cal.component(.day, from: date))")
                    .font(.system(size: 15, weight: isToday || isSelected ? .semibold : .regular))
                    .foregroundStyle(
                        isToday ? .white :
                        isSelected ? AppColors.accent :
                        isCurrentMonth ? AppColors.foreground :
                        AppColors.subtleForeground
                    )
            }

            // Task dots
            if !dayTasks.isEmpty {
                HStack(spacing: 3) {
                    ForEach(dayTasks.prefix(3)) { task in
                        Circle()
                            .fill(Color(hex: task.displayColor))
                            .frame(width: 5, height: 5)
                            .opacity(isCurrentMonth ? 1 : 0.3)
                    }
                }
            } else {
                Spacer().frame(height: 5)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: 62)
    }

    // MARK: - Selected Day Task Panel (expands below the week)

    private var selectedDayPanel: some View {
        let dayTasks = tasksOnDate(selectedDate)
        let fmt = DateFormatter()
        fmt.dateFormat = "EEEE, MMM d"

        return VStack(alignment: .leading, spacing: 0) {
            // Panel header
            HStack {
                Text(fmt.string(from: selectedDate))
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(AppColors.foreground)
                Spacer()
                Text("\(dayTasks.count) tasks")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.mutedForeground)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)

            if dayTasks.isEmpty {
                Text("No tasks")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.subtleForeground)
                    .padding(.horizontal, 14)
                    .padding(.bottom, 12)
            } else {
                ForEach(dayTasks) { task in
                    TaskItemView(
                        task: task,
                        onToggle: onToggle,
                        onTap: { selectedTask = task }
                    )
                }
                .padding(.bottom, 4)
            }
        }
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
    }

    // MARK: - Helpers

    private func daysInMonth() -> [Date] {
        let range = cal.range(of: .day, in: .month, for: selectedDate) ?? 1..<31
        let firstOfMonth = cal.date(from: cal.dateComponents([.year, .month], from: selectedDate))!
        let firstWeekday = cal.component(.weekday, from: firstOfMonth)
        var days: [Date] = []
        for i in stride(from: firstWeekday - 1, through: 1, by: -1) {
            if let d = cal.date(byAdding: .day, value: -i, to: firstOfMonth) { days.append(d) }
        }
        for day in range {
            if let d = cal.date(byAdding: .day, value: day - 1, to: firstOfMonth) { days.append(d) }
        }
        while days.count < 42 {
            if let last = days.last, let d = cal.date(byAdding: .day, value: 1, to: last) { days.append(d) }
        }
        return days
    }

    private func tasksOnDate(_ date: Date) -> [CalTask] {
        let dateStr = DateFormatting.formatDate(date)
        return tasks.filter { $0.dueDate == dateStr }
    }
}

// MARK: - Week View

private struct WeekView: View {
    @Binding var selectedDate: Date
    @Binding var selectedTask: CalTask?
    let tasks: [CalTask]
    let onToggle: (String) -> Void
    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                ForEach(weekDays(), id: \.self) { date in
                    let dayTasks = tasksOnDate(date)
                    VStack(alignment: .leading, spacing: 0) {
                        HStack(spacing: 8) {
                            Text(date.formatted(.dateTime.weekday(.abbreviated)))
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(Calendar.current.isDateInToday(date) ? AppColors.accent : .white)
                            Text(date.formatted(.dateTime.day()))
                                .font(.system(size: 13))
                                .foregroundStyle(AppColors.mutedForeground)
                            Spacer()
                            if !dayTasks.isEmpty {
                                Text("\(dayTasks.count)")
                                    .font(.system(size: 11))
                                    .foregroundStyle(AppColors.mutedForeground)
                            }
                        }
                        .padding(.horizontal, 14).padding(.vertical, 10)
                        ForEach(dayTasks) { task in
                            TaskItemView(task: task, onToggle: onToggle, onTap: { selectedTask = task })
                        }
                        if dayTasks.isEmpty {
                            Text("No tasks").font(.system(size: 12)).foregroundStyle(AppColors.subtleForeground)
                                .padding(.horizontal, 14).padding(.bottom, 10)
                        }
                    }
                    .background(AppColors.card).clipShape(RoundedRectangle(cornerRadius: 12)).padding(.horizontal, 12)
                }
            }.padding(.vertical, 8)
        }
    }
    private func weekDays() -> [Date] {
        let cal = Calendar.current
        let start = cal.date(from: cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: selectedDate))!
        return (0..<7).compactMap { cal.date(byAdding: .day, value: $0, to: start) }
    }
    private func tasksOnDate(_ date: Date) -> [CalTask] {
        return tasks.filter { $0.dueDate == DateFormatting.formatDate(date) }
    }
}

// MARK: - Day View

private struct DayView: View {
    @Binding var selectedDate: Date
    @Binding var selectedTask: CalTask?
    let tasks: [CalTask]
    let onToggle: (String) -> Void
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                HStack {
                    Button { HapticManager.light(); selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate } label: {
                        Image(systemName: "chevron.left").font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.foreground)
                    }
                    Spacer()
                    VStack(spacing: 2) {
                        Text(selectedDate.formatted(.dateTime.weekday(.wide))).font(.system(size: 15, weight: .semibold)).foregroundStyle(AppColors.foreground)
                        Text(selectedDate.formatted(.dateTime.month(.wide).day().year())).font(.system(size: 12)).foregroundStyle(AppColors.mutedForeground)
                    }
                    Spacer()
                    Button { HapticManager.light(); selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate } label: {
                        Image(systemName: "chevron.right").font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.foreground)
                    }
                }.padding(.horizontal, 16)

                if !Calendar.current.isDateInToday(selectedDate) {
                    Button { HapticManager.light(); selectedDate = Date() } label: {
                        Text("Go to Today").font(.system(size: 13, weight: .medium)).foregroundStyle(AppColors.accent)
                    }
                }

                let dayTasks = tasksOnDate(selectedDate)
                VStack(alignment: .leading, spacing: 0) {
                    HStack {
                        Text("Tasks").font(.system(size: 15, weight: .semibold)).foregroundStyle(AppColors.foreground)
                        Spacer()
                        Text("\(dayTasks.count)").font(.system(size: 13)).foregroundStyle(AppColors.mutedForeground)
                    }.padding(.horizontal, 14).padding(.vertical, 12)
                    if dayTasks.isEmpty {
                        Text("No tasks on this day").font(.system(size: 13)).foregroundStyle(AppColors.subtleForeground)
                            .padding(.horizontal, 14).padding(.bottom, 12)
                    } else {
                        ForEach(dayTasks) { task in
                            TaskItemView(task: task, onToggle: onToggle, onTap: { selectedTask = task })
                        }
                    }
                }
                .background(AppColors.card).clipShape(RoundedRectangle(cornerRadius: 14)).padding(.horizontal, 12)
            }.padding(.vertical, 8)
        }
    }
    private func tasksOnDate(_ date: Date) -> [CalTask] {
        return tasks.filter { $0.dueDate == DateFormatting.formatDate(date) }
    }
}
