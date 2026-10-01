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

## Evidence record

For each executed test record:
- date/time
- device and OS
- browser/app version
- connection type
- VPN/proxy on or off
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
- Confirm the queued records remain preserved until an explicit server acknowledgement is available.
- Do not treat local conflict detection as proof of production sync correctness; server-side conflict policy still requires backend testing and approval.
