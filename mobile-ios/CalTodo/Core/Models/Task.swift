import Foundation

/// CalTodo task model matching the shared TypeScript `Task` interface.
/// All fields are optional-safe to handle any nulls from the API.
///
/// - SeeAlso: `packages/shared/src/types.ts` for the source-of-truth schema.
struct CalTask: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let userId: String?
    var title: String
    var description: String?
    var dueDate: String?
    var dueTime: String?
    var isCompleted: Bool?
    var color: String?
    let createdAt: String?
    var updatedAt: String?
    var source: String?
    var externalId: String?
    var courseName: String?
    var sourceUrl: String?
    var pointsPossible: Double?
    var isSubmitted: Bool?
    var googleEventId: String?
    var dismissedAt: String?
    var repeatInterval: Int?
    var repeatUnit: String?
    var repeatEndDate: String?
    var repeatEndCount: Int?
    var lateDueDate: String?
    var completedAt: String?
    var tags: [String]?
    var snoozedUntil: String?
    var sortOrder: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case title, description
        case dueDate = "due_date"
        case dueTime = "due_time"
        case isCompleted = "is_completed"
        case color
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case source
        case externalId = "external_id"
        case courseName = "course_name"
        case sourceUrl = "source_url"
        case pointsPossible = "points_possible"
        case isSubmitted = "is_submitted"
        case googleEventId = "google_event_id"
        case dismissedAt = "dismissed_at"
        case repeatInterval = "repeat_interval"
        case repeatUnit = "repeat_unit"
        case repeatEndDate = "repeat_end_date"
        case repeatEndCount = "repeat_end_count"
        case lateDueDate = "late_due_date"
        case completedAt = "completed_at"
        case tags
        case snoozedUntil = "snoozed_until"
        case sortOrder = "sort_order"
    }

    /// The task's display color, defaulting to blue if not set.
    var displayColor: String {
        (color ?? "").isEmpty ? "#3B82F6" : color!
    }

    /// Whether the task is marked complete (safe unwrap).
    var completed: Bool {
        isCompleted ?? false
    }

    /// Whether this task has a recurrence pattern.
    var isRecurring: Bool {
        repeatInterval != nil && repeatUnit != nil
    }

    /// Safe tags access.
    var tagList: [String] {
        tags ?? []
    }

    /// Task source as enum if valid.
    var taskSource: TaskSource? {
        guard let source else { return nil }
        return TaskSource(rawValue: source)
    }
}

/// Assignment source types matching the shared TypeScript union.
enum TaskSource: String, Codable, Sendable {
    case canvas
    case gradescope
    case pensieve
    case syllabus
}

/// Repeat unit types for recurring tasks.
enum RepeatUnit: String, Codable, Sendable {
    case day
    case week
    case month
}
