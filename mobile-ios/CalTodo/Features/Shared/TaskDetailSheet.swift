import SwiftUI

/// Task detail — read-only view with edit sheet. Three-dot menu for delete.
struct TaskDetailSheet: View {
    @ObservedObject private var theme = ThemeManager.shared
    let task: CalTask
    var onToggle: ((String) -> Void)? = nil
    var onDismiss: (() -> Void)? = nil

    @EnvironmentObject var taskStore: TaskStore
    @Environment(\.dismiss) private var dismiss
    @State private var checkScale: CGFloat = 1.0
    @State private var showFlash = false
    @State private var showEditSheet = false
    @State private var showDeleteConfirm = false

    private let iconWidth: CGFloat = 20
    private let iconGap: CGFloat = 12

    var body: some View {
        VStack(spacing: 0) {
            topBar

            ScrollView {
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
                .padding(.bottom, 24)
            }
        }
        .background(showFlash ? AppColors.green500.opacity(0.06) : AppColors.background)
        .animation(.easeInOut(duration: 0.4), value: showFlash)
        .alert("Delete Task?", isPresented: $showDeleteConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                Task { await taskStore.deleteTask(taskId: task.id) }
                dismiss()
            }
        }
        .sheet(isPresented: $showEditSheet) {
            TaskEditSheet(task: task)
                .environmentObject(taskStore)
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack {
            Spacer()
            HStack(spacing: 20) {
                Button {
                    HapticManager.light()
                    showEditSheet = true
                } label: {
                    Text("Edit")
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.accent)
                        .frame(minWidth: 44, minHeight: 44)
                }

                Menu {
                    Button(role: .destructive) { showDeleteConfirm = true } label: {
                        Label("Delete Task", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(AppColors.foreground)
                        .frame(minWidth: 44, minHeight: 44)
                }
            }
            .padding(.trailing, 16)
        }
        .padding(.top, 16)
        .padding(.bottom, 24)
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
                            .font(.system(size: 10, weight: .bold)).foregroundStyle(.white)
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
                .opacity(task.completed ? 0.6 : 1)
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

// MARK: - Edit Sheet (mirrors TaskCreateSheet layout)

struct TaskEditSheet: View {
    let task: CalTask
    @EnvironmentObject var taskStore: TaskStore
    @ObservedObject private var theme = ThemeManager.shared
    @Environment(\.dismiss) private var dismiss

    @State private var title: String
    @State private var courseName: String
    @State private var dueDate: Date
    @State private var hasDueDate: Bool
    @State private var dueTime: Date
    @State private var hasDueTime: Bool
    @State private var description: String
    @State private var selectedColor: String
    @State private var isSaving = false
    @State private var showCustomClass = false
    @State private var showColorPicker = false
    @State private var showDatePicker = false
    @State private var showTimePicker = false
    @State private var customColor = Color(hex: "#3B82F6")

    init(task: CalTask) {
        self.task = task
        _title = State(initialValue: task.title)
        _courseName = State(initialValue: task.courseName ?? "")
        _selectedColor = State(initialValue: task.displayColor)
        _description = State(initialValue: task.description ?? "")

        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        if let d = task.dueDate, !d.isEmpty, let date = fmt.date(from: d) {
            _dueDate = State(initialValue: date)
            _hasDueDate = State(initialValue: true)
        } else {
            _dueDate = State(initialValue: Date())
            _hasDueDate = State(initialValue: false)
        }

        let tfmt = DateFormatter()
        tfmt.dateFormat = "HH:mm"
        if let t = task.dueTime, !t.isEmpty, let time = tfmt.date(from: t) {
            _dueTime = State(initialValue: time)
            _hasDueTime = State(initialValue: true)
        } else {
            _dueTime = State(initialValue: Date())
            _hasDueTime = State(initialValue: false)
        }
    }

    private var existingCourses: [String] {
        let names = Set(taskStore.tasks.compactMap { $0.courseName?.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty })
        return names.sorted()
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Title
                    TextField("What do you need to do?", text: $title)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(AppColors.foreground)
                        .padding(.horizontal, 20)
                        .padding(.top, 16)
                        .padding(.bottom, 16)

                    editDivider

                    // Color
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Color")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundStyle(AppColors.foreground)
                            .padding(.horizontal, 20)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(TaskColors.all, id: \.self) { hex in
                                    Circle()
                                        .fill(Color(hex: hex))
                                        .frame(width: 28, height: 28)
                                        .overlay(
                                            Circle().stroke(.white, lineWidth: selectedColor == hex ? 2.5 : 0).frame(width: 20, height: 20)
                                        )
                                        .overlay(Circle().stroke(AppColors.border, lineWidth: 1))
                                        .onTapGesture {
                                            HapticManager.light()
                                            selectedColor = hex
                                        }
                                }

                                Button {
                                    HapticManager.light()
                                    showColorPicker = true
                                } label: {
                                    Circle()
                                        .fill(AngularGradient(colors: [.red, .orange, .yellow, .green, .blue, .purple, .red], center: .center))
                                        .frame(width: 28, height: 28)
                                        .overlay(Image(systemName: "plus").font(.system(size: 12, weight: .bold)).foregroundStyle(.white))
                                        .overlay(Circle().stroke(AppColors.border, lineWidth: 1))
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                    .padding(.vertical, 16)

                    editDivider

                    // Class
                    editFieldSection(icon: "graduationcap", label: "Class") {
                        if showCustomClass {
                            TextField("e.g. CS 61A", text: $courseName)
                                .font(.system(size: 15))
                                .foregroundStyle(AppColors.foreground)
                                .multilineTextAlignment(.trailing)
                        } else {
                            Menu {
                                ForEach(existingCourses, id: \.self) { course in
                                    Button {
                                        courseName = course
                                    } label: {
                                        if courseName == course {
                                            Label(course, systemImage: "checkmark")
                                        } else {
                                            Text(course)
                                        }
                                    }
                                }
                                Divider()
                                Button {
                                    courseName = ""
                                    showCustomClass = true
                                } label: {
                                    Label("New Class", systemImage: "plus")
                                }
                                if !courseName.isEmpty {
                                    Divider()
                                    Button(role: .destructive) { courseName = "" } label: {
                                        Label("Clear", systemImage: "xmark")
                                    }
                                }
                            } label: {
                                HStack(spacing: 4) {
                                    Text(courseName.isEmpty ? "None" : courseName)
                                        .font(.system(size: 15))
                                        .foregroundStyle(courseName.isEmpty ? AppColors.subtleForeground : AppColors.foreground)
                                    Image(systemName: "chevron.up.chevron.down")
                                        .font(.system(size: 10))
                                        .foregroundStyle(AppColors.subtleForeground)
                                }
                            }
                        }
                    }

                    editDivider

                    // Due date
                    editFieldSection(icon: "calendar", label: "Due Date") {
                        Button {
                            if hasDueDate && !showDatePicker {
                                showDatePicker = true
                            } else if !hasDueDate {
                                hasDueDate = true
                                showDatePicker = true
                            } else {
                                showDatePicker = false
                            }
                        } label: {
                            HStack(spacing: 4) {
                                Text(hasDueDate ? dueDate.formatted(.dateTime.month(.abbreviated).day().year()) : "None")
                                    .font(.system(size: 15))
                                    .foregroundStyle(hasDueDate ? AppColors.foreground : AppColors.subtleForeground)
                                Image(systemName: "chevron.up.chevron.down")
                                    .font(.system(size: 10))
                                    .foregroundStyle(AppColors.subtleForeground)
                            }
                        }

                        if hasDueDate {
                            Button {
                                hasDueDate = false
                                showDatePicker = false
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 16))
                                    .foregroundStyle(AppColors.subtleForeground)
                            }
                        }
                    }

                    if showDatePicker {
                        DatePicker("", selection: $dueDate, displayedComponents: .date)
                            .datePickerStyle(.graphical)
                            .tint(AppColors.accent)
                            .padding(.horizontal, 16)
                    }

                    if hasDueDate {
                        editDivider

                        editFieldSection(icon: "clock", label: "Due Time") {
                            Button {
                                if hasDueTime && !showTimePicker {
                                    showTimePicker = true
                                } else if !hasDueTime {
                                    hasDueTime = true
                                    showTimePicker = true
                                } else {
                                    showTimePicker = false
                                }
                            } label: {
                                HStack(spacing: 4) {
                                    Text(hasDueTime ? dueTime.formatted(.dateTime.hour().minute()) : "None")
                                        .font(.system(size: 15))
                                        .foregroundStyle(hasDueTime ? AppColors.foreground : AppColors.subtleForeground)
                                    Image(systemName: "chevron.up.chevron.down")
                                        .font(.system(size: 10))
                                        .foregroundStyle(AppColors.subtleForeground)
                                }
                            }

                            if hasDueTime {
                                Button {
                                    hasDueTime = false
                                    showTimePicker = false
                                } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.system(size: 16))
                                        .foregroundStyle(AppColors.subtleForeground)
                                }
                            }
                        }

                        if showTimePicker {
                            DatePicker("", selection: $dueTime, displayedComponents: .hourAndMinute)
                                .labelsHidden()
                                .padding(.horizontal, 20)
                                .padding(.vertical, 8)
                        }
                    }

                    editDivider

                    // Notes
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 10) {
                            Image(systemName: "text.alignleft").font(.system(size: 15)).foregroundStyle(AppColors.mutedForeground).frame(width: 22)
                            Text("Notes").font(.system(size: 15, weight: .medium)).foregroundStyle(AppColors.foreground)
                        }
                        .padding(.horizontal, 20)

                        TextEditor(text: $description)
                            .font(.system(size: 15))
                            .foregroundStyle(AppColors.foreground)
                            .frame(minHeight: 80)
                            .padding(.horizontal, 16)
                            .scrollContentBackground(.hidden)
                            .overlay(alignment: .topLeading) {
                                if description.isEmpty {
                                    Text("Add notes...")
                                        .font(.system(size: 15))
                                        .foregroundStyle(AppColors.subtleForeground)
                                        .padding(.horizontal, 21)
                                        .padding(.top, 8)
                                        .allowsHitTesting(false)
                                }
                            }
                    }
                    .padding(.vertical, 16)
                }
                .padding(.bottom, 20)
            }
            .background(AppColors.background)
            .navigationTitle("Edit Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.mutedForeground)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { saveEdits() } label: {
                        Text("Save")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(title.isEmpty ? AppColors.mutedForeground : AppColors.accent)
                    }
                    .disabled(title.isEmpty || isSaving)
                }
            }
        }
        .presentationDragIndicator(.visible)
        .sheet(isPresented: $showColorPicker) {
            NavigationView {
                VStack(spacing: 24) {
                    ColorPicker("Pick a color", selection: $customColor, supportsOpacity: false)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(AppColors.foreground)
                        .padding(.horizontal, 20)
                        .padding(.top, 20)
                    Circle().fill(customColor).frame(width: 60, height: 60)
                        .overlay(Circle().stroke(AppColors.border, lineWidth: 1))
                    Spacer()
                }
                .background(AppColors.background)
                .navigationTitle("Custom Color")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") { showColorPicker = false }.foregroundStyle(AppColors.mutedForeground)
                    }
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Done") {
                            selectedColor = customColor.toHex()
                            showColorPicker = false
                        }
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(AppColors.accent)
                    }
                }
            }
            .presentationDetents([.medium])
        }
    }

    private func editFieldSection<Content: View>(
        icon: String, label: String, @ViewBuilder content: () -> Content
    ) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon).font(.system(size: 15)).foregroundStyle(AppColors.mutedForeground).frame(width: 22)
            Text(label).font(.system(size: 15, weight: .medium)).foregroundStyle(AppColors.foreground)
            Spacer()
            content()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
    }

    private var editDivider: some View {
        Rectangle().fill(AppColors.separator).frame(height: 1).padding(.leading, 52)
    }

    private func saveEdits() {
        isSaving = true
        HapticManager.medium()

        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        let dateStr = hasDueDate ? fmt.string(from: dueDate) : nil

        let tfmt = DateFormatter()
        tfmt.dateFormat = "HH:mm"
        let timeStr = (hasDueDate && hasDueTime) ? tfmt.string(from: dueTime) : nil

        let updates = TaskUpdate(
            title: title,
            description: description.isEmpty ? nil : description,
            dueDate: dateStr,
            dueTime: timeStr,
            color: selectedColor,
            courseName: courseName.isEmpty ? nil : courseName
        )

        Task {
            try? await taskStore.client.from("tasks")
                .update(updates)
                .eq("id", value: task.id)
                .execute()
            await taskStore.fetchTasks()
            dismiss()
        }
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
