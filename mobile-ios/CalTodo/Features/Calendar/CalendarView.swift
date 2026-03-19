import SwiftUI

/// Calendar view with month, week, and day modes.
/// Shows tasks on their due dates. Matches the desktop app's calendar page.
struct CalendarView: View {
    @EnvironmentObject var taskStore: TaskStore
    @AppStorage("cal_view_mode") private var viewMode = "month"
    @State private var selectedDate = Date()
    @State private var selectedTask: CalTask? = nil

    var body: some View {
        VStack(spacing: 0) {
            Picker("view", selection: $viewMode) {
                Text("month").tag("month")
                Text("week").tag("week")
                Text("day").tag("day")
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)

            switch viewMode {
            case "month":
                MonthView(
                    selectedDate: $selectedDate,
                    selectedTask: $selectedTask,
                    tasks: taskStore.activeTasks,
                    onToggle: toggleTask
                )
            case "week":
                WeekView(
                    selectedDate: $selectedDate,
                    selectedTask: $selectedTask,
                    tasks: taskStore.activeTasks,
                    onToggle: toggleTask
                )
            case "day":
                DayView(
                    selectedDate: $selectedDate,
                    selectedTask: $selectedTask,
                    tasks: taskStore.activeTasks,
                    onToggle: toggleTask
                )
            default:
                MonthView(
                    selectedDate: $selectedDate,
                    selectedTask: $selectedTask,
                    tasks: taskStore.activeTasks,
                    onToggle: toggleTask
                )
            }
        }
        .background(AppColors.background)
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

    /// Toggles task completion from any sub-view.
    private func toggleTask(_ id: String) {
        Task { await taskStore.toggleComplete(taskId: id) }
    }
}

// MARK: - Month View

private struct MonthView: View {
    @Binding var selectedDate: Date
    @Binding var selectedTask: CalTask?
    let tasks: [CalTask]
    let onToggle: (String) -> Void

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 0), count: 7)
    private let weekdays = ["S", "M", "T", "W", "T", "F", "S"]

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                monthHeader

                LazyVGrid(columns: columns, spacing: 0) {
                    ForEach(Array(weekdays.enumerated()), id: \.offset) { _, day in
                        Text(day)
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundStyle(AppColors.mutedForeground)
                            .frame(height: 24)
                    }
                }
                .padding(.horizontal, 8)

                LazyVGrid(columns: columns, spacing: 4) {
                    ForEach(daysInMonth(), id: \.self) { date in
                        DayCell(
                            date: date,
                            isSelected: Calendar.current.isDate(date, inSameDayAs: selectedDate),
                            isToday: Calendar.current.isDateInToday(date),
                            isCurrentMonth: Calendar.current.isDate(
                                date, equalTo: selectedDate, toGranularity: .month
                            ),
                            taskCount: tasksOnDate(date).count
                        )
                        .onTapGesture {
                            HapticManager.light()
                            selectedDate = date
                        }
                    }
                }
                .padding(.horizontal, 8)

                selectedDateTasks
            }
            .padding(.vertical, 8)
        }
    }

    private var monthHeader: some View {
        HStack {
            Button {
                HapticManager.light()
                selectedDate = Calendar.current.date(
                    byAdding: .month, value: -1, to: selectedDate
                ) ?? selectedDate
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.foreground)
            }

            Spacer()

            Text(selectedDate.formatted(.dateTime.month(.wide).year()))
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundStyle(AppColors.foreground)

            Spacer()

            Button {
                HapticManager.light()
                selectedDate = Calendar.current.date(
                    byAdding: .month, value: 1, to: selectedDate
                ) ?? selectedDate
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.foreground)
            }
        }
        .padding(.horizontal, 16)
    }

    private var selectedDateTasks: some View {
        let dayTasks = tasksOnDate(selectedDate)
        return VStack(alignment: .leading, spacing: 0) {
            SectionHeaderView(
                title: selectedDate.formatted(
                    .dateTime.weekday(.wide).month(.abbreviated).day()
                ),
                count: dayTasks.count
            )

            if dayTasks.isEmpty {
                EmptyStateView(icon: "calendar", message: "no tasks on this day")
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(dayTasks.enumerated()), id: \.element.id) { index, task in
                        TaskItemView(
                            task: task,
                            onToggle: onToggle,
                            onTap: { selectedTask = task }
                        )

                        if index < dayTasks.count - 1 {
                            Rectangle()
                                .fill(AppColors.separator)
                                .frame(height: 1)
                                .padding(.leading, 52)
                        }
                    }
                }
            }
        }
        .padding(.top, 8)
        .background(AppColors.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 16)
    }

    private func daysInMonth() -> [Date] {
        let cal = Calendar.current
        let range = cal.range(of: .day, in: .month, for: selectedDate) ?? 1..<31
        let firstOfMonth = cal.date(
            from: cal.dateComponents([.year, .month], from: selectedDate)
        )!
        let firstWeekday = cal.component(.weekday, from: firstOfMonth)

        var days: [Date] = []
        for i in stride(from: firstWeekday - 1, through: 1, by: -1) {
            if let d = cal.date(byAdding: .day, value: -i, to: firstOfMonth) {
                days.append(d)
            }
        }
        for day in range {
            if let d = cal.date(byAdding: .day, value: day - 1, to: firstOfMonth) {
                days.append(d)
            }
        }
        while days.count < 42 {
            if let last = days.last,
               let d = cal.date(byAdding: .day, value: 1, to: last) {
                days.append(d)
            }
        }
        return days
    }

    private func tasksOnDate(_ date: Date) -> [CalTask] {
        let dateStr = DateFormatting.formatDate(date)
        return tasks.filter { $0.dueDate == dateStr }
    }
}

// MARK: - Day Cell

private struct DayCell: View {
    let date: Date
    let isSelected: Bool
    let isToday: Bool
    let isCurrentMonth: Bool
    let taskCount: Int

    var body: some View {
        VStack(spacing: 2) {
            Text("\(Calendar.current.component(.day, from: date))")
                .font(.system(size: 14, weight: isToday ? .bold : .regular))
                .foregroundStyle(
                    isSelected ? .white :
                    isToday ? AppColors.blue500 :
                    isCurrentMonth ? AppColors.foreground :
                    AppColors.subtleForeground
                )

            if taskCount > 0 {
                HStack(spacing: 2) {
                    ForEach(0..<min(taskCount, 3), id: \.self) { _ in
                        Circle()
                            .fill(isSelected ? .white.opacity(0.8) : AppColors.blue500)
                            .frame(width: 4, height: 4)
                    }
                }
            }
        }
        .frame(height: 44)
        .frame(maxWidth: .infinity)
        .background(
            isSelected ? AppColors.blue500 :
            isToday ? AppColors.blue500.opacity(0.1) :
            Color.clear
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
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
            VStack(spacing: 12) {
                HStack {
                    Button {
                        HapticManager.light()
                        selectedDate = Calendar.current.date(
                            byAdding: .weekOfYear, value: -1, to: selectedDate
                        ) ?? selectedDate
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.foreground)
                    }

                    Spacer()

                    Text(weekRangeText())
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(AppColors.foreground)

                    Spacer()

                    Button {
                        HapticManager.light()
                        selectedDate = Calendar.current.date(
                            byAdding: .weekOfYear, value: 1, to: selectedDate
                        ) ?? selectedDate
                    } label: {
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.foreground)
                    }
                }
                .padding(.horizontal, 16)

                ForEach(weekDays(), id: \.self) { date in
                    let dayTasks = tasksOnDate(date)
                    VStack(alignment: .leading, spacing: 0) {
                        HStack(spacing: 8) {
                            Text(date.formatted(.dateTime.weekday(.abbreviated)))
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundStyle(
                                    Calendar.current.isDateInToday(date)
                                        ? AppColors.blue500
                                        : AppColors.secondaryForeground
                                )

                            Text(date.formatted(.dateTime.day()))
                                .font(.caption)
                                .foregroundStyle(AppColors.mutedForeground)

                            if !dayTasks.isEmpty {
                                Text("\(dayTasks.count)")
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundStyle(AppColors.mutedForeground)
                                    .padding(.horizontal, 5)
                                    .padding(.vertical, 1)
                                    .background(AppColors.tertiaryBackground)
                                    .clipShape(Capsule())
                            }

                            Spacer()
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)

                        ForEach(dayTasks) { task in
                            TaskItemView(
                                task: task,
                                onToggle: onToggle,
                                onTap: { selectedTask = task }
                            )
                        }

                        if dayTasks.isEmpty {
                            Text("no tasks")
                                .font(.caption2)
                                .foregroundStyle(AppColors.subtleForeground)
                                .padding(.horizontal, 14)
                                .padding(.bottom, 8)
                        }
                    }
                    .background(AppColors.card)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal, 16)
                }
            }
            .padding(.vertical, 8)
        }
    }

    private func weekDays() -> [Date] {
        let cal = Calendar.current
        let startOfWeek = cal.date(
            from: cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: selectedDate)
        )!
        return (0..<7).compactMap { cal.date(byAdding: .day, value: $0, to: startOfWeek) }
    }

    private func weekRangeText() -> String {
        let days = weekDays()
        guard let first = days.first, let last = days.last else { return "" }
        return "\(first.formatted(.dateTime.month(.abbreviated).day())) \u{2013} \(last.formatted(.dateTime.month(.abbreviated).day()))"
    }

    private func tasksOnDate(_ date: Date) -> [CalTask] {
        let dateStr = DateFormatting.formatDate(date)
        return tasks.filter { $0.dueDate == dateStr }
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
                    Button {
                        HapticManager.light()
                        selectedDate = Calendar.current.date(
                            byAdding: .day, value: -1, to: selectedDate
                        ) ?? selectedDate
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.foreground)
                    }

                    Spacer()

                    VStack(spacing: 2) {
                        Text(selectedDate.formatted(.dateTime.weekday(.wide)))
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundStyle(AppColors.foreground)
                        Text(selectedDate.formatted(.dateTime.month(.wide).day().year()))
                            .font(.caption)
                            .foregroundStyle(AppColors.mutedForeground)
                    }

                    Spacer()

                    Button {
                        HapticManager.light()
                        selectedDate = Calendar.current.date(
                            byAdding: .day, value: 1, to: selectedDate
                        ) ?? selectedDate
                    } label: {
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.foreground)
                    }
                }
                .padding(.horizontal, 16)

                if !Calendar.current.isDateInToday(selectedDate) {
                    Button {
                        HapticManager.light()
                        selectedDate = Date()
                    } label: {
                        Text("go to today")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundStyle(AppColors.blue500)
                    }
                }

                let dayTasks = tasksOnDate(selectedDate)
                VStack(alignment: .leading, spacing: 0) {
                    SectionHeaderView(title: "tasks", count: dayTasks.count)

                    if dayTasks.isEmpty {
                        EmptyStateView(icon: "calendar", message: "no tasks on this day")
                    } else {
                        VStack(spacing: 0) {
                            ForEach(
                                Array(dayTasks.enumerated()),
                                id: \.element.id
                            ) { index, task in
                                TaskItemView(
                                    task: task,
                                    onToggle: onToggle,
                                    onTap: { selectedTask = task }
                                )

                                if index < dayTasks.count - 1 {
                                    Rectangle()
                                        .fill(AppColors.separator)
                                        .frame(height: 1)
                                        .padding(.leading, 52)
                                }
                            }
                        }
                    }
                }
                .padding(.vertical, 4)
                .background(AppColors.card)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .padding(.horizontal, 16)
            }
            .padding(.vertical, 8)
        }
    }

    private func tasksOnDate(_ date: Date) -> [CalTask] {
        let dateStr = DateFormatting.formatDate(date)
        return tasks.filter { $0.dueDate == dateStr }
    }
}
