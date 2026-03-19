import SwiftUI

/// Calendar view placeholder.
/// Will integrate with Google Calendar events in a future phase.
struct CalendarView: View {
    var body: some View {
        VStack(spacing: 16) {
            EmptyStateView(
                icon: "calendar",
                message: "Calendar coming soon"
            )
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.secondaryBackground)
        .navigationTitle("calendar")
        .navigationBarTitleDisplayMode(.large)
    }
}
