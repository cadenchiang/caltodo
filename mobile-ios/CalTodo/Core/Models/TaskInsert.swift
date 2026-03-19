import Foundation

/// Encodable model for creating a new task via POST /api/mobile/tasks.
/// Only includes fields that can be set on creation.
///
/// - SeeAlso: `packages/shared/src/types.ts` TaskInsert type.
struct TaskInsert: Encodable {
    let title: String
    var description: String?
    var dueDate: String?
    var dueTime: String?
    var color: String?
    var tags: [String]?
    var repeatInterval: Int?
    var repeatUnit: RepeatUnit?
    var repeatEndDate: String?
    var repeatEndCount: Int?

    enum CodingKeys: String, CodingKey {
        case title, description, color, tags
        case dueDate = "due_date"
        case dueTime = "due_time"
        case repeatInterval = "repeat_interval"
        case repeatUnit = "repeat_unit"
        case repeatEndDate = "repeat_end_date"
        case repeatEndCount = "repeat_end_count"
    }
}
