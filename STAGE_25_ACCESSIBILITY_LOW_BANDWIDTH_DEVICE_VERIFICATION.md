# Pacific Education — Stage 25 Accessibility, Low-Bandwidth & Device Verification

## Status

**Stage 25 architecture contract: DEFINED — implementation, device testing and independent accessibility verification required.**

This stage defines the minimum verification boundary for an education service intended to work across Fiji and other environments with varying connectivity and devices.

## 1. Accessibility boundary

The production interface should be designed and tested against an appropriate recognized accessibility standard, with WCAG 2.2 AA used as the target baseline unless a qualified accessibility review establishes a different applicable requirement.

Testing must cover:

- Keyboard navigation where applicable
- Visible focus
- Logical reading and navigation order
- Labels and instructions
- Form validation and error messages
- Color-independent meaning
- Text resizing and zoom
- Sufficient contrast
- Touch target usability
- Screen-reader compatibility where applicable
- Captions/transcripts or equivalent support for relevant media
- Reduced-motion considerations
- Accessible authentication and recovery

Accessibility must apply to core learning, assessment, communication and account workflows, not only the landing page.

## 2. Mobile and device support

The production service should be tested on representative:

- Android phones
- Android tablets where supported
- Desktop/laptop browsers
- Small screens
- Larger screens
- Older/lower-spec devices likely to be used by the pilot population

Test evidence must record device/browser versions, date, workflow tested and result.

## 3. Low-bandwidth design

The application should minimize unnecessary network use through:

- Compressed/appropriately sized assets
- Efficient JavaScript and CSS
- Avoidance of unnecessary third-party requests
- Caching of safe static assets
- Small API payloads
- Pagination or incremental loading where appropriate
- Retry/backoff controls
- Clear connection-state feedback

The service must remain safe when connectivity is intermittent.

## 4. Offline operation

Offline functionality must be limited to operations explicitly designed for offline use.

Queued changes must:

- Use unique operation identifiers
- Be reauthenticated/revalidated by the production server
- Be idempotent where applicable
- Reject stale or unauthorized operations
- Never override authoritative server state without validation
- Provide understandable sync status
- Avoid exposing sensitive information unnecessarily on shared devices

Offline capability must never bypass production authorization.

## 5. Performance

Testing should measure representative:

- Initial load
- Lesson load
- Assessment load
- Save/sync
- Reconnect
- Offline-to-online transition

Testing should include slower networks and lower-end devices, not only fast broadband and modern hardware.

## 6. User experience and resilience

The interface should clearly communicate:

- Loading
- Saved state
- Unsaved state
- Offline state
- Synchronization
- Errors
- Permission denial
- Session expiry

Error messages must not reveal secrets, internal infrastructure details or unnecessary personal information.

## 7. Accessibility and safeguarding together

Accessibility accommodations must not weaken privacy or child-safeguarding controls.

Examples:

- Shared-device support must not expose another learner's records.
- Accessibility assistance must not grant unauthorized data access.
- Recovery/help workflows must retain required identity and safeguarding checks.

## 8. Required Stage 25 evidence

Stage 25 should not be marked implementation-complete until evidence exists for:

- Accessibility target documented
- Automated accessibility checks where suitable
- Manual accessibility review
- Keyboard/focus testing where applicable
- Screen-reader testing where applicable
- Responsive layout testing
- Representative Android/device testing
- Low-bandwidth testing
- Offline/reconnect testing
- Sync conflict and stale-operation testing
- Performance testing
- Accessibility defects remediated or documented
- Independent accessibility review where required

## 9. Release boundary

Stage 25 does not authorize production publication.

The production approval gate remains fail-closed until accessibility, device compatibility, low-bandwidth/offline behavior and the remaining production requirements are implemented and verified.
