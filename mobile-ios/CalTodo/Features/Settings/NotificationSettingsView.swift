import SwiftUI

/// Notification settings — on by default, multi-select reminders, organized by type.
struct NotificationSettingsView: View {
    // Task reminders (on by default)
    @AppStorage("notif_task_reminders") private var taskReminders = true
    @AppStorage("notif_remind_15m") private var remind15m = false
    @AppStorage("notif_remind_30m") private var remind30m = true
    @AppStorage("notif_remind_1h") private var remind1h = false
    @AppStorage("notif_remind_1d") private var remind1d = true
    @AppStorage("notif_remind_morning") private var remindMorning = true

    // Due date alerts
    @AppStorage("notif_overdue_alerts") private var overdueAlerts = true
    @AppStorage("notif_daily_summary") private var dailySummary = true

    // CalChat
    @AppStorage("notif_calchat_messages") private var calChatMessages = true
    @AppStorage("notif_calchat_mentions") private var calChatMentions = true

    @State private var permissionGranted = true

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Permission banner if denied
                if !permissionGranted {
                    permissionBanner
                }

                // Task Reminders
                sectionCard(title: "Task Reminders", subtitle: "Get reminded before tasks are due") {
                    VStack(spacing: 0) {
                        toggleRow(icon: "bell.badge", label: "Task Reminders", isOn: $taskReminders)

                        if taskReminders {
                            divider

                            // Remind me header
                            HStack {
                                Text("Remind Me")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundStyle(AppColors.mutedForeground)
                                Spacer()
                                Text("Select multiple")
                                    .font(.system(size: 11))
                                    .foregroundStyle(AppColors.subtleForeground)
                            }
                            .padding(.horizontal, 16)
                            .padding(.top, 12)
                            .padding(.bottom, 6)

                            // Multi-select timing chips
                            timingChips
                                .padding(.horizontal, 16)
                                .padding(.bottom, 12)
                        }
                    }
                }

                // Due Date Alerts
                sectionCard(title: "Due Date Alerts", subtitle: "Stay on top of deadlines") {
                    VStack(spacing: 0) {
                        toggleRow(icon: "exclamationmark.circle", label: "Overdue Alerts", isOn: $overdueAlerts)
                        divider
                        toggleRow(icon: "sun.max", label: "Morning Summary", desc: "Daily overview at 8 AM", isOn: $dailySummary)
                    }
                }

                // Test Notification
                sectionCard(title: "Test", subtitle: "Make sure notifications work") {
                    Button {
                        HapticManager.medium()
                        sendTestNotification()
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: testSent ? "checkmark.circle.fill" : "bell.and.waves.left.and.right")
                                .font(.system(size: 15))
                                .foregroundStyle(testSent ? AppColors.green500 : AppColors.accent)
                                .frame(width: 22)
                            Text(testSent ? "Sent!" : "Send Test Notification")
                                .font(.system(size: 15))
                                .foregroundStyle(testSent ? AppColors.green500 : AppColors.accent)
                            Spacer()
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .animation(.easeInOut(duration: 0.2), value: testSent)
                    }
                }
            }
            .padding(.vertical, 16)
        }
        .background(AppColors.background)
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            let settings = await UNUserNotificationCenter.current().notificationSettings()
            permissionGranted = settings.authorizationStatus == .authorized
            // Request permission on first open if not yet asked
            if settings.authorizationStatus == .notDetermined {
                permissionGranted = await NotificationManager.shared.requestPermission()
            }
        }
    }

    // MARK: - Permission Banner

    private var permissionBanner: some View {
        HStack(spacing: 10) {
            Image(systemName: "bell.slash")
                .font(.system(size: 16))
                .foregroundStyle(AppColors.red500)
            VStack(alignment: .leading, spacing: 2) {
                Text("Notifications Disabled")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.foreground)
                Text("Enable in Settings → caltodo → Notifications")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.mutedForeground)
            }
            Spacer()
            Button {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            } label: {
                Text("Open")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(AppColors.blue500)
            }
        }
        .padding(14)
        .background(AppColors.red500.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal, 16)
    }

    // MARK: - Timing Chips (multi-select)

    private var timingChips: some View {
        let chips: [(label: String, binding: Binding<Bool>)] = [
            ("15 min", $remind15m),
            ("30 min", $remind30m),
            ("1 hour", $remind1h),
            ("1 day", $remind1d),
            ("Morning", $remindMorning),
        ]

        return LazyVGrid(columns: [
            GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())
        ], spacing: 8) {
            ForEach(Array(chips.enumerated()), id: \.offset) { _, chip in
                Button {
                    HapticManager.light()
                    chip.binding.wrappedValue.toggle()
                } label: {
                    Text(chip.label)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(chip.binding.wrappedValue ? .white : AppColors.foreground)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(chip.binding.wrappedValue ? AppColors.accent : AppColors.muted)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
        }
    }

    // MARK: - Section Card

    private func sectionCard<C: View>(title: String, subtitle: String, @ViewBuilder content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(AppColors.foreground)
                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.mutedForeground)
            }
            .padding(.horizontal, 20)

            content()
                .background(AppColors.card)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(AppColors.border, lineWidth: 1))
                .padding(.horizontal, 16)
        }
    }

    // MARK: - Toggle Row

    private func toggleRow(icon: String, label: String, desc: String? = nil, isOn: Binding<Bool>) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 15))
                .foregroundStyle(AppColors.mutedForeground)
                .frame(width: 22)
            VStack(alignment: .leading, spacing: 1) {
                Text(label)
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.foreground)
                if let desc {
                    Text(desc)
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.mutedForeground)
                }
            }
            Spacer()
            Toggle("", isOn: isOn)
                .labelsHidden()
                .tint(AppColors.accent)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 11)
    }

    private var divider: some View {
        Rectangle().fill(AppColors.separator).frame(height: 1).padding(.leading, 50)
    }

    @State private var testSent = false

    /// Sends a test local notification that fires in 1 second.
    /// Temporarily sets up foreground delivery so it shows even while in-app.
    private func sendTestNotification() {
        Task {
            // Ensure permission
            let granted = await NotificationManager.shared.requestPermission()
            guard granted else {
                permissionGranted = false
                return
            }

            // Enable foreground display
            NotificationDelegate.shared.register()

            let content = UNMutableNotificationContent()
            content.title = "caltodo"
            content.body = "notifications are working!"
            content.sound = .default

            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
            let request = UNNotificationRequest(identifier: "test-\(UUID().uuidString)", content: content, trigger: trigger)

            do {
                try await UNUserNotificationCenter.current().add(request)
                testSent = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) { testSent = false }
            } catch {
                AppLogger.app.error("Test notification failed: \(error.localizedDescription)")
            }
        }
    }
}
