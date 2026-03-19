import SwiftUI

/// Notes view placeholder.
/// Will support task notes and descriptions in a future phase.
struct NotesView: View {
    var body: some View {
        VStack(spacing: 16) {
            EmptyStateView(
                icon: "note.text",
                message: "Notes coming soon"
            )
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.secondaryBackground)
        .navigationTitle("notes")
        .navigationBarTitleDisplayMode(.large)
    }
}
