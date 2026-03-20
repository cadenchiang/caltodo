import SwiftUI

/// Full-width task creation sheet matching desktop's create modal.
/// Fields: title (required), class, due date, due time, color, description.
struct TaskCreateSheet: View {
    @EnvironmentObject var taskStore: TaskStore
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var courseName = ""
    @State private var dueDate = Date()
    @State private var hasDueDate = false
    @State private var dueTime = Date()
    @State private var hasDueTime = false
    @State private var description = ""
    @State private var selectedColor = "#3B82F6"
    @State private var isSaving = false

    /// Optional pre-filled date (from calendar day tap).
    var prefillDate: Date?

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Title
                    TextField("task title", text: $title)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(AppColors.foreground)
                        .padding(.horizontal, 20)
                        .padding(.top, 8)

                    Divider().padding(.horizontal, 20)

                    // Color picker
                    colorRow

                    // Class
                    fieldRow(icon: "graduationcap", label: "class") {
                        TextField("course name", text: $courseName)
                            .font(.system(size: 15))
                            .foregroundStyle(AppColors.foreground)
                    }

                    // Due date
                    fieldRow(icon: "calendar", label: "due date") {
                        Toggle("", isOn: $hasDueDate)
                            .labelsHidden()
                            .tint(AppColors.accent)
                    }
                    if hasDueDate {
                        DatePicker("", selection: $dueDate, displayedComponents: .date)
                            .datePickerStyle(.graphical)
                            .tint(AppColors.accent)
                            .padding(.horizontal, 20)
                    }

                    // Due time
                    if hasDueDate {
                        fieldRow(icon: "clock", label: "due time") {
                            Toggle("", isOn: $hasDueTime)
                                .labelsHidden()
                                .tint(AppColors.accent)
                        }
                        if hasDueTime {
                            DatePicker("", selection: $dueTime, displayedComponents: .hourAndMinute)
                                .labelsHidden()
                                .padding(.horizontal, 48)
                        }
                    }

                    // Description
                    fieldRow(icon: "text.alignleft", label: "description") {
                        EmptyView()
                    }
                    TextEditor(text: $description)
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.foreground)
                        .frame(minHeight: 60)
                        .padding(.horizontal, 20)
                        .scrollContentBackground(.hidden)
                }
                .padding(.bottom, 20)
            }
            .background(AppColors.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("cancel") { dismiss() }
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.mutedForeground)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        saveTask()
                    } label: {
                        if isSaving {
                            ProgressView().tint(AppColors.accent)
                        } else {
                            Text("save")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(title.isEmpty ? AppColors.mutedForeground : AppColors.accent)
                        }
                    }
                    .disabled(title.isEmpty || isSaving)
                }
            }
        }
        .onAppear {
            if let date = prefillDate {
                dueDate = date
                hasDueDate = true
            }
        }
    }

    // MARK: - Color Row

    private var colorRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(TaskColors.all, id: \.self) { hex in
                    Circle()
                        .fill(Color(hex: hex))
                        .frame(width: 24, height: 24)
                        .overlay(
                            Circle()
                                .stroke(Color.white, lineWidth: selectedColor == hex ? 2 : 0)
                                .shadow(radius: selectedColor == hex ? 2 : 0)
                        )
                        .onTapGesture {
                            HapticManager.light()
                            selectedColor = hex
                        }
                }
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Field Row

    private func fieldRow<Content: View>(
        icon: String, label: String, @ViewBuilder content: () -> Content
    ) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.mutedForeground)
                .frame(width: 20)
            Text(label)
                .font(.system(size: 13))
                .foregroundStyle(AppColors.mutedForeground)
            Spacer()
            content()
        }
        .padding(.horizontal, 20)
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
        let timeStr = (hasDueDate && hasDueTime) ? timeFormatter.string(from: dueTime) : nil

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
