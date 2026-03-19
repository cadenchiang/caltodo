import Foundation

/// Typed error enum for CalTodo API operations.
/// Provides structured error information for logging and user-facing messages.
///
/// - SeeAlso: `packages/shared/src/api-client.ts` for error handling patterns.
enum APIError: LocalizedError {
    /// No auth token available — user needs to sign in.
    case unauthorized

    /// Server returned a non-2xx status code.
    /// - Parameters:
    ///   - statusCode: HTTP status code
    ///   - message: Server-provided error message
    case serverError(statusCode: Int, message: String)

    /// Network error (no connectivity, timeout, DNS failure).
    case networkError(underlying: Error)

    /// Response body could not be decoded.
    case decodingError(underlying: Error)

    /// Request URL could not be constructed.
    case invalidURL(path: String)

    var errorDescription: String? {
        switch self {
        case .unauthorized:
            return "Authentication required. Please sign in again."
        case .serverError(let code, let message):
            return "Server error (\(code)): \(message)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Data error: \(error.localizedDescription)"
        case .invalidURL(let path):
            return "Invalid URL for path: \(path)"
        }
    }

    /// Whether this error indicates the user should be redirected to login.
    var requiresReauth: Bool {
        switch self {
        case .unauthorized:
            return true
        case .serverError(let code, _):
            return code == 401
        default:
            return false
        }
    }
}
