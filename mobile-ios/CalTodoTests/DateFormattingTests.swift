import XCTest
@testable import CalTodo

/// Unit tests for DateFormatting utility functions.
/// Validates due date display logic, time formatting, and greeting generation.
final class DateFormattingTests: XCTestCase {

    // MARK: - todayString

    func testTodayStringFormat() {
        let result = DateFormatting.todayString()
        // Should match YYYY-MM-DD format
        let regex = /^\d{4}-\d{2}-\d{2}$/
        XCTAssertNotNil(result.firstMatch(of: regex), "todayString should return YYYY-MM-DD format")
    }

    // MARK: - dateString(daysFromNow:)

    func testDateStringDaysFromNow() {
        let today = DateFormatting.todayString()
        let tomorrow = DateFormatting.dateString(daysFromNow: 1)
        XCTAssertNotEqual(today, tomorrow, "Tomorrow should differ from today")
        XCTAssertGreaterThan(tomorrow, today, "Tomorrow should be after today")
    }

    func testDateStringNegativeDays() {
        let today = DateFormatting.todayString()
        let yesterday = DateFormatting.dateString(daysFromNow: -1)
        XCTAssertLessThan(yesterday, today, "Yesterday should be before today")
    }

    // MARK: - formatTime12h

    func testFormatTime12hMorning() {
        XCTAssertEqual(DateFormatting.formatTime12h("09:30"), "9:30 AM")
    }

    func testFormatTime12hAfternoon() {
        XCTAssertEqual(DateFormatting.formatTime12h("14:00"), "2:00 PM")
    }

    func testFormatTime12hMidnight() {
        XCTAssertEqual(DateFormatting.formatTime12h("00:00"), "12:00 AM")
    }

    func testFormatTime12hNoon() {
        XCTAssertEqual(DateFormatting.formatTime12h("12:00"), "12:00 PM")
    }

    func testFormatTime12h1159PM() {
        XCTAssertEqual(DateFormatting.formatTime12h("23:59"), "11:59 PM")
    }

    // MARK: - dueDateInfo

    func testDueDateInfoNilDate() {
        let result = DateFormatting.dueDateInfo(dueDate: nil, dueTime: nil)
        XCTAssertNil(result, "Nil due date should return nil")
    }

    func testDueDateInfoEmptyDate() {
        let result = DateFormatting.dueDateInfo(dueDate: "", dueTime: nil)
        XCTAssertNil(result, "Empty due date should return nil")
    }

    func testDueDateInfoToday() {
        let today = DateFormatting.todayString()
        let result = DateFormatting.dueDateInfo(dueDate: today, dueTime: nil)
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.dateLabel, "Today")
        XCTAssertEqual(result?.colorHex, "#60A5FA", "Today should be blue")
    }

    func testDueDateInfoTomorrow() {
        let tomorrow = DateFormatting.dateString(daysFromNow: 1)
        let result = DateFormatting.dueDateInfo(dueDate: tomorrow, dueTime: nil)
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.dateLabel, "Tomorrow")
        XCTAssertEqual(result?.colorHex, "#60A5FA", "Tomorrow should be blue")
    }

    func testDueDateInfoOverdue() {
        let past = DateFormatting.dateString(daysFromNow: -3)
        let result = DateFormatting.dueDateInfo(dueDate: past, dueTime: nil)
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.colorHex, "#F87171", "Overdue should be red")
    }

    func testDueDateInfoFarFuture() {
        let future = DateFormatting.dateString(daysFromNow: 30)
        let result = DateFormatting.dueDateInfo(dueDate: future, dueTime: nil)
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.colorHex, "#9CA3AF", "Far future should be gray")
    }

    func testDueDateInfoWithTime() {
        let today = DateFormatting.todayString()
        let result = DateFormatting.dueDateInfo(dueDate: today, dueTime: "23:59")
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.timeLabel, "11:59 PM")
    }

    // MARK: - greeting

    func testGreetingReturnsValidString() {
        let result = DateFormatting.greeting()
        let validGreetings = ["good morning", "good afternoon", "good evening"]
        XCTAssertTrue(validGreetings.contains(result), "Greeting should be one of the expected values")
    }
}
