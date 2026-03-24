import SwiftUI

/// Manages toast notifications with optional undo action.
final class ToastManager: ObservableObject {
    struct Toast: Equatable {
        let id = UUID()
        let message: String
        let hasUndo: Bool
        static func == (lhs: Toast, rhs: Toast) -> Bool { lhs.id == rhs.id }
    }

    @Published var currentToast: Toast?
    private var undoAction: (() -> Void)?
    private var dismissTimer: DispatchWorkItem?

    /// Shows a toast. If undoAction is provided, shows the undo button.
    func showToast(message: String, undoAction: (() -> Void)? = nil) {
        dismissTimer?.cancel()
        self.undoAction = undoAction
        withAnimation(.spring(response: 0.4, dampingFraction: 0.65)) {
            currentToast = Toast(message: message, hasUndo: undoAction != nil)
        }
        let timer = DispatchWorkItem { [weak self] in
            withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                self?.currentToast = nil
            }
            self?.undoAction = nil
        }
        dismissTimer = timer
        DispatchQueue.main.asyncAfter(deadline: .now() + 4, execute: timer)
        AppLogger.ui.info("Toast: \(message)")
    }

    func dismiss() {
        dismissTimer?.cancel()
        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            currentToast = nil
        }
        undoAction = nil
    }

    func performUndo() {
        undoAction?()
        dismiss()
        AppLogger.ui.info("Toast undo performed")
    }
}

/// Floating undo button — orange circle that slides in from left, same level as FAB.
/// No text, just a round temporary button with undo arrow icon.
struct ToastView: View {
    @EnvironmentObject var toastManager: ToastManager

    var body: some View {
        if let toast = toastManager.currentToast {
            HStack {
                if toast.hasUndo {
                    // Orange undo circle button — slides in from left
                    Button {
                        HapticManager.medium()
                        toastManager.performUndo()
                    } label: {
                        Image(systemName: "arrow.uturn.backward")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(width: 56, height: 56)
                            .background(Color(hex: "#F97316"))
                            .clipShape(Circle())
                            .shadow(color: Color(hex: "#F97316").opacity(0.4), radius: 8, y: 4)
                    }
                    .transition(.move(edge: .leading).combined(with: .opacity))
                } else {
                    // Simple checkmark pill for non-undo toasts
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 14))
                            .foregroundStyle(AppColors.green500)
                        Text(toast.message)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.foreground)
                            .lineLimit(1)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(AppColors.card)
                    .clipShape(Capsule())
                    .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                Spacer()
            }
            .padding(.leading, 20)
            .padding(.bottom, 20)
        }
    }
}
