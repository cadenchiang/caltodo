import SwiftUI

/// Premium task detail sheet with large header, generous spacing, and subtle dividers.
/// Presented as a sheet with medium/large detents.
///
/// - Parameters:
///   - task: The CalTask to display details for.
///   - onToggle: Called with the task ID when the checkbox is tapped.
///   - onDismiss: Called when the sheet should be dismissed.
struct TaskDetailSheet: View {
    let task: CalTask
    var onToggle: ((String) -> Void)? = nil
    var onDismiss: (() -> Void)? = nil

    @State private var checkScale: CGFloat = 1.0

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Custom top bar — replaces NavigationView to eliminate excess spacing
                HStack {
                    Spacer()
                    Button {
                        HapticManager.light()
                    } label: {
                        Image(systemName: "square.and.pencil")
                            .font(.system(size: 16, weight: .regular))
                            .foregroundColor(.primary)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)

                headerSection
                headerDivider
                detailRows
            }
        }
        .background(AppColors.background)
    }

    // MARK: - Header

    /// 24x24 checkbox with spring animation + 24pt semibold title, wrapping.
    private var headerSection: some View {
        HStack(alignment: .top, spacing: 12) {
            Button {
                HapticManager.light()
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    checkScale = 1.2
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                    withAnimation(.spring(response: 0.2, dampingFraction: 0.7)) {
                        checkScale = 1.0
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

                        Image(systemName: "checkmark")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(.white)
                    }
                }
                .scaleEffect(checkScale)
            }
            .buttonStyle(.plain)
            .padding(.top, 3)

            Text(task.title)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(AppColors.foreground)
                .strikethrough(task.completed)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
    }

    // MARK: - Divider

    /// Subtle 1pt divider below the header.
    private var headerDivider: some View {
        Rectangle()
            .fill(AppColors.separator)
            .frame(height: 1)
            .padding(.horizontal, 20)
    }

    // MARK: - Detail Rows

    /// Metadata rows with icon + label on first line, value indented 40pt on second line.
    /// 24pt spacing between rows.
    private var detailRows: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Due date
            if let info = DateFormatting.dueDateInfo(
                dueDate: task.dueDate, dueTime: task.dueTime
            ) {
                detailRow(
                    icon: "calendar",
                    label: "due date",
                    valueView: AnyView(
                        Text(info.dateLabel)
                            .font(.system(size: 16))
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
                            .font(.system(size: 16))
                            .foregroundStyle(AppColors.foreground)
                    )
                )
            }

            // Repeat
            if task.isRecurring {
                let unit = task.repeatUnit ?? "day"
                let interval = task.repeatInterval ?? 1
                let repeatLabel = interval == 1
                    ? "every \(unit)"
                    : "every \(interval) \(unit)s"
                detailRow(
                    icon: "repeat",
                    label: "repeat",
                    valueView: AnyView(
                        Text(repeatLabel)
                            .font(.system(size: 16))
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
                            .font(.system(size: 16))
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
                            .font(.system(size: 16))
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
                                .font(.system(size: 16))
                                .foregroundStyle(AppColors.blue500)
                        }
                    )
                )
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 24)
    }

    // MARK: - Detail Row Helper

    /// Renders a single detail row with icon + label on first line,
    /// value indented 40pt on second line.
    ///
    /// - Parameters:
    ///   - icon: SF Symbol name (16pt, muted foreground, 24pt frame width).
    ///   - label: Row label text (13pt, muted).
    ///   - valueView: The value view to display indented below.
    private func detailRow(
        icon: String,
        label: String,
        valueView: AnyView
    ) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.mutedForeground)
                .frame(width: 20, alignment: .center)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 3) {
                Text(label.lowercased())
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.subtleForeground)

                valueView
            }
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
                    .padding(.vertical, 5)
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

    /// Calculates the total size needed to lay out all subviews in a wrapping flow.
    ///
    /// - Parameters:
    ///   - proposal: The proposed size from the parent.
    ///   - subviews: The child subviews to lay out.
    ///   - cache: Unused cache parameter.
    /// - Returns: The total size required.
    func sizeThatFits(
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    /// Places all subviews at their calculated positions within the bounds.
    ///
    /// - Parameters:
    ///   - bounds: The available bounds rectangle.
    ///   - proposal: The proposed size from the parent.
    ///   - subviews: The child subviews to place.
    ///   - cache: Unused cache parameter.
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

    /// Calculates origin points for each subview in a wrapping horizontal flow.
    ///
    /// - Parameters:
    ///   - proposal: The proposed size from the parent.
    ///   - subviews: The child subviews to arrange.
    /// - Returns: Tuple of origin points and total size.
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
