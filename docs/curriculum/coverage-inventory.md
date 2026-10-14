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
