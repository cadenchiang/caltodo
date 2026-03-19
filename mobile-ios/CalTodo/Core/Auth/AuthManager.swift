import Foundation
import Supabase
import AuthenticationServices

/// Manages Supabase authentication state including Google OAuth sign-in,
/// session persistence, and token refresh.
///
/// Uses `ObservableObject` + `@Published` for iOS 16+ compatibility.
/// The Supabase SDK handles Keychain storage and automatic token refresh.
///
/// - SeeAlso: `mobile/app/login.tsx` for the React Native OAuth flow reference.
final class AuthManager: ObservableObject {

    // MARK: - Public State

    /// Whether the user has an active, valid session.
    @Published var isAuthenticated = false

    /// Whether an auth operation is in progress.
    @Published var isLoading = false

    /// Human-readable error message from the last failed operation, or nil.
    @Published var errorMessage: String?

    /// The current user's display name (from Google profile), or nil.
    var userName: String? {
        client.auth.currentSession?.user.userMetadata["full_name"]?.stringValue
    }

    /// The current user's email address, or nil.
    var userEmail: String? {
        client.auth.currentSession?.user.email
    }

    /// The current user's avatar URL (from Google profile), or nil.
    var avatarURL: URL? {
        guard let urlString = client.auth.currentSession?.user.userMetadata["avatar_url"]?.stringValue else {
            return nil
        }
        return URL(string: urlString)
    }

    /// The current access token for API requests, or nil.
    var accessToken: String? {
        client.auth.currentSession?.accessToken
    }

    // MARK: - Private

    let client: SupabaseClient

    /// Auth state listener task, kept alive for the app's lifetime.
    private var authListenerTask: Task<Void, Never>?

    // MARK: - Init

    /// Creates an AuthManager with the given Supabase client.
    ///
    /// - Parameter client: A configured SupabaseClient instance.
    init(client: SupabaseClient) {
        self.client = client
        startAuthListener()
        AppLogger.auth.info("AuthManager initialized")
    }

    deinit {
        authListenerTask?.cancel()
    }

    // MARK: - Auth Listener

    /// Listens to Supabase auth state changes and updates `isAuthenticated`.
    private func startAuthListener() {
        authListenerTask = Task { [weak self] in
            guard let self else { return }
            for await (event, session) in self.client.auth.authStateChanges {
                await MainActor.run {
                    let wasAuthenticated = self.isAuthenticated
                    self.isAuthenticated = session != nil
                    AppLogger.auth.info("Auth event: \(event.rawValue), session: \(session != nil)")
                    if wasAuthenticated && !self.isAuthenticated {
                        AppLogger.auth.info("User signed out")
                    }
                }
            }
        }
    }

    // MARK: - Google OAuth

    /// Initiates Google OAuth sign-in via ASWebAuthenticationSession.
    ///
    /// - Throws: Sets `errorMessage` on failure. Does not throw.
    @MainActor
    func signInWithGoogle() async {
        isLoading = true
        errorMessage = nil
        AppLogger.auth.info("Starting Google OAuth sign-in")

        do {
            try await client.auth.signInWithOAuth(
                provider: .google,
                redirectTo: URL(string: "caltodo://auth/callback")
            )
            AppLogger.auth.info("Google OAuth completed successfully")
        } catch {
            AppLogger.auth.error("Google OAuth failed: \(error.localizedDescription)")
            errorMessage = "Sign-in failed. Please try again."
        }

        isLoading = false
    }

    // MARK: - Sign Out

    /// Signs out the current user and clears the session.
    @MainActor
    func signOut() async {
        AppLogger.auth.info("Signing out user")
        do {
            try await client.auth.signOut()
            isAuthenticated = false
            AppLogger.auth.info("Sign out successful")
        } catch {
            AppLogger.auth.error("Sign out failed: \(error.localizedDescription)")
            errorMessage = "Failed to sign out. Please try again."
        }
    }

    // MARK: - Session Check

    /// Checks for an existing session on app launch.
    @MainActor
    func checkExistingSession() async {
        AppLogger.auth.info("Checking for existing session")
        do {
            let session = try await client.auth.session
            isAuthenticated = true
            AppLogger.auth.info("Existing session found for user: \(session.user.email ?? "unknown")")
        } catch {
            isAuthenticated = false
            AppLogger.auth.info("No existing session found")
        }
    }
}

// MARK: - AnyJSON String Helper

private extension AnyJSON {
    /// Extracts a string value from AnyJSON.
    var stringValue: String? {
        switch self {
        case .string(let value):
            return value
        default:
            return nil
        }
    }
}
