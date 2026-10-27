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


## Additional official-status finding — National Curriculum Framework review

A further official-source check found that the Fiji Government's **7 October 2025 Cabinet decisions** state that Cabinet endorsed a review of the **2013 Fiji National Curriculum Framework (FNCF)**. This is important version-control context: the 2013 framework should not automatically be treated as unchanged or as the final current framework for new mapping. The announcement confirms endorsement of a review; it does **not** establish that a revised framework has since been published or specify its effective date.

- [Fiji Government — 14th Cabinet Meeting Decisions, 7 October 2025](https://www.fiji.gov.fj/14th-cabinet-meeting-decisions-7-october-2025/): review of the 2013 FNCF endorsed.
- [Ministry of Education Pre-Primary Education Policy](https://www.education.gov.fj/wp-content/uploads/2025/04/PPE_Policy_WEB.pdf): states that the National Curriculum Framework sets out curriculum philosophy and structure from early childhood to Year 13, and identifies *Na Noda Mataniciva* as the national curriculum guidelines for ages 3–6.
- [Ministry of Education Annual Report 2022–2023](https://www.parliament.gov.fj/wp-content/uploads/2025/04/Ministry-of-Education-Annual-Report-2022%E2%80%932023.pdf): records curriculum-review activity for selected Year 12 and Year 13 subjects. This is evidence of review work in that reporting period, not confirmation of the latest syllabus version for every subject.

### Required follow-up

- Ask the Ministry/Curriculum Advisory Services or verify its official publications for the outcome and publication date of the FNCF review.
- For every syllabus, record whether the source is current, under review, superseded, or not yet verified. Do not infer current status from an old document's continued availability online.
- Keep the ECE–Year 13 pathway and all individual subject/outcome mappings marked **awaiting official source verification** until the applicable version is confirmed.


## 27 October 2026 — source discovery and implementation gate

A further source search located the Ministry-hosted **Early Childhood Education Curriculum Framework (November 2024)** and the Ministry Annual Report for 2022–2023, which describes revised literacy/numeracy curriculum work and syllabus resources for Years 1–4. These sources help prioritize collection but do not supply a verified, complete English indicator map for every level.

- [Early Childhood Education Curriculum Framework — November 2024](https://iga-infra-moe-website-file-ir.s3.eu-west-1.amazonaws.com/uploads/Early_Childhood_Education_Curriculum_Framework_en.pdf): ECE framework source located; verify issuing authority, current applicability, exact page-level outcomes, and whether it supersedes or supplements *Na Noda Mataniciva* before mapping.
- [Ministry of Education Annual Report 2022–2023](https://www.parliament.gov.fj/wp-content/uploads/2025/04/Ministry-of-Education-Annual-Report-2022%E2%80%932023.pdf): reports revised literacy/numeracy curriculum work and Year 1–4 syllabus/guide resources; it is a report about curriculum work, not itself a substitute for the current English syllabus and achievement indicators.

### Implementation status

- Curriculum import validation now requires source title, authority, version, document ID, URL/reference, page or section, and a schedule evidence reference before accepting a candidate mapping.
- Accepted candidates remain prototype-only and are never marked production-eligible by the importer.
- Supported mapping levels are limited to ECE, Class 1–8, and Form 3–7. Term, week and day values are range-checked; week/day placements require a schedule evidence reference.
- Educator review is still required to certify the exact official source/version and indicator. Do not use a source placeholder or a teacher-proposed sequence as proof of official term/week placement.
- **Coverage remains incomplete.** No current, source-verified Class 1 English indicator has been approved by this code change. The Class 1 English Term 1 Week 1 Day 2 material must remain a practice candidate until a teacher checks the applicable official syllabus and source reference.


### Class 1 English — source-informed starter pack (27 October 2026)

A copy of *Year 1 English — Language, Literacy and Communication* was located on a third-party flipbook host. The resource itself states Curriculum Development Unit, Ministry of Education, Heritage and Arts, Fiji; 2013, revised 2019, reprinted 2020. Unit 1 “Who am I?” is shown on resource page 5, and S/s and A/a phonics activities on pages 6–7. [Source copy](https://fliphtml5.com/gjgbb/miwv/Year_1_English_-_Language%2C_Literacy_and_Communication/).

- Original, printable daily worksheets have been added in `docs/curriculum/english-class-1-daily-worksheet-pack.md` for a proposed five-day starter: diagnostic, self-introduction, S/s, A/a, and review.
- This supports **source-informed practice**, not full official verification. The located copy is hosted off the Ministry domain; a teacher must compare with the current authorized school/FEMIS or Ministry copy, record exact indicator IDs/wording and approve the daily sequence.
- The Term 1 / Week 1 placement remains a proposed planning slot, not a verified official timetable. No claim is made that the worksheets cover the full syllabus or all required indicators.
- Curriculum verification status remains pending educator review; production eligibility remains false.
