# Pacific Education — Feature Recovery and Validation Matrix

Purpose: every major feature has a predictable validation line, dependency check, fallback/recovery action, and recheck path. A failure in one feature must be isolated, reported, repaired where safe, and re-tested before the workflow is considered healthy.

## Standard line

**Feature → dependencies → health check → safe fallback/repair → targeted recheck → workflow gate**

## Feature lines

1. **Welcome + Voice**
   - Dependencies: speech runtime, accessibility runtime, welcome controls.
   - Check: welcome text, Hear Welcome, Stop Speech, automatic greeting.
   - Repair: bind missing controls and use safe text fallback; never block navigation.
   - Recheck: welcome/voice regression.

2. **Navigation**
   - Dependencies: guided-flow state and Next controls.
   - Check: each step exposes only its intended page and advances exactly once.
   - Repair: restore missing wrapper/button binding; preserve current flow step.
   - Recheck: guided-navigation regression.

3. **Registration**
   - Dependencies: identity form, validation, local pilot storage.
   - Check: required fields validate, successful registration advances, registration page does not duplicate.
   - Repair: restore submit/Next handler and safe pilot-storage fallback.
   - Recheck: registration regression.

4. **Learning Level → Subject → Term**
   - Dependencies: selectors and synchronized curriculum context.
   - Check: selections persist and remain mutually consistent.
   - Repair: reject mismatched context instead of creating duplicate data.
   - Recheck: curriculum dependency regression.

5. **Daily Activities**
   - Dependencies: class reference, level, subject, term, teacher calendar.
   - Check: correct activity context and date controls.
   - Repair: fall back to validated activity data and flag missing dependencies.
   - Recheck: daily-activity regression.

6. **Practice**
   - Dependencies: daily activity and learner context.
   - Check: practice opens for the selected activity and records permitted pilot evidence.
   - Repair: restore activity-to-practice link; preserve class reference.
   - Recheck: practice regression.

7. **Assessments**
   - Dependencies: learner/class/subject/term context and assessment runtime.
   - Check: question types, answer entry, audio/text response, submission.
   - Repair: restore assessment navigation/runtime without losing context.
   - Recheck: assessment regression.

8. **Coverage + Progress**
   - Dependencies: class reference, achievement indicators, activities, practice, assessments.
   - Check: evidence maps to the existing class reference and selected curriculum context.
   - Repair: block mismatches; never create a replacement class automatically.
   - Recheck: coverage regression.

9. **Teacher Workspace + Calendar**
   - Dependencies: teacher role, class reference, school calendar.
   - Check: teacher controls instructional dates; learner dates remain derived from the approved calendar.
   - Repair: restore calendar binding and preserve existing class reference.
   - Recheck: teacher-calendar regression.

10. **Owner / Technician Workspace**
    - Dependencies: owner/technician controls, diagnostics, audit records.
    - Check: repair actions are visible, scoped, and logged.
    - Repair: isolate failed component and provide controlled recovery; do not silently change ownership or production gates.
    - Recheck: integrity/control regression.

11. **Online Connectivity**
    - Dependencies: network requests and service endpoints.
    - Check: online state is detected and user-facing connectivity status is updated.
    - Repair: retry safely and preserve local pilot state.
    - Recheck: connectivity regression.

12. **Offline + Sync**
    - Dependencies: service worker/cache, local state, sync queue.
    - Check: core shell loads offline; queued pilot-safe state survives and syncs when connectivity returns.
    - Repair: refresh cache/version and re-run sync validation; surface conflicts instead of overwriting silently.
    - Recheck: offline-sync regression.

13. **PWA Install**
    - Dependencies: manifest, install runtime, standalone detection.
    - Check: install control/status and installed-app greeting.
    - Repair: restore install binding/status fallback.
    - Recheck: PWA regression.

14. **Mailbox**
    - Dependencies: pilot mailbox storage and UI controls.
    - Check: mailbox opens, refreshes, composes, stores and displays pilot-safe messages.
    - Repair: restore local fallback without affecting personal email.
    - Recheck: mailbox regression.

## Automatic recovery rules

- A failed feature must not silently rewrite another feature's data.
- Repairs are **feature-scoped first**, then dependency-scoped.
- Class Reference is immutable during automatic repair; no duplicate class is created.
- Curriculum mismatches are blocked and reported for review.
- Safe UI/runtime repairs may be automatic; production authorization, ownership, payment, privacy, safeguarding, or external approval decisions remain gated and must not be auto-approved.
- Every repair creates a testable state: **Detected → Repaired/Blocked → Rechecked → Pass/Fail**.
- If recheck fails, stop cascading repairs and record the dependency chain for the next diagnostic run.

## CI workflow

For every push:
1. Validate feature matrix.
2. Run targeted regressions.
3. Run offline/sync checks.
4. Run accessibility and prototype validation.
5. Run Stage 15 QA and security checks.
6. Build the Android pilot.
7. Deploy Pages only when the relevant deployment checks pass.
8. Report remaining failures; do not label the pilot complete from a partial pass.


## User-protection recovery layer

15. **Pre-failure detection**
   - Check dependencies before opening a feature, not only after a button fails.
   - If a dependency is unavailable, show a clear status and use the approved fallback where possible.

16. **Automatic retry**
   - Retry transient operations with bounded attempts.
   - Do not create duplicate records when retrying a write.
   - Preserve the user's current workflow step during retries.

17. **Safe fallback**
   - If repair cannot complete immediately, keep the user inside a usable part of the app.
   - Provide the next safe action instead of exposing a blank or broken page.
   - Voice must announce the fallback when mandatory voice is active.

18. **Dependency tracing**
   - Record which feature, script, service, data context, or workflow dependency caused the failure.
   - Re-test the smallest affected dependency chain before re-running the full suite.

19. **State protection**
   - Never discard valid learner progress because a UI component fails.
   - Never silently overwrite newer data during synchronization.
   - Preserve Class Reference, Learning Level, Subject, and Term relationships.

20. **Repair escalation**
   - Automatic repair handles safe UI/runtime/cache failures.
   - Failed automatic repair creates a diagnostic record for Owner/Technician review.
   - Security, privacy, safeguarding, payment, ownership, curriculum approval, and production-gate decisions require explicit controlled review.

21. **User-facing recovery message**
   - Replace technical errors with a simple message such as: “This feature needs a quick repair. Your work is being protected.”
   - Provide Retry/Continue where appropriate.
   - Do not expose stack traces or internal credentials/configuration.

22. **Recovery verification**
   - After repair, test the exact action that failed.
   - Then test its immediate dependents.
   - Only after both pass should the workflow continue to broader regression tests.

23. **Failure containment**
   - One damaged feature must not disable unrelated features.
   - A failure in Voice must not disable learning navigation.
   - A failure in Daily Activities must not corrupt Practice or Assessment context.
   - A failure in connectivity must not erase offline-safe pilot state.

24. **Repair audit trail**
   - Record detection time, feature, dependency, action, result, retry count, and recheck result.
   - Keep repair records separate from learner-facing content and personal mailbox data.

## Expanded automatic sequence

**Detect → Protect user state → Isolate dependency → Retry safe operation → Apply bounded repair/fallback → Re-test failed action → Re-test immediate dependents → Record result → Continue or escalate.**

## Recovery acceptance criteria

A feature is considered recovered only when:
- the original user action works again;
- its immediate dependent feature still works;
- protected state remains intact;
- no duplicate Class Reference or duplicate submission is created;
- accessibility/voice behavior remains available where required;
- the recovery result is recorded;
- unresolved failures are clearly surfaced rather than hidden.
