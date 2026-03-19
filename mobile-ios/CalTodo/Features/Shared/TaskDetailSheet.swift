import SwiftUI

/// Task detail sheet matching the web app's detail panel.
/// Presented as a .sheet with medium/large detents.
/// Shows header with checkbox + title, then rows of task metadata.
struct TaskDetailSheet: View {
    let task: CalTask
    var onToggle: ((String) -> Void)? = nil
    var onDismiss: (() -> Void)? = nil

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    headerSection
                    divider
                    detailRows
                }
                .padding(.top, 8)
            }
            .background(AppColors.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("done") {
                        onDismiss?()
                    }
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(AppColors.blue500)
                }
            }
        }
    }

    // MARK: - Header

    /// Large checkbox + title side by side.
    private var headerSection: some View {
        HStack(alignment: .top, spacing: 12) {
            Button {
                HapticManager.light()
                onToggle?(task.id)
            } label: {
                ZStack {
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(Color(hex: task.displayColor), lineWidth: 2)
                        .frame(width: 24, height: 24)

                    if task.completed {
                        RoundedRectangle(cornerRadius: 6)
                            .fill(Color(hex: task.displayColor))
                            .frame(width: 24, height: 24)

                        Image(systemName: "checkmark")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(.white)
                    }
                }
                .animation(.easeInOut(duration: 0.2), value: task.completed)
            }
            .buttonStyle(.plain)
            .padding(.top, 4)

            Text(task.title)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(AppColors.foreground)
                .strikethrough(task.completed)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
    }

    // MARK: - Divider

    private var divider: some View {
        Rectangle()
            .fill(AppColors.separator)
            .frame(height: 1)
            .padding(.horizontal, 20)
    }

    // MARK: - Detail Rows

    /// Metadata rows with icon + label + value pattern.
    private var detailRows: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Due date
            if let info = DateFormatting.dueDateInfo(
                dueDate: task.dueDate, dueTime: task.dueTime
            ) {
                detailRow(
                    icon: "calendar",
                    label: "due date",
                    valueView: AnyView(
                        Text(info.dateLabel)
                            .font(.system(size: 15))
                            .foregroundStyle(Color(hex: info.colorHex))
                    )
                )
            }

            // Due time
            if let dueTime = task.dueTime,
               let formatted = DateFormatting.formatTime12h(dueTime) {
                detailRow(
                    icon: "clock",
                    label: "due time",
                    valueView: AnyView(
                        Text(formatted)
                            .font(.system(size: 15))
                            .foregroundStyle(AppColors.foreground)
                    )
                )
            }

            // Repeat
            if task.isRecurring {
                let unit = task.repeatUnit ?? "day"
                let interval = task.repeatInterval ?? 1
                let label = interval == 1
                    ? "every \(unit)"
                    : "every \(interval) \(unit)s"
                detailRow(
                    icon: "repeat",
                    label: "repeat",
                    valueView: AnyView(
                        Text(label)
                            .font(.system(size: 15))
                            .foregroundStyle(AppColors.purple400)
                    )
                )
            }

            // Course
            if let course = task.courseName, !course.isEmpty {
                detailRow(
                    icon: "graduationcap",
                    label: "class",
                    valueView: AnyView(
                        Text(course)
                            .font(.system(size: 15))
                            .foregroundStyle(AppColors.foreground)
                    )
                )
            }

            // Tags
            if !task.tagList.isEmpty {
                detailRow(
                    icon: "tag",
                    label: "tags",
                    valueView: AnyView(tagsView)
                )
            }

            // Description
            if let desc = task.description, !desc.isEmpty {
                detailRow(
                    icon: "text.alignleft",
                    label: "description",
                    valueView: AnyView(
                        Text(desc)
                            .font(.system(size: 15))
                            .foregroundStyle(AppColors.secondaryForeground)
                            .fixedSize(horizontal: false, vertical: true)
                    )
                )
            }

            // Source link
            if let urlString = task.sourceUrl,
               let url = URL(string: urlString) {
                detailRow(
                    icon: "link",
                    label: "source",
                    valueView: AnyView(
                        Link(destination: url) {
                            Text("open link")
                                .font(.system(size: 15))
                                .foregroundStyle(AppColors.blue500)
                        }
                    )
                )
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
    }

    // MARK: - Detail Row Helper

    /// Renders a single detail row with icon, label, and value.
    ///
    /// - Parameters:
    ///   - icon: SF Symbol name.
    ///   - label: Row label text.
    ///   - valueView: The value view to display.
    private func detailRow(
        icon: String,
        label: String,
        valueView: AnyView
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.mutedForeground)
                    .frame(width: 20)

                Text(label.lowercased())
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.mutedForeground)
            }

            valueView
                .padding(.leading, 28)
        }
    }

    // MARK: - Tags View

    /// Horizontal wrap of tag capsules in blue.
    private var tagsView: some View {
        FlowLayout(spacing: 6) {
            ForEach(task.tagList, id: \.self) { tag in
                Text(tag)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(AppColors.blue500)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(AppColors.blue500.opacity(0.1))
                    .clipShape(Capsule())
            }
        }
    }
}

// MARK: - Flow Layout

/// Simple horizontal flow layout for wrapping tags.
/// Lays out children left-to-right, wrapping to the next line when needed.
private struct FlowLayout: Layout {
    var spacing: CGFloat = 6

    func sizeThatFits(
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(
        in bounds: CGRect,
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, origin) in result.origins.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + origin.x, y: bounds.minY + origin.y),
                proposal: .unspecified
            )
        }
    }

    private func arrange(
        proposal: ProposedViewSize,
        subviews: Subviews
    ) -> (origins: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var origins: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var maxX: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            origins.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxX = max(maxX, x - spacing)
        }

        return (origins, CGSize(width: maxX, height: y + rowHeight))
    }
}
