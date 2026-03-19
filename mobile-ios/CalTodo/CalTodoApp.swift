import SwiftUI
import Supabase

/// Entry point for the CalTodo iOS app.
/// Configures the Supabase client, injects environment objects,
/// and routes between LoginView and MainTabView based on auth state.
@main
struct CalTodoApp: App {
    @StateObject private var authManager: AuthManager
    @StateObject private var taskStore: TaskStore
    @State private var onboardingComplete = UserDefaults.standard.bool(forKey: "onboarding_completed")
    @State private var isReady = false

    init() {
        let urlString = Configuration.supabaseURL
        let anonKey = Configuration.supabaseAnonKey

        print("[CalTodoApp] SUPABASE_URL = '\(urlString)'")
        print("[CalTodoApp] SUPABASE_ANON_KEY = '\(anonKey.prefix(20))...'")
        print("[CalTodoApp] API_BASE_URL = '\(Configuration.apiBaseURL)'")

        guard let url = URL(string: urlString) else {
            fatalError("[CalTodoApp] Invalid SUPABASE_URL: '\(urlString)'. Check Config.xcconfig.")
        }

        let client = SupabaseClient(
            supabaseURL: url,
            supabaseKey: anonKey
        )
        let auth = AuthManager(client: client)
        _authManager = StateObject(wrappedValue: auth)
        _taskStore = StateObject(wrappedValue: TaskStore(authManager: auth))
        print("[CalTodoApp] Init complete")
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if !isReady {
                    // Show loading while checking session
                    VStack(spacing: 16) {
                        ProgressView()
                        Text("loading...")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                } else if !authManager.isAuthenticated {
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
                print("[CalTodoApp] Checking session...")
                await authManager.checkExistingSession()
                print("[CalTodoApp] Session check done, isAuthenticated=\(authManager.isAuthenticated)")
                isReady = true
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
    /// Supabase project URL, constructed from SUPABASE_HOST in Config.xcconfig.
    /// xcconfig treats // as comments, so we store host-only and prepend https://.
    static let supabaseURL: String = {
        guard let host = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_HOST") as? String,
              !host.isEmpty else {
            fatalError("Missing SUPABASE_HOST in Info.plist. Add it via Config.xcconfig.")
        }
        return "https://\(host)"
    }()

    /// Supabase anonymous key for client-side auth.
    static let supabaseAnonKey: String = {
        guard let value = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String,
              !value.isEmpty else {
            fatalError("Missing SUPABASE_ANON_KEY in Info.plist. Add it via Config.xcconfig.")
        }
        return value
    }()

    /// Base URL for CalTodo API, constructed from API_HOST in Config.xcconfig.
    static let apiBaseURL: String = {
        guard let host = Bundle.main.object(forInfoDictionaryKey: "API_HOST") as? String,
              !host.isEmpty else {
            fatalError("Missing API_HOST in Info.plist. Add it via Config.xcconfig.")
        }
        return "https://\(host)"
    }()
}
