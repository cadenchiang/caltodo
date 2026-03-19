import Foundation
import os

/// Structured logging wrapper around os.Logger for CalTodo.
/// Provides categorized logging with consistent formatting across the app.
///
/// Usage:
///   AppLogger.auth.info("User signed in")
///   AppLogger.api.error("Request failed", error: someError)
enum AppLogger {
    /// Logger for authentication events (sign in, sign out, token refresh).
    static let auth = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.caltodo", category: "auth")

    /// Logger for API/network requests and responses.
    static let api = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.caltodo", category: "api")

    /// Logger for task store operations (CRUD, sync, optimistic updates).
    static let tasks = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.caltodo", category: "tasks")

    /// Logger for UI lifecycle and navigation events.
    static let ui = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.caltodo", category: "ui")

    /// Logger for general app lifecycle events.
    static let app = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.caltodo", category: "app")
}
