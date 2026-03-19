import Foundation

/// URLSession-based HTTP client for CalTodo's Next.js API routes.
/// Mirrors the TypeScript `ApiClient` from `packages/shared/src/api-client.ts`.
///
/// All requests include the Supabase Bearer token in the Authorization header.
/// Uses snake_case JSON decoding to match the API's response format.
///
/// - SeeAlso: `packages/shared/src/api-client.ts` for the API contract.
final class APIClient: Sendable {

    private let baseURL: String
    private let session: URLSession
    private let getToken: @Sendable () -> String?

    /// JSON decoder configured for snake_case API responses.
    private static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }()

    /// JSON encoder for request bodies.
    private static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        return encoder
    }()

    /// Creates an API client with the given base URL and token provider.
    ///
    /// - Parameters:
    ///   - baseURL: The CalTodo web app URL (e.g. "https://caltodo.vercel.app").
    ///   - getToken: Closure that returns the current Supabase access token.
    ///   - session: URLSession to use for requests. Defaults to `.shared`.
    init(baseURL: String, getToken: @escaping @Sendable () -> String?, session: URLSession = .shared) {
        self.baseURL = baseURL.hasSuffix("/") ? String(baseURL.dropLast()) : baseURL
        self.getToken = getToken
        self.session = session
    }

    // MARK: - Tasks

    /// Fetches all non-dismissed tasks for the authenticated user.
    ///
    /// - Returns: Array of CalTask objects.
    /// - Throws: `APIError` on failure.
    func getTasks() async throws -> [CalTask] {
        return try await request(path: "/api/mobile/tasks", method: "GET")
    }

    /// Creates a new task.
    ///
    /// - Parameter task: The task fields to create.
    /// - Returns: The created CalTask.
    /// - Throws: `APIError` on failure.
    func createTask(_ task: TaskInsert) async throws -> CalTask {
        return try await request(path: "/api/mobile/tasks", method: "POST", body: task)
    }

    /// Updates an existing task.
    ///
    /// - Parameters:
    ///   - id: The task ID to update.
    ///   - updates: The fields to update.
    /// - Returns: The updated CalTask.
    /// - Throws: `APIError` on failure.
    func updateTask(id: String, updates: TaskUpdate) async throws -> CalTask {
        return try await request(path: "/api/mobile/tasks/\(id)", method: "PATCH", body: updates)
    }

    /// Deletes (soft-dismisses) a task.
    ///
    /// - Parameter id: The task ID to delete.
    /// - Throws: `APIError` on failure.
    func deleteTask(id: String) async throws {
        let _: DeleteResponse = try await request(path: "/api/mobile/tasks/\(id)", method: "DELETE")
    }

    // MARK: - Private

    /// Makes an authenticated request to the API.
    ///
    /// - Parameters:
    ///   - path: API path (e.g. "/api/mobile/tasks").
    ///   - method: HTTP method (GET, POST, PATCH, DELETE).
    ///   - body: Optional Encodable body for POST/PATCH requests.
    /// - Returns: Decoded response of type `T`.
    /// - Throws: `APIError` on failure.
    private func request<T: Decodable>(path: String, method: String, body: (any Encodable)? = nil) async throws -> T {
        guard let token = getToken() else {
            AppLogger.api.error("No auth token available for \(method) \(path)")
            throw APIError.unauthorized
        }

        guard let url = URL(string: "\(baseURL)\(path)") else {
            AppLogger.api.error("Invalid URL: \(self.baseURL)\(path)")
            throw APIError.invalidURL(path: path)
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        if let body {
            request.httpBody = try Self.encoder.encode(body)
        }

        AppLogger.api.info("\(method) \(path)")

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            AppLogger.api.error("Network error for \(method) \(path): \(error.localizedDescription)")
            throw APIError.networkError(underlying: error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(underlying: URLError(.badServerResponse))
        }

        AppLogger.api.info("\(method) \(path) -> \(httpResponse.statusCode)")

        guard (200...299).contains(httpResponse.statusCode) else {
            let message = parseErrorMessage(from: data) ?? "Request failed"
            if httpResponse.statusCode == 401 {
                throw APIError.unauthorized
            }
            throw APIError.serverError(statusCode: httpResponse.statusCode, message: message)
        }

        do {
            return try Self.decoder.decode(T.self, from: data)
        } catch {
            AppLogger.api.error("Decoding error for \(method) \(path): \(error.localizedDescription)")
            throw APIError.decodingError(underlying: error)
        }
    }

    /// Attempts to extract an error message from a JSON error response.
    ///
    /// - Parameter data: Response body data.
    /// - Returns: Error message string if parseable, nil otherwise.
    private func parseErrorMessage(from data: Data) -> String? {
        struct ErrorBody: Decodable {
            let error: String?
            let message: String?
        }
        let body = try? JSONDecoder().decode(ErrorBody.self, from: data)
        return body?.error ?? body?.message
    }
}

/// Response type for DELETE operations.
private struct DeleteResponse: Decodable {
    let success: Bool
}
