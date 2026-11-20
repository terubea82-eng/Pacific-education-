# PacEdu Global Account Lifecycle and Learning Entitlements

**Status:** Staging architecture specification only  
**Branch:** `pacedu/simple-subject-workspace-staging-20261111`  
**Purpose:** Define safe account states, free access, verification, school pathway, paid entitlements and account continuity  
**Implementation status:** Not implemented by this document

## 1. Core rules

1. Each authenticated person/account has one stable, immutable PacEdu UID.
2. A user may select multiple curriculum countries without creating multiple user identities.
3. Registration country, preferred curriculum country and contracting/billing country are separate facts.
4. A selected role or country in a browser form is a preference/request, not proof of identity, school enrolment or authority.
5. Eligible users should receive the published free learning library without entering payment details.
6. Paid features require an explicit purchase by the account holder or authorised payer, and a verified payment event.
7. A user's learning history must not be erased when their country, curriculum, school, role request or plan changes.
8. Official school assessment records must remain distinguishable from supplementary and personal practice.

## 2. Account states

Use explicit server-managed lifecycle states. Suggested states:

- `pending_email_or_contact_verification`
- `active_free`
- `pending_guardian_authorisation`
- `pending_school_verification`
- `active_school_learner`
- `active_individual_learner`
- `active_teacher`
- `pending_country_admin_approval`
- `active_country_admin`
- `suspended_review`
- `closed`

These states are not user-editable. Transitions must be performed by trusted server workflows after required evidence and approvals. Avoid one overloaded `role` field: account status, role assignments, learning pathway and billing entitlement are distinct dimensions.

## 3. Suggested lifecycle

### A. New user

- Create a Firebase Authentication identity after verified sign-up.
- Assign a stable UID.
- Record minimum necessary profile details.
- Set status to pending verification until required checks are complete.
- Do not trust display name, country, age, school, student ID or role submitted by the browser as verified facts.

### B. Free learning access

- Once the minimum account checks required for the service and jurisdiction are satisfied, grant the free library entitlement.
- Do not require a payment card.
- Label curriculum resources with country, curriculum version, source and whether the learning is supplementary or officially authorised.
- Keep access to lawful free materials even if a paid plan expires, unless a legal or safety reason requires otherwise.

### C. Learner pathway

- A learner may request a school pathway and provide school details through a protected workflow.
- Verify school roster/identity through an authorised school or country process.
- Before verification, show the learner as pending school verification and keep their activity in the personal/supplementary pathway.
- Only after approval should official school class membership and teacher assignment be provisioned server-side.
- Do not let a child self-assign a teacher, class, school administrator or official assessment status.

### D. Teacher and country administrator

- Teacher access requires an authorised school assignment and active class scope.
- Country administrator access requires documented country authority approval and explicit country scope.
- Owner access is granted only through a restricted trusted administrative process, never through public registration or a client-editable field.
- Every privileged grant, change and revocation must be audited.

### E. Paid plan

- A free user may view the optional plan and pricing information.
- A paid entitlement is activated only after clear acceptance of the terms by the account holder or authorised guardian/payer and verified payment or a valid sponsor agreement.
- Record entitlement start/end, features, billing period, payer, agreement/payment reference and status.
- Failed, pending or unverified payment must not activate paid access.
- Cancellation and expiry should follow the published terms; do not silently renew or silently charge.
- Keep free entitlement available when paid entitlement ends.

## 4. Entitlement model

Treat access as a server-calculated set of entitlements, not a browser-selected plan name.

Suggested entitlement dimensions:
- `free_library`
- `basic_practice`
- `expanded_student_pathway`
- `advanced_progress_reports`
- `teacher_workspace`
- `school_management`
- `country_reporting`

Each entitlement record should include:
- UID or organisation/school scope.
- Entitlement key.
- Source: free policy, individual purchase, guardian purchase, school subscription or country agreement.
- Effective start and end.
- Status: pending, active, expired, cancelled, suspended or refunded.
- Agreement, invoice or verified payment reference where relevant.
- Issuer and audit timestamps.

A client must never write its own active paid entitlement. Every protected API and data operation must check the caller's current entitlement and role/scope server-side.

## 5. Multiple curriculum countries

- One UID may have several curriculum selections.
- Store each selection as a separate record with country, curriculum version, selected date and pathway type.
- Switching the preferred curriculum does not change registration country, residency, school enrolment or billing country.
- A supplementary learner may practise another country's curriculum without claiming official school placement.
- If a country later adopts PacEdu, the learner may request transfer into its authorised school pathway. Keep earlier supplementary records and do not automatically convert them into official school assessment results.

## 6. Account continuity, duplicates and recovery

- Use the immutable UID as the primary account key.
- Do not deduplicate users solely by display name or a shared family email.
- Treat duplicate-account resolution as a support workflow requiring sufficient verification and an audit record.
- Do not merge learning histories automatically based on matching names, student IDs or phone numbers.
- Account recovery must use verified recovery channels and must not allow a guardian, teacher or country administrator to take over an unrelated adult account.
- Account closure must follow applicable retention/deletion law and preserve only records that PacEdu is legally required to retain.
- Do not store raw identity documents or children's official identifiers in general-purpose profile documents unless necessary, lawful and protected.

## 7. Guardian and child safeguards

- Determine age/consent requirements for each launch jurisdiction before opening accounts to children.
- Where required, obtain verifiable guardian authorisation before collecting personal data or activating applicable services.
- The guardian/payer relationship must be verified and scoped; it must not grant access to unrelated children's records.
- Children must not be prompted to enter payment credentials or make purchases.
- Payment and upgrade communications should be directed to the authorised adult, not used as pressure in the child's learning experience.
- Provide age-appropriate privacy information and a contact route for guardian requests.

## 8. Owner and country dashboards

- Owner global totals are derived from verified unique UIDs and aggregated server-side.
- Country dashboards expose only permitted aggregates and records for that country.
- Registration country, curriculum country and contracting/billing country remain separate dimensions.
- A user with multiple curriculum selections counts once in global unique-user totals.
- Do not expose children's individual learning histories in marketing or global growth dashboards.
- Restrict and audit all access to personal and financial records.

## 9. Transition and abuse tests

Before release, test that:
- A browser cannot change its own UID, role, country-admin scope, school membership or paid entitlement.
- A free user can use the free library without payment details.
- A pending school learner cannot see official class assessment data.
- A supplementary curriculum selection does not change residency, official enrolment or country billing.
- Multiple curriculum selections do not inflate unique-user totals.
- A paid entitlement activates only after verified purchase or approved sponsorship.
- A pending/failed payment does not activate paid features.
- Cancellation/expiry removes only the relevant paid entitlement and preserves the free library and permitted learning history.
- Guardian access is limited to the verified linked child and authorised functions.
- Revoked teacher/country-admin assignments immediately fail subsequent server-side checks.
- Closed/suspended accounts cannot continue protected operations.
- Every privileged state transition creates an audit event.
- Duplicate resolution cannot merge unrelated users or overwrite their history.

## 10. Release gates

Do not implement production account transitions or entitlements until Firebase Authentication, trusted server-side authorization, guardian/child compliance, data retention and access-control tests are reviewed. Run emulator tests and controlled staging-project tests. Confirm the deployed Firebase project and rules before release.

## 11. Explicit non-changes

This is a design specification only. It does not change registration code, Firebase Authentication, Firestore or Storage rules, cloud functions, IAM, user data, payment provider settings, subscriptions, invoices or receipts. It does not create or verify accounts, assign roles or grant entitlements. Any implementation requires a separate reviewed change and explicit release approval.
