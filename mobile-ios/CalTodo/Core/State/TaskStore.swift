import Foundation

/// Central state manager for CalTodo tasks.
/// Handles CRUD operations, optimistic updates with rollback,
/// and pull-to-refresh. Uses `ObservableObject` for iOS 16+ compatibility.
///
/// Mirrors the React Native `useTasks` hook's optimistic update pattern:
/// apply the change locally first, then sync with the server. On failure,
/// roll back to the previous state.
final class TaskStore: ObservableObject {

    // MARK: - Public State

    /// All tasks fetched from the API, sorted by sort_order then created_at.
    @Published var tasks: [CalTask] = []

    /// Whether a fetch/refresh is in progress.
    @Published var isLoading = false

    /// Human-readable error message from the last failed operation, or nil.
    @Published var errorMessage: String?

    /// Integration connection status from the API.
    @Published var integrations: IntegrationStatus?

    /// Active (non-completed) tasks.
    var activeTasks: [CalTask] {
        tasks.filter { !$0.completed }
    }

    /// Completed tasks.
    var completedTasks: [CalTask] {
        tasks.filter { $0.completed }
    }

    /// Tasks due today.
    var todayTasks: [CalTask] {
        let today = DateFormatting.todayString()
        return activeTasks.filter { $0.dueDate == today }
    }

    /// Upcoming tasks (due in the next 7 days, excluding today).
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

    private let apiClient: APIClient
    private weak var authManager: AuthManager?

    // MARK: - Init

    /// Creates a TaskStore connected to the given AuthManager.
    ///
    /// - Parameter authManager: The auth manager providing access tokens.
    init(authManager: AuthManager) {
        self.authManager = authManager
        self.apiClient = APIClient(
            baseURL: Configuration.apiBaseURL,
            getToken: { [weak authManager] in authManager?.accessToken }
        )
        AppLogger.tasks.info("TaskStore initialized")
    }

    // MARK: - Fetch

    /// Fetches all tasks from the API. Used for initial load and pull-to-refresh.
    @MainActor
    func fetchTasks() async {
        isLoading = true
        errorMessage = nil
        AppLogger.tasks.info("Fetching tasks")

        do {
            let fetched = try await apiClient.getTasks()
            tasks = fetched.sorted { sortTasks($0, $1) }
            AppLogger.tasks.info("Fetched \(fetched.count) tasks")
        } catch let error as APIError {
            handleError(error, context: "fetch")
        } catch {
            errorMessage = error.localizedDescription
            AppLogger.tasks.error("Fetch failed: \(error.localizedDescription)")
        }

        isLoading = false
    }

    // MARK: - Fetch Credentials

    /// Fetches integration connection status from the API.
    @MainActor
    func fetchCredentials() async {
        do {
            integrations = try await apiClient.getCredentials()
            AppLogger.tasks.info("Fetched integration status")
        } catch {
            AppLogger.tasks.error("Credentials fetch failed: \(error.localizedDescription)")
        }
    }

    // MARK: - Toggle Complete

    /// Toggles a task's completion state with optimistic update.
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
        AppLogger.tasks.info("Toggling task \(taskId) to completed=\(newCompleted)")

        do {
            let updated = try await apiClient.updateTask(
                id: taskId,
                updates: TaskUpdate(isCompleted: newCompleted, completedAt: completedAt)
            )
            if let idx = tasks.firstIndex(where: { $0.id == taskId }) {
                tasks[idx] = updated
            }
        } catch {
            if let idx = tasks.firstIndex(where: { $0.id == taskId }) {
                tasks[idx] = previousState
            }
            AppLogger.tasks.error("Toggle rollback for \(taskId): \(error.localizedDescription)")
            errorMessage = "Failed to update task. Change reverted."
        }
    }

    // MARK: - Create

    /// Creates a new task via the API and adds it to the local list.
    @MainActor
    func createTask(_ insert: TaskInsert) async {
        AppLogger.tasks.info("Creating task: \(insert.title)")

        do {
            let created = try await apiClient.createTask(insert)
            tasks.insert(created, at: 0)
            AppLogger.tasks.info("Created task \(created.id)")
        } catch let error as APIError {
            handleError(error, context: "create")
        } catch {
            errorMessage = "Failed to create task."
            AppLogger.tasks.error("Create failed: \(error.localizedDescription)")
        }
    }

    // MARK: - Delete

    /// Deletes (soft-dismisses) a task with optimistic removal.
    @MainActor
    func deleteTask(taskId: String) async {
        guard let index = tasks.firstIndex(where: { $0.id == taskId }) else { return }

        let removed = tasks.remove(at: index)
        AppLogger.tasks.info("Deleting task \(taskId)")

        do {
            try await apiClient.deleteTask(id: taskId)
        } catch {
            tasks.insert(removed, at: min(index, tasks.count))
            AppLogger.tasks.error("Delete rollback for \(taskId): \(error.localizedDescription)")
            errorMessage = "Failed to delete task. Change reverted."
        }
    }

    // MARK: - Private Helpers

    private func sortTasks(_ a: CalTask, _ b: CalTask) -> Bool {
        if a.completed != b.completed { return !a.completed }
        if let aOrder = a.sortOrder, let bOrder = b.sortOrder {
            return aOrder < bOrder
        }
        return (a.createdAt ?? "") > (b.createdAt ?? "")
    }

    private func handleError(_ error: APIError, context: String) {
        errorMessage = error.localizedDescription
        AppLogger.tasks.error("\(context) error: \(error.localizedDescription)")
        if error.requiresReauth {
            Task { @MainActor in
                await authManager?.signOut()
            }
        }
    }
}
