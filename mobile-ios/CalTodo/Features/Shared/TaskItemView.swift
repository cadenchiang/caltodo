import SwiftUI

/// Clean two-line task row matching the web app's flat list design.
/// Shows colored checkbox, title, due date, optional course name, and recurrence icon.
///
/// - Parameters:
///   - task: The CalTask to display.
///   - onToggle: Called with the task ID when the checkbox is tapped.
///   - onTap: Called when the row body is tapped (for detail sheet).
struct TaskItemView: View {
    let task: CalTask
    var onToggle: ((String) -> Void)? = nil
    var onTap: (() -> Void)? = nil

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            checkboxView

            VStack(alignment: .leading, spacing: 2) {
                titleText
                dueDateRow
            }

            Spacer(minLength: 4)

            if task.isRecurring {
                Image(systemName: "repeat")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(AppColors.purple400)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
        .onTapGesture { onTap?() }
        .opacity(task.completed ? 0.5 : 1.0)
    }

    // MARK: - Checkbox

    /// 20x20 rounded checkbox. Filled with task color + white checkmark when completed.
    private var checkboxView: some View {
        Button {
            HapticManager.light()
            onToggle?(task.id)
        } label: {
            ZStack {
                RoundedRectangle(cornerRadius: 5)
                    .stroke(Color(hex: task.displayColor), lineWidth: 1.5)
                    .frame(width: 20, height: 20)

                if task.completed {
                    RoundedRectangle(cornerRadius: 5)
                        .fill(Color(hex: task.displayColor))
                        .frame(width: 20, height: 20)

                    Image(systemName: "checkmark")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(.white)
                }
            }
            .animation(.easeInOut(duration: 0.2), value: task.completed)
        }
        .buttonStyle(.plain)
        .frame(width: 44, height: 44)
    }

    // MARK: - Title

    /// Task title with strikethrough when completed.
    private var titleText: some View {
        Text(task.title)
            .font(.system(size: 15, weight: .medium))
            .foregroundStyle(AppColors.foreground)
            .strikethrough(task.completed)
            .lineLimit(1)
            .truncationMode(.tail)
    }

    // MARK: - Due Date Row

    /// Due date label, color-coded. Optional course name after a dot separator.
    @ViewBuilder
    private var dueDateRow: some View {
        let info = DateFormatting.dueDateInfo(
            dueDate: task.dueDate,
            dueTime: task.dueTime
        )
        if let info = info {
            HStack(spacing: 4) {
                Text(info.dateLabel)
                    .font(.system(size: 12))
                    .foregroundStyle(Color(hex: info.colorHex))

                if let time = info.timeLabel {
                    Text("·")
                        .font(.system(size: 12))
                        .foregroundStyle(Color(hex: info.colorHex))
                    Text(time)
                        .font(.system(size: 12))
                        .foregroundStyle(Color(hex: info.colorHex))
                }

                if let course = task.courseName, !course.isEmpty {
                    Text("·")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.subtleForeground)
                    Text(course)
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.subtleForeground)
                        .lineLimit(1)
                }
            }
        } else if let course = task.courseName, !course.isEmpty {
            Text(course)
                .font(.system(size: 12))
                .foregroundStyle(AppColors.subtleForeground)
                .lineLimit(1)
        }
    }
}
