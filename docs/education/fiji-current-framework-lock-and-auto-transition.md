# Locked curriculum decision: Fiji current framework and automatic transition policy

**Decision:** PacEdu Basic Education (PCD) uses the Fiji National Curriculum Framework currently in force as its locked baseline. The current working baseline is the 2013 Fiji National Curriculum Framework until an authorised replacement is formally brought into force. The Ministry's 2026 review announcement is not, by itself, evidence that the replacement framework has commenced.

**Conversation decision recorded in this proposal branch:** do not replace this baseline with another country's framework or an unapproved draft. Keep ECE named ECE. Apply the currently adopted Fiji curriculum, syllabus, subject choices, assessment policy and school calendar to class/subject content.

## Evidence checked

- Fiji Cabinet decisions dated 7 October 2025 say Cabinet endorsed a review of the 2013 Fiji National Curriculum Framework: https://www.fiji.gov.fj/14th-cabinet-meeting-decisions-7-october-2025/
- Fiji Parliament Hansard dated 25 May 2026 records the Ministry saying the comprehensive review had launched and the revised framework would be submitted for Cabinet endorsement after consultation: https://www.parliament.gov.fj/wp-content/uploads/2026/06/Daily-Hansard-Monday-25th-May-2026.pdf

These sources support the status “review underway” as of the latest official evidence checked here; they do not establish that a replacement framework is already in force. Monitor official Ministry/Cabinet publications for a later commencement notice.

## Automatic transition behaviour required

When an official source explicitly confirms that a replacement framework has been approved/adopted and states its effective date or commencement, PacEdu should automatically:

1. Capture the official notice, URL, publication date, effective date, framework version and verification timestamp.
2. Create a new immutable version record; preserve the old framework and historical student evidence for audit.
3. Switch the active curriculum version only from the official effective date and according to school adoption instructions.
4. Compare old and new outcomes, class/subject structures, language requirements, assessment rules and progression expectations.
5. Mark outcomes as unchanged, revised, newly added, withdrawn or mapping-required.
6. Rebuild draft daily activities, revision sequences, practice assessments, answer keys and rubrics from the new approved mappings.
7. Run automated checks for missing outcomes, class/subject mismatches, inaccessible resources, broken links, unsafe data exposure and assessment/answer-key leakage.
8. Notify the owner and relevant school administrator with a migration report, impact list and any unresolved items.
9. Publish versioned changes only after official source verification and required curriculum reviewer/school adoption approval; retain a rollback path.

## Safety and accuracy rules

- A changed webpage alone is not proof that a new framework is in force. It triggers review, not automatic activation.
- Never guess an effective date, subject list, syllabus, achievement indicator, exam structure, grade boundary or mark weighting.
- If the new framework is announced but its effective date or subject-specific syllabus is unclear, keep the last approved version active and show a curriculum-update alert.
- Keep curriculum mapping status visible: verified, review-required, or outcome-mapping-pending.
- Teacher/school adoption settings and class subject choices remain authoritative where the Ministry permits local configuration.
- Do not silently overwrite released lessons or historical marks. New content is versioned and old records remain readable.
- New framework transition must not weaken student privacy, teacher approval, accessible evidence options, or protected assessment content.
- Use independent framework versions for other countries; Fiji's framework must never be applied to non-Fiji schools by default.

## Implementation status

This document and the source registry record the required policy on PR #306. They do not prove the live app already performs all automatic migration steps. The live monitor, official commencement detection, curriculum mapping regeneration, approval workflow and UI activation must be implemented, tested, merged and deployed before describing the feature as operational.
