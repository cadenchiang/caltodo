import SwiftUI

/// Manages toast notifications with optional undo actions.
/// Auto-dismisses after 6 seconds. Only one toast shown at a time.
///
/// - SeeAlso: `ToastView` for the visual overlay.
final class ToastManager: ObservableObject {

    /// A toast notification with message and optional undo capability.
    struct Toast: Equatable {
        let id = UUID()
        let message: String
        let hasUndo: Bool

        static func == (lhs: Toast, rhs: Toast) -> Bool {
            lhs.id == rhs.id
        }
    }

    /// The currently displayed toast, or nil.
    @Published var currentToast: Toast?

    /// Undo closure for the current toast.
    private var undoAction: (() -> Void)?

    /// Work item for auto-dismiss timer.
    private var dismissWorkItem: DispatchWorkItem?

    /// Shows a toast with an optional undo button.
    ///
    /// - Parameters:
    ///   - message: Text to display.
    ///   - undoAction: Closure called when "undo" is tapped, or nil for no undo button.
    @MainActor
    func showToast(message: String, undoAction: (() -> Void)? = nil) {
        dismissWorkItem?.cancel()
        self.undoAction = undoAction

        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
            currentToast = Toast(message: message, hasUndo: undoAction != nil)
        }

        let workItem = DispatchWorkItem { [weak self] in
            DispatchQueue.main.async {
                self?.dismiss()
            }
        }
        dismissWorkItem = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + 6, execute: workItem)

        AppLogger.ui.info("Toast shown: \(message)")
    }

    /// Dismisses the current toast immediately.
    @MainActor
    func dismiss() {
        dismissWorkItem?.cancel()
        withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) {
            currentToast = nil
        }
        undoAction = nil
    }

    /// Executes the undo action and dismisses the toast.
    @MainActor
    func performUndo() {
        undoAction?()
        dismiss()
        AppLogger.ui.info("Toast undo performed")
    }
}

/// Toast overlay that slides up from the bottom.
/// Attach to the root view with `.overlay(alignment: .bottom)`.
///
/// Shows a pill-shaped notification with a checkmark, message, and optional
/// orange "undo" button. Auto-dismisses after 6 seconds via ToastManager.
struct ToastView: View {
    @EnvironmentObject var toastManager: ToastManager

    var body: some View {
        if let toast = toastManager.currentToast {
            HStack(spacing: 10) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.green500)

                Text(toast.message)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.foreground)
                    .lineLimit(1)

                if toast.hasUndo {
                    Button {
                        HapticManager.light()
                        toastManager.performUndo()
                    } label: {
                        Text("undo")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(Color(hex: "#F97316"))
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(AppColors.card)
            .clipShape(Capsule())
            .shadow(color: .black.opacity(0.12), radius: 10, y: 4)
            .padding(.horizontal, 20)
            .padding(.bottom, 100)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        }
    }
}
