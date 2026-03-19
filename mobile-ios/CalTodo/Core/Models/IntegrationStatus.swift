import Foundation

/// Integration connection status returned by /api/mobile/credentials.
struct IntegrationStatus: Codable {
    let canvasConnected: Bool
    let gradescopeConnected: Bool
    let googleCalendarConnected: Bool
    let pensieveConnected: Bool
    let hasCompletedOnboarding: Bool

    enum CodingKeys: String, CodingKey {
        case canvasConnected = "canvas_connected"
        case gradescopeConnected = "gradescope_connected"
        case googleCalendarConnected = "google_calendar_connected"
        case pensieveConnected = "pensieve_connected"
        case hasCompletedOnboarding = "has_completed_onboarding"
    }
}
