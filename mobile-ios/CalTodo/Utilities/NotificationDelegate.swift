import Foundation
import UserNotifications

/// Handles foreground notification display.
/// Without this, iOS silently swallows notifications while the app is active.
final class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationDelegate()
    private override init() { super.init() }

    /// Registers this delegate with the notification center.
    /// Safe to call multiple times.
    func register() {
        UNUserNotificationCenter.current().delegate = self
    }

    /// Shows notifications as banners even when the app is in the foreground.
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }
}
