import Foundation
import UserNotifications

/// Manages local push notifications for task reminders.
/// Singleton — schedules/cancels notifications based on task due dates.
/// iOS limits pending local notifications to 64.
final class NotificationManager {
    static let shared = NotificationManager()
    private init() {}

    /// Requests notification permission from the user.
    /// - Returns: Whether permission was granted.
    func requestPermission() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            AppLogger.app.info("Notification permission: \(granted)")
            return granted
        } catch {
            AppLogger.app.error("Notification permission error: \(error.localizedDescription)")
            return false
        }
    }

    /// Schedules a local notification reminder for a task.
    /// - Parameters:
    ///   - task: The task to remind about.
    ///   - minutesBefore: Minutes before due date to fire the reminder.
    func scheduleTaskReminder(task: CalTask, minutesBefore: Int) {
        guard let dueDate = task.dueDate, !dueDate.isEmpty else { return }

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard var date = formatter.date(from: dueDate) else { return }

        // Add due time if available, otherwise default to 9 AM
        if let dueTime = task.dueTime, !dueTime.isEmpty {
            let timeParts = dueTime.split(separator: ":")
            if timeParts.count >= 2,
               let hour = Int(timeParts[0]),
               let minute = Int(timeParts[1]) {
                date = Calendar.current.date(
                    bySettingHour: hour, minute: minute, second: 0, of: date
                ) ?? date
            }
        } else {
            date = Calendar.current.date(
                bySettingHour: 9, minute: 0, second: 0, of: date
            ) ?? date
        }

        // Calculate trigger time
        let triggerDate = date.addingTimeInterval(-Double(minutesBefore * 60))
        guard triggerDate > Date() else { return } // Skip past reminders

        let content = UNMutableNotificationContent()
        content.title = task.title
        content.body = "Due \(DateFormatting.dueDateInfo(dueDate: task.dueDate, dueTime: task.dueTime)?.dateLabel ?? "soon")"
        content.sound = .default

        let components = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: triggerDate
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        let request = UNNotificationRequest(
            identifier: "task-\(task.id)-\(minutesBefore)",
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request) { error in
            if let error {
                AppLogger.app.error("Failed to schedule notification: \(error.localizedDescription)")
            }
        }
    }

    /// Cancels all pending reminders for a specific task.
    func cancelTaskReminder(taskId: String) {
        let center = UNUserNotificationCenter.current()
        center.getPendingNotificationRequests { requests in
            let ids = requests.filter { $0.identifier.hasPrefix("task-\(taskId)") }
                .map(\.identifier)
            center.removePendingNotificationRequests(withIdentifiers: ids)
        }
    }

    /// Reschedules reminders for all active tasks using multi-select timing preferences.
    /// Reads @AppStorage flags for which reminder times are enabled.
    /// Respects iOS 64 pending notification limit.
    func rescheduleAllReminders(tasks: [CalTask]) {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()

        guard UserDefaults.standard.bool(forKey: "notif_task_reminders") else { return }

        // Collect enabled reminder times
        var minutesList: [Int] = []
        if UserDefaults.standard.bool(forKey: "notif_remind_15m") { minutesList.append(15) }
        if UserDefaults.standard.bool(forKey: "notif_remind_30m") { minutesList.append(30) }
        if UserDefaults.standard.bool(forKey: "notif_remind_1h") { minutesList.append(60) }
        if UserDefaults.standard.bool(forKey: "notif_remind_1d") { minutesList.append(1440) }
        // "Morning of" = 9 AM on due date (handled separately)
        let morningEnabled = UserDefaults.standard.bool(forKey: "notif_remind_morning")

        guard !minutesList.isEmpty || morningEnabled else { return }

        let today = DateFormatting.todayString()
        let futureTasks = tasks
            .filter { !$0.completed && ($0.dueDate ?? "") >= today }
            .sorted { ($0.dueDate ?? "") < ($1.dueDate ?? "") }

        // Budget: 64 notifications max
        var scheduled = 0
        let limit = 64

        for task in futureTasks {
            guard scheduled < limit else { break }
            for mins in minutesList {
                guard scheduled < limit else { break }
                scheduleTaskReminder(task: task, minutesBefore: mins)
                scheduled += 1
            }
            if morningEnabled, scheduled < limit {
                scheduleTaskReminder(task: task, minutesBefore: 0) // 0 = morning of (9 AM)
                scheduled += 1
            }
        }

        AppLogger.app.info("Scheduled \(scheduled) reminders for \(futureTasks.count) tasks")
    }
}
