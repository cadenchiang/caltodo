import SwiftUI

/// iMessage-style chat thread with proper input bar positioning.
struct ChatThreadView: View {
    let courseId: String
    let courseName: String
    @EnvironmentObject var chatStore: ChatStore
    @EnvironmentObject var authManager: AuthManager
    @State private var messageText = ""
    @State private var isSending = false

    private var currentUserId: String? {
        authManager.client.auth.currentSession?.user.id.uuidString.lowercased()
    }

    var body: some View {
        VStack(spacing: 0) {
            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 2) {
                        if chatStore.isLoadingMessages && chatStore.messages.isEmpty {
                            ProgressView().padding(.vertical, 40)
                        }

                        ForEach(chatStore.messages) { msg in
                            messageBubble(msg).id(msg.id)
                        }
                    }
                    .padding(.horizontal, 10)
                    .padding(.top, 8)
                    .padding(.bottom, 8)
                }
                .scrollDismissesKeyboard(.interactively)
                .onChange(of: chatStore.messages.count) { _ in
                    scrollToBottom(proxy)
                }
            }

            // Input bar
            inputBar
        }
        .background(Color.black)
        .navigationTitle(courseName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .task { await chatStore.fetchMessages(courseId: courseId) }
    }

    private func scrollToBottom(_ proxy: ScrollViewProxy) {
        if let last = chatStore.messages.last {
            withAnimation(.easeOut(duration: 0.15)) {
                proxy.scrollTo(last.id, anchor: .bottom)
            }
        }
    }

    // MARK: - Message Bubble

    private func messageBubble(_ msg: ChatMessage) -> some View {
        let isOwn = msg.authorId == currentUserId
        let showName = !isOwn && shouldShowName(for: msg)

        return VStack(alignment: isOwn ? .trailing : .leading, spacing: 1) {
            if showName, let name = msg.authorName {
                Text(name)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(AppColors.mutedForeground)
                    .padding(.horizontal, 6)
            }

            HStack {
                if isOwn { Spacer(minLength: 64) }

                Text(msg.body)
                    .font(.system(size: 16))
                    .foregroundStyle(isOwn ? .white : .white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 9)
                    .background(isOwn ? Color(hex: "#007AFF") : Color(hex: "#1C1C1E"))
                    .clipShape(RoundedRectangle(cornerRadius: 18))

                if !isOwn { Spacer(minLength: 64) }
            }
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 1)
    }

    private func shouldShowName(for msg: ChatMessage) -> Bool {
        guard let idx = chatStore.messages.firstIndex(where: { $0.id == msg.id }) else { return true }
        if idx == 0 { return true }
        return chatStore.messages[idx - 1].authorId != msg.authorId
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        HStack(spacing: 8) {
            TextField("Message", text: $messageText, axis: .vertical)
                .font(.system(size: 16))
                .lineLimit(1...5)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color(hex: "#1C1C1E"))
                .clipShape(RoundedRectangle(cornerRadius: 20))

            if !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 30))
                        .foregroundStyle(Color(hex: "#007AFF"))
                }
                .disabled(isSending)
                .transition(.scale.combined(with: .opacity))
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .padding(.bottom, 2)
        .background(Color.black)
        .animation(.easeInOut(duration: 0.15), value: messageText.isEmpty)
    }

    private func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        HapticManager.light()
        isSending = true
        messageText = ""
        Task {
            await chatStore.sendMessage(body: text, courseId: courseId)
            isSending = false
        }
    }
}
