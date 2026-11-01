# PacEdu Teacher Attendance Control — pre-ticked present register

**Status:** implementation specification for PR #306; not yet merged or active in the deployed app.

## Required teacher experience

At the start of each school day, show every currently enrolled child in the selected class with a large, thick-bordered tick by default. The teacher's quick daily task is to **untick only the children who are absent**. This is a deliberate time-saving register workflow, not an inference that the child has physically arrived.

## Behaviour

- Load the verified, active class roster for the selected school date. Pre-tick each listed child as the teacher's default starting state.
- Teacher leaves the tick in place for a child who is present and unticks it for a child who is absent. Show clear labels/icons and an absent state; do not rely on colour alone.
- Make the register's state clear: before the teacher saves/confirms it, label it **Not yet confirmed**. Do not present the default ticks as a completed or server-confirmed attendance record.
- On teacher confirmation, save an explicit present or absent value for every child in the active roster. If the teacher has not confirmed the register, retain a draft/pending state and show that status.
- Save attendance against the student's stable internal ID, verified school enrolment/roster entry, class, local school date, and authenticated teacher who recorded it.
- Prevent duplicate daily records. Editing a saved value updates the current daily record while preserving an audit event with previous value, new value, actor, timestamp, and optional reason.
- Provide clear saving/saved/error states. If offline, queue the change safely and show **Pending sync**; do not falsely show server-confirmed save. Resolve conflicting edits without silently overwriting another teacher's newer record.
- Start a fresh register for each school date using the current active roster. Never copy yesterday's attendance values into today's register.
- Only children actively enrolled in the selected class on that date appear in the default register. A pending transfer, withdrawal, or enrolment dispute must not silently duplicate a child across two active school registers.
- Attendance changes must not erase worksheets, assessment evidence, or prior attendance history. Absence is not a reason to remove a student from the class list or automatically assign a permanent ability label.

## Visual and accessibility requirements

- Minimum tap target approximately 44–48 CSS pixels square; use a thick 3px border and adequate spacing.
- Use a clear checkmark and readable Present / Absent labels, not colour alone.
- Support large-text mode, touch input, keyboard activation, and screen-reader names such as “Mark [student display name] absent” or “Mark [student display name] present”.
- Keep the class list compact: student name, approved identifier/status, attendance control, and optional status text. Avoid extra instructions that crowd the teacher's daily workflow.
- Show class totals for present, absent, and register confirmation status. Offer a printable attendance register for the teacher's desk book. Mask identifiers by default on printed/exported records unless the authorised task requires them.

## Access and privacy

Only an authorised teacher or school staff member assigned to that class may create or edit attendance. Enforce this in Firebase/backend security rules, not only in the interface. Do not expose student IDs in public URLs, filenames, or analytics. Keep an audit trail for corrections.

## Acceptance tests

1. A new school date loads the current verified active roster with default ticks and clearly says the register is **Not yet confirmed**.
2. Leaving a tick means present; unticking means absent. The state is visible and accessible.
3. Teacher confirmation saves an explicit present/absent value for each roster child; an unconfirmed draft is never reported as final attendance.
4. A new date starts fresh and does not inherit yesterday's values.
5. Only the correct active school/class roster is shown for that date, including during transfers.
6. The record is linked to the correct verified student, roster entry, class, local date, and authorised actor.
7. Retries, offline queueing, and concurrent edits do not create duplicate or silently conflicting records.
8. Corrections preserve audit history and never delete prior-day attendance.
9. Unauthorised users cannot read or change attendance outside their permitted school/class scope.
10. The control works on mobile touch, keyboard, and assistive technologies and remains usable in large-text mode.
11. Existing registration, guided navigation, voice/accessibility controls, and working teacher pages remain intact.

## Implementation boundary

This document is a specification, not a live attendance control. Before implementation, inspect and reuse the current class-list, authentication, Firebase, and offline-sync code. Add the control and tests in a small change; do not replace the roster or rewrite the teacher workspace wholesale.