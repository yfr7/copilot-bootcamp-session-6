# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-items`  
**Created**: 2026-02-27  
**Status**: Draft  
**Input**: User description: "Users need a clear, visual way to identify which todos have not been completed by their due date. This helps users quickly spot overdue items without having to manually check dates against today's date."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Overdue Indicators on Todo Cards (Priority: P1)

As a user viewing my todo list, I want overdue todo items to be visually distinct from other items so that I can immediately spot which tasks are past their due date without reading each date individually.

When a todo has a due date that has passed and the todo is not yet completed, its card should display a clear visual indicator (such as a color change on the due date text, a distinct border or background highlight, and/or an icon) that draws my attention. This visual treatment should be obvious at a glance even among a long list of items.

**Why this priority**: This is the core value of the feature. Without visual indicators, users must manually compare each due date to today's date, which is error-prone and time-consuming. This story alone delivers the full benefit described in the user request.

**Independent Test**: Can be fully tested by creating several todos with past, present, and future due dates, then visually confirming that only the past-due incomplete items display the overdue treatment.

**Acceptance Scenarios**:

1. **Given** a todo with a due date in the past and incomplete status, **When** the user views the todo list, **Then** the todo card displays a distinct overdue visual indicator (e.g., danger-colored due date text and an overdue icon/badge).
2. **Given** a todo with a due date of today and incomplete status, **When** the user views the todo list, **Then** the todo card does NOT display overdue indicators (it is still due today, not past due).
3. **Given** a todo with a due date in the future and incomplete status, **When** the user views the todo list, **Then** the todo card displays normally without overdue indicators.
4. **Given** a todo with a due date in the past but marked as completed, **When** the user views the todo list, **Then** the todo card does NOT display overdue indicators (completed items are never overdue).
5. **Given** a todo with no due date set, **When** the user views the todo list, **Then** the todo card displays normally without overdue indicators.

---

### User Story 2 - Overdue Count Summary (Priority: P2)

As a user, I want to see a quick count of how many overdue items exist so that I can immediately understand the urgency of my task list without scanning every card.

A counter or badge near the top of the todo list (e.g., in the header area) should display the number of currently overdue items. When there are no overdue items, this counter should be hidden or show zero in a non-alarming way.

**Why this priority**: This builds on the visual indicators by providing a summary-level view. It is valuable but secondary — even without a count, users can still identify overdue items via the card-level indicators from P1.

**Independent Test**: Can be fully tested by creating a mix of overdue, current, and completed todos, then verifying the displayed count matches the actual number of incomplete todos with past due dates.

**Acceptance Scenarios**:

1. **Given** 3 incomplete todos with past due dates and 2 todos with future due dates, **When** the user views the todo list, **Then** the overdue count displays "3".
2. **Given** no todos have past due dates, **When** the user views the todo list, **Then** the overdue count is either hidden or displays "0" without visual urgency.
3. **Given** an overdue todo is marked as completed, **When** the todo list refreshes, **Then** the overdue count decreases by one.
4. **Given** a todo's due date is updated from a past date to a future date, **When** the todo list refreshes, **Then** the overdue count decreases by one.

---

### User Story 3 - Overdue Status Reflects Current Date (Priority: P3)

As a user returning to the app on a new day, I want the overdue status of my todos to reflect the current date so that items that became overdue overnight are correctly shown as overdue without me needing to refresh or take any action.

**Why this priority**: This ensures accuracy over time. While the overdue detection naturally works on each page load (comparing dates), this story explicitly covers the scenario where a user keeps the app open across midnight or returns after several days.

**Independent Test**: Can be tested by creating a todo due "today," waiting until the next calendar day (or simulating a date change), and verifying the todo now appears as overdue.

**Acceptance Scenarios**:

1. **Given** a todo with a due date of today that is not overdue, **When** the calendar date advances past midnight to the next day, **Then** the todo is displayed as overdue upon the next interaction with the app (page load, navigation, or periodic check).
2. **Given** a user has not visited the app for several days, **When** the user opens the app, **Then** all todos with due dates before the current date and incomplete status are correctly displayed as overdue.

---

### Edge Cases

- **Todo with due date exactly at midnight boundary**: A todo due on February 27 should become overdue starting February 28. The comparison uses calendar dates, not timestamps.
- **Completed todo with past due date**: Should never show overdue styling. Completion status takes precedence.
- **Todo marked incomplete after due date has passed**: If a user un-checks a completed todo whose due date has already passed, the overdue indicator should appear immediately.
- **Editing due date to a past date**: If a user edits a todo's due date to a date in the past, the overdue indicator should appear immediately.
- **Editing due date from past to future**: If a user edits an overdue todo's due date to a future date, the overdue indicator should be removed immediately.
- **Large number of overdue items**: The visual treatment and count should remain functional and readable even with 50+ overdue items.
- **All todos overdue**: The interface should remain usable and not feel overwhelming if every item is overdue.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST determine a todo as "overdue" when it has a due date strictly before the current calendar date AND is not marked as completed.
- **FR-002**: System MUST display a distinct visual indicator on overdue todo cards that differentiates them from non-overdue items. The indicator must be visible without user interaction (no hover or click required).
- **FR-003**: System MUST use the application's existing danger/warning color palette for overdue visual treatment to maintain design consistency.
- **FR-004**: System MUST NOT display overdue indicators on completed todos, regardless of their due date.
- **FR-005**: System MUST NOT display overdue indicators on todos without a due date.
- **FR-006**: System MUST NOT treat todos due on the current calendar date as overdue.
- **FR-007**: System MUST display a count of overdue items in the header/summary area of the todo list.
- **FR-008**: System MUST update overdue indicators whenever the todo list is rendered, using the current calendar date for comparison.
- **FR-009**: System MUST update overdue visual indicators immediately when a user completes an overdue todo (indicator removed) or un-completes a todo with a past due date (indicator added).
- **FR-010**: System MUST update overdue visual indicators immediately when a user edits a todo's due date such that its overdue status changes.
- **FR-011**: System MUST ensure overdue visual treatment is accessible — it must not rely solely on color to convey overdue status (an icon, text label, or other non-color indicator must also be present).

### Key Entities

- **Todo Item (extended)**: Existing todo entity with title, due date (optional), and completion status. This feature adds derived/computed overdue status based on comparing due date to the current calendar date.
- **Overdue Status**: A derived (not stored) property of a todo item. Calculated as: `has due date` AND `due date < current calendar date` AND `not completed`. This is computed at display time, not persisted.

## Assumptions

- The application already supports due dates on todo items, as described in the existing functional requirements.
- Overdue status is computed client-side based on the user's local calendar date (no timezone complexities for this single-user app).
- The existing design system's danger color (red tones) is appropriate for overdue indicators and provides sufficient contrast in both light and dark modes.
- No sorting or filtering changes are required — overdue items remain in their current list position (creation date order). The visual indicators alone provide the needed distinction.
- Performance impact is negligible since overdue computation is a simple date comparison on each todo item.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify all overdue items in their todo list within 3 seconds of viewing the list, without reading individual due dates.
- **SC-002**: 100% of incomplete todos with past due dates display the overdue visual indicator correctly.
- **SC-003**: 0% of completed todos, todos without due dates, or todos due today or in the future display the overdue indicator (zero false positives).
- **SC-004**: The overdue item count displayed in the summary area matches the actual count of overdue items with 100% accuracy.
- **SC-005**: Overdue indicators update within 1 second of a user action that changes a todo's overdue status (completing, un-completing, or editing the due date).
- **SC-006**: Overdue visual treatment is perceivable by users who cannot distinguish colors, via a non-color indicator (icon, text, or pattern).
