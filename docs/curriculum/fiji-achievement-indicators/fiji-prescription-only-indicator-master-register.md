# Fiji prescription-only curriculum indicator master register — ECE to Form 7

**Authority rule:** This file is the only intake register for PacEdu's Fiji prescription-only achievement-indicator bank. Add an indicator only when it is present in a controlled, current, officially issued or formally authorised Fiji curriculum prescription for the relevant level and subject. Do not create an indicator from a framework description, textbook, teaching resource, assessment paper, news story, programme document, teacher-created guide, draft, trial or unverified third-party copy.

**Current status (12 November 2026):** `SOURCE_INTAKE_IN_PROGRESS`. This master file is a coverage and evidence register, not a completed indicator bank. No new indicator text is promoted in this update because current controlled prescriptions for every level and subject have not yet been retrieved and verified.

## 1. Accepted source hierarchy

1. Current Ministry-approved subject syllabus/curriculum prescription, with version, approval/effective date and scope-and-sequence.
2. Current Ministry-issued achievement-indicator/learning-outcome schedule, teacher guide or curriculum support document explicitly authorised as a prescription and tied to that syllabus/version.
3. A formal Ministry circular or amendment that confirms adoption, effective date, replacement or withdrawal of a curriculum document.
4. Where the Ministry confirms access is restricted (for example, through FEMIS/Moodle or school distribution), obtain the exact controlled document from an authorised school/CAS channel and record its document control details.

**Not sufficient by themselves:** NCF framework, strategic plans, annual reports, policy summaries, news releases, textbook/resource lists, old post-examination support packs, draft/review documents, trial materials, commercial mappings or other third-party copies. They can guide source discovery but cannot supply indicator records.

## 2. Level-by-level coverage and intake status

The status below refers to the current controlled subject prescription being retrieved and checked for this register, not whether Fiji has a curriculum or whether schools teach the level.

| Level | Required prescription evidence before indicator entry | Intake status |
|---|---|---|
| ECE / Preschool | Current formally authorised ECE prescription or CAS confirmation that Na Noda Mataniciva remains the operative controlled outcome schedule, including any authorised amendments and reuse permission | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Year 1 | Current Year 1 subject prescriptions and scope/sequence, especially English and Mathematics; other prescribed learning areas and language programmes | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Year 2 | Same evidence, separately verified for Year 2 | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Year 3 | Current Year 3 subject prescriptions, outcomes/indicators and sequence | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Year 4 | Current Year 4 subject prescriptions, outcomes/indicators and sequence | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Year 5 | Current Year 5 subject prescriptions, outcomes/indicators and sequence; verify any revised literacy/numeracy package and effective date | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Year 6 | Current Year 6 subject prescriptions, outcomes/indicators and sequence; do not substitute post-examination Term 3 support material | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Year 7 | Current Year 7 subject prescriptions, outcomes/indicators and sequence | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Year 8 | Current Year 8 subject prescriptions, outcomes/indicators and sequence; verify final adoption of any previously trialled revisions | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Form 3 / Year 9 | Current subject-specific syllabuses, outcomes/indicators, pathways, prerequisites, contact hours and effective dates | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Form 4 / Year 10 | Same evidence, separately verified by subject and year | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Form 5 / Year 11 | Current approved subject syllabus and assessment specification, including pathway and prerequisite rules | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Form 6 / Year 12 | Current approved subject syllabus, external examination scope/specification and effective date | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |
| Form 7 / Year 13 | Current approved subject syllabus, course outcomes/SLOs, required hours, assessment and examination specification | `PENDING_CURRENT_CONTROLLED_PRESCRIPTION` |

Do not infer a subject's existence, name, year placement or indicator set from another year. Do not assume every subject is taught at every level.

## 3. Subject intake matrix

For each level above, retrieve only subjects formally prescribed for that level. The first priority is:

1. English / language and literacy prescriptions.
2. Mathematics / numeracy prescriptions.
3. Science (use the exact Ministry subject label and year range).
4. Social Science / Social Studies (use the exact Ministry subject label and year range).
5. All other prescribed learning areas and languages, including Health/Healthy Living, PE, Arts, Agriculture, Technology, Home Economics, Commercial Studies, Computer Studies, Vosa Vakaviti, Fiji Hindi, Urdu and Rotuman where the current level-specific prescription confirms them.

This priority order is an intake order only. It does not rank the importance of subjects or permit omission of any mandated subject.

## 4. Required metadata for every accepted prescription

Record one source document entry before creating indicator records:

- `sourceId`: stable source record ID.
- `issuingAuthority`: Fiji Ministry / formally authorised body.
- `documentTitle`, `documentNumber` (if any).
- `subject`, `levelOrYear`, `strandOrLearningArea`.
- `versionOrEdition`, `publicationDate`, `approvalDate`, `effectiveFrom`.
- `status`: approved/current, amended, superseded, withdrawn, draft or trial.
- `scopeAndSequence` and `contactHours` where prescribed.
- `exactOfficialURLOrControlledLocation`, access date, page/section/table.
- `copyrightOrReuseTerms`.
- Confirmation of any replacement, amendment or transition arrangements.

## 5. Indicator record rules

- Preserve the official indicator/outcome wording exactly in `sourceText`; store any teacher-friendly explanation in a separate field.
- Preserve official code, numbering, punctuation, strand, sub-strand and year/level as printed. Never invent missing codes.
- One record per distinct official outcome/indicator; do not split or combine it unless the source itself does so.
- Record prerequisite links only when stated by the prescription or approved by a qualified curriculum reviewer with rationale.
- Keep source and indicator versions immutable. A replacement creates a new version/status, not silent overwriting.
- Every record must carry its source page/section and approval/effective status.
- Do not map a historical indicator to a current syllabus solely because the wording looks similar.

## 6. 115-day distribution gate

The 9/9/5 pattern gives a planning frame of 45 + 45 + 25 = 115 teaching days. It does not prove that every prescription fits 115 days. Do not distribute indicators until all applicable prescribed outcomes, prerequisite relationships, required contact hours, school calendar closures and examination windows have been reconciled. If the official prescription requires more time, preserve its requirements and flag the timetable conflict for authorised review; never delete outcomes to force-fit the calendar.

Term 3 revision must revisit the full taught/required scope in a way that respects the official sequence and available teaching time. Do not label a concept as taught or assessed unless the activity evidence links to the approved indicator.

## 7. Exclusion register — historical or non-prescription material

The following existing files are retained for provenance and audit only. They are **not** eligible as sources for the prescription-only master bank until CAS confirms they are current, formally authorised prescriptions:

- `year6-year8-2015-guide-source-backed-indicator-register.md` — historical Term 3/post-examination teacher guide; not a full-year prescription.
- `financial-education-years1-8-outcome-candidates.md` — NFIT 2015 programme outcomes; current Ministry prescription status unconfirmed.
- `financial-education-years9-12-outcome-candidates.md` — NFIT 2015 programme outcomes; current Ministry prescription status unconfirmed.
- `ministry-year6-year8-financial-education-achievement-candidates.md` — historical Term 3 guide evidence; extraction incomplete and current status unconfirmed.
- Any teacher-designed activity packs, curriculum maps, textbook lists, resource catalogues, framework-only summaries and third-party copies.

Do not delete these audit files. Do not import their records into the live indicator table or the 115-day distribution unless a current controlled prescription explicitly validates them.

## 8. Current official evidence and unresolved access

- Fiji Ministry *Policy in National Curriculum Assessment and Reporting* (official Ministry PDF, hosted 2022): identifies the role of appropriate syllabuses and outcomes in reporting and assessment, and requires valid/reliable, equitable assessment and teacher moderation. It is an assessment policy, not an indicator syllabus. URL: https://www.education.gov.fj/wp-content/uploads/2022/11/POLICY-IN-NATIONAL-CURRICULUM-ASSESSMENT-AND-REPORTING.pdf
- Fiji Government announcement, 2 September 2025: states Na Noda Mataniciva continues to guide ECE, while the ECE curriculum was being updated with UNICEF support to include early literacy and numeracy. This is a status notice, not the replacement prescription. URL: https://www.fiji.gov.fj/47th-fiji-early-childhood-teachers-association-conference-national-social-emotional-learning-launched/
- Ministry Annual Report 2020–2021 search-indexed extract reports changes to the Years 1–8 English and Mathematics syllabus and describes a package including framework, scope-and-sequence overviews, year-level scope-and-sequence and teacher guides. Direct PDF page verification and the current controlled package remain outstanding. URL: https://www.education.gov.fj/wp-content/uploads/2024/06/Ministry-of-Education-Heritage-and-Arts-Annual-Report-2020%E2%80%932021.pdf
- Ministry Annual Report 2022–2023 previously recorded in source findings: Years 1–4 revised English/Mathematics implementation was reported as begun in 2023; Years 5–8 were still described as Phase 2 trial at that report date. This historical status does not confirm what was formally adopted after that report.
- Fiji's NCF and official system descriptions help identify broad FALD/KLA structure but do not replace level-specific prescriptions.

**Required next source action:** retrieve the current controlled package for ECE, Years 1–8 English and Mathematics, and then each remaining subject; separately obtain current Forms 3–7 subject syllabuses and examination specifications. If public links are not available, request the controlled copies through the Ministry Curriculum Advisory Services or an authorised school distribution channel. Record “not publicly retrieved” rather than substituting a non-prescription.

- **ECE source located for controlled review (not yet accepted into the active indicator bank):** Ministry-hosted *Na Noda Mataniciva: Kindergarten Curriculum Guidelines for the Fiji Islands* (copyright 2009; official Ministry PDF: https://www.education.gov.fj/wp-content/uploads/2022/06/Na-Noda-Mataniciva.pdf). The document states that it outlines outcomes rather than prescribing detailed content and organises expectations under six Foundation Areas of Learning and Development (FALD), with a developmental continuum from ages 3–6. The Ministry's 2025 National PPE Policy identifies Na Noda Mataniciva as Fiji's national curriculum guidelines for ages 3–6 (https://www.education.gov.fj/wp-content/uploads/2025/04/PPE_Policy_WEB.pdf). However, a separate Fiji Government announcement on 2 September 2025 said the ECE curriculum was being updated. Therefore, the 2009 document is recorded as an official source lead, but its supersession/current-version status must be confirmed by CAS before any outcomes are promoted. **No ECE outcomes have been imported into the active indicator bank.**
- **System-structure source only:** The Higher Education Commission's School Education page describes six ECE FALD and seven primary/secondary KLAs, but does not supply the controlled, level-specific indicator schedules required for this register: https://nic.hec.org.fj/school-education. Use only to guide completeness checks, not as indicator text.


- **Controlled-document acquisition route:** The Ministry's 2016–2017 Annual Report describes Curriculum Advisory Services (CAS) as responsible for developing/reviewing ECCE, primary and secondary syllabi, dispatching syllabuses and educational resource materials to schools, and developing support resources aligned to implemented syllabi. This is historical evidence of the responsible Ministry channel and distribution model, not evidence that any particular old syllabus remains current. Use CAS or an authorised school-held copy to obtain controlled, current versions. URL: https://www.education.gov.fj/wp-content/uploads/2022/06/MEHA-Annual-Report-2016-2017.pdf

## 9. Release status

- Master register: `SOURCE_INTAKE_IN_PROGRESS`.
- Accepted current prescription documents: none newly verified in this update.
- Accepted indicator records added in this update: zero.
- Daily activity generation from this master: blocked until the relevant prescription and educator validation are recorded.
- Formal assessment eligibility: false until source, approval, scope, reviewer and server-side controls are validated.
- No production deployment, Firebase write, learner record change or APK replacement is authorised by this file.

**Stage 1 remains IN_PROGRESS.**


### ECE source qualification review — 12 November 2026

The Ministry-hosted 2009 *Na Noda Mataniciva: Kindergarten Curriculum Guidelines for the Fiji Islands* has now been opened and reviewed as a primary-source document (official PDF: https://www.education.gov.fj/wp-content/uploads/2022/06/Na-Noda-Mataniciva.pdf).

**Finding: official Ministry publication, but not yet an accepted prescription source for PacEdu's strict prescription-only bank.** The foreword says the guidelines outline outcomes rather than prescribe the content to be learnt (PDF printed pages iii–iv; PDF text lines 73–89). The curriculum section describes six FALD and outcomes, and expressly says the outcomes are guidelines only (printed pages 16–17; PDF text lines 1119–1217). It covers Kindergarten ages 3–6 and describes the FALD as also informing Classes 1 and 2 (printed page 4; PDF text lines 477–493). The document carries a 2009 copyright notice and says reproduction requires prior written permission (copyright page ii; PDF text lines 31–36).

A Ministry-hosted 2025 National PPE Policy also identifies Na Noda Mataniciva in the ECE context (https://www.education.gov.fj/wp-content/uploads/2025/04/PPE_Policy_WEB.pdf). This supports its official relevance, but does not by itself establish that the 2009 outcome schedule is still the current, unamended controlled prescription. The 2 September 2025 Government announcement that the ECE curriculum was being updated reinforces the need for CAS confirmation.

**Decision for PacEdu:** retain the 2009 document as an official source lead and audit reference only. Do not transcribe its outcomes into the active prescription-only indicator file, generate ECE daily activities from it, or reproduce its protected wording until (a) CAS confirms the operative version and any amendments in writing and (b) the Ministry's reuse permission/licence is established. ECE remains `PENDING_CURRENT_CONTROLLED_PRESCRIPTION`. No indicator count is added.

**Next controlled evidence required from CAS:** document title and control number; approved/current version; approval and effective dates; whether the 2009 guideline remains operative or has been replaced; all amendments; the exact authorised ECE outcome schedule; and written reuse permission or licence terms for PacEdu's intended internal and user-facing use.


### Primary literacy/numeracy and secondary English status review — 12 November 2026

**Primary Years 1–8 English and Mathematics:** The Ministry's 2020–2021 Annual Report (Curriculum Advisory section, printed page 50; PDF lines 2402–2425) confirms changes were made to the Y1–Y8 English and Mathematics syllabus and describes the associated curriculum package as including a syllabus, scope-and-sequence overviews, year-level scope and sequence, and teacher guides. This is a strong official source lead for the exact package to retrieve. It is a historical report and does not establish the latest approved version, effective date, or whether later revisions superseded it. Therefore Years 1–8 English and Mathematics remain pending until the current controlled package and version history are obtained. Official report: https://www.parliament.gov.fj/wp-content/uploads/2023/09/Ministry-of-Education-Heritage-and-Arts-Annual-Report-2020%E2%80%932021.pdf

**Secondary English, Years 9–10 (Forms 3–4):** A Department of Foreign Affairs and Trade programme notice posted 22 September 2026 states that the Ministry has developed and rolled out RSEC English curriculum frameworks for Years 9 and 10. This is a credible implementation-status lead, but the notice is not the actual Ministry prescription or the controlled framework. The exact approved Year 9 and Year 10 framework, achievement indicators, version, approval/effective date, scope and sequence, and reuse terms must be retrieved from CAS before any indicator is transcribed. Source: https://ausconnect.dfat.gov.au/opportunities/revised-secondary-english-curriculum-rsec-advisor-yr-11-australia-fiji-education-fiji-program

**Secondary English, Year 11 (Form 5):** The same 22 September 2026 notice says the Ministry was seeking technical support to develop the Year 11 English package, building on Years 9–10 and aligned with future Years 12–13 progression. It identifies planned framework, learning materials and assessment deliverables. This does not prove the Year 11 package has since been approved or issued. Keep Year 11 English pending; do not infer Year 11 indicators from Years 9–10 or from the previous syllabus.

**Secondary English, Years 12–13 (Forms 6–7):** The notice says current Year 11–13 frameworks, pedagogy, materials and progression were to be reviewed as part of the Year 11 work. No current controlled replacement or confirmation of existing Years 12–13 prescriptions was retrieved in this review. Keep both levels pending and obtain each current subject/year syllabus and examination specification independently.

**Primary curriculum review context:** FBC's 10 February 2024 report quotes the Ministry Permanent Secretary as saying primary English/Mathematics curriculum review for Classes 1–8 had been completed and Years 9–10 literacy/numeracy was being piloted at that time. This is useful historical context only; it does not establish the later approval status of any package. Source: https://www.fbcnews.com.fj/news/curriculum-review-in-progress/

**No indicator records are added by these findings.** They identify exact controlled documents to request and prevent PacEdu from confusing an implementation announcement, a programme notice, a pilot, or an old syllabus with the currently authorised prescription.
