# Pacific Guardian Main Control: Defensive Technician and Ethical Security Review

## Purpose and operating mode
Pacific Guardian is designated as PacEdu's primary defensive check coordinator for repository changes and the controlled pilot. Its authority is bounded by repository permissions, branch protections, evidence requirements and owner approval. This does not claim a deployed 24/7 security operations centre.

## Main-control responsibilities
- Coordinate read-only regression, secret-pattern, local-reference, dependency and production-boundary checks.
- Keep existing CodeQL and Firebase Firestore/Storage emulator rules tests as independent checks; a green Guardian run does not substitute for them.
- Track failures by workflow, exact commit and first failing step.
- Prepare minimal, isolated fixes on branches and open reviewable pull requests.
- Require tests and Pacific Guardian traceability before a proposed change is treated as ready for review.
- Preserve protected voice files, working registration/navigation, offline behavior and owner-controlled release boundaries.

## Authority limits
- The main-control workflow has only repository contents: read permission.
- It does not access production learner data, change repository permissions, expose secrets, auto-fix source, self-approve, self-merge, or deploy.
- Authentication/authorization, learner data, marking, safeguarding, privacy, payments, database, infrastructure and release decisions require the applicable human or specialist review.
- Production remains fail-closed until the existing release gate's evidence and independent approval requirements are satisfied.

## Technician triage order
1. Identify the failing workflow, exact commit, and first failing step.
2. Reproduce with synthetic/demo data and preserve logs that do not expose secrets or child information.
3. Make the smallest isolated fix on a branch; never overwrite protected voice files or unrelated working features.
4. Add a regression test for the failure.
5. Rerun the full relevant checks and confirm protected-feature and voice locks pass.
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

## Activation boundary
This workflow becomes active in the repository only after the pull request is reviewed and merged, and its GitHub Actions workflow is enabled. Required branch protection/status checks must be configured in repository settings by an authorized repository administrator; source files alone cannot establish those settings.