import SwiftUI

/// Notes view placeholder.
/// Will support task notes and descriptions in a future phase.
struct NotesView: View {
    var body: some View {
        EmptyStateView(
            icon: "note.text",
            message: "notes coming soon"
        )
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.background)
    }
}
