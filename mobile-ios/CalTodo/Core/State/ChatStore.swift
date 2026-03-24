import Foundation
import Supabase

/// State manager for CalChat — fetches boards and messages via direct Supabase.
final class ChatStore: ObservableObject {
    @Published var boards: [DiscussionBoard] = []
    @Published var messages: [ChatMessage] = []
    @Published var isLoadingBoards = false
    @Published var isLoadingMessages = false
    @Published var currentCourseId: String?

    private let client: SupabaseClient
    private weak var authManager: AuthManager?
    private var boardsCached = false

    init(authManager: AuthManager) {
        self.authManager = authManager
        self.client = authManager.client
    }

    // MARK: - Fetch Boards (optimized: 2 queries total, not N+1)

    @MainActor
    func fetchBoards() async {
        if boardsCached && !boards.isEmpty { return }
        if isLoadingBoards { return } // prevent duplicate calls
        isLoadingBoards = true

        do {
            // 1) Get all courses the user is enrolled in (single query with join)
            let memberships: [MembershipRow] = try await client.from("course_memberships")
                .select("course_id, courses(id, source, external_id, name)")
                .execute()
                .value

            guard !memberships.isEmpty else {
                boards = []
                isLoadingBoards = false
                boardsCached = true
                return
            }

            // Build boards (deduplicate by course ID) — no message fetch for speed
            var seenCourseIds = Set<String>()
            var fetchedBoards: [DiscussionBoard] = []
            for membership in memberships {
                guard let course = membership.courses else { continue }
                guard seenCourseIds.insert(course.id).inserted else { continue }
                fetchedBoards.append(DiscussionBoard(
                    course: course,
                    messageCount: 0,
                    lastMessageBody: nil,
                    lastMessageAuthor: nil,
                    lastMessageAt: nil,
                    memberCount: 0
                ))
            }

            boards = fetchedBoards.sorted { $0.course.name < $1.course.name }
            boardsCached = true
            AppLogger.ui.info("Fetched \(fetchedBoards.count) boards")
        } catch {
            AppLogger.ui.error("Board fetch failed: \(error.localizedDescription)")
        }

        isLoadingBoards = false
    }

    /// Force refresh boards (pull-to-refresh).
    @MainActor
    func refreshBoards() async {
        boardsCached = false
        await fetchBoards()
    }

    // MARK: - Fetch Messages

    @MainActor
    func fetchMessages(courseId: String) async {
        currentCourseId = courseId
        isLoadingMessages = true

        do {
            let fetched: [ChatMessage] = try await client.from("chat_messages")
                .select()
                .eq("course_id", value: courseId)
                .order("created_at", ascending: true)
                .limit(50)
                .execute()
                .value

            messages = fetched
            AppLogger.ui.info("Fetched \(fetched.count) messages")
        } catch {
            AppLogger.ui.error("Messages fetch failed: \(error.localizedDescription)")
        }

        isLoadingMessages = false
    }

    // MARK: - Send Message

    @MainActor
    func sendMessage(body: String, courseId: String) async {
        let trimmed = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        let payload = SendMessagePayload(
            courseId: courseId,
            body: trimmed,
            authorName: authManager?.userName,
            authorAvatar: authManager?.avatarURL?.absoluteString
        )

        do {
            let sent: ChatMessage = try await client.from("chat_messages")
                .insert(payload)
                .select()
                .single()
                .execute()
                .value

            messages.append(sent)
        } catch {
            AppLogger.ui.error("Send failed: \(error.localizedDescription)")
        }
    }

    // MARK: - Delete Message

    @MainActor
    func deleteMessage(id: String) async {
        messages.removeAll { $0.id == id }
        do {
            try await client.from("chat_messages")
                .delete()
                .eq("id", value: id)
                .execute()
        } catch {
            AppLogger.ui.error("Delete failed: \(error.localizedDescription)")
        }
    }
}

/// Row from course_memberships with joined course.
private struct MembershipRow: Decodable {
    let courseId: String
    let courses: ChatCourse?

    enum CodingKeys: String, CodingKey {
        case courseId = "course_id"
        case courses
    }
}
