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


## Redundant feature-line requirement

For critical user-facing features, a single implementation line must never be the only path.

### Welcome and greeting redundancy

The greeting system must have multiple independent recovery paths:

1. **Primary greeting path** — normal welcome voice/runtime.
2. **Secondary greeting path** — alternate voice invocation using the same approved welcome text.
3. **Text fallback path** — visible greeting remains available if speech fails.
4. **Accessibility path** — Hear Welcome control can invoke the greeting independently.
5. **Installed-app path** — PWA/standalone startup can announce the welcome independently.
6. **Navigation-safe path** — failure of every greeting path must not block the Next/navigation flow.

### Redundancy rule

For every critical feature, define at least:
- a primary execution path;
- an independent secondary path;
- a user-visible fallback;
- a health check for each path;
- a recovery/recheck sequence.

A failure in one greeting line must automatically try the next valid greeting path before declaring the feature unavailable.

### User experience rule

The user should not see a technical failure merely because one implementation path broke. The system should transparently fail over, preserve the intended function where possible, and log which path was used.

The same redundancy pattern should be applied to other critical functions such as Next navigation, Registration, Daily Activities, Practice, Assessments, connectivity/sync, and accessibility controls.


## Redundant paths by feature

| Feature | Primary path | Secondary path | User-visible fallback | Isolation rule |
|---|---|---|---|---|
| Welcome / Greeting | Automatic welcome voice | Hear Welcome / alternate voice invocation | Visible welcome text + Next | Greeting failure cannot block navigation |
| Navigation / Next | Guided-flow Next handler | Direct section navigation | App Menu / role workspace entry | A broken Next control cannot hide the destination |
| Registration | Registration form handler | User Registration entry control | Registration instructions/status | Registration failure cannot erase existing pilot state |
| Class / Level / Subject / Term | Guided selectors | Existing assigned-context/recovery selector | Current valid selection remains visible | Never create a duplicate Class Reference |
| Daily Activities | Daily lesson runtime | Renderer refresh/re-entry path | Previous/Next Day + activity status | Activity failure cannot disable Practice/Assessment |
| Practice | Practice runtime | Re-open Practice stage from Daily Activities | Practice instructions/status | Preserve completed activity evidence |
| Assessments | Assessment engine | Assessment-specific entry/restart path | Assessment stage and status | Do not duplicate submissions |
| Coverage / Progress | Coverage renderer | Dashboard refresh/rebuild path | Last verified coverage/progress view | Never consume mismatched class curriculum |
| Teacher Workspace / Calendar | Teacher dashboard/calendar runtime | Dashboard refresh/re-entry | Teacher workspace navigation | Student learning remains available if teacher UI fails |
| Owner / Technician Workspace | Workspace controls | Direct system-status / repository links | Technical status panel | Never expose credentials or secrets |
| Online Connectivity | Network request | Retry with bounded backoff | Offline status + cached pilot shell | Network failure must not crash local UI |
| Offline / Sync | Sync queue | Retry/reconcile path | Local pending-sync state | Protect queued evidence; no duplicate writes |
| PWA Install | Browser install prompt | Install/status control | Web app remains usable without install | Install failure does not affect learning |
| Mailbox | Mailbox local store | Refresh/re-render path | Empty/status view | Mailbox failure cannot affect learning data |
| Accessibility / Voice | Accessibility runtime | Hear Welcome / direct speech controls | Visible text + controls | Speech failure never blocks content/navigation |

### Mandatory behavior for every row

Each feature must have **at least two execution paths** before it is considered resilient. The secondary path must not simply call the same failing function without checking its health first. The fallback must preserve the user's ability to continue where safe.

The recovery sequence is:

**Detect → protect state → test primary path → fail over to secondary path → show safe fallback if needed → re-test feature → re-test immediate dependents → record the path used.**

A feature is not considered fully recovered merely because an error was caught. The intended user action must be re-tested.

### Critical-path dependency rule

Critical learning paths use dependency-aware isolation:

**Welcome → Registration → Class/Level → Subject → Term → Daily Activities → Practice → Assessment → Coverage**

A failure in one stage must not automatically disable unrelated stages. If a dependency is genuinely required for a specific action, only that action is blocked and the reason is surfaced; unrelated tools remain available.

### Redundancy acceptance test

For each feature, pilot QA must test:
1. primary path works;
2. primary path is intentionally made unavailable in a controlled test;
3. secondary path takes over;
4. user-visible fallback appears if both execution paths are unavailable;
5. user state is preserved;
6. immediate dependent feature remains usable;
7. recovery is recorded and the feature is re-tested.


## Technician responsibility

The pilot Technician is the operational recovery role for the feature-line system. The Technician is responsible for monitoring feature health, identifying failed execution lines, protecting user state, activating the approved secondary path or safe fallback, re-testing the affected feature and immediate dependents, and recording the recovery result.

Technician handling must remain feature-scoped and dependency-aware:
- Do not rewrite another feature's data to repair a failed feature.
- Do not create duplicate Class References while repairing class/teacher/curriculum flows.
- Do not bypass Owner, production, payment, privacy, safeguarding, curriculum-verification, or external-approval gates.
- Do not expose credentials, secrets, or sensitive pilot information.
- A Technician repair is not considered successful until the affected user action is re-tested and passes.

### Automatic Technician sequence

**Detect → isolate → protect state → select healthy line → fail over → verify user action → verify dependent feature → log recovery → continue monitoring.**

This makes the Technician the operational handler of broken feature lines while preserving the Owner's authorization and governance controls.


## Technician responsibility

The pilot Technician is the operational recovery role for the feature-line system. The Technician is responsible for monitoring feature health, identifying failed execution lines, protecting user state, activating the approved secondary path or safe fallback, re-testing the affected feature and immediate dependents, and recording the recovery result.

Technician handling must remain feature-scoped and dependency-aware:
- Do not rewrite another feature's data to repair a failed feature.
- Do not create duplicate Class References while repairing class/teacher/curriculum flows.
- Do not bypass Owner, production, payment, privacy, safeguarding, curriculum-verification, or external-approval gates.
- Do not expose credentials, secrets, or sensitive pilot information.
- A Technician repair is not considered successful until the affected user action is re-tested and passes.

### Automatic Technician sequence

**Detect → isolate → protect state → select healthy line → fail over → verify user action → verify dependent feature → log recovery → continue monitoring.**

This makes the Technician the operational handler of broken feature lines while preserving the Owner's authorization and governance controls.
