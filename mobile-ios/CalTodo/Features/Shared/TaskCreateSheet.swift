import SwiftUI

/// Task creation sheet. Clean, consistent UI with proper spacing.
///
/// - Parameters:
///   - prefillDate: Optional pre-filled date (from calendar day tap).
struct TaskCreateSheet: View {
    @EnvironmentObject var taskStore: TaskStore
    @ObservedObject private var theme = ThemeManager.shared
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var courseName = ""
    @State private var dueDate = Date()
    @State private var hasDueDate = false
    @State private var dueTime = Date()
    @State private var hasDueTime = false
    @State private var description = ""
    @State private var selectedColor = "#3B82F6"
    @State private var customColor = Color(hex: "#3B82F6")
    @State private var isSaving = false
    @State private var showCustomClass = false
    @State private var showColorPicker = false
    @State private var showDatePicker = false
    @State private var showTimePicker = false

    var prefillDate: Date?

    /// Unique course names from existing tasks, sorted alphabetically.
    private var existingCourses: [String] {
        let names = Set(taskStore.tasks.compactMap { $0.courseName?.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty })
        return names.sorted()
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Title input
                    TextField("What do you need to do?", text: $title)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(AppColors.foreground)
                        .padding(.horizontal, 20)
                        .padding(.top, 16)
                        .padding(.bottom, 16)

                    divider

                    // Color picker
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
                                            Circle()
                                                .stroke(.white, lineWidth: selectedColor == hex ? 2.5 : 0)
                                                .frame(width: 20, height: 20)
                                        )
                                        .overlay(
                                            Circle()
                                                .stroke(AppColors.border, lineWidth: 1)
                                        )
                                        .onTapGesture {
                                            HapticManager.light()
                                            selectedColor = hex
                                        }
                                }

                                // Custom color button
                                Button {
                                    HapticManager.light()
                                    showColorPicker = true
                                } label: {
                                    Circle()
                                        .fill(
                                            AngularGradient(
                                                colors: [.red, .orange, .yellow, .green, .blue, .purple, .red],
                                                center: .center
                                            )
                                        )
                                        .frame(width: 28, height: 28)
                                        .overlay(
                                            Image(systemName: "plus")
                                                .font(.system(size: 12, weight: .bold))
                                                .foregroundStyle(.white)
                                        )
                                        .overlay(
                                            Circle()
                                                .stroke(AppColors.border, lineWidth: 1)
                                        )
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                    .padding(.vertical, 16)

                    divider

                    // Class
                    fieldSection(icon: "graduationcap", label: "Class") {
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
                                    Button(role: .destructive) {
                                        courseName = ""
                                    } label: {
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

                    divider

                    // Due date
                    fieldSection(icon: "calendar", label: "Due Date") {
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
                        divider

                        // Due time
                        fieldSection(icon: "clock", label: "Due Time") {
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

                    divider

                    // Description
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 10) {
                            Image(systemName: "text.alignleft")
                                .font(.system(size: 15))
                                .foregroundStyle(AppColors.mutedForeground)
                                .frame(width: 22)
                            Text("Notes")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundStyle(AppColors.foreground)
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
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.mutedForeground)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        saveTask()
                    } label: {
                        Text("Save")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(title.isEmpty ? AppColors.mutedForeground : AppColors.accent)
                    }
                    .disabled(title.isEmpty || isSaving)
                }
            }
        }
        .presentationDragIndicator(.visible)
        .onAppear {
            if let date = prefillDate {
                dueDate = date
                hasDueDate = true
            }
        }
        .sheet(isPresented: $showColorPicker) {
            NavigationView {
                VStack(spacing: 24) {
                    ColorPicker("Pick a color", selection: $customColor, supportsOpacity: false)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(AppColors.foreground)
                        .padding(.horizontal, 20)
                        .padding(.top, 20)

                    // Preview
                    Circle()
                        .fill(customColor)
                        .frame(width: 60, height: 60)
                        .overlay(Circle().stroke(AppColors.border, lineWidth: 1))

                    Spacer()
                }
                .background(AppColors.background)
                .navigationTitle("Custom Color")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") { showColorPicker = false }
                            .foregroundStyle(AppColors.mutedForeground)
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

    // MARK: - Field Section

    private func fieldSection<Content: View>(
        icon: String, label: String, @ViewBuilder content: () -> Content
    ) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 15))
                .foregroundStyle(AppColors.mutedForeground)
                .frame(width: 22)
            Text(label)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(AppColors.foreground)
            Spacer()
            content()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
    }

    private var divider: some View {
        Rectangle()
            .fill(AppColors.separator)
            .frame(height: 1)
            .padding(.leading, 52)
    }

    // MARK: - Save

    private func saveTask() {
        guard !title.isEmpty else { return }
        isSaving = true
        HapticManager.medium()

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateStr = hasDueDate ? formatter.string(from: dueDate) : nil

        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm"
        let timeStr = (hasDueDate && hasDueTime)
            ? timeFormatter.string(from: dueTime) : nil

        let insert = TaskInsert(
            title: title,
            description: description.isEmpty ? nil : description,
            dueDate: dateStr,
            dueTime: timeStr,
            color: selectedColor,
            tags: nil,
            repeatInterval: nil,
            repeatUnit: nil,
            repeatEndDate: nil,
            repeatEndCount: nil
        )

        Task {
            let success = await taskStore.createTask(insert)
            if success {
                dismiss()
            } else {
                isSaving = false
            }
        }
    }
}
