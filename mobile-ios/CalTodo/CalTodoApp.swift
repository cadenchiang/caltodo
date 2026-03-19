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
    @AppStorage("appearance") private var appearance = "system"

    /// Converts the appearance string to a SwiftUI ColorScheme.
    private var colorScheme: ColorScheme? {
        switch appearance {
        case "light": return .light
        case "dark": return .dark
        default: return nil
        }
    }

    init() {
        guard let url = URL(string: Configuration.supabaseURL) else {
            fatalError("Invalid SUPABASE_URL. Check Config.xcconfig.")
        }

        let client = SupabaseClient(
            supabaseURL: url,
            supabaseKey: Configuration.supabaseAnonKey
        )
        let auth = AuthManager(client: client)
        _authManager = StateObject(wrappedValue: auth)
        _taskStore = StateObject(wrappedValue: TaskStore(authManager: auth))
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
            .preferredColorScheme(colorScheme)
            .onOpenURL { url in
                AppLogger.auth.info("Received deep link: \(url.absoluteString)")
            }
            .task {
                await authManager.checkExistingSession()
                isReady = true
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
    /// Uses http:// for localhost, https:// for production hosts.
    static let apiBaseURL: String = {
        guard let host = Bundle.main.object(forInfoDictionaryKey: "API_HOST") as? String,
              !host.isEmpty else {
            fatalError("Missing API_HOST in Info.plist. Add it via Config.xcconfig.")
        }
        let scheme = host.hasPrefix("localhost") ? "http" : "https"
        return "\(scheme)://\(host)"
    }()
}
