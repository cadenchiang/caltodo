import Foundation

/// Date formatting utilities for CalTodo.
/// Handles due date display, greeting generation, and time formatting.
///
/// Matches the web app's date display logic from `task-utils.ts`.
enum DateFormatting {

    // MARK: - Date Strings

    /// Returns today's date as "YYYY-MM-DD" string.
    static func todayString() -> String {
        formatDate(Date())
    }

    /// Returns a date string for N days from now.
    ///
    /// - Parameter days: Number of days from today (can be negative).
    /// - Returns: "YYYY-MM-DD" formatted date string.
    static func dateString(daysFromNow days: Int) -> String {
        let date = Calendar.current.date(byAdding: .day, value: days, to: Date()) ?? Date()
        return formatDate(date)
    }

    /// Formats a Date as "YYYY-MM-DD".
    ///
    /// - Parameter date: The date to format.
    /// - Returns: ISO date string.
    static func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter.string(from: date)
    }

    // MARK: - Due Date Display

    /// Returns display info for a task's due date.
    /// Color coding matches the web app: red for overdue, blue for upcoming (≤7 days),
    /// gray for future dates.
    ///
    /// - Parameters:
    ///   - dueDate: ISO date string (YYYY-MM-DD) or nil.
    ///   - dueTime: 24-hour time string (HH:MM) or nil.
    /// - Returns: Tuple of (dateLabel, timeLabel, colorHex), or nil if no due date.
    static func dueDateInfo(dueDate: String?, dueTime: String?) -> DueDateInfo? {
        guard let dueDate, !dueDate.isEmpty else { return nil }

        let today = Calendar.current.startOfDay(for: Date())
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")

        guard let dueDay = formatter.date(from: dueDate) else { return nil }
        let due = Calendar.current.startOfDay(for: dueDay)
        let diffDays = Calendar.current.dateComponents([.day], from: today, to: due).day ?? 0

        let timeLabel = dueTime.flatMap { formatTime12h($0) }

        let monthDay: String = {
            let mf = DateFormatter()
            mf.dateFormat = "MMM d"
            mf.locale = Locale(identifier: "en_US")
            return mf.string(from: due)
        }()

        if diffDays < 0 {
            return DueDateInfo(dateLabel: monthDay, timeLabel: timeLabel, colorHex: "#F87171")
        }
        if diffDays == 0 {
            return DueDateInfo(dateLabel: "Today", timeLabel: timeLabel, colorHex: "#60A5FA")
        }
        if diffDays == 1 {
            return DueDateInfo(dateLabel: "Tomorrow", timeLabel: timeLabel, colorHex: "#60A5FA")
        }
        if diffDays <= 7 {
            return DueDateInfo(dateLabel: monthDay, timeLabel: timeLabel, colorHex: "#60A5FA")
        }
        return DueDateInfo(dateLabel: monthDay, timeLabel: timeLabel, colorHex: "#9CA3AF")
    }

    // MARK: - Time Formatting

    /// Converts a 24-hour time string to 12-hour format.
    /// Matches the web app's `formatTime12h`.
    ///
    /// - Parameter time24: Time string in "HH:MM" format.
    /// - Returns: Formatted time (e.g. "11:59 PM"), or nil if parsing fails.
    static func formatTime12h(_ time24: String) -> String? {
        let parts = time24.split(separator: ":")
        guard parts.count >= 2,
              let hour = Int(parts[0]),
              let minute = parts[1].prefix(2).description as String? else {
            return nil
        }
        let ampm = hour >= 12 ? "PM" : "AM"
        let hour12 = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour)
        return "\(hour12):\(minute) \(ampm)"
    }

    // MARK: - Greeting

    /// Returns a time-based greeting string.
    ///
    /// - Returns: "good morning", "good afternoon", or "good evening".
    static func greeting() -> String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 { return "good morning" }
        if hour < 17 { return "good afternoon" }
        return "good evening"
    }
}

/// Display information for a task's due date.
struct DueDateInfo {
    /// The date label (e.g. "Today", "Tomorrow", "Mar 25").
    let dateLabel: String
    /// The time label (e.g. "11:59 PM"), or nil if no time set.
    let timeLabel: String?
    /// Hex color string for the due date text.
    let colorHex: String
}
