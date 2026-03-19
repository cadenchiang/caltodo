import XCTest
@testable import CalTodo

/// Unit tests for CalTask model encoding/decoding.
/// Validates JSON round-trip with snake_case keys matching the API contract.
final class TaskModelTests: XCTestCase {

    // MARK: - Decoding

    func testDecodeMinimalTask() throws {
        let json = """
        {
            "id": "abc-123",
            "user_id": "user-1",
            "title": "Test Task",
            "description": "",
            "due_date": null,
            "due_time": null,
            "is_completed": false,
            "color": "#3B82F6",
            "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-01T00:00:00Z",
            "source": null,
            "external_id": null,
            "course_name": null,
            "source_url": null,
            "points_possible": null,
            "is_submitted": false,
            "google_event_id": null,
            "dismissed_at": null,
            "repeat_interval": null,
            "repeat_unit": null,
            "repeat_end_date": null,
            "repeat_end_count": null,
            "late_due_date": null,
            "completed_at": null,
            "tags": [],
            "snoozed_until": null,
            "sort_order": null
        }
        """.data(using: .utf8)!

        let task = try JSONDecoder().decode(CalTask.self, from: json)
        XCTAssertEqual(task.id, "abc-123")
        XCTAssertEqual(task.userId, "user-1")
        XCTAssertEqual(task.title, "Test Task")
        XCTAssertFalse(task.isCompleted)
        XCTAssertEqual(task.color, "#3B82F6")
        XCTAssertNil(task.dueDate)
        XCTAssertNil(task.source)
        XCTAssertTrue(task.tags.isEmpty)
    }

    func testDecodeTaskWithAllFields() throws {
        let json = """
        {
            "id": "abc-456",
            "user_id": "user-1",
            "title": "Homework 5",
            "description": "Chapter 3 exercises",
            "due_date": "2025-03-20",
            "due_time": "23:59",
            "is_completed": true,
            "color": "#EF4444",
            "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-02T00:00:00Z",
            "source": "canvas",
            "external_id": "ext-789",
            "course_name": "CS 61B",
            "source_url": "https://bcourses.berkeley.edu/...",
            "points_possible": 100.0,
            "is_submitted": true,
            "google_event_id": "gcal-123",
            "dismissed_at": null,
            "repeat_interval": 1,
            "repeat_unit": "week",
            "repeat_end_date": "2025-05-01",
            "repeat_end_count": null,
            "late_due_date": "2025-03-22",
            "completed_at": "2025-03-19T10:00:00Z",
            "tags": ["CS", "homework"],
            "snoozed_until": null,
            "sort_order": 5
        }
        """.data(using: .utf8)!

        let task = try JSONDecoder().decode(CalTask.self, from: json)
        XCTAssertEqual(task.title, "Homework 5")
        XCTAssertEqual(task.dueDate, "2025-03-20")
        XCTAssertEqual(task.dueTime, "23:59")
        XCTAssertTrue(task.isCompleted)
        XCTAssertEqual(task.source, .canvas)
        XCTAssertEqual(task.courseName, "CS 61B")
        XCTAssertEqual(task.pointsPossible, 100.0)
        XCTAssertEqual(task.repeatInterval, 1)
        XCTAssertEqual(task.repeatUnit, .week)
        XCTAssertEqual(task.tags, ["CS", "homework"])
        XCTAssertEqual(task.sortOrder, 5)
        XCTAssertTrue(task.isRecurring)
    }

    // MARK: - displayColor

    func testDisplayColorDefault() throws {
        let json = makeTaskJSON(color: "")
        let task = try JSONDecoder().decode(CalTask.self, from: json)
        XCTAssertEqual(task.displayColor, "#3B82F6", "Empty color should default to blue")
    }

    func testDisplayColorCustom() throws {
        let json = makeTaskJSON(color: "#EF4444")
        let task = try JSONDecoder().decode(CalTask.self, from: json)
        XCTAssertEqual(task.displayColor, "#EF4444")
    }

    // MARK: - isRecurring

    func testIsRecurringFalse() throws {
        let json = makeTaskJSON(color: "#3B82F6")
        let task = try JSONDecoder().decode(CalTask.self, from: json)
        XCTAssertFalse(task.isRecurring)
    }

    // MARK: - TaskSource

    func testAllSourceTypes() throws {
        for source in ["canvas", "gradescope", "pensieve", "syllabus"] {
            let json = makeTaskJSON(color: "#3B82F6", source: source)
            let task = try JSONDecoder().decode(CalTask.self, from: json)
            XCTAssertNotNil(task.source, "Source '\(source)' should decode successfully")
        }
    }

    // MARK: - Helpers

    private func makeTaskJSON(color: String, source: String? = nil) -> Data {
        let sourceJSON = source.map { "\"\($0)\"" } ?? "null"
        return """
        {
            "id": "test", "user_id": "u1", "title": "T", "description": "",
            "due_date": null, "due_time": null, "is_completed": false,
            "color": "\(color)", "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-01T00:00:00Z", "source": \(sourceJSON),
            "external_id": null, "course_name": null, "source_url": null,
            "points_possible": null, "is_submitted": false, "google_event_id": null,
            "dismissed_at": null, "repeat_interval": null, "repeat_unit": null,
            "repeat_end_date": null, "repeat_end_count": null, "late_due_date": null,
            "completed_at": null, "tags": [], "snoozed_until": null, "sort_order": null
        }
        """.data(using: .utf8)!
    }
}
