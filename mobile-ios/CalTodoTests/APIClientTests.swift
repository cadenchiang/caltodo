import XCTest
@testable import CalTodo

/// Unit tests for APIClient using URLProtocol mock.
/// Validates request construction, error handling, and response decoding.
final class APIClientTests: XCTestCase {

    private var client: APIClient!

    override func setUp() {
        super.setUp()
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        let session = URLSession(configuration: config)
        client = APIClient(
            baseURL: "https://test.example.com",
            getToken: { "test-token" },
            session: session
        )
    }

    override func tearDown() {
        MockURLProtocol.requestHandler = nil
        super.tearDown()
    }

    // MARK: - getTasks

    func testGetTasksSuccess() async throws {
        let tasksJSON = """
        [
            {
                "id": "1", "user_id": "u1", "title": "Task 1", "description": "",
                "due_date": null, "due_time": null, "is_completed": false,
                "color": "#3B82F6", "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z", "source": null,
                "external_id": null, "course_name": null, "source_url": null,
                "points_possible": null, "is_submitted": false, "google_event_id": null,
                "dismissed_at": null, "repeat_interval": null, "repeat_unit": null,
                "repeat_end_date": null, "repeat_end_count": null, "late_due_date": null,
                "completed_at": null, "tags": [], "snoozed_until": null, "sort_order": null
            }
        ]
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            XCTAssertEqual(request.url?.path, "/api/mobile/tasks")
            XCTAssertEqual(request.value(forHTTPHeaderField: "Authorization"), "Bearer test-token")
            XCTAssertEqual(request.httpMethod, "GET")
            let response = HTTPURLResponse(
                url: request.url!, statusCode: 200,
                httpVersion: nil, headerFields: nil
            )!
            return (response, tasksJSON)
        }

        let tasks = try await client.getTasks()
        XCTAssertEqual(tasks.count, 1)
        XCTAssertEqual(tasks[0].title, "Task 1")
    }

    func testGetTasksUnauthorized() async {
        let client = APIClient(
            baseURL: "https://test.example.com",
            getToken: { nil },
            session: .shared
        )

        do {
            _ = try await client.getTasks()
            XCTFail("Should throw unauthorized error")
        } catch let error as APIError {
            if case .unauthorized = error {
                // Expected
            } else {
                XCTFail("Expected unauthorized, got \(error)")
            }
        } catch {
            XCTFail("Unexpected error type: \(error)")
        }
    }

    func testGetTasksServerError() async {
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(
                url: request.url!, statusCode: 500,
                httpVersion: nil, headerFields: nil
            )!
            let body = """
            {"error": "Internal server error"}
            """.data(using: .utf8)!
            return (response, body)
        }

        do {
            _ = try await client.getTasks()
            XCTFail("Should throw server error")
        } catch let error as APIError {
            if case .serverError(let code, _) = error {
                XCTAssertEqual(code, 500)
            } else {
                XCTFail("Expected serverError, got \(error)")
            }
        } catch {
            XCTFail("Unexpected error type: \(error)")
        }
    }

    // MARK: - updateTask

    func testUpdateTaskSendsCorrectBody() async throws {
        let responseJSON = """
        {
            "id": "1", "user_id": "u1", "title": "Task 1", "description": "",
            "due_date": null, "due_time": null, "is_completed": true,
            "color": "#3B82F6", "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-02T00:00:00Z", "source": null,
            "external_id": null, "course_name": null, "source_url": null,
            "points_possible": null, "is_submitted": false, "google_event_id": null,
            "dismissed_at": null, "repeat_interval": null, "repeat_unit": null,
            "repeat_end_date": null, "repeat_end_count": null, "late_due_date": null,
            "completed_at": "2025-01-02T00:00:00Z", "tags": [], "snoozed_until": null,
            "sort_order": null
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { request in
            XCTAssertEqual(request.url?.path, "/api/mobile/tasks/1")
            XCTAssertEqual(request.httpMethod, "PATCH")

            // Verify body contains is_completed
            if let body = request.httpBody ?? request.httpBodyStream?.readAll() {
                let json = try? JSONSerialization.jsonObject(with: body) as? [String: Any]
                XCTAssertEqual(json?["is_completed"] as? Bool, true)
            }

            let response = HTTPURLResponse(
                url: request.url!, statusCode: 200,
                httpVersion: nil, headerFields: nil
            )!
            return (response, responseJSON)
        }

        let updated = try await client.updateTask(
            id: "1",
            updates: TaskUpdate(isCompleted: true)
        )
        XCTAssertTrue(updated.isCompleted)
    }
}

// MARK: - MockURLProtocol

/// URLProtocol mock for intercepting and simulating network requests in tests.
final class MockURLProtocol: URLProtocol {
    /// Handler closure set by tests to define mock responses.
    static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data))?

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        guard let handler = MockURLProtocol.requestHandler else {
            XCTFail("MockURLProtocol handler not set")
            return
        }
        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}
}

// MARK: - InputStream Helper

extension InputStream {
    /// Reads all available data from the stream.
    func readAll() -> Data {
        open()
        var data = Data()
        let bufferSize = 1024
        let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: bufferSize)
        while hasBytesAvailable {
            let read = self.read(buffer, maxLength: bufferSize)
            if read > 0 {
                data.append(buffer, count: read)
            }
        }
        buffer.deallocate()
        close()
        return data
    }
}
