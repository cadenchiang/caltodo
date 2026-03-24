import Foundation

/// A single chat message in a CalChat discussion board.
struct ChatMessage: Codable, Identifiable, Equatable {
    let id: String
    let courseId: String
    let authorId: String
    var authorName: String?
    var authorAvatar: String?
    let body: String
    let createdAt: String
    let updatedAt: String
    var replyToId: String?

    enum CodingKeys: String, CodingKey {
        case id
        case courseId = "course_id"
        case authorId = "author_id"
        case authorName = "author_name"
        case authorAvatar = "author_avatar"
        case body
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case replyToId = "reply_to_id"
    }
}

/// A discussion board (course) with message metadata.
struct DiscussionBoard: Identifiable {
    let course: ChatCourse
    let messageCount: Int
    let lastMessageBody: String?
    let lastMessageAuthor: String?
    let lastMessageAt: String?
    let memberCount: Int

    var id: String { course.id }
}

/// Minimal course model for chat boards.
struct ChatCourse: Codable, Identifiable {
    let id: String
    let source: String
    let externalId: String
    let name: String

    enum CodingKeys: String, CodingKey {
        case id, source, name
        case externalId = "external_id"
    }
}

/// Payload for sending a new message.
struct SendMessagePayload: Encodable {
    let courseId: String
    let body: String
    let authorName: String?
    let authorAvatar: String?

    enum CodingKeys: String, CodingKey {
        case courseId = "course_id"
        case body
        case authorName = "author_name"
        case authorAvatar = "author_avatar"
    }
}
