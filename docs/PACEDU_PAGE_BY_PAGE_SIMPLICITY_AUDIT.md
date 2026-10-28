# PacEdu Page-by-Page Simplicity Audit

Date: 28 October 2026  
Branch: `feature/voice-switch-page-instructions`  
Scope: static structural review of `src/index.html` plus current voice/worksheet feature branch. This is an audit record, not a claim that every page has passed browser or device testing.

## Acceptance rule

Every learner-facing page should be understandable to a Class 1 learner: one clear task at a time; short familiar words; large tappable controls; optional spoken guidance with Next, Back, Repeat, Stop and Mute; a worked example before each activity; brief feedback and safe retry; clear save/offline status; and no teacher/admin controls or other learners' private information. Simplify content without removing code or controls until dependencies and regression tests have been checked.

## Static page inventory and first-pass review

| # | Section / page | First-pass action |
|---:|---|---|
| 1 | Welcome to Pacific Education | Keep welcome short; one obvious Next action. Avoid repeating the founder/purpose story on later pages. |
| 2 | Why Pacific Education / PacEdu? | Review for overlap with Welcome and Vision. Keep only if it serves a distinct step; don't delete until navigation references are checked. |
| 3 | Vision • Mission • Purpose | Keep one concise version; compare with sections 4–5 for duplicated text. |
| 4 | Mission | Candidate to combine with section 3 if it repeats the same content and has no independent route. |
| 5 | Purpose | Candidate to combine with section 3 if it repeats the same content and has no independent route. |
| 6 | Pacific Education Mail Box | Keep separate from personal email; explain simply what it is for and show only authorised messages. |
| 7 | App Menu | Keep out of the child's main activity path if the guided flow already provides navigation. |
| 8 | Accessibility Controls | Preserve text-size and speech accessibility; labels should be easy to understand and controls easy to tap. |
| 9 | Controlled Pilot Banner | Keep pilot limitations available to adults/administrators; avoid placing lengthy operational detail in the child's activity path. |
| 10–12 | Technician Activation, Technical Workspace, Privileged Access Notice | Restrict to authorised owner/technician access; never show these controls in the learner flow. |
| 13 | School Identity | Keep school setup in the appropriate adult workflow; avoid asking a child to manage it. |
| 14–15 | Learning Platform / Learning Tools | Check whether both headings duplicate the same entry point; retain only the necessary child-facing choice after checking route dependencies. |
| 16 | Teacher Calendar | Keep in teacher workspace; make dates and actions clear. |
| 17 | Account Recovery | Show only when needed; use plain-language recovery steps. |
| 18 | User Registration | Ask only for required information, explain each field simply, and keep role/access checks intact. |
| 19 | Website Pilot Launch Checklist | Adult/owner-only, not a learner step. |
| 20 | Prototype Access | Keep behind the correct access/role gate; explain the next action plainly. |
| 21 | Learning Level | Use familiar labels; do not ask a Class 1 child to interpret technical ability categories. |
| 22 | Curriculum Subject | Show the learner only the assigned/approved subject choices. |
| 23 | School Term | Auto-fill from the school calendar where reliable; don't force young learners to configure terms. |
| 24 | Learning Capability | Ensure the value is displayed and understandable; avoid a blank or technical-looking box. |
| 25–26 | Daily Activities / Practice | Priority: one task at a time, example before each activity, large response controls, repeat/listen option and clear progress. |
| 27 | Home Evidence | Child/family submission only when assigned; preserve teacher review and privacy checks. |
| 28 | Term Baseline Assessment | Explain purpose simply; prevent accidental loss of answers. |
| 29 | School Transfer | Adult/authorised workflow, not part of the daily child path. |
| 30 | Assessment | Separate child instructions from teacher assessment controls; use simple wording and clear feedback. |
| 31 | Special Education / Inclusion Dashboard | Restrict sensitive support information to authorised users; avoid labels that stigmatise children. |
| 32 | Teacher Daily Activities | Teacher-only workspace; concise action steps and generated examples for each activity. |
| 33 | Parent Dashboard | Show only the linked learner's authorised progress and practical next steps. |
| 34–38 | Access Entitlement, Institution Fees, University Fee Workflow, Payment Links, Plans | Keep payment/fee flows disabled or clearly marked as future until approved; do not expose them to children or imply pilot charges. |
| 39 | Connectivity Boundary | Translate technical status into simple saved / waiting to sync / synced wording where supported by real state. |
| 40 | Publication Status | Adult/owner-facing; keep official-approval claims accurate. |
| 41 | Pacific Education AI | State what the tool can and cannot do; provide a safe, clear prompt flow. |
| 42 | Pacific Guardian — Owner Oversight | Owner/admin-only, never in a child's navigation. |
| 43–44 | Student External ID Registry / Identity Integrity | Keep sensitive identity functions protected and out of child-facing pages. |
| 45 | System Status | Adult/owner-facing; show actionable status rather than raw technical details to learners. |

## Initial findings

1. The HTML contains several purpose/mission/vision sections (2–5). They are candidates for simplification, but should not be removed until guided navigation and script references are verified.
2. Several adult-only or privileged sections are present in the same HTML document. Visibility and role/access guards must be tested, not assumed from labels alone.
3. The current global voice-switch workspace list includes 16 workspace IDs; that list is not proof that every guided-flow page has its own narration. Guided-page narration remains handled by the existing voice repair/navigation code and must be checked separately.
4. The worksheet code identifies its practice questions as original pilot content, not a verified import of Fiji Ministry achievement indicators. Keep that status accurate.
5. A Class 1-friendly example should precede every activity, not merely teacher instructions. This needs an explicit content-level test across supported subjects and class/ability levels.
6. Static HTML inspection does not prove mobile usability, speech-engine availability, correct role isolation, offline saving, or successful student journeys.

## Safe order of work

1. Test the current entry flow and every guided step without changing the protected navigation baseline.
2. Check each page's title, instruction length, controls, voice, back/next route, and role visibility.
3. Check every generated activity has an example and child-friendly directions.
4. Remove only confirmed duplicate display content after reference/dependency checks.
5. Run targeted and full relevant CI; do not merge until all required checks pass.
6. Test on a real Android device before describing device behavior as verified.

## Current verification snapshot

At the time this audit was written, GitHub Actions reported the voice-feature regression workflow and several existing preservation/security workflows as successful on the checked commit. CodeQL and cross-device browser tests were still in progress. This is not a full pass for every page; re-check the newest branch commit's results before merge.
