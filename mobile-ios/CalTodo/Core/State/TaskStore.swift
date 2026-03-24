import Foundation
import Combine
import Supabase

/// Central state manager for CalTodo tasks.
/// Uses direct Supabase queries with Row Level Security — the industry standard
/// approach recommended by Supabase. No API middleman needed.
final class TaskStore: ObservableObject {

    // MARK: - Public State

    @Published var tasks: [CalTask] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var integrations: IntegrationStatus?
    @Published var recentlyCompletedIds: Set<String> = []

    weak var toastManager: ToastManager?

    var activeTasks: [CalTask] {
        tasks.filter { !$0.completed || recentlyCompletedIds.contains($0.id) }
    }

    var completedTasks: [CalTask] {
        tasks.filter { $0.completed }
    }

    var todayTasks: [CalTask] {
        let today = DateFormatting.todayString()
        return activeTasks.filter { $0.dueDate == today }
    }

    var upcomingTasks: [CalTask] {
        let today = DateFormatting.todayString()
        let weekFromNow = DateFormatting.dateString(daysFromNow: 7)
        return activeTasks
            .filter { task in
                guard let due = task.dueDate else { return false }
                return due > today && due <= weekFromNow
            }
            .sorted { ($0.dueDate ?? "") < ($1.dueDate ?? "") }
    }

    // MARK: - Private

    let client: SupabaseClient
    private weak var authManager: AuthManager?
    private var syncTimer: AnyCancellable?

    // MARK: - Init

    init(authManager: AuthManager) {
        self.authManager = authManager
        self.client = authManager.client
        loadCachedTasks()
        startAutoSync()
        AppLogger.tasks.info("TaskStore initialized")
    }

    // MARK: - Auto-Sync (5-minute interval)

    private func startAutoSync() {
        syncTimer = Timer.publish(every: 300, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                Task { @MainActor [weak self] in
                    await self?.fetchTasks()
                }
            }
    }

    // MARK: - Task Caching

    private func loadCachedTasks() {
        guard let data = UserDefaults.standard.data(forKey: "cached_tasks"),
              let cached = try? JSONDecoder().decode([CalTask].self, from: data) else {
            return
        }
        tasks = cached
        AppLogger.tasks.info("Loaded \(cached.count) cached tasks")
    }

    private func saveTasks() {
        if let data = try? JSONEncoder().encode(tasks) {
            UserDefaults.standard.set(data, forKey: "cached_tasks")
        }
    }

    // MARK: - Fetch Tasks (Direct Supabase)

    @MainActor
    func fetchTasks() async {
        isLoading = true
        errorMessage = nil
        AppLogger.tasks.info("Fetching tasks via Supabase")

        do {
            let fetched: [CalTask] = try await client.from("tasks")
                .select()
                .is("dismissed_at", value: nil)
                .order("created_at", ascending: false)
                .execute()
                .value

            tasks = fetched.sorted { sortTasks($0, $1) }
            saveTasks()

            // Reschedule notifications with user's multi-select preferences
            NotificationManager.shared.rescheduleAllReminders(tasks: tasks)
            AppLogger.tasks.info("Fetched \(fetched.count) tasks")
        } catch {
            errorMessage = "Failed to load tasks"
            AppLogger.tasks.error("Fetch failed: \(error.localizedDescription)")
        }

        isLoading = false
    }

    // MARK: - Fetch Credentials

    @MainActor
    func fetchCredentials() async {
        do {
            let rows: [CredentialRow] = try await client.from("integration_credentials")
                .select("canvas_token,canvas_ical_url,gradescope_email,google_access_token_encrypted,pensieve_calendar_url")
                .limit(1)
                .execute()
                .value

            if let row = rows.first {
                integrations = IntegrationStatus(
                    canvasConnected: (row.canvasToken != nil && !row.canvasToken!.isEmpty)
                        || (row.canvasIcalUrl != nil && !row.canvasIcalUrl!.isEmpty),
                    gradescopeConnected: row.gradescopeEmail != nil && !row.gradescopeEmail!.isEmpty,
                    googleCalendarConnected: row.googleAccessTokenEncrypted != nil && !row.googleAccessTokenEncrypted!.isEmpty,
                    pensieveConnected: row.pensieveCalendarUrl != nil && !row.pensieveCalendarUrl!.isEmpty
                )
            }
            AppLogger.tasks.info("Fetched integration status")
        } catch {
            AppLogger.tasks.error("Credentials fetch failed: \(error.localizedDescription)")
        }
    }

    // MARK: - Toggle Complete

    @MainActor
    func toggleComplete(taskId: String) async {
        guard let index = tasks.firstIndex(where: { $0.id == taskId }) else {
            AppLogger.tasks.error("Toggle failed: task \(taskId) not found")
            return
        }

        let previousState = tasks[index]
        let newCompleted = !(previousState.isCompleted ?? false)
        let completedAt = newCompleted ? ISO8601DateFormatter().string(from: Date()) : nil

        tasks[index].isCompleted = newCompleted
        tasks[index].completedAt = completedAt

        if newCompleted {
            recentlyCompletedIds.insert(taskId)
            let taskTitle = previousState.title
            toastManager?.showToast(message: "Completed \"\(taskTitle)\"") { [weak self] in
                guard let self else { return }
                Task { @MainActor in
                    await self.toggleComplete(taskId: taskId)
                }
            }
            Task { @MainActor [weak self] in
                try? await Task.sleep(nanoseconds: 800_000_000)
                self?.recentlyCompletedIds.remove(taskId)
            }
        }

        do {
            let updates = TaskUpdate(isCompleted: newCompleted, completedAt: completedAt)
            try await client.from("tasks")
                .update(updates)
                .eq("id", value: taskId)
                .execute()
        } catch {
            if let idx = tasks.firstIndex(where: { $0.id == taskId }) {
                tasks[idx] = previousState
            }
            recentlyCompletedIds.remove(taskId)
            AppLogger.tasks.error("Toggle rollback: \(error.localizedDescription)")
            errorMessage = "Failed to update task. Change reverted."
        }
    }

    // MARK: - Create

    @discardableResult
    @MainActor
    func createTask(_ insert: TaskInsert) async -> Bool {
        AppLogger.tasks.info("Creating task: \(insert.title)")

        do {
            let created: CalTask = try await client.from("tasks")
                .insert(insert)
                .select()
                .single()
                .execute()
                .value

            tasks.insert(created, at: 0)
            AppLogger.tasks.info("Created task \(created.id)")
            return true
        } catch {
            errorMessage = "Failed to create task."
            AppLogger.tasks.error("Create failed: \(error.localizedDescription)")
            return false
        }
    }

    // MARK: - Delete (soft-dismiss)

    @MainActor
    func deleteTask(taskId: String) async {
        guard let index = tasks.firstIndex(where: { $0.id == taskId }) else { return }

        let removed = tasks.remove(at: index)
        AppLogger.tasks.info("Deleting task \(taskId)")

        do {
            try await client.from("tasks")
                .update(["dismissed_at": ISO8601DateFormatter().string(from: Date())])
                .eq("id", value: taskId)
                .execute()
        } catch {
            tasks.insert(removed, at: min(index, tasks.count))
            AppLogger.tasks.error("Delete rollback: \(error.localizedDescription)")
            errorMessage = "Failed to delete task. Change reverted."
        }
    }

    // MARK: - Filtered & Sorted

    func filteredTasks(filter: String, sort: String) -> [CalTask] {
        var result = activeTasks

        switch filter {
        case "today":
            let today = DateFormatting.todayString()
            result = result.filter { $0.dueDate == today }
        case "7days":
            let today = DateFormatting.todayString()
            let weekFromNow = DateFormatting.dateString(daysFromNow: 7)
            result = result.filter { task in
                guard let due = task.dueDate else { return false }
                return due >= today && due <= weekFromNow
            }
        default:
            break
        }

        switch sort {
        case "class":
            result.sort { ($0.courseName ?? "") < ($1.courseName ?? "") }
        default:
            result.sort { ($0.dueDate ?? "9999") < ($1.dueDate ?? "9999") }
        }

        return result
    }

    // MARK: - Private

    private func sortTasks(_ a: CalTask, _ b: CalTask) -> Bool {
        if a.completed != b.completed { return !a.completed }
        if let aOrder = a.sortOrder, let bOrder = b.sortOrder {
            return aOrder < bOrder
        }
        return (a.createdAt ?? "") > (b.createdAt ?? "")
    }
}

/// Internal model for reading credential columns.
private struct CredentialRow: Decodable {
    let canvasToken: String?
    let canvasIcalUrl: String?
    let gradescopeEmail: String?
    let googleAccessTokenEncrypted: String?
    let pensieveCalendarUrl: String?

    enum CodingKeys: String, CodingKey {
        case canvasToken = "canvas_token"
        case canvasIcalUrl = "canvas_ical_url"
        case gradescopeEmail = "gradescope_email"
        case googleAccessTokenEncrypted = "google_access_token_encrypted"
        case pensieveCalendarUrl = "pensieve_calendar_url"
    }
}
