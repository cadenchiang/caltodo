import SwiftUI

/// Minimal onboarding — single screen to connect sources.
/// Only shown for new users (no integrations, no tasks).
/// Existing users detected at launch and skip straight to home.
struct OnboardingView: View {
    @Binding var isComplete: Bool
    @EnvironmentObject var taskStore: TaskStore

    var body: some View {
        OnboardingSourcesStep(onComplete: completeOnboarding)
    }

    private func completeOnboarding() {
        HapticManager.success()
        UserDefaults.standard.set(true, forKey: "onboarding_completed")
        withAnimation(.easeInOut(duration: 0.3)) {
            isComplete = true
        }
        Task { await taskStore.fetchTasks() }
        AppLogger.ui.info("Onboarding completed")
    }
}
