import SwiftUI
import Supabase

/// Entry point for the CalTodo iOS app.
/// Configures the Supabase client, injects environment objects,
/// and routes between LoginView and MainTabView based on auth state.
///
/// URL scheme `caltodo://` is configured in Info.plist for OAuth callbacks.
@main
struct CalTodoApp: App {
    /// Manages auth state, Google OAuth, and session persistence.
    @StateObject private var authManager: AuthManager

    /// Manages task data, CRUD operations, and optimistic updates.
    @StateObject private var taskStore: TaskStore

    /// Whether onboarding has been completed (persisted in UserDefaults).
    @State private var onboardingComplete = UserDefaults.standard.bool(forKey: "onboarding_completed")

    init() {
        let client = SupabaseClient(
            supabaseURL: URL(string: Configuration.supabaseURL)!,
            supabaseKey: Configuration.supabaseAnonKey
        )
        let auth = AuthManager(client: client)
        _authManager = StateObject(wrappedValue: auth)
        _taskStore = StateObject(wrappedValue: TaskStore(authManager: auth))
        AppLogger.app.info("CalTodoApp initialized")
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if !authManager.isAuthenticated {
                    LoginView()
                } else if !onboardingComplete {
                    OnboardingView(isComplete: $onboardingComplete)
                } else {
                    MainTabView()
                }
            }
            .environmentObject(authManager)
            .environmentObject(taskStore)
            .onOpenURL { url in
                AppLogger.auth.info("Received deep link: \(url.absoluteString)")
            }
            .task {
                await authManager.checkExistingSession()
            }
            .onReceive(authManager.$isAuthenticated) { isAuth in
                if isAuth {
                    Task { await taskStore.fetchTasks() }
                }
            }
        }
    }
}

// MARK: - Configuration

/// App configuration loaded from Info.plist via Config.xcconfig.
///
/// - Important: Never commit actual keys to source control.
enum Configuration {
    /// Supabase project URL (e.g. "https://xxx.supabase.co").
    static let supabaseURL: String = {
        guard let value = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String,
              !value.isEmpty else {
            fatalError("Missing SUPABASE_URL in Info.plist. Add it via Config.xcconfig.")
        }
        return value
    }()

    /// Supabase anonymous key for client-side auth.
    static let supabaseAnonKey: String = {
        guard let value = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String,
              !value.isEmpty else {
            fatalError("Missing SUPABASE_ANON_KEY in Info.plist. Add it via Config.xcconfig.")
        }
        return value
    }()

    /// Base URL for CalTodo API (e.g. "https://caltodo.vercel.app").
    static let apiBaseURL: String = {
        guard let value = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
              !value.isEmpty else {
            fatalError("Missing API_BASE_URL in Info.plist. Add it via Config.xcconfig.")
        }
        return value
    }()
}
