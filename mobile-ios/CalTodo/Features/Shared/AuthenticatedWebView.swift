import SwiftUI
import WebKit

/// Authenticated WKWebView that injects Supabase session before loading.
/// Used for CalChat and Notes to get 1:1 web parity instantly.
struct AuthenticatedWebView: UIViewRepresentable {
    let url: URL
    let authManager: AuthManager

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true

        let coordinator = context.coordinator
        coordinator.targetURL = url
        coordinator.authManager = authManager

        // Step 1: Load the login page (real HTML page on the domain)
        // so we can inject localStorage before navigating to target
        let loginURL = URL(string: "https://caltodo.vercel.app/login")!
        webView.load(URLRequest(url: loginURL))

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    class Coordinator: NSObject, WKNavigationDelegate {
        var targetURL: URL?
        var authManager: AuthManager?
        private var hasInjectedAuth = false

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // After the login page finishes loading, inject auth and navigate
            guard !hasInjectedAuth else { return }
            hasInjectedAuth = true

            guard let session = authManager?.client.auth.currentSession else {
                AppLogger.ui.error("WebView: No session available")
                if let target = targetURL {
                    webView.load(URLRequest(url: target))
                }
                return
            }

            let token = session.accessToken
            let refresh = session.refreshToken
            let userId = session.user.id.uuidString.lowercased()
            let email = session.user.email ?? ""
            let expiresAt = Int(Date().timeIntervalSince1970) + 3600

            // Match the exact Supabase JS localStorage format
            let js = """
            (function() {
                var session = {
                    access_token: '\(token)',
                    refresh_token: '\(refresh)',
                    expires_at: \(expiresAt),
                    expires_in: 3600,
                    token_type: 'bearer',
                    user: { id: '\(userId)', email: '\(email)' }
                };
                localStorage.setItem('sb-dcoowflhqsfggtmnzxfn-auth-token', JSON.stringify(session));
                return 'ok';
            })();
            """

            webView.evaluateJavaScript(js) { [weak self] result, error in
                if let error {
                    AppLogger.ui.error("WebView auth injection failed: \(error.localizedDescription)")
                }
                // Step 2: Now navigate to the actual target URL
                if let target = self?.targetURL {
                    AppLogger.ui.info("WebView navigating to: \(target.absoluteString)")
                    webView.load(URLRequest(url: target))
                }
            }
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let requestURL = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }
            if requestURL.host == "caltodo.vercel.app" || requestURL.scheme == "about" {
                decisionHandler(.allow)
            } else {
                UIApplication.shared.open(requestURL)
                decisionHandler(.cancel)
            }
        }
    }
}
