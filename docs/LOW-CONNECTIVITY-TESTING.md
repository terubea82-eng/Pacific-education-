# Pacific Education — Low-Connectivity Test Procedure

Prototype evidence guide for Stage 21. This document defines repeatable checks; it does not claim that the checks have been executed.

## Scope

Verify that the prototype remains usable across:
- intermittent Wi-Fi or cellular service
- slow/high-latency connections
- temporary offline periods
- reconnect and retry conditions
- VPN/proxy connections
- web and Android devices

## Test 1 — Online baseline

1. Open the Pacific Education entry page while connected.
2. Confirm the connectivity diagnostics report **online**.
3. Confirm service-worker status is eventually **controlled** after reload if supported.
4. Confirm queued progress count is visible.
5. Record device, browser, connection type and timestamp.

## Test 2 — Temporary offline

1. Start a lesson or practice activity.
2. Disable the network using the device/browser network controls.
3. Attempt a supported progress action.
4. Confirm the application does not claim that server synchronization succeeded.
5. Confirm queued progress remains available locally.
6. Restore connectivity.

## Test 3 — Reconnect

1. With progress queued, restore the network.
2. Confirm the connectivity monitor changes from offline to online.
3. Confirm the reconnect guidance appears.
4. Confirm queued progress is preserved until a real server acknowledgement exists.
5. Do not manually clear the queue as evidence of synchronization.

## Test 4 — Slow/high-latency network

1. Use a browser/device network profile or controlled network with reduced bandwidth and increased latency.
2. Load the entry page.
3. Navigate through Welcome, Learning Level, Subject and Term.
4. Record noticeable load failures, timeouts or unusable controls.
5. Confirm voice and accessibility controls remain available where supported.

## Test 5 — VPN/proxy

1. Repeat the online baseline with a VPN or proxy enabled.
2. Repeat a reconnect cycle.
3. Confirm the app relies on normal network connectivity rather than a country, ISP, IP range or VPN state.
4. Record any network-specific access failure without treating the VPN itself as a guarantee of availability.

## Test 6 — Duplicate/retry safety

1. Queue the same supported progress event more than once.
2. Confirm duplicate detection prevents repeated local entries.
3. Inspect the generated sync batch if available.
4. Confirm deterministic event IDs are present.
5. Confirm retry planning is bounded and eventually reports manual review.
6. Confirm no item is removed merely because a retry was attempted.

## Test 7 — Mobile/accessibility conflict review

1. Create a queued conflict using the conflict procedure below.
2. On an Android-sized viewport, confirm the **Sync conflict review** panel fits within the available width without horizontal scrolling.
3. Confirm each conflict is presented as a distinct, readable item with the lesson/day and both completion states.
4. Confirm **Needs review** and **Reviewed — data preserved** are visible text states, not color-only indicators.
5. Confirm **Mark reviewed** and **Require review again** controls are at least approximately 44px high/wide and remain usable with touch.
6. Confirm keyboard focus is visibly indicated when navigating with a keyboard or accessibility switch.
7. Confirm long lesson identifiers wrap instead of forcing horizontal scrolling.
8. With reduced-motion preferences enabled, confirm the conflict controls remain usable without relying on animation.
9. Confirm reviewing a conflict does not delete or rewrite either queued record.
10. Repeat after reconnect and confirm the manual-review gate remains enforced until every conflict is reviewed.

## Test 8 — Accessibility runtime and UI

1. Open the entry page with keyboard navigation and an assistive technology or browser accessibility tools where available.
2. Confirm the accessibility runtime loads without a console error.
3. Confirm the accessibility live-status target is present and announcements are exposed through a polite live region.
4. Confirm the **Voice preference** control is reachable and operable with keyboard input.
5. Exercise supported text scaling and confirm only the documented normal, large and x-large states are accepted.
6. Exercise speech controls where browser speech synthesis is available and confirm Stop Speech cancels active speech.
7. Confirm unsupported speech synthesis is reported as unavailable rather than presented as successful.
8. Repeat on an Android-sized viewport and confirm controls remain usable without horizontal scrolling.
9. Open the app in two same-origin browser tabs, change Voice preference in one tab, and confirm the other tab updates its control state and announces the change through the polite live region.
10. Record browser, assistive technology, speech availability and accessibility settings in the evidence record.

## Evidence record

For each executed test record:
- date/time
- device and OS
- browser/app version
- viewport/orientation
- connection type
- VPN/proxy on or off
- accessibility settings used
- assistive technology used, if any
- speech synthesis availability
- test case
- expected result
- observed result
- screenshot/log reference
- defect or issue number, if applicable

## Production gate

These are prototype/manual verification procedures. Passing a local test does **not** authorize production deployment, real child-data use, or server synchronization. Production requires the repository's approved backend, authentication, authorization, persistence, monitoring, backup and external verification controls.

## Conflict handling

- Queue the same lesson/day progress event more than once with different completion states.
- Confirm the runtime reports a conflict candidate rather than silently choosing one value.
- Confirm the sync controller reports the conflict as requiring manual review.
- Confirm **System Status** displays a **Sync conflict review** section when a conflict exists.
- Confirm each conflict shows the lesson/day and both conflicting completion states.
- Confirm **Mark reviewed** changes only the local review state and does not delete or rewrite either queued record.
- Confirm reviewed conflicts show **Reviewed; data preserved**.
- Confirm **Require review again** returns the conflict to the manual-review gate.
- Confirm retry remains blocked while any conflict is unreviewed.
- Confirm queued records remain preserved until an explicit server acknowledgement is available.
- Do not treat local conflict detection or review controls as proof of production sync correctness; server-side conflict policy still requires backend testing and approval.

## Cache diagnostics verification

- Open System Status after the service worker controls the page.
- Confirm the cache version and entry/core cache counts are displayed when available.
- Repeat after a service-worker update and record the observed cache state.
- If the page is not controlled by a service worker, record that state rather than treating it as a cache failure.


## Voice preference accessibility verification

For the accessibility and voice-first checks, record evidence for the voice preference control:

1. Confirm the Voice preference control is reachable by keyboard and has a visible focus indicator.
2. Confirm the control exposes an accessible ON/OFF state through aria-pressed.
3. Enable voice preference and confirm the setting persists after a page reload.
4. Disable voice preference and confirm the disabled state persists after a page reload.
5. Confirm the control's accessible label changes between enabling and disabling states.
6. Confirm selectable controls can be announced when voice preference is enabled.
7. Confirm the control remains usable when speech synthesis is unavailable; the application must not report speech success when the browser does not provide speech synthesis.
8. Repeat the preference change in a second same-origin browser tab and confirm the first tab receives the updated state without a page reload.
9. Change the documented text scale in one same-origin browser tab and confirm the other tab applies the normalized scale without a page reload and announces the update.
10. Record browser/version, device, operating system, speech availability, keyboard/assistive technology used, and the relevant app commit.

This is a manual verification procedure. It does not by itself establish accessibility conformance or production approval.
