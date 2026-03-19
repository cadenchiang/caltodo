import Foundation

/// Encodable model for updating a task via PATCH /api/mobile/tasks/:id.
/// All fields are optional — only non-nil values are sent.
///
/// - SeeAlso: `packages/shared/src/types.ts` TaskUpdate type.
struct TaskUpdate: Encodable {
    var title: String?
    var description: String?
    var dueDate: String?
    var dueTime: String?
    var isCompleted: Bool?
    var color: String?
    var tags: [String]?
    var dismissedAt: String?
    var repeatInterval: Int?
    var repeatUnit: RepeatUnit?
    var completedAt: String?
    var snoozedUntil: String?
    var sortOrder: Int?

    enum CodingKeys: String, CodingKey {
        case title, description, color, tags
        case dueDate = "due_date"
        case dueTime = "due_time"
        case isCompleted = "is_completed"
        case dismissedAt = "dismissed_at"
        case repeatInterval = "repeat_interval"
        case repeatUnit = "repeat_unit"
        case completedAt = "completed_at"
        case snoozedUntil = "snoozed_until"
        case sortOrder = "sort_order"
    }
}
