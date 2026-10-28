# PacEdu Teacher Attendance Control — large tap-to-toggle checkbox

**Status:** implementation specification for PR #306; not yet merged or active in the deployed app.

## Required teacher experience

Add one large, thick-bordered attendance checkbox beside each student in the teacher's class list. It must be comfortable to tap on a mobile phone and accessible by keyboard/screen reader. The checkbox belongs to the student's verified roster entry for the selected class and school date.

## Behaviour

- Each student starts in an explicit `unmarked` state for the new attendance date. Do not assume a student is present merely because the student is enrolled or opened an activity.
- Teacher taps the box to mark `present`; the box shows a clear tick and visible state.
- Teacher unticks the box to change the attendance to `absent` (or uses a clearly labelled absent state if needed for accessibility). The saved value is `absent`, not a missing record.
- If the class has not yet been taken, show `unmarked`; distinguish this from `absent`.
- Save attendance against the student's stable internal ID, verified school enrolment/roster entry, class, local school date, and the authenticated teacher who recorded it.
- Prevent duplicate daily records. Editing a saved value updates the current daily record while preserving an audit event with previous value, new value, actor, timestamp, and optional reason.
- Provide a clear saving/saved/error state. If offline, queue the change safely and show that it is pending sync; do not falsely show server-confirmed save. Resolve conflicting edits without silently overwriting another teacher's newer record.
- Do not carry yesterday's attendance into today. Date boundaries must use the school's configured local timezone/calendar.
- Attendance changes must not erase a student's worksheets, assessment evidence, or prior attendance history. Absence is not a reason to remove a student from the class list or automatically assign a permanent ability label.

## Visual and accessibility requirements

- Minimum tap target approximately 44–48 CSS pixels square; use a thick 3px border and adequate spacing.
- Use shape/checkmark and readable labels, not colour alone.
- Support large-text mode, touch input, keyboard activation, and screen-reader names such as `Mark [student display name] present` or `Mark [student display name] absent`.
- Keep the class list compact and simple: student name, approved identifier/status, attendance control, and optional attendance status text. Avoid extra instructions that crowd the teacher's daily workflow.
- Offer a class-level summary (present / absent / unmarked) and a printable attendance register for the teacher's desk book. Printed/exported identifiers should be masked by default unless needed for the teacher's authorised task.

## Access and privacy

Only an authorised teacher or school staff member assigned to that class may create or edit attendance. Enforce this in Firebase/backend security rules, not only in the interface. Do not expose student IDs in public URLs, filenames, or analytics. Keep an audit trail for corrections.

## Acceptance tests

1. A new school date starts as `unmarked`, not automatically present or absent.
2. Tapping the box changes unmarked/present/absent according to the agreed two-state teacher interaction, and the visible tick/state is clear.
3. Unticking a previously present student saves `absent` for that date; it does not delete the attendance record.
4. A new date has its own attendance record and does not inherit yesterday's value.
5. The record is linked to the correct verified student, roster entry, class, local date, and authorised actor.
6. Duplicate taps, slow connections, retries, offline queueing, and concurrent edits do not create duplicate or silently conflicting records.
7. Corrections preserve audit history and never delete prior-day attendance.
8. Unauthorised users cannot read or change attendance outside their permitted school/class scope.
9. The control works on mobile touch, keyboard, and assistive technologies and remains usable in large-text mode.
10. Existing registration, guided navigation, voice/accessibility controls, and working teacher pages remain intact.

## Implementation boundary

This document is a specification, not a live attendance control. Before implementation, inspect and reuse the current class-list, authentication, Firebase, and offline-sync code. Add the control and tests in a small change; do not replace the roster or rewrite the teacher workspace wholesale.
