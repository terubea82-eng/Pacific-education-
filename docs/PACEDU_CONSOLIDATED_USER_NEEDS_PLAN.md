# PacEdu consolidated user-needs implementation plan

**Purpose:** One owner-approved checklist for finishing the controlled PacEdu pilot without destabilizing working code. This document records requirements and acceptance gates; it does not claim every feature is already implemented.

## Non-negotiable change rules

- Keep the current working `main` and the resolved learner workspaces stable. Do not reopen or rewrite unrelated registration/workspace code.
- Preserve protected mandatory voice/navigation baseline `#856` and its protected files. One narrator at a time; page-specific narration, manual replay, stop speech, and accessible text controls. No competing auto-narrators.
- Small, isolated pull requests; inspect changed lines, run targeted tests and the complete relevant CI checks, then merge only after all required checks pass. Never force-push or merge failing/stale branches.
- Do not build or install an APK unless the owner explicitly requests it. No claim of physical-device verification unless performed.
- Keep the pilot owner-controlled. No production-ready, legally compliant, Ministry-approved, or official-curriculum-complete claims without evidence.
- Avoid unnecessary help panels, menus, duplicate prompts and technical wording in learner workspaces. Sign-out remains explicit and confirmed by the user, never automatic.

## P0 — Pilot reliability, safety and access

- [ ] Reconcile all open feature branches with current `main` safely; resolve conflicts manually and retain unrelated working changes.
- [ ] Fix and rerun the failed browser checks for World Library, mandatory voice, learner identity and sequential navigation. Verify the newest commit on each PR, not an old run.
- [ ] Resolve Pacific Guardian dependency-audit findings with reviewed, compatible dependency updates; no blind `npm audit fix --force`. Rerun audit, regression tests and browser tests.
- [ ] Keep Firebase rules least-privilege and verify them before enabling real student data. Confirm email/Google sign-in only as configured, role authorization, and server-side validation; never trust client-side role or identity alone.
- [ ] Protect child data: collect only needed information, use test identities in the pilot, avoid exposing student records in logs/analytics, and require authorized teacher review for learner identity/evidence.
- [ ] Keep offline-first behavior honest: show whether work is saved locally, queued, synced, or awaiting review; do not claim shared cross-device storage from browser-local storage.
- [ ] Keep pilot payment disabled. Future pricing may be shown as future plans only; no charge or payment collection in the pilot.
- [ ] Keep current affairs and externally sourced information pending review until checked; never present unverified feed items as teacher-approved content.

## P1 — Simple, complete learning flow (Fiji first)

- [ ] After registration, take the teacher directly to the Teacher Daily Activities workspace. Keep teacher and student views role-specific and uncluttered.
- [ ] Student view: automatic local date, numbered assigned activities, simple instructions, progress and feedback only. Students see activities after teacher assignment/approval; completed teacher-approved lessons become revision practice. Absent learners can work from home when authorized.
- [ ] Registration: collect the required Fiji FEMIS learner ID for Fiji students; where verification is unavailable, show a clear pending-verification state rather than pretending the ID was verified. Other countries can use their applicable school ID/name rules. Keep student names optional where the country workflow allows it.
- [ ] Teacher review must show the learner identity and evidence clearly so the teacher can confirm the correct learner. Never allow one learner's evidence to be attached to another learner.
- [ ] Camera/voice evidence is an optional submission method in the pilot, not a barrier to learning. Support typed/manual work too. Treat submitted photos/audio as evidence requiring appropriate review; do not claim camera AI marking is reliable unless validated.
- [ ] Daily assessment may automatically score only objectively keyed question types such as multiple choice and true/false. Matching, free response, photos and voice stay pending review unless a validated rubric and policy explicitly support automatic scoring.
- [ ] Generate individual, evidence-based feedback and progress. Keep marks/comments traceable; do not silently alter teacher-approved records. Teachers review evidence/identity and resolve exceptions; automated ability remains provisional until sufficient evidence exists.
- [ ] Ability identification: use four understandable, configurable performance bands with transparent percentage/evidence rules. Do not infer a final ability from one activity. The proposed gate is at least five teacher-marked daily activities plus a marked term examination; show “provisional / more evidence needed” before the gate, then explain the evidence and next learning steps to the teacher.
- [ ] Maintain an accessible, predictable sequence: Next/Back, stop speech, replay, normal/large/extra-large text and reduced-motion support. Prevent hidden/duplicate controls and accidental advancement.

## P2 — Curriculum and real daily activities

- [ ] Cover Fiji curriculum labels exactly as requested: **ECE**, Classes 1–8 and Forms 3–7. Start with English and expand across subjects.
- [ ] Each daily activity needs a learning objective, verified syllabus/achievement indicator, short explanation/example, student questions, answer key/rationale for teachers, differentiated versions for four ability bands, marking guidance, and print-ready student worksheet/lesson plan.
- [ ] Use clear English and familiar Fiji examples (market money, weather/rainfall, safe water, school/community services). Increase reasoning complexity by level without making instructions unnecessarily difficult.
- [ ] Preserve Day 1 as an initial diagnostic. Include the requested Class 1 English Term 1 Week 1 Day 2 starter, then build the term/week/day sequence, revision, exams and intervention packs from the school's verified calendar.
- [ ] Support teacher-configured school dates, terms, teaching weeks, holidays and learning days. Never count weekends/holidays as teaching days unless configured; do not invent official term dates.
- [ ] Curriculum labels must not be called “officially aligned” until each outcome and teaching sequence is verified against current authorized Ministry/school documents. Teacher-verify iTaukei and Hindi content; do not invent translations.
- [ ] Printable output must exclude teacher-only answer keys from the student worksheet. Keep class, subject, term/week/day and ability band visible on teacher previews.

## P3 — Trusted educational resources and wider work needs

- [ ] Provide a country-aware education resource hub with legitimate official links: ministry/curriculum sources, school information, scholarships, grants, training, exams, university/TVET admissions and educational opportunities.
- [ ] Clearly label source, country, publication/update date and review status. Open external resources in a safe new destination; do not scrape restricted content or promise that every external link is current.
- [ ] Country-specific current affairs: use reputable/official feeds where available, summarize in simple educational language, link to the source, and route content through teacher review before showing it as classroom material. Fall back to local real-life learning when no suitable feed exists.
- [ ] Keep exam/curriculum access country-specific; do not expose another country's restricted papers or mislabel practice questions as official exam papers.
- [ ] Add a separate Worldwide Jobs/Careers helper for CV and cover-letter drafting, application guidance, interview preparation and country-aware job-search links. Do not invent qualifications, references or employment history; users review all generated documents before sending.
- [ ] Add the proposed Skills & Earn workspace for legitimate skills/training and opportunity links. Clearly warn about scams, fees and unverifiable offers; never promise earnings or imply a job is guaranteed.
- [ ] Provide relevant role-based information for education, government/public services, businesses/employers and community organizations without mixing their permissions with student/teacher access. External links must identify the source and country.

## P4 — Accessibility, voice, connectivity and operations

- [ ] Use one narrator at a time, consistent English voice where the device supports it, short page-specific narration, explicit replay/stop, and no repeated welcome audio on every page.
- [ ] Keep breathing cues short and optional, presented accessibly without blocking navigation.
- [ ] Test phone-sized browser layouts, keyboard/touch access, screen-reader labels, offline/slow-network behavior, service-worker cache updates, and registration-to-workspace handoff.
- [ ] Keep Pacific Education Mail Box clearly separate from personal email. Show only authorized pilot messages and feedback.
- [ ] Keep Technician mode disabled by default. Pacific Guardian maintenance/security actions must be authorized, auditable and least-privilege. The proposed app-scoped tunnel/VPN concept must not be presented as active protection until a real, tested tunnel is deployed.
- [ ] Analytics remains privacy-conscious and must not collect unnecessary children's personal data. Zero analytics data is not evidence that the app is broken.

## Release and merge gates

A feature is complete only when:
1. The intended change is small and isolated; protected files and unrelated behavior remain unchanged.
2. Relevant unit/regression tests pass.
3. Desktop and phone-sized browser tests pass on the latest PR head.
4. Security/dependency checks pass or have an explicitly documented, owner-approved exception with mitigation.
5. The UI is checked for the intended role and no unrelated workflow regresses.
6. The PR description states limitations honestly; official curriculum, cross-device sync, automatic marking, live VPN and physical Android installation are not claimed unless actually verified.
7. Merge is performed in a controlled order after checks pass; deployment is then checked separately.

## Suggested implementation order

1. Stabilize current failing PRs and security audit.
2. Verify learner registration/identity and the student/teacher handoff.
3. Finish teacher assignment, daily worksheets, evidence review and provisional ability reporting.
4. Verify calendar and curriculum mapping; expand worksheet coverage with reviewed content.
5. Finish trusted education/current-affairs resources, careers/CV helper and Skills & Earn as separate features.
6. Verify accessibility, offline/sync behavior, mailbox, permissions and deployment.
7. Conduct an owner-approved pilot acceptance review before any production or payment activation.

**Status note (2026-10-25):** This checklist is a consolidated requirements record, not proof that all items are implemented. Existing feature PRs remain separate and must be tested and merged individually.