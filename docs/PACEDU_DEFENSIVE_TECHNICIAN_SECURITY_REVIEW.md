# PacEdu Defensive Technician and Ethical Security Review

## Purpose
This is a controlled, defensive maintenance plan for the PacEdu pilot. Automated checks run read-only and report findings; they do not self-edit production, access real student records, change repository permissions, or deploy releases.

## Automated checks
- Run the existing Node regression suite.
- Scan tracked source/configuration for obvious committed secret patterns.
- Validate local script references.
- Run the package-lock-based dependency audit and fail on high/critical reported advisories.
- Verify the production authorization gate remains fail-closed.
- Continue using the separate CodeQL scan and Firebase Firestore/Storage emulator rules tests.
- Run daily and on every pull request to main; allow a repository owner to start a manual run.

## Technician triage order
1. Identify the failing workflow, exact commit, and first failing step.
2. Reproduce with synthetic/demo data and preserve logs that do not expose secrets or child information.
3. Make the smallest isolated fix on a branch; never overwrite protected voice files or unrelated working features.
4. Add a regression test for the failure.
5. Rerun the full relevant checks and confirm the protected-feature and voice locks pass.
6. Ask the owner to review and merge. No bot should self-approve or self-merge.

## Authorised ethical security testing
- Only test systems, accounts, endpoints and data explicitly owned by or authorised for PacEdu.
- Start with static analysis, dependency review, security rules emulator tests and synthetic accounts.
- Do not attempt credential theft, phishing, persistence, destructive testing, denial of service, or access to real student records.
- Any external penetration test must have a written scope, time window, contact and stop condition, with an independent report and remediation retest.

## Required before expanding the pilot
- [ ] All relevant GitHub Actions checks pass on the exact proposed commit.
- [ ] Firestore and Storage rules pass emulator tests; verify least-privilege access for student, teacher and administrator roles.
- [ ] No unresolved high/critical dependency advisories without documented owner-approved mitigation.
- [ ] Secret scan passes; any exposed real credential is revoked/rotated, not merely deleted from a file.
- [ ] Install and test the candidate on the actual Android device, including voice, registration, date, navigation, offline mode, resume, sign-out and screen-reader/large-text controls.
- [ ] Verify backups and complete a restore drill for any backend used by the pilot.
- [ ] Review child privacy, safeguarding, consent, retention/deletion and incident-response procedures.
- [ ] Curriculum content and assessment papers are checked against authoritative current Fiji sources before being labelled official.
- [ ] Owner reviews evidence and authorises the next pilot scope.

## Honest limits
A green workflow is not proof that PacEdu is fully secure or fully functional. Static scans can miss flaws; automated tests cannot verify real-world usability, all device TTS engines, legal compliance or curriculum authority approval. Do not enable real payments or production child-data services until the existing production release gate's independent evidence requirements are satisfied.
