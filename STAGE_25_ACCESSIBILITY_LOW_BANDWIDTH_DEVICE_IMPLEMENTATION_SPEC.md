# Stage 25 — Accessibility, Low-Bandwidth & Device Verification Implementation Specification

**Status:** PREPARED FOR IMPLEMENTATION — production remains BLOCKED.

## 1. Purpose
Define practical verification across supported mobile devices, low-bandwidth conditions and accessibility needs.

## 2. Accessibility controls
Use clear language and navigation; readable/scalable text; labeled controls and forms; logical focus/order; accessible assessments; non-color-only communication; alternatives for required media; appropriate support for device accessibility settings.

## 3. Low-bandwidth and offline
Minimize payloads and requests. Clearly show online/offline/sync state. Queue only permitted offline operations. Never treat client completion as authoritative until server verification. Handle conflicts, retries, expired sessions and failed sync safely.

## 4. Device matrix
Test supported Android versions, screen sizes, browsers/WebView where used, touch input, orientation, storage limits and network conditions. Record exact versions and test conditions.

## 5. User workflows
Test account access, lessons, assessments, progress, dashboards, relationships, communication controls, errors, offline use, synchronization and logout on representative devices.

## 6. Performance
Define measurable targets for loading, navigation, synchronization, recovery and data usage suitable for supported Fiji conditions. Test rather than assume.

## 7. Defects
Classify accessibility and device defects by severity. Critical barriers block completion until resolved or formally handled by the authorized process.

## 8. Evidence
Device/browser matrix; automated accessibility checks; human accessibility/usability review; low-bandwidth results; offline/sync results; performance measurements; defect and retest register; independent verification where required.

## 9. Completion
Stage 25 is COMPLETE only after mandatory evidence is VERIFIED, required review is APPROVED, blocking defects are zero and authorized completion is recorded.

## 10. Guardian boundary and transition
Guardian cannot certify accessibility compliance or waive barriers. Verified completion prepares Stage 26 official curriculum-source validation and alignment review.

**Stage 25 remains incomplete until practical testing and verification occur.**
