import SwiftUI

/// CalChat board list — iMessage-style with group avatars and member count.
struct CalChatView: View {
    @EnvironmentObject var chatStore: ChatStore

    /// Deterministic gradient colors matching the web's GroupAvatar hash.
    private static let gradientPairs: [(Color, Color)] = [
        (Color(hex: "#3B82F6"), Color(hex: "#1D4ED8")),
        (Color(hex: "#8B5CF6"), Color(hex: "#6D28D9")),
        (Color(hex: "#EC4899"), Color(hex: "#BE185D")),
        (Color(hex: "#10B981"), Color(hex: "#047857")),
        (Color(hex: "#F59E0B"), Color(hex: "#D97706")),
        (Color(hex: "#EF4444"), Color(hex: "#B91C1C")),
        (Color(hex: "#06B6D4"), Color(hex: "#0E7490")),
        (Color(hex: "#F97316"), Color(hex: "#C2410C")),
        (Color(hex: "#14B8A6"), Color(hex: "#0F766E")),
        (Color(hex: "#A855F7"), Color(hex: "#7C3AED")),
    ]

    /// Simple hash matching the web's deterministic color assignment.
    private func colorPair(for name: String) -> (Color, Color) {
        var hash = 0
        for char in name.unicodeScalars { hash = hash &* 31 &+ Int(char.value) }
        let idx = abs(hash) % Self.gradientPairs.count
        return Self.gradientPairs[idx]
    }

    var body: some View {
        Group {
            if chatStore.isLoadingBoards && chatStore.boards.isEmpty {
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if chatStore.boards.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "bubble.left.and.bubble.right")
                        .font(.system(size: 40, weight: .thin))
                        .foregroundStyle(AppColors.subtleForeground)
                    Text("No Chats Yet")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(AppColors.mutedForeground)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                boardList
            }
        }
        .background(Color.black)
        .task { await chatStore.fetchBoards() }
        .refreshable { await chatStore.refreshBoards() }
    }

    @State private var isEditMode = false

    private var boardList: some View {
        VStack(spacing: 0) {
            // Title + edit button
            HStack {
                Text("CalChat")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(.white)
                Spacer()
                Button {
                    withAnimation { isEditMode.toggle() }
                } label: {
                    Text(isEditMode ? "Done" : "Edit")
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.accent)
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 4)
            .padding(.bottom, 8)

            List {
                ForEach(chatStore.boards) { board in
                    NavigationLink {
                        ChatThreadView(courseId: board.course.id, courseName: board.course.name)
                            .environmentObject(chatStore)
                    } label: {
                        boardRow(board)
                    }
                    .listRowBackground(Color.black)
                    .listRowSeparatorTint(Color(hex: "#1C1C1E"))
                }
                .onMove { from, to in
                    chatStore.boards.move(fromOffsets: from, toOffset: to)
                }
            }
            .listStyle(.plain)
            .environment(\.editMode, .constant(isEditMode ? .active : .inactive))
        }
    }

    private func boardRow(_ board: DiscussionBoard) -> some View {
        let pair = colorPair(for: board.course.name)

        return HStack(spacing: 14) {
            // Group avatar — gradient circle matching web's GroupAvatar hash
            ZStack {
                Circle()
                    .fill(LinearGradient(colors: [pair.0, pair.1], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 52, height: 52)

                Text(abbreviation(for: board.course.name))
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(board.course.name)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .lineLimit(1)

                Text(board.memberCount > 0 ? "\(board.memberCount) members" : "Group Chat")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.mutedForeground)
                    .lineLimit(1)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color(hex: "#3A3A3C"))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    /// Creates a 2-letter abbreviation from a course name.
    private func abbreviation(for name: String) -> String {
        let words = name.split(separator: " ")
        if words.count >= 2 {
            return String(words[0].prefix(1) + words[1].prefix(1)).uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}
