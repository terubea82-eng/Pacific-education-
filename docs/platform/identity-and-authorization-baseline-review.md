# PacEdu Identity, Registration and Authorization Baseline Review

**Review target:** `pacedu/simple-subject-workspace-staging-20261111`  
**Review commit before this document:** `5429710d175a32c38a87d1e95b0b06d9c73f6c6e`  
**Status:** Read-only baseline review and implementation plan  
**Environment:** Staging source review only; no Firebase Console, live data or deployed rules changed

## 1. Executive finding

The current staging source contains useful fail-closed UI messages and Firestore/Storage security rules, but the inspected registration flow is explicitly a browser-session pilot profile, not production authentication or a verified account system.

The current UI states that pilot registration creates a synthetic profile. The save handler stores the profile in `sessionStorage`, marks it `pilotOnly`, and says it does not sync to another device. The UI also states that the entered learner ID is not verified or stored. This must not be presented as a real registered identity, secure account, paid/free entitlement or school enrolment.

The existing Firestore rules deny public role creation and restrict user profiles to a narrow set of fields. Class membership writes are denied to clients and are expected to be provisioned by a trusted server. The current rules do not yet define a complete Owner-only global user-count dashboard, country administrator authorization, country agreement/payment model or production account lifecycle.

**Recommendation:** do not add global user counting or free/paid entitlements by trusting browser storage, a selected role, a country dropdown, or client-submitted counters. First establish verified identity and server-controlled authorization.

## 2. Files inspected

- `src/index.html` — registration UI and pilot save handler.
- `firebase.json` — identifies Firestore and Storage rules paths and Firestore region `asia-southeast1`.
- `firestore.rules` — client access policy for users, class membership, feedback, progress and learner submissions.
- `storage.rules` — private learner photo evidence path and default-deny rule.
- `tests/firestore-rules.test.cjs` — emulator rules tests for unauthenticated access, user ownership, role self-assignment, feedback, progress, submissions and storage.

This review is limited to those inspected files. It does not claim that every backend, cloud function, console setting, deployment or connected service has been inspected.

## 3. Current registration behavior observed

The registration handler:
- Uses a browser session key named `pacificEducationPilotRegistration`.
- Saves the selected display name, role, country code, language code and pilot flags to `sessionStorage`.
- Sets `pilotOnly: true`.
- Saves a local pilot role value in session storage.
- Clears the entered learner ID rather than storing it.
- Displays a message that the registration is only for the open app session and does not sync to another device.
- Blocks public self-registration for Owner/Control and Technician roles in this UI.

These are useful pilot safeguards, but browser-side restrictions are not a security boundary. A modified browser can bypass UI checks. Server-side authentication and authorization must be authoritative before any production workspace or protected data is exposed.

## 4. Existing Firestore and Storage protections observed

### Firestore

- `/users/{userId}`: authenticated users can read their own document; create is limited to a small allowlist of profile fields; update is limited to ordinary profile fields; client deletion is denied.
- `/classes/{classId}/members/{memberUid}`: a user may get their own membership; clients cannot list, create, update or delete membership records.
- Class role helper checks authenticated UID, membership role and active status.
- `/feedback/{feedbackId}`: authenticated owner-bound creation with message/category validation; client reads, updates and deletes are denied.
- `/progress/{progressId}`: create/read/update are restricted to the UID recorded on the document, and updates cannot transfer ownership; delete is denied.
- `/learnerSubmissions/{submissionId}`: creation requires the authenticated learner's active class membership and constrained metadata; assigned active teachers can review using limited fields; client deletion is denied.
- No broad catch-all allow rule was observed in the inspected Firestore file.

### Cloud Storage

- Learner photo evidence is constrained to a class/student/submission path, authenticated student ownership, active class membership, JPEG content type and an 8 MiB maximum.
- Only the learner and an active teacher assigned to that class may get the object.
- List, overwrite and delete are denied for this evidence path.
- All other object paths are denied by the catch-all rule.

### Important boundary

These rules protect the client paths described above. They do not, by themselves, prove that Admin SDK services, service accounts, callable functions, hosting configuration, Authentication providers, project IAM or deployed production rules are correctly configured. Admin SDK code bypasses Firestore Security Rules and must enforce its own authorization.

## 5. Critical gaps before global dashboard or billing

1. **Verified identity:** the inspected registration path is session-only and has no Firebase Auth account creation/sign-in call.
2. **Trusted role assignment:** a role selected in the browser is not proof of authority. Owner, country administrator, teacher and school roles must be assigned by a trusted process.
3. **Owner-only aggregate counts:** no complete server-enforced Owner-only country-count endpoint or data model was verified in this review.
4. **Country scope:** registration country, selected curriculum country and contracting/billing country must remain separate server-validated fields.
5. **Unique-user counting:** count by immutable authenticated UID or a carefully governed identity-resolution process, not display name, email text, student number typed into a public form, or number of curriculum selections.
6. **Child privacy:** minimize child personal information; never expose a global user list or children's individual activity to country administrators merely because they can view their own country totals.
7. **Entitlements:** free/paid access must be calculated by trusted server policy, not a browser flag or local storage value.
8. **Billing and receipts:** no payment or receipt may be inferred from an account's role, plan selection or client transaction screenshot.
9. **Account lifecycle:** duplicate handling, email/phone verification, guardian consent where required, recovery, deletion/retention and account merge rules require explicit design.
10. **Deployment parity:** emulator tests do not prove that the same rules are deployed to the intended Firebase project.

## 6. Recommended target data separation

Keep identity, authorization, learning preferences and billing facts separate. Illustrative server-owned records:

### User identity (private)

- `uid` — Firebase Authentication UID.
- `accountStatus` — pending, active, suspended or closed.
- `verifiedAt`, `createdAt`, `updatedAt`.
- Minimal contact and verification metadata as legally required.
- No plaintext identity documents or unnecessary sensitive child identifiers in general profile documents.

### User learning profile

- `uid`.
- `registrationCountryCode`.
- `preferredLanguage`.
- Optional preferences and accessibility settings.
- No privileged role claims writable by the user.

### Curriculum selections

- `uid`.
- `curriculumCountryCode`.
- `curriculumVersion`.
- `pathwayType` — supplementary or authorized-school.
- Verification/approval reference where official placement is required.

A user may have multiple curriculum selections while remaining one unique account.

### Authorization assignments (server-owned)

- `uid`, `role`, `scopeType`, `scopeId`, `active`.
- `grantedBy`, `grantedAt`, `expiresAt` where applicable.
- Role changes must be performed by trusted server code or a restricted administrative workflow, with audit events.
- Owner privileges must not be granted by public registration or a client-editable profile field.

### Country agreements and billing (separate records)

- Contracting country, agreement version, covered cohort definition, agreed currency/rate/billing period, effective dates and authorised contacts.
- Invoice and payment records reference the agreement and covered cohort.
- A user's preferred curriculum country must never automatically create a country payment obligation.

## 7. Recommended secure implementation order

### Phase A — Authentication foundation

- Confirm Firebase Authentication provider configuration and project environment.
- Implement verified sign-up, sign-in, sign-out and account recovery.
- Add age-appropriate guardian/consent flow where required by the launch jurisdiction.
- Keep the existing pilot-only session profile clearly separate from production accounts.
- Do not migrate pilot session records into verified accounts automatically.

### Phase B — Server-owned authorization

- Establish trusted server-side role assignments.
- Use least-privilege claims or database assignments with revocation and expiry.
- Verify role and scope on every privileged server endpoint.
- Deny by default and never trust a role, country, school or owner flag sent by the browser.
- Keep Owner global scope separate from country-admin scope.
- Add append-only audit records for grants, revocations and privileged reads.

### Phase C — Global aggregate counts

- Create a server-only aggregation process keyed by verified UID.
- Count unique accounts once, regardless of number of subjects or selected curricula.
- Keep registration country, curriculum country and billing country as separate dimensions.
- Exclude test, duplicate, unverified and closed accounts from defined headline metrics while retaining auditable category totals.
- Expose only aggregated country metrics to the Owner endpoint.
- Do not provide country admins with global totals or other countries' records.
- Prevent clients from writing aggregate counts or querying unrestricted user collections.

### Phase D — Free/paid entitlements

- Define a server-owned entitlement record and effective dates.
- Default eligible new accounts to the free tier without payment credentials.
- Require explicit authorised purchase/guardian approval for paid entitlements.
- Verify payment-provider events server-side before granting paid access.
- Keep free-resource access available according to the published policy.
- Add refund, cancellation, expiry, grace and dispute handling.

### Phase E — Country agreements, invoices and receipts

- Implement only after the agreement and payment model is approved.
- Invoice only the agreed covered cohort and agreed billing unit.
- Issue receipts only after verified payment events.
- Maintain immutable event history, corrections and refunds.
- Do not activate live payment collection as part of this baseline review.

## 8. Mandatory security test matrix

- Anonymous users cannot read private profiles, memberships, progress, country counts or billing records.
- Authenticated users cannot read or modify another user's private profile or learning records.
- A user cannot assign themselves Owner, country admin, teacher, Ministry or school administrator.
- A country admin cannot query another country or global totals.
- A teacher can access only assigned class/student records within granted scope.
- A user selecting another curriculum does not change registration country or billing country.
- Duplicate subjects/curriculum selections do not inflate unique-user totals.
- Browser storage edits and forged API payloads do not grant roles or paid entitlements.
- Clients cannot write Owner dashboard aggregates, invoices, receipts, agreements or payment events.
- Revoked/expired roles stop working on subsequent server authorization checks.
- Owner-only endpoints reject every non-Owner role even if the UI is manually opened.
- Admin SDK functions validate caller identity and authorization independently of Firestore Rules.
- Audit events record role grants/revocations and restricted dashboard access.
- Emulator tests and a controlled staging-project verification both pass before release.

## 9. Release gates

Do not enable production registration, privileged dashboards, country administrator accounts, paid entitlements, invoicing or receipts until:
- Authentication and recovery are implemented and tested.
- Server-side role/scope checks are independently reviewed.
- Firestore and Storage rules are tested and deployed to the intended environment.
- Backend/Admin SDK endpoints have authorization tests.
- Child privacy, guardian consent, retention and jurisdictional requirements have been reviewed.
- The Owner-only dashboard passes cross-country isolation tests.
- Backup, recovery and audit review are complete.
- The Owner explicitly approves release.

## 10. Explicit non-changes in this review

This document does not change `firestore.rules`, `storage.rules`, `firebase.json`, Firebase Authentication settings, Firestore data, Storage objects, project IAM, hosting, payment providers or production deployment. It does not create accounts, assign roles, count real users or grant legal/official status.

**Conclusion:** the current pilot registration is a session-only prototype. Keep it clearly labelled as such. Build verified identity and server-side authorization before implementing global counts, country dashboards or free/paid entitlements.
