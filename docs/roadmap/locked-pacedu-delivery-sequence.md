# Locked PacEdu Delivery Sequence

**Decision status:** User-authorised priority and order, recorded on staging branch 12 November 2026.
**Implementation status:** Requirements locked; delivery remains subject to staged implementation, source verification, tests and explicit release approval.
**No merge, production deployment, Firebase mutation, payment activation or APK replacement is authorised by this document.**

## Mandatory order

### Stage 1 — Complete curriculum source and indicator inventory
- Start with Fiji, then extend to each additional jurisdiction only through its own authorised curriculum sources.
- Verify issuer, legal/administrative authority, effective status, edition, publication date, level, subject, page/section and permitted use/licence.
- Prefer the newest effective prescription. If unavailable or not verifiable, use the latest reliable older prescription as an explicitly labelled interim basis, revised into current teaching activities without falsely claiming it is current.
- Extract prescribed concepts and indicators first. Keep exact source codes and concise paraphrases; do not invent indicators.
- Record unavailable, conflicting, draft, trial, superseded and restricted documents distinctly.
- Retain the official source level labels. Map Class/Form aliases only when an authoritative equivalence is established.

### Stage 2 — Complete exact 115-day distributions
- Plan 45 instructional days in Term 1, 45 in Term 2 and 25 in Term 3.
- Build coverage by jurisdiction, class/year, subject, term, week and day.
- Verify prerequisite progression, repeats, gaps, subject availability and local school calendar exceptions.
- Do not borrow an indicator from another day, level, subject or country to fill a gap.
- Have an authorised curriculum reviewer validate source-to-indicator mapping and a qualified educator validate day-level teaching suitability.
- Keep incomplete slots blocked and visible in an owner coverage report.

### Stage 3 — Complete student worksheets and teacher guides
- Every worksheet must reference its exact approved indicator, source, level, subject and daily slot.
- Use Bloom's taxonomy (Remember, Understand, Apply, Analyse, Evaluate, Create) to build suitable question variety and cognitive progression.
- Copper, Bronze, Silver and Gold share the same approved learning objective; scaffolding and challenge differ, not the prescribed objective.
- Include suitable texts/stimuli, worked examples, questions, answer rationale, marking criteria, accepted equivalent wording, misconception notes and next steps.
- Provide separate student and teacher versions, audio with visible text/transcript, accessible response methods, teacher-authorised voice response where appropriate, print/download options, and offline save/resume.
- Auto-mark only objectively keyed items; teacher-review subjective, practical, oral and creative evidence.
- Do not use copyrighted passages, textbooks, images or examination papers without appropriate permission/licence.

### Stage 4 — Build the separate Global Library
- Begin only after Stage 3 worksheets pass their completion and quality gates.
- Keep library navigation separate from the learner's main subject/workspace flow.
- Include educational fiction and non-fiction resources for reading, listening and watching.
- Show language, level, subject/topic, format, accessibility features, source, rights/licence and free/paid access clearly.
- Do not imply permission to reproduce or stream a resource merely because it is publicly accessible.

### Stage 5 — Expand user capacity and personal information space
- Design for elastic scale with no arbitrary small global registered-user ceiling, while stating no physically infinite capacity guarantee.
- Use stateless application services, scoped multi-tenant data, managed databases, object storage/CDN, background queues, caching, pagination and autoscaling.
- Keep learner records private and jurisdiction-scoped; enforce permissions server-side.
- Provide personal saved resources, notes, bookmarks, permitted uploads and learning history with transparent limits, usage display, export/deletion, retention and recovery.
- Keep essential learner progress independent of unexpected payments; make storage and paid entitlements clear before use.
- Load-test, monitor latency/errors/costs/quotas, test backup restoration and offline synchronisation, and use gradual rollouts with rollback.

## Release gates
- Source/legal/copyright review appropriate to each jurisdiction.
- Server-side authority and educator approval; client CSV/import metadata is never proof of approval.
- Privacy, child safeguarding, accessibility and security checks.
- Tests for curriculum isolation, role permissions, exact day mapping, no borrowing, offline recovery, duplicate submissions, performance and restore.
- Explicit owner approval before merging or production release.

## Current boundary
This document records the user's requested order and acceptance requirements. It does not certify that any stage is complete. PR #363 remains draft and unmerged until the owner separately authorises a merge after reviewing fresh checks. Production, Firebase, payments and installed APK remain unchanged.
