import SwiftUI

/// Task row — checkbox on same line as title, date underneath.
struct TaskItemView: View {
    let task: CalTask
    var onToggle: ((String) -> Void)?
    var onTap: (() -> Void)?

    @EnvironmentObject var taskStore: TaskStore
    @State private var checkScale: CGFloat = 1.0
    @State private var justCompleted = false
    @State private var isDisappearing = false

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            // Top row: checkbox + title (vertically centered)
            HStack(spacing: 10) {
                checkboxView

                Text(task.title)
                    .font(.system(size: 17))
                    .foregroundStyle(task.completed ? AppColors.mutedForeground : AppColors.foreground)
                    .strikethrough(justCompleted || task.completed, color: AppColors.mutedForeground)
                    .lineLimit(1)

                if task.isRecurring {
                    Image(systemName: "repeat")
                        .font(.system(size: 10))
                        .foregroundStyle(AppColors.purple400)
                }

                if !task.tagList.isEmpty {
                    Text(task.tagList.count == 1 ? task.tagList[0] : "\(task.tagList.count) tags")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(AppColors.blue500)
                        .padding(.horizontal, 5).padding(.vertical, 1)
                        .background(AppColors.blue500.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                }

                Spacer(minLength: 4)
            }

            // Date/time row (indented to align with title, not checkbox)
            dateSubtitle
                .padding(.leading, 26) // 16px checkbox + 10px spacing
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(justCompleted ? AppColors.green500.opacity(0.06) : Color.clear)
        .contentShape(Rectangle())
        .onTapGesture { onTap?() }
        .opacity(isDisappearing ? 0 : (task.completed && !justCompleted ? 0.5 : 1.0))
        .offset(x: isDisappearing ? -40 : 0)
        .animation(.easeInOut(duration: 0.3), value: justCompleted)
        .animation(.easeOut(duration: 0.35), value: isDisappearing)
    }

    // MARK: - Checkbox (16x16, same height as text)

    private var checkboxView: some View {
        Button {
            HapticManager.medium()
            withAnimation(.spring(response: 0.25, dampingFraction: 0.5)) { checkScale = 1.3 }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) {
                withAnimation(.spring(response: 0.2, dampingFraction: 0.7)) { checkScale = 1.0 }
            }
            if !task.completed {
                justCompleted = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                    withAnimation { isDisappearing = true }
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    justCompleted = false
                    isDisappearing = false
                }
            }
            onToggle?(task.id)
        } label: {
            ZStack {
                RoundedRectangle(cornerRadius: 4)
                    .stroke(Color(hex: task.displayColor), lineWidth: 1.5)
                    .frame(width: 16, height: 16)
                if task.completed || justCompleted {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color(hex: task.displayColor))
                        .frame(width: 16, height: 16)
                    Image(systemName: "checkmark")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.white)
                }
            }
            .scaleEffect(checkScale)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Date Subtitle

    @ViewBuilder
    private var dateSubtitle: some View {
        let info = DateFormatting.dueDateInfo(dueDate: task.dueDate, dueTime: task.dueTime)
        if let info {
            HStack(spacing: 4) {
                Text(info.dateLabel)
                    .foregroundStyle(task.completed ? AppColors.subtleForeground : Color(hex: info.colorHex))
                if let time = info.timeLabel {
                    Text("·").foregroundStyle(AppColors.mutedForeground)
                    Text(time).foregroundStyle(AppColors.mutedForeground)
                }
            }
            .font(.system(size: 12))
            .lineLimit(1)
        }
    }
}
