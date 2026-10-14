# Fiji Curriculum Coverage Inventory

**Requirement:** [Issue #117 — mandatory ECE–Year 13 curriculum-aligned, capability-adaptive daily learning](https://github.com/terubea82-eng/Pacific-education-/issues/117)

**Status:** Initial audit scaffold. This is not a claim of curriculum coverage, Ministry endorsement, or classroom readiness.

## Rules for this inventory

- The applicable official Fiji Ministry of Education curriculum/syllabus is authoritative.
- Verify current official source documents and effective dates before mapping outcomes or writing content.
- Never mark content as Ministry-approved without documentary evidence of approval.
- “Implemented” requires working content and tested behaviour, not only a policy flag or placeholder.
- Every activity must distinguish teacher-assigned learning from demo practice and formal assessment.
- Keep content accessible and provide differentiation based on demonstrated learner capability, with teacher oversight.
- Curriculum content and pathway completion require qualified educator review.

## Level coverage register

Every level below is **not yet verified against official curriculum sources** by this initial code audit.

| Level | Content inventory status | Official source/version | Educator review |
|---|---|---|---|
| Early Childhood Education (ECE) | Not audited | To verify | Pending |
| Kindergarten | Not audited | To verify | Pending |
| Class 1 | Partial prototype indicated in master specification; content coverage not audited | To verify | Pending |
| Class 2 | Not audited | To verify | Pending |
| Class 3 | Not audited | To verify | Pending |
| Class 4 | Not audited | To verify | Pending |
| Class 5 | Not audited | To verify | Pending |
| Class 6 | Not audited | To verify | Pending |
| Class 7 | Not audited | To verify | Pending |
| Class 8 | Not audited | To verify | Pending |
| Class 9 | Not audited | To verify | Pending |
| Class 10 | Not audited | To verify | Pending |
| Class 11 | Not audited | To verify | Pending |
| Class 12 | Not audited | To verify | Pending |
| Class 13 | Not audited | To verify | Pending |

## Subject and learning-domain inventory

The following are audit categories, **not a representation of the official Fiji subject list**. Confirm the exact subject names, year applicability, and learning outcomes against current official sources.

- Languages and literacy, including the required language(s) for the level
- Mathematics and numeracy
- Science and inquiry
- Social studies, history, geography and civic learning where applicable
- Digital and information literacy where applicable
- Health, physical education and wellbeing
- Arts, music, creativity and practical expression
- Technology, design and practical/vocational learning where applicable
- Life skills, community and environmental learning
- Level-specific senior secondary and examination pathways

For each verified subject/level combination, record the official source title, issuing authority, publication/version, effective date, exact learning outcome/reference, activity IDs, accessibility alternatives, assessment evidence, educator reviewer and review date.

## Minimum daily-sequence checklist

A pathway should not be marked complete until each relevant item is evidenced:

- [ ] Teacher-authorised learner level, subject and term assignment
- [ ] Explicit learning objective linked to a verified curriculum reference
- [ ] Age- and level-appropriate explanation/instructions
- [ ] Guided example or demonstration
- [ ] Independent practice with meaningful response options
- [ ] Easier scaffold/remediation and optional challenge/enrichment
- [ ] Feedback and retry opportunity
- [ ] Accessible alternative (including screen-reader/keyboard use and visual/text alternatives as appropriate)
- [ ] Progress evidence with privacy-conscious handling
- [ ] Teacher review/override and clear separation of practice from formal assessment
- [ ] Offline/cached behaviour and clear sync status
- [ ] Automated regression tests and physical-device/educator validation recorded

## Initial repository audit

Files inspected on main:

- `js/dailyLessons.js`: contains concrete day-by-day English-oriented content, including a detailed Days 1–60 sequence and further English practice through Day 365. This does **not** establish a complete multi-subject ECE–Year 13 programme.
- `src/js/pacificEducationMasterInclusionSpecification.js`: declares Kindergarten and Classes 1–13, inclusion, curriculum authority, adaptive support, offline fallback and assessment principles. These policy flags are not evidence that all associated content or runtime behaviour is implemented.
- `src/js/pacificEducationSequentialRoleWorkspaces.js`: student flow includes class/level, subject, term and capability steps. This alone does not prove all pathways have correct content.

## Completion gate

Do not claim “complete Fiji curriculum coverage” until every required level/subject has an official-source mapping, usable activity sequences, tested accessibility/differentiation, educator review and recorded validation. CI passing is not proof of physical-device behaviour or Ministry approval.


## Official-source register — initial verification

These official Ministry publications provide useful starting points for the mapping exercise. They are **framework/policy references, not proof that every current syllabus or subject outcome has been collected**. Check for newer or replacement documents before mapping specific activities.

| Source | What it establishes for the audit | Status |
|---|---|---|
| [Na Noda Mataniciva — Kindergarten Curriculum Guidelines for the Fiji Islands](https://www.education.gov.fj/wp-content/uploads/2022/06/Na-Noda-Mataniciva.pdf) | Official early-childhood/kindergarten guideline; the document covers ages 3–6 and foundation areas including physical development, health and wellbeing; learning to know; language, literacy and communication; living and learning together; aesthetics, creativity and the arts; spiritual and moral development. | Located; verify current applicability and any replacement |
| [Fiji National Education Policy Framework 2024–2033](https://www.education.gov.fj/wp-content/uploads/2024/02/2023-Denarau-Declration.pdf) | Policy context for education and curriculum. | Located; map relevant policy, not individual lesson outcomes |
| [Teacher's Guide to Disability-Inclusive Education in Fiji](https://www.education.gov.fj/wp-content/uploads/2024/09/SIE-guide-high-res-web-version-1.pdf) | Official inclusion guidance; references the National Curriculum Framework and flexible teaching and assessment approaches, including cultural and multilingual inclusion. | Located; use for accessibility/inclusion design, not as a subject syllabus |
| [Pre-Primary Education Policy](https://www.education.gov.fj/wp-content/uploads/2025/04/PPE_Policy_WEB.pdf) | Defines pre-primary/kindergarten context and states that the National Curriculum Framework structures curriculum from early childhood through Year 13. | Located; verify any current updates |

### Source verification still required before curriculum claims

- Obtain/verify the current National Curriculum Framework document and all applicable syllabus, scope-and-sequence and teacher-guide documents by year/level and subject.
- Record each document's exact title, publisher, version/publication date, effective status, URL and the exact outcome/reference mapped to an activity.
- Distinguish the document's publication date from when it was indexed or uploaded online.
- If the current applicable document cannot be verified, mark the pathway `awaiting_official_source_verification` and do not describe its content as Fiji Ministry-curriculum-aligned.
- Official policy context and inclusive education guidance support design decisions but do not replace the specific syllabus/learning outcomes for each subject and level.
