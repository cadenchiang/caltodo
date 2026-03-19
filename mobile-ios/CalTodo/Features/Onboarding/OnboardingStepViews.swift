import SwiftUI

// MARK: - Shared Button (matches Sleep Tracker's onboarding button style)

/// Reusable onboarding action button.
/// White bg, black text, 50pt height, 14pt corner radius — Sleep Tracker pattern.
private func onboardingButton(_ title: String, action: @escaping () -> Void) -> some View {
    Button(action: action) {
        Text(title)
            .font(.subheadline)
            .fontWeight(.semibold)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(AppColors.foreground)
            .foregroundStyle(AppColors.background)
            .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

// MARK: - Step 0: Welcome (Animated, inspired by Sleep Tracker's moon welcome)

/// Welcome screen with staggered fade-in animations.
/// Icon glow pulse, title slide-up, subtitle fade, delayed button appearance.
struct OnboardingWelcomeStep: View {
    let onNext: () -> Void

    @State private var iconVisible = false
    @State private var titleVisible = false
    @State private var subtitleVisible = false
    @State private var buttonVisible = false
    @State private var iconGlow = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Logo with glow effect (matches Sleep Tracker's moon pattern)
            ZStack {
                // Glow layer
                Image(systemName: "checkmark.square.fill")
                    .font(.system(size: 72, weight: .thin))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [AppColors.blue500.opacity(0.6), AppColors.blue400.opacity(0.3)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .blur(radius: iconGlow ? 20 : 10)
                    .scaleEffect(iconGlow ? 1.1 : 1.0)

                // Main icon
                Image(systemName: "checkmark.square.fill")
                    .font(.system(size: 72, weight: .thin))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [AppColors.blue500, AppColors.blue400],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
            .opacity(iconVisible ? 1 : 0)
            .scaleEffect(iconVisible ? 1 : 0.8)
            .padding(.bottom, 32)

            // Title
            Text("welcome to caltodo")
                .font(.system(size: 32, weight: .light, design: .rounded))
                .foregroundStyle(AppColors.foreground)
                .opacity(titleVisible ? 1 : 0)
                .offset(y: titleVisible ? 0 : 10)
                .padding(.bottom, 12)

            // Subtitle
            Text("all your deadlines,\none calendar.")
                .font(.subheadline)
                .foregroundStyle(AppColors.mutedForeground)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .opacity(subtitleVisible ? 1 : 0)
                .offset(y: subtitleVisible ? 0 : 10)

            Spacer()

            // Get Started button — delayed appearance
            onboardingButton("Get Started", action: onNext)
                .opacity(buttonVisible ? 1 : 0)
                .offset(y: buttonVisible ? 0 : 20)
        }
        .padding(.horizontal, 32)
        .padding(.bottom, 40)
        .onAppear { startAnimations() }
    }

    private func startAnimations() {
        iconVisible = false
        titleVisible = false
        subtitleVisible = false
        buttonVisible = false
        iconGlow = false

        withAnimation(.easeOut(duration: 1.2)) {
            iconVisible = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            withAnimation(.easeOut(duration: 1.0)) {
                titleVisible = true
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            withAnimation(.easeOut(duration: 1.0)) {
                subtitleVisible = true
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            withAnimation(.easeInOut(duration: 2.5).repeatForever(autoreverses: true)) {
                iconGlow = true
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            withAnimation(.easeOut(duration: 0.8)) {
                buttonVisible = true
            }
        }
    }
}

// MARK: - Step 1: How It Works (Staggered rows, Sleep Tracker pattern)

/// Educational step showing app features with staggered reveal animation.
struct OnboardingHowItWorksStep: View {
    let onNext: () -> Void
    @State private var showRows: [Bool] = [false, false, false, false]

    private let features: [(icon: String, title: String, desc: String)] = [
        ("tray.fill", "Unified Inbox", "All your assignments from every source in one place"),
        ("arrow.triangle.2.circlepath", "Auto-Sync", "Automatically imports from bCourses & Gradescope"),
        ("calendar", "Calendar View", "See deadlines on a visual calendar with Google Calendar"),
        ("bell.badge.fill", "Never Miss Due Dates", "Smart reminders and daily email digests"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            Text("how caltodo works")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundStyle(AppColors.foreground)
                .padding(.bottom, 32)

            VStack(spacing: 24) {
                ForEach(Array(features.enumerated()), id: \.offset) { index, feature in
                    HowItWorksRow(
                        icon: feature.icon,
                        title: feature.title,
                        description: feature.desc,
                        isVisible: showRows[index]
                    )
                }
            }

            Spacer()

            onboardingButton("Next", action: onNext)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 28)
        .onAppear {
            for i in 0..<4 {
                DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.5) {
                    withAnimation(.easeOut(duration: 0.5)) {
                        showRows[i] = true
                    }
                }
            }
        }
    }
}

/// Feature row with icon circle + title + description.
/// Matches Sleep Tracker's HowItWorksRow exactly.
private struct HowItWorksRow: View {
    let icon: String
    let title: String
    let description: String
    let isVisible: Bool

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(AppColors.blue500.opacity(0.1))
                    .frame(width: 50, height: 50)

                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundStyle(AppColors.blue500)
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(AppColors.foreground)

                Text(description)
                    .font(.caption)
                    .foregroundStyle(AppColors.mutedForeground)
            }

            Spacer()
        }
        .opacity(isVisible ? 1 : 0)
        .offset(y: isVisible ? 0 : 10)
    }
}

// MARK: - Step 2: Sources Selection (Card selection, Sleep Tracker pattern)

/// Shows the assignment sources CalTodo supports.
/// Single-select cards with haptics and blue selection state.
struct OnboardingSourcesStep: View {
    let onNext: () -> Void
    @State private var selectedSources: Set<String> = []

    private let sources: [(id: String, icon: String, title: String, desc: String)] = [
        ("canvas", "book.closed.fill", "bCourses / Canvas", "Auto-import assignments"),
        ("gradescope", "doc.text.magnifyingglass", "Gradescope", "Track homework & exams"),
        ("pensieve", "brain.head.profile", "Pensieve", "Import via iCal feed"),
        ("manual", "plus.circle.fill", "Manual Tasks", "Add your own deadlines"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            Image(systemName: "square.stack.3d.up.fill")
                .font(.system(size: 36))
                .foregroundStyle(AppColors.blue500)
                .padding(.bottom, 12)

            Text("Where Are Your Assignments?")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundStyle(AppColors.foreground)
                .padding(.bottom, 4)

            Text("Select all that apply — you can set these up later")
                .font(.caption2)
                .foregroundStyle(AppColors.mutedForeground)
                .padding(.bottom, 20)

            VStack(spacing: 8) {
                ForEach(sources, id: \.id) { source in
                    let isSelected = selectedSources.contains(source.id)

                    Button {
                        HapticManager.soft()
                        if isSelected {
                            selectedSources.remove(source.id)
                        } else {
                            selectedSources.insert(source.id)
                        }
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: source.icon)
                                .font(.system(size: 16))
                                .foregroundStyle(AppColors.blue500)
                                .frame(width: 24)

                            VStack(alignment: .leading, spacing: 1) {
                                Text(source.title)
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundStyle(AppColors.foreground)

                                Text(source.desc)
                                    .font(.caption2)
                                    .foregroundStyle(AppColors.mutedForeground)
                            }

                            Spacer()

                            if isSelected {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.caption)
                                    .foregroundStyle(AppColors.blue500)
                            }
                        }
                        .padding(12)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(isSelected ? AppColors.blue500.opacity(0.08) : AppColors.card)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(
                                    isSelected ? AppColors.blue500 : Color.gray.opacity(0.25),
                                    lineWidth: 1
                                )
                        )
                    }
                    .buttonStyle(.plain)
                }
            }

            Spacer()

            onboardingButton("Continue", action: onNext)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 28)
    }
}

// MARK: - Step 3: Social Proof (Feature highlights)

/// Trust indicators and feature highlights.
struct OnboardingSocialProofStep: View {
    let onNext: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            Image(systemName: "person.3.fill")
                .font(.system(size: 40, weight: .light))
                .foregroundStyle(AppColors.blue500)
                .padding(.bottom, 16)

            Text("Built for Students")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundStyle(AppColors.foreground)
                .padding(.bottom, 4)

            Text("Everything you need to stay on top of deadlines")
                .font(.caption2)
                .foregroundStyle(AppColors.mutedForeground)
                .padding(.bottom, 28)

            VStack(spacing: 16) {
                proofItem(icon: "bolt.fill", text: "Auto-sync from bCourses, Gradescope & Pensieve")
                proofItem(icon: "calendar.badge.clock", text: "Google Calendar two-way integration")
                proofItem(icon: "envelope.fill", text: "Daily email digest so you never miss a deadline")
                proofItem(icon: "paintbrush.fill", text: "12+ beautiful themes to make it yours")
            }

            Spacer()

            onboardingButton("Continue", action: onNext)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 28)
    }

    private func proofItem(icon: String, text: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.blue500)
                .frame(width: 24)
            Text(text)
                .font(.caption)
                .foregroundStyle(AppColors.secondaryForeground)
            Spacer()
        }
    }
}

// MARK: - Step 4: Ready (Completion with celebration)

/// Final step — celebration and CTA to start using the app.
struct OnboardingReadyStep: View {
    let onComplete: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            Image(systemName: "sparkles")
                .font(.system(size: 56, weight: .light))
                .foregroundStyle(
                    LinearGradient(
                        colors: [AppColors.blue500, AppColors.blue400],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .padding(.bottom, 24)

            Text("you're all set!")
                .font(.system(size: 32, weight: .light, design: .rounded))
                .foregroundStyle(AppColors.foreground)
                .padding(.bottom, 12)

            Text("your deadlines are about to get\na whole lot more organized")
                .font(.subheadline)
                .foregroundStyle(AppColors.mutedForeground)
                .multilineTextAlignment(.center)
                .lineSpacing(4)

            Spacer()

            onboardingButton("Let's Go!", action: onComplete)
        }
        .padding(.horizontal, 32)
        .padding(.bottom, 40)
    }
}
