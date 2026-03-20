import SwiftUI

/// Compact task row — checkbox with spring animation, title, metadata, repeat icon.
/// Shows a brief green flash when the task transitions to completed.
struct TaskItemView: View {
    let task: CalTask
    var onToggle: ((String) -> Void)?
    var onTap: (() -> Void)?

    @EnvironmentObject var taskStore: TaskStore
    @State private var checkScale: CGFloat = 1.0
    @State private var justCompleted = false

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            checkboxView
            contentColumn
            Spacer(minLength: 4)
            if task.isRecurring {
                Image(systemName: "repeat")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.purple400)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(
            justCompleted
                ? AppColors.green500.opacity(0.10)
                : Color.clear
        )
        .contentShape(Rectangle())
        .onTapGesture { onTap?() }
        .opacity(task.completed && !justCompleted ? 0.5 : 1.0)
        .animation(.easeInOut(duration: 0.3), value: justCompleted)
    }

    private var checkboxView: some View {
        Button {
            HapticManager.light()
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                checkScale = 1.25
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                withAnimation(.spring(response: 0.2, dampingFraction: 0.7)) {
                    checkScale = 1.0
                }
            }
            if !task.completed {
                justCompleted = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                    justCompleted = false
                }
            }
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
                        .shadow(color: Color(hex: task.displayColor).opacity(0.3), radius: 3, y: 1)

                    Image(systemName: "checkmark")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(.white)
                }
            }
            .scaleEffect(checkScale)
        }
        .buttonStyle(.plain)
        .frame(width: 44, height: 44)
    }

    private var contentColumn: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(task.title)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(task.completed ? AppColors.mutedForeground : AppColors.foreground)
                .strikethrough(task.completed)
                .lineLimit(1)

            metadataRow
        }
    }

    /// Metadata row with individually colored segments:
    /// date uses due-date color coding, time and class use subtle gray.
    @ViewBuilder
    private var metadataRow: some View {
        let info = DateFormatting.dueDateInfo(dueDate: task.dueDate, dueTime: task.dueTime)
        let hasInfo = info != nil
        let hasCourse = task.courseName != nil && !task.courseName!.isEmpty

        if hasInfo || hasCourse {
            HStack(spacing: 0) {
                if let info {
                    Text(info.dateLabel)
                        .foregroundStyle(Color(hex: info.colorHex))

                    if info.timeLabel != nil || hasCourse {
                        Text(" · ").foregroundStyle(AppColors.subtleForeground)
                    }

                    if let time = info.timeLabel {
                        Text(time)
                            .foregroundStyle(AppColors.subtleForeground)

                        if hasCourse {
                            Text(" · ").foregroundStyle(AppColors.subtleForeground)
                        }
                    }
                }

                if let course = task.courseName, !course.isEmpty {
                    Text(course)
                        .foregroundStyle(AppColors.subtleForeground)
                }
            }
            .font(.system(size: 12))
            .lineLimit(1)
        }
    }
}
