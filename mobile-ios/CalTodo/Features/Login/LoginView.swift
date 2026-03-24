import SwiftUI

/// Login screen matching the web's clean, snappy design.
/// Logo, title, subtitle, Google sign-in button — fast staggered entrance.
struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager

    @State private var iconVisible = false
    @State private var titleVisible = false
    @State private var subtitleVisible = false
    @State private var buttonVisible = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            VStack(spacing: 0) {
                // Logo
                Image("Logo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 56, height: 56)
                    .opacity(iconVisible ? 1 : 0)
                    .scaleEffect(iconVisible ? 1 : 0.9)
                    .padding(.bottom, 24)

                // Title
                Text("Welcome to caltodo")
                    .font(.system(size: 28, weight: .bold))
                    .tracking(-0.5)
                    .foregroundStyle(AppColors.foreground)
                    .opacity(titleVisible ? 1 : 0)
                    .offset(y: titleVisible ? 0 : -12)
                    .padding(.bottom, 8)

                // Subtitle
                Text("All your deadlines, one calendar")
                    .font(.subheadline)
                    .foregroundStyle(AppColors.mutedForeground)
                    .multilineTextAlignment(.center)
                    .opacity(subtitleVisible ? 1 : 0)
                    .offset(y: subtitleVisible ? 0 : -12)
                    .padding(.bottom, 40)

                // Error message
                if let error = authManager.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(AppColors.red400)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(AppColors.red500.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .padding(.bottom, 16)
                }

                // Google OAuth button — matches web: black bg, Google G logo, white text
                Button {
                    HapticManager.medium()
                    Task { await authManager.signInWithGoogle() }
                } label: {
                    HStack(spacing: 12) {
                        if authManager.isLoading {
                            ProgressView().tint(.white)
                        } else {
                            Image("GoogleLogo")
                                .renderingMode(.original)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 20, height: 20)
                            Text("Continue with Google")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(AppColors.background)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(AppColors.foreground)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(authManager.isLoading)
                .opacity(buttonVisible ? 1 : 0)
                .offset(y: buttonVisible ? 0 : 12)
                .scaleEffect(buttonVisible ? 1 : 0.97)
            }
            .frame(maxWidth: 340)
            .padding(.horizontal, 32)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.background)
        .onAppear { startAnimations() }
    }

    /// Fast staggered entrance — matches web's snappy drop-in (350-500ms).
    private func startAnimations() {
        withAnimation(.easeOut(duration: 0.35)) { iconVisible = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            withAnimation(.easeOut(duration: 0.35)) { titleVisible = true }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            withAnimation(.easeOut(duration: 0.35)) { subtitleVisible = true }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            withAnimation(.easeOut(duration: 0.35)) { buttonVisible = true }
        }
    }
}
