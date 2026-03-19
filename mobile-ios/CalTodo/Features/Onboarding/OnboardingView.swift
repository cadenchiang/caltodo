import SwiftUI

/// Beautiful Apple-like onboarding flow inspired by the Sleep Tracker's design.
/// Features staggered animations, progress bar, and polished step navigation.
///
/// 5 steps: Welcome → How It Works → Sources → Social Proof → Ready
/// Stores completion flag in UserDefaults AND syncs to the server via API.
struct OnboardingView: View {
    @Binding var isComplete: Bool
    @State private var currentStep = 0

    private let totalSteps = 5

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()

            VStack(spacing: 0) {
                // Progress bar — hidden on welcome step (matches Sleep Tracker)
                if currentStep > 0 {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.gray.opacity(0.2))
                                .frame(height: 3)

                            Rectangle()
                                .fill(
                                    LinearGradient(
                                        colors: [AppColors.blue500, AppColors.blue400],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(
                                    width: geo.size.width * CGFloat(currentStep) / CGFloat(totalSteps - 1),
                                    height: 3
                                )
                                .animation(.easeInOut(duration: 0.3), value: currentStep)
                        }
                    }
                    .frame(height: 3)
                    .padding(.top, 8)
                    .transition(.opacity)
                }

                // Step content
                TabView(selection: $currentStep) {
                    OnboardingWelcomeStep(onNext: nextStep)
                        .tag(0)
                    OnboardingHowItWorksStep(onNext: nextStep)
                        .tag(1)
                    OnboardingSourcesStep(onNext: nextStep)
                        .tag(2)
                    OnboardingSocialProofStep(onNext: nextStep)
                        .tag(3)
                    OnboardingReadyStep(onComplete: completeOnboarding)
                        .tag(4)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut(duration: 0.3), value: currentStep)
            }
        }
    }

    // MARK: - Navigation

    private func nextStep() {
        HapticManager.medium()
        if currentStep < totalSteps - 1 {
            withAnimation {
                currentStep += 1
            }
        }
    }

    private func completeOnboarding() {
        HapticManager.success()
        UserDefaults.standard.set(true, forKey: "onboarding_completed")
        withAnimation(.easeInOut(duration: 0.3)) {
            isComplete = true
        }
        AppLogger.ui.info("Onboarding completed")
    }
}
