import SwiftUI

/// Task detail — view + edit mode. Three-dot menu for delete. Edit icon top-right.
struct TaskDetailSheet: View {
    let task: CalTask
    var onToggle: ((String) -> Void)? = nil
    var onDismiss: (() -> Void)? = nil

    @EnvironmentObject var taskStore: TaskStore
    @Environment(\.dismiss) private var dismiss
    @State private var checkScale: CGFloat = 1.0
    @State private var showFlash = false
    @State private var isEditing = false
    @State private var showDeleteConfirm = false

    // Edit state
    @State private var editTitle: String = ""
    @State private var editDueDate: Date = Date()
    @State private var editHasDueDate: Bool = false
    @State private var editDescription: String = ""

    private let iconWidth: CGFloat = 20
    private let iconGap: CGFloat = 12

    var body: some View {
        VStack(spacing: 0) {
            // Top bar: drag indicator + edit/menu
            topBar

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    if isEditing {
                        editView
                    } else {
                        readView
                    }
                }
                .padding(.bottom, 24)
            }
        }
        .background(showFlash ? AppColors.green500.opacity(0.06) : AppColors.background)
        .animation(.easeInOut(duration: 0.4), value: showFlash)
        .onAppear {
            editTitle = task.title
            editDescription = task.description ?? ""
            if let d = task.dueDate, !d.isEmpty {
                let fmt = DateFormatter(); fmt.dateFormat = "yyyy-MM-dd"
                editDueDate = fmt.date(from: d) ?? Date()
                editHasDueDate = true
            }
        }
        .alert("Delete Task?", isPresented: $showDeleteConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                Task { await taskStore.deleteTask(taskId: task.id) }
                dismiss()
            }
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack {
            Spacer()
            HStack(spacing: 16) {
                // Edit toggle
                Button {
                    HapticManager.light()
                    if isEditing { saveEdits() }
                    withAnimation(.easeInOut(duration: 0.15)) { isEditing.toggle() }
                } label: {
                    Image(systemName: isEditing ? "checkmark" : "pencil")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(isEditing ? AppColors.accent : AppColors.foreground)
                }

                // Three-dot menu
                Menu {
                    Button(role: .destructive) { showDeleteConfirm = true } label: {
                        Label("Delete Task", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(AppColors.foreground)
                }
            }
            .padding(.trailing, 20)
        }
        .padding(.top, 20)
        .padding(.bottom, 32)
    }

    // MARK: - Read View

    private var readView: some View {
        VStack(alignment: .leading, spacing: 0) {
            headerRow
            dateTimeRow
            repeatRow
            divider.padding(.vertical, 14)
            courseRow
            tagsRow
            descriptionRow
            sourceLinkRow
        }
    }

    private var hasBelowContent: Bool {
        (task.courseName != nil && !(task.courseName ?? "").isEmpty)
        || !task.tagList.isEmpty
        || (task.description != nil && !(task.description ?? "").isEmpty)
    }

    // MARK: - Edit View

    private var editView: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Title
            TextField("Task title", text: $editTitle)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(AppColors.foreground)
                .padding(.horizontal, 24)

            Rectangle().fill(AppColors.inputBorder).frame(height: 1).padding(.horizontal, 24)

            // Due date toggle + picker
            HStack(spacing: iconGap) {
                Image(systemName: "calendar")
                    .font(.system(size: 15)).foregroundStyle(AppColors.mutedForeground).frame(width: iconWidth)
                Text("Due Date").font(.system(size: 15)).foregroundStyle(AppColors.foreground)
                Spacer()
                Toggle("", isOn: $editHasDueDate).labelsHidden().tint(AppColors.accent)
            }
            .padding(.horizontal, 24)

            if editHasDueDate {
                DatePicker("", selection: $editDueDate, displayedComponents: .date)
                    .datePickerStyle(.graphical)
                    .tint(AppColors.accent)
                    .padding(.horizontal, 20)
            }

            // Description
            HStack(alignment: .top, spacing: iconGap) {
                Image(systemName: "text.alignleft")
                    .font(.system(size: 15)).foregroundStyle(AppColors.mutedForeground).frame(width: iconWidth)
                    .padding(.top, 8)
                TextEditor(text: $editDescription)
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.foreground)
                    .frame(minHeight: 80)
                    .scrollContentBackground(.hidden)
            }
            .padding(.horizontal, 24)
        }
        .padding(.top, 8)
    }

    private func saveEdits() {
        let fmt = DateFormatter(); fmt.dateFormat = "yyyy-MM-dd"
        let dateStr = editHasDueDate ? fmt.string(from: editDueDate) : nil
        let desc = editDescription.isEmpty ? nil : editDescription
        Task {
            let updates = TaskUpdate(
                title: editTitle,
                description: desc,
                dueDate: dateStr
            )
            try? await taskStore.client.from("tasks")
                .update(updates)
                .eq("id", value: task.id)
                .execute()
            await taskStore.fetchTasks()
        }
    }

    // MARK: - Header

    private var headerRow: some View {
        HStack(alignment: .top, spacing: iconGap) {
            Button {
                HapticManager.medium()
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { checkScale = 1.2 }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                    withAnimation(.spring(response: 0.2, dampingFraction: 0.7)) { checkScale = 1.0 }
                }
                if !(task.isCompleted ?? false) {
                    showFlash = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { showFlash = false }
                }
                onToggle?(task.id)
            } label: {
                ZStack {
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(Color(hex: task.displayColor), lineWidth: 1.5)
                        .frame(width: iconWidth, height: iconWidth)
                    if task.completed {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color(hex: task.displayColor))
                            .frame(width: iconWidth, height: iconWidth)
                        Image(systemName: "checkmark")
                            .font(.system(size: 10, weight: .bold)).foregroundStyle(AppColors.foreground)
                    }
                }
                .scaleEffect(checkScale)
            }
            .buttonStyle(.plain)
            .frame(width: iconWidth, height: iconWidth)
            .padding(.top, 4)

            Text(task.title)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(AppColors.foreground)
                .strikethrough(task.completed)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 24)
    }

    @ViewBuilder private var dateTimeRow: some View {
        if let info = DateFormatting.dueDateInfo(dueDate: task.dueDate, dueTime: task.dueTime) {
            HStack(spacing: 4) {
                Text(info.dateLabel)
                if let time = info.timeLabel {
                    Text("·").foregroundStyle(AppColors.mutedForeground)
                    Text(time)
                }
            }
            .font(.system(size: 14)).foregroundStyle(AppColors.secondaryForeground)
            .padding(.leading, 24 + iconWidth + iconGap).padding(.top, 4)
        }
    }

    @ViewBuilder private var repeatRow: some View {
        if task.isRecurring {
            let unit = task.repeatUnit ?? "day"
            let interval = task.repeatInterval ?? 1
            Text(interval == 1 ? "Every \(unit)" : "Every \(interval) \(unit)s")
                .font(.system(size: 14)).foregroundStyle(AppColors.secondaryForeground)
                .padding(.leading, 24 + iconWidth + iconGap).padding(.top, 2)
        }
    }

    @ViewBuilder private var courseRow: some View {
        if let course = task.courseName, !course.isEmpty {
            iconRow(icon: "graduationcap", text: course)
        }
    }

    @ViewBuilder private var tagsRow: some View {
        if !task.tagList.isEmpty {
            HStack(alignment: .top, spacing: iconGap) {
                Image(systemName: "tag").font(.system(size: 15)).foregroundStyle(AppColors.secondaryForeground).frame(width: iconWidth)
                FlowLayout(spacing: 6) {
                    ForEach(task.tagList, id: \.self) { tag in
                        Text(tag).font(.system(size: 12, weight: .medium)).foregroundStyle(AppColors.blue500)
                            .padding(.horizontal, 10).padding(.vertical, 5)
                            .background(AppColors.blue500.opacity(0.1)).clipShape(Capsule())
                    }
                }
            }.padding(.horizontal, 24).padding(.vertical, 10)
        }
    }

    @ViewBuilder private var descriptionRow: some View {
        if let desc = task.description, !desc.isEmpty {
            HStack(alignment: .top, spacing: iconGap) {
                Image(systemName: "text.alignleft").font(.system(size: 15)).foregroundStyle(AppColors.secondaryForeground).frame(width: iconWidth)
                Text(desc).font(.system(size: 14)).foregroundStyle(AppColors.foreground).fixedSize(horizontal: false, vertical: true)
            }.padding(.horizontal, 24).padding(.vertical, 10)
        }
    }

    @ViewBuilder private var sourceLinkRow: some View {
        if let urlString = task.sourceUrl, let url = URL(string: urlString) {
            Button { HapticManager.light(); UIApplication.shared.open(url) } label: {
                HStack(spacing: iconGap) {
                    Image(systemName: "link").font(.system(size: 15)).foregroundStyle(AppColors.secondaryForeground).frame(width: iconWidth)
                    Text("Open Link").font(.system(size: 14)).foregroundStyle(AppColors.blue500)
                }
            }.padding(.horizontal, 24).padding(.vertical, 10)
        }
    }

    private func iconRow(icon: String, text: String) -> some View {
        HStack(spacing: iconGap) {
            Image(systemName: icon).font(.system(size: 15)).foregroundStyle(AppColors.secondaryForeground).frame(width: iconWidth)
            Text(text).font(.system(size: 14)).foregroundStyle(AppColors.foreground)
        }.padding(.horizontal, 24).padding(.vertical, 10)
    }

    private var divider: some View {
        Rectangle().fill(AppColors.inputBorder).frame(height: 1).padding(.horizontal, 24)
    }
}

// MARK: - Flow Layout
private struct FlowLayout: Layout {
    var spacing: CGFloat = 6
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrange(proposal: proposal, subviews: subviews).size
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        for (i, o) in arrange(proposal: proposal, subviews: subviews).origins.enumerated() {
            subviews[i].place(at: CGPoint(x: bounds.minX + o.x, y: bounds.minY + o.y), proposal: .unspecified)
        }
    }
    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (origins: [CGPoint], size: CGSize) {
        let mw = proposal.width ?? .infinity
        var o: [CGPoint] = [], x: CGFloat = 0, y: CGFloat = 0, rh: CGFloat = 0, mx: CGFloat = 0
        for s in subviews {
            let sz = s.sizeThatFits(.unspecified)
            if x + sz.width > mw, x > 0 { x = 0; y += rh + spacing; rh = 0 }
            o.append(CGPoint(x: x, y: y)); rh = max(rh, sz.height); x += sz.width + spacing; mx = max(mx, x - spacing)
        }
        return (o, CGSize(width: mx, height: y + rh))
    }
}
