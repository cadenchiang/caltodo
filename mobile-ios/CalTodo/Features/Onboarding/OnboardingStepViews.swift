import SwiftUI

/// Single onboarding screen — connect sources or skip.
/// Opens web setup flows in browser for each integration.
struct OnboardingSourcesStep: View {
    let onComplete: () -> Void
    @State private var visible = false

    private let sources: [(id: String, logo: String, title: String, desc: String, path: String)] = [
        ("canvas", "CanvasLogo", "bCourses", "Auto-import from Canvas", "canvas"),
        ("gradescope", "GradescopeLogo", "Gradescope", "Sync homework & exams", "gradescope"),
        ("pensieve", "PensieveLogo", "Pensieve", "Import via iCal feed", "pensieve"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Logo
            Image("Logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 48, height: 48)
                .opacity(visible ? 1 : 0)
                .padding(.bottom, 20)

            Text("Connect Your Sources")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(AppColors.foreground)
                .opacity(visible ? 1 : 0)
                .padding(.bottom, 4)

            Text("You can always do this later in Settings")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.mutedForeground)
                .opacity(visible ? 1 : 0)
                .padding(.bottom, 28)

            // Source cards
            VStack(spacing: 8) {
                ForEach(sources, id: \.id) { src in
                    Button {
                        HapticManager.light()
                        let u = "https://caltodo.vercel.app/app/onboarding?setup=\(src.path)"
                        if let url = URL(string: u) { UIApplication.shared.open(url) }
                    } label: {
                        HStack(spacing: 12) {
                            Image(src.logo)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 20, height: 20)
                            VStack(alignment: .leading, spacing: 1) {
                                Text(src.title)
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundStyle(AppColors.foreground)
                                Text(src.desc)
                                    .font(.system(size: 12))
                                    .foregroundStyle(AppColors.mutedForeground)
                            }
                            Spacer()
                            Text("Connect")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundStyle(AppColors.blue500)
                        }
                        .padding(14)
                        .background(AppColors.card)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(AppColors.border, lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                    .opacity(visible ? 1 : 0)
                }
            }

            Spacer()

            // Continue button
            Button(action: onComplete) {
                Text("Continue")
                    .font(.system(size: 15, weight: .semibold))
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(AppColors.foreground)
                    .foregroundStyle(AppColors.background)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .opacity(visible ? 1 : 0)

            // Skip link
            Button {
                onComplete()
            } label: {
                Text("Skip for Now")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.mutedForeground)
            }
            .padding(.top, 12)
            .opacity(visible ? 1 : 0)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 32)
        .background(AppColors.background)
        .onAppear {
            withAnimation(.easeOut(duration: 0.35)) { visible = true }
        }
    }
}
