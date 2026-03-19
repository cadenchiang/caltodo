import SwiftUI

/// Reusable task row matching the web app's TaskItem design.
/// Displays checkbox (colored), title, tag badge, repeat icon,
/// source badge, and color-coded due date.
///
/// Styling: 44pt height, 16pt horizontal padding, 60% opacity when completed.
/// Checkbox: 16x16pt, 4pt corner radius, colored border/fill.
/// Font sizes match web app: 14pt title, 9pt tags, 11pt due date.
///
/// - SeeAlso: `mobile/src/components/TaskItem.tsx` for React Native equivalent.
struct TaskItemView: View {
    let task: CalTask
    let onToggle: (String) -> Void
    var onTap: ((String) -> Void)?

    var body: some View {
        HStack(spacing: 0) {
            checkboxView
                .padding(.trailing, 10)

            titleAndTags

            Spacer(minLength: 4)

            trailingBadges
        }
        .frame(height: 44)
        .padding(.horizontal, 16)
        .contentShape(Rectangle())
        .onTapGesture { onTap?(task.id) }
        .opacity(task.isCompleted ? 0.6 : 1)
    }

    // MARK: - Checkbox

    private var checkboxView: some View {
        Button {
            HapticManager.light()
            onToggle(task.id)
        } label: {
            ZStack {
                RoundedRectangle(cornerRadius: 4)
                    .stroke(Color(hex: task.displayColor), lineWidth: task.isCompleted ? 0 : 1)
                    .background(
                        RoundedRectangle(cornerRadius: 4)
                            .fill(task.isCompleted ? Color(hex: task.displayColor) : .clear)
                    )
                    .frame(width: 16, height: 16)

                if task.isCompleted {
                    Image(systemName: "checkmark")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.white)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel(task.isCompleted ? "Mark incomplete" : "Mark complete")
    }

    // MARK: - Title & Tags

    private var titleAndTags: some View {
        HStack(spacing: 6) {
            Text(task.title)
                .font(.system(size: 14))
                .foregroundStyle(task.isCompleted ? AppColors.mutedForeground : AppColors.foreground)
                .lineLimit(1)

            if !task.tags.isEmpty {
                Text(task.tags.count == 1 ? task.tags[0] : "\(task.tags.count) tags")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundStyle(AppColors.blue500)
                    .padding(.horizontal, 4)
                    .padding(.vertical, 1)
                    .background(Color(hex: "#EFF6FF"))
                    .clipShape(RoundedRectangle(cornerRadius: 3))
            }
        }
    }

    // MARK: - Trailing Badges

    private var trailingBadges: some View {
        HStack(spacing: 6) {
            if task.isRecurring {
                Image(systemName: "repeat")
                    .font(.system(size: 10))
                    .foregroundStyle(AppColors.purple400)
            }

            if let source = task.source {
                let badge = TaskColors.sourceBadge(for: source)
                Text(badge.label)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(badge.text)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(badge.bg)
                    .clipShape(Capsule())
            }

            if let info = DateFormatting.dueDateInfo(dueDate: task.dueDate, dueTime: task.dueTime) {
                dueDateLabel(info: info)
            }
        }
    }

    private func dueDateLabel(info: DueDateInfo) -> some View {
        HStack(spacing: 2) {
            if let time = info.timeLabel {
                Text(time)
                    .font(.system(size: 11))
                    .foregroundStyle(AppColors.mutedForeground.opacity(0.6))
            }
            Text(info.dateLabel)
                .font(.system(size: 11))
                .foregroundStyle(
                    task.isCompleted ? AppColors.subtleForeground : Color(hex: info.colorHex)
                )
        }
    }
}
