import SwiftUI
import Supabase

/// Entry point for the CalTodo iOS app.
/// Configures the Supabase client, injects environment objects,
/// and routes between LoginView and MainTabView based on auth state.
@main
struct CalTodoApp: App {
    @StateObject private var authManager: AuthManager
    @StateObject private var taskStore: TaskStore
    @StateObject private var chatStore: ChatStore
    @StateObject private var toastManager = ToastManager()
    @State private var onboardingComplete = UserDefaults.standard.bool(forKey: "onboarding_completed")
    @State private var isReady = false
    @State private var loadingProgress: Double = 0
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
        // Register notification defaults so they work on first launch
        UserDefaults.standard.register(defaults: [
            "notif_task_reminders": true,
            "notif_remind_30m": true,
            "notif_remind_1d": true,
            "notif_remind_morning": true,
            "notif_overdue_alerts": true,
            "notif_daily_summary": true,
            "notif_calchat_messages": true,
            "notif_calchat_mentions": true,
        ])

        // Allow notifications to show while app is in foreground
        NotificationDelegate.shared.register()

        // Glassy translucent tab bar
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithDefaultBackground()
        tabBarAppearance.backgroundEffect = UIBlurEffect(style: .systemThinMaterial)
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance

        // Smaller large navigation title (24pt instead of default 34pt)
        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithDefaultBackground()
        navAppearance.largeTitleTextAttributes = [
            .font: UIFont.systemFont(ofSize: 28, weight: .bold)
        ]
        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance

        // Smaller search bar font + subtle icon
        UITextField.appearance(whenContainedInInstancesOf: [UISearchBar.self]).font = UIFont.systemFont(ofSize: 14)
        UISearchBar.appearance().setImage(
            UIImage(systemName: "magnifyingglass")?.withTintColor(.tertiaryLabel, renderingMode: .alwaysOriginal),
            for: .search, state: .normal
        )

        guard let url = URL(string: Configuration.supabaseURL) else {
            fatalError("Invalid SUPABASE_URL. Check Config.xcconfig.")
        }

        let client = SupabaseClient(
            supabaseURL: url,
            supabaseKey: Configuration.supabaseAnonKey,
            options: .init(auth: .init(autoRefreshToken: true))
        )
        let auth = AuthManager(client: client)
        _authManager = StateObject(wrappedValue: auth)
        _taskStore = StateObject(wrappedValue: TaskStore(authManager: auth))
        _chatStore = StateObject(wrappedValue: ChatStore(authManager: auth))
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if !isReady {
                    ZStack {
                        Color.black.ignoresSafeArea()
                        VStack(spacing: 28) {
                            Image("Logo")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 56, height: 56)
                            // Progress bar that fills smoothly to 100%
                            GeometryReader { geo in
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(AppColors.accent)
                                    .frame(width: geo.size.width * loadingProgress, height: 3)
                            }
                            .frame(width: 120, height: 3)
                            .background(Color(hex: "#1C1C1E"))
                            .clipShape(RoundedRectangle(cornerRadius: 2))
                        }
                    }
                    .transition(.opacity)
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
            .environmentObject(chatStore)
            .environmentObject(toastManager)
            .overlay(alignment: .bottom) {
                ToastView()
                    .environmentObject(toastManager)
            }
            .preferredColorScheme(colorScheme)
            .observeThemeColorScheme()
            .onOpenURL { url in
                AppLogger.auth.info("Received deep link: \(url.absoluteString)")
            }
            .task {
                taskStore.toastManager = toastManager

                // Animate progress: 0 → 60% while checking session
                withAnimation(.easeOut(duration: 0.6)) { loadingProgress = 0.6 }
                await authManager.checkExistingSession()

                // 60% → 100%
                withAnimation(.easeOut(duration: 0.4)) { loadingProgress = 1.0 }

                // Auto-skip onboarding if we have cached tasks
                if authManager.isAuthenticated && !onboardingComplete && !taskStore.tasks.isEmpty {
                    UserDefaults.standard.set(true, forKey: "onboarding_completed")
                    onboardingComplete = true
                }

                // Brief pause at 100% so user sees it complete
                try? await Task.sleep(nanoseconds: 200_000_000)

                // Fade out loading screen
                withAnimation(.easeOut(duration: 0.3)) { isReady = true }

                // Background refresh silently
                if authManager.isAuthenticated {
                    async let t: () = taskStore.fetchTasks()
                    async let c: () = taskStore.fetchCredentials()
                    async let b: () = chatStore.fetchBoards()
                    _ = await (t, c, b)
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
