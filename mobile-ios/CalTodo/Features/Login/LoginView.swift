import SwiftUI

/// Login screen with branded caltodo design.
/// Bear cube logo, Google "G" image button, animated entrance.
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
                // Bear cube logo
                Image("Logo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 80, height: 80)
                    .opacity(iconVisible ? 1 : 0)
                    .scaleEffect(iconVisible ? 1 : 0.8)
                    .padding(.bottom, 24)

                // Brand
                Text("welcome to caltodo")
                    .font(.system(size: 28, weight: .bold))
                    .tracking(-0.5)
                    .foregroundStyle(AppColors.foreground)
                    .opacity(titleVisible ? 1 : 0)
                    .offset(y: titleVisible ? 0 : 10)
                    .padding(.bottom, 8)

                Text("all your deadlines, one calendar")
                    .font(.subheadline)
                    .foregroundStyle(AppColors.mutedForeground)
                    .multilineTextAlignment(.center)
                    .opacity(subtitleVisible ? 1 : 0)
                    .offset(y: subtitleVisible ? 0 : 10)
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

                // Google OAuth button with actual Google G logo
                Button {
                    HapticManager.medium()
                    Task { await authManager.signInWithGoogle() }
                } label: {
                    HStack(spacing: 12) {
                        if authManager.isLoading {
                            ProgressView().tint(.white)
                        } else {
                            Image("GoogleLogo")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 18, height: 18)
                            Text("continue with google")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundStyle(.white)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(.black)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(authManager.isLoading)
                .opacity(buttonVisible ? 1 : 0)
                .offset(y: buttonVisible ? 0 : 20)
            }
            .frame(maxWidth: 340)
            .padding(.horizontal, 32)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.background)
        .onAppear { startAnimations() }
    }

    /// Triggers staggered entrance animations for logo, title, subtitle, and button.
    private func startAnimations() {
        withAnimation(.easeOut(duration: 1.0)) { iconVisible = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            withAnimation(.easeOut(duration: 0.8)) { titleVisible = true }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            withAnimation(.easeOut(duration: 0.8)) { subtitleVisible = true }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            withAnimation(.easeOut(duration: 0.6)) { buttonVisible = true }
        }
    }
}
