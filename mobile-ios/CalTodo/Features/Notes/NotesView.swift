import SwiftUI

/// Notes placeholder — native implementation coming next.
struct NotesView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "note.text")
                .font(.system(size: 40, weight: .thin))
                .foregroundStyle(AppColors.subtleForeground)
            Text("Notes Coming Soon")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(AppColors.mutedForeground)
            Text("Synced notes with folders are being built")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.subtleForeground)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.background)
    }
}
